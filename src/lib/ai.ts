import { supabase, isSupabaseConfigured, supabaseConfigError } from './supabase';

export const DEFAULT_AI_MODEL = 'meta-llama/llama-3-70b-instruct';

export type AIModel =
  | 'meta-llama/llama-3-70b-instruct'
  | 'google/gemini-pro'
  | (string & {});

export interface AIRequestOptions {
  model?: AIModel;
  onLoadingChange?: (isLoading: boolean) => void;
}

export interface AIServiceError {
  code: 'NOT_CONFIGURED' | 'INVALID_RESPONSE' | 'REQUEST_FAILED';
  message: string;
  cause?: unknown;
}

export interface AIResult<T> {
  data: T;
  model: string;
  isFallback: boolean;
}

export interface JobDescriptionInput {
  title: string;
  department: string;
  requirements: string[];
}

export interface JobDescriptionOutput {
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications: string[];
  compensationNotes: string[];
}

export interface CandidateForScoring {
  id: string;
  name: string;
  experienceYears?: number;
  skills: string[];
  location?: string;
  notes?: string;
}

export interface CandidateScore {
  candidateId: string;
  score: number;
  rationale: string;
  strengths: string[];
  risks: string[];
}

export interface ScoreCandidatesOutput {
  roleSummary: string;
  scores: CandidateScore[];
}

export interface CandidateMatch {
  candidateId: string;
  matchScore: number;
  reasons: string[];
  nextStep: 'screen' | 'hold' | 'reject';
}

export interface MatchCandidatesOutput {
  roleSummary: string;
  matches: CandidateMatch[];
}

export type OutreachTone = 'professional' | 'conversational' | 'direct';

export interface OutreachEmailOutput {
  subject: string;
  body: string;
  personalizationSignals: string[];
}

export interface ParsedResumeOutput {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string;
  yearsExperience: number | null;
  skills: string[];
  certifications: string[];
  education: string[];
  recentRoles: Array<{
    title: string;
    company: string;
    startDate: string | null;
    endDate: string | null;
  }>;
}

export interface SourceCandidatesOutput {
  queryPlan: string[];
  candidatePersonas: Array<{
    title: string;
    industries: string[];
    keywords: string[];
    locations: string[];
  }>;
  outreachAngles: string[];
}

interface EdgeCompletionResponse {
  content?: string;
  model?: string;
  fallbackFrom?: string;
  error?: string;
}

interface AIServiceState {
  isLoading: boolean;
  inFlightRequests: number;
  lastError: AIServiceError | null;
}

function createAIServiceError(
  code: AIServiceError['code'],
  message: string,
  cause?: unknown,
): AIServiceError {
  return { code, message, cause };
}

function parseJSONObject<T>(raw: string): T {
  const cleaned = raw.trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw createAIServiceError('INVALID_RESPONSE', 'AI response was not valid JSON.');
    }

    try {
      return JSON.parse(match[0]) as T;
    } catch (error) {
      throw createAIServiceError('INVALID_RESPONSE', 'AI response JSON could not be parsed.', error);
    }
  }
}

class AIService {
  private state: AIServiceState = {
    isLoading: false,
    inFlightRequests: 0,
    lastError: null,
  };

  getState(): AIServiceState {
    return { ...this.state };
  }

  private setLoading(isLoading: boolean): void {
    this.state.isLoading = isLoading;
  }

  private setLastError(error: AIServiceError | null): void {
    this.state.lastError = error;
  }

  private async callEdgeFunction<T>(
    prompt: string,
    systemMessage: string,
    options?: AIRequestOptions,
  ): Promise<AIResult<T>> {
    if (!isSupabaseConfigured) {
      const error = createAIServiceError(
        'NOT_CONFIGURED',
        supabaseConfigError ?? 'Supabase is not configured.',
      );
      this.setLastError(error);
      throw error;
    }

    this.state.inFlightRequests += 1;
    this.setLoading(true);
    options?.onLoadingChange?.(true);
    this.setLastError(null);

    try {
      const { data, error } = await supabase.functions.invoke<EdgeCompletionResponse>('ai-completion', {
        body: {
          prompt,
          systemMessage,
          model: options?.model ?? DEFAULT_AI_MODEL,
        },
      });

      if (error) {
        throw createAIServiceError('REQUEST_FAILED', error.message, error);
      }

      if (!data?.content) {
        throw createAIServiceError('INVALID_RESPONSE', data?.error ?? 'AI response content is missing.');
      }

      const parsed = parseJSONObject<T>(data.content);

      return {
        data: parsed,
        model: data.model ?? options?.model ?? DEFAULT_AI_MODEL,
        isFallback: Boolean(data.fallbackFrom),
      };
    } catch (error) {
      const aiError = (error as AIServiceError).code
        ? (error as AIServiceError)
        : createAIServiceError('REQUEST_FAILED', (error as Error).message, error);
      this.setLastError(aiError);
      throw aiError;
    } finally {
      this.state.inFlightRequests = Math.max(0, this.state.inFlightRequests - 1);
      const hasRequestsInFlight = this.state.inFlightRequests > 0;
      this.setLoading(hasRequestsInFlight);
      options?.onLoadingChange?.(hasRequestsInFlight);
    }
  }

  generateJobDescription(
    input: JobDescriptionInput,
    options?: AIRequestOptions,
  ): Promise<AIResult<JobDescriptionOutput>> {
    return this.callEdgeFunction<JobDescriptionOutput>(
      `Create a job description for title: ${input.title}, department: ${input.department}, requirements: ${input.requirements.join(', ')}.`,
      'You are a senior recruiting writer. Return strict JSON with keys: summary (string), responsibilities (string[]), qualifications (string[]), preferredQualifications (string[]), compensationNotes (string[]).',
      options,
    );
  }

  scoreCandidates(
    role: string,
    candidates: CandidateForScoring[],
    options?: AIRequestOptions,
  ): Promise<AIResult<ScoreCandidatesOutput>> {
    return this.callEdgeFunction<ScoreCandidatesOutput>(
      `Role: ${role}. Candidates: ${JSON.stringify(candidates)}. Score each candidate from 0 to 100.`,
      'You are a recruiting evaluation engine. Return strict JSON with keys: roleSummary (string), scores (array of {candidateId, score, rationale, strengths, risks}).',
      options,
    );
  }

  matchCandidates(
    role: string,
    candidateList: CandidateForScoring[],
    options?: AIRequestOptions,
  ): Promise<AIResult<MatchCandidatesOutput>> {
    return this.callEdgeFunction<MatchCandidatesOutput>(
      `Role: ${role}. Candidate list: ${JSON.stringify(candidateList)}. Determine shortlist fit and actions.`,
      "You are a talent matching assistant. Return strict JSON with keys: roleSummary (string), matches (array of {candidateId, matchScore, reasons, nextStep}). nextStep must be one of 'screen', 'hold', 'reject'.",
      options,
    );
  }

  generateOutreachEmail(
    candidate: CandidateForScoring,
    role: string,
    tone: OutreachTone,
    options?: AIRequestOptions,
  ): Promise<AIResult<OutreachEmailOutput>> {
    return this.callEdgeFunction<OutreachEmailOutput>(
      `Candidate: ${JSON.stringify(candidate)}. Role: ${role}. Tone: ${tone}.`,
      'You are an executive recruiter writing concise first-contact email outreach. Return strict JSON with keys: subject (string), body (string), personalizationSignals (string[]).',
      options,
    );
  }

  parseResume(
    resumeText: string,
    options?: AIRequestOptions,
  ): Promise<AIResult<ParsedResumeOutput>> {
    return this.callEdgeFunction<ParsedResumeOutput>(
      `Extract structured candidate details from this resume text: ${resumeText}`,
      'You are a resume parser. Return strict JSON with keys: fullName, email, phone, location, summary, yearsExperience, skills, certifications, education, recentRoles[{title, company, startDate, endDate}]. Use null for unknown values.',
      options,
    );
  }

  sourceCandidates(
    roleDescription: string,
    criteria: string[],
    options?: AIRequestOptions,
  ): Promise<AIResult<SourceCandidatesOutput>> {
    return this.callEdgeFunction<SourceCandidatesOutput>(
      `Role description: ${roleDescription}. Search criteria: ${criteria.join(', ')}.`,
      'You are a candidate sourcing strategist. Return strict JSON with keys: queryPlan (string[]), candidatePersonas (array of {title, industries, keywords, locations}), outreachAngles (string[]).',
      options,
    );
  }
}

export const aiService = new AIService();

export async function generateJobDescription(
  title: string,
  department: string,
  requirements: string[],
  options?: AIRequestOptions,
): Promise<AIResult<JobDescriptionOutput>> {
  return aiService.generateJobDescription({ title, department, requirements }, options);
}

export async function scoreCandidates(
  role: string,
  candidates: CandidateForScoring[],
  options?: AIRequestOptions,
): Promise<AIResult<ScoreCandidatesOutput>> {
  return aiService.scoreCandidates(role, candidates, options);
}

export async function matchCandidates(
  role: string,
  candidateList: CandidateForScoring[],
  options?: AIRequestOptions,
): Promise<AIResult<MatchCandidatesOutput>> {
  return aiService.matchCandidates(role, candidateList, options);
}

export async function generateOutreachEmail(
  candidate: CandidateForScoring,
  role: string,
  tone: OutreachTone,
  options?: AIRequestOptions,
): Promise<AIResult<OutreachEmailOutput>> {
  return aiService.generateOutreachEmail(candidate, role, tone, options);
}

export async function parseResume(
  resumeText: string,
  options?: AIRequestOptions,
): Promise<AIResult<ParsedResumeOutput>> {
  return aiService.parseResume(resumeText, options);
}

export async function sourceCandidates(
  roleDescription: string,
  criteria: string[],
  options?: AIRequestOptions,
): Promise<AIResult<SourceCandidatesOutput>> {
  return aiService.sourceCandidates(roleDescription, criteria, options);
}

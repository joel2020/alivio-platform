import { isSupabaseConfigured, supabase, supabaseConfigError } from './supabase';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export type AIServiceErrorCode = 'NOT_CONFIGURED' | 'INVALID_RESPONSE' | 'REQUEST_FAILED';

export interface AIServiceError {
  code: AIServiceErrorCode;
  message: string;
  cause?: unknown;
}

export interface AIRequestOptions {
  onLoadingChange?: (isLoading: boolean) => void;
}

export interface AIResult<T> {
  data: T;
  model: string;
}

export interface AIRequestState {
  isLoading: boolean;
  inFlightRequests: number;
  lastError: AIServiceError | null;
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

interface EdgeResponse<T> {
  data?: T;
  model?: string;
  error?: string;
}

function buildError(code: AIServiceErrorCode, message: string, cause?: unknown): AIServiceError {
  return { code, message, cause };
}

class AIService {
  private state: AIRequestState = {
    isLoading: false,
    inFlightRequests: 0,
    lastError: null,
  };

  getState(): AIRequestState {
    return { ...this.state };
  }

  private async invoke<T>(
    functionName: string,
    payload: Record<string, unknown>,
    options?: AIRequestOptions,
  ): Promise<AIResult<T>> {
    if (!isSupabaseConfigured) {
      const err = buildError('NOT_CONFIGURED', supabaseConfigError ?? 'Supabase is not configured.');
      this.state.lastError = err;
      throw err;
    }

    this.state.inFlightRequests += 1;
    this.state.isLoading = true;
    this.state.lastError = null;
    options?.onLoadingChange?.(true);

    try {
      const { data, error } = await supabase.functions.invoke<EdgeResponse<T>>(functionName, {
        body: payload,
        headers: supabaseAnonKey
          ? {
              Authorization: `Bearer ${supabaseAnonKey}`,
              apikey: supabaseAnonKey,
            }
          : undefined,
      });

      if (error) {
        throw buildError('REQUEST_FAILED', error.message, error);
      }

      if (!data?.data) {
        throw buildError('INVALID_RESPONSE', data?.error ?? 'AI function returned invalid payload.');
      }

      return {
        data: data.data,
        model: data.model ?? 'openrouter/free',
      };
    } catch (error) {
      const aiError = (error as AIServiceError).code
        ? (error as AIServiceError)
        : buildError('REQUEST_FAILED', (error as Error).message, error);
      this.state.lastError = aiError;
      throw aiError;
    } finally {
      this.state.inFlightRequests -= 1;
      this.state.isLoading = this.state.inFlightRequests > 0;
      options?.onLoadingChange?.(false);
    }
  }

  generateJobDescription(title: string, department: string, requirements: string[], options?: AIRequestOptions) {
    return this.invoke<JobDescriptionOutput>('ai-generate-job', { title, department, requirements }, options);
  }

  scoreCandidates(role: string, candidates: CandidateForScoring[], options?: AIRequestOptions) {
    return this.invoke<ScoreCandidatesOutput>('ai-score-candidates', { role, candidates }, options);
  }

  matchCandidates(role: string, candidateList: CandidateForScoring[], options?: AIRequestOptions) {
    return this.invoke<MatchCandidatesOutput>('ai-match-candidates', { role, candidateList }, options);
  }

  generateOutreachEmail(candidate: CandidateForScoring, role: string, tone: OutreachTone, options?: AIRequestOptions) {
    return this.invoke<OutreachEmailOutput>('generate-outreach', { candidate, role, tone }, options);
  }

  parseResume(resumeText: string, options?: AIRequestOptions) {
    return this.invoke<ParsedResumeOutput>('ai-parse-resume', { resumeText }, options);
  }

  sourceCandidates(roleDescription: string, criteria: string[], options?: AIRequestOptions) {
    return this.invoke<SourceCandidatesOutput>('ai-source-candidates', { roleDescription, criteria }, options);
  }
}

export const aiService = new AIService();

export function getAIRequestState() {
  return aiService.getState();
}

export const generateJobDescription = (title: string, department: string, requirements: string[], options?: AIRequestOptions) =>
  aiService.generateJobDescription(title, department, requirements, options);

export const scoreCandidates = (role: string, candidates: CandidateForScoring[], options?: AIRequestOptions) =>
  aiService.scoreCandidates(role, candidates, options);

export const matchCandidates = (role: string, candidateList: CandidateForScoring[], options?: AIRequestOptions) =>
  aiService.matchCandidates(role, candidateList, options);

export const generateOutreachEmail = (
  candidate: CandidateForScoring,
  role: string,
  tone: OutreachTone,
  options?: AIRequestOptions,
) => aiService.generateOutreachEmail(candidate, role, tone, options);

export const parseResume = (resumeText: string, options?: AIRequestOptions) =>
  aiService.parseResume(resumeText, options);

export const sourceCandidates = (roleDescription: string, criteria: string[], options?: AIRequestOptions) =>
  aiService.sourceCandidates(roleDescription, criteria, options);

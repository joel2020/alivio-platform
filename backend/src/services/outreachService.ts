import { Candidate, Job, OutreachDraft } from '../models/types';
import { LLMProvider } from '../providers/llmProvider';

export class OutreachService {
  constructor(private llm: LLMProvider) {}

  async generate(candidate: Candidate, job: Job): Promise<OutreachDraft> {
    const promptBase = `Candidate: ${candidate.fullName}, ${candidate.title}, ${candidate.location}. Role: ${job.title} at ${job.client} in ${job.location}.`;

    const [firstTouch, followUp, callPrep] = await Promise.all([
      this.llm.generate(`${promptBase} Draft first-touch recruiter outreach under 120 words.`),
      this.llm.generate(`${promptBase} Draft follow-up message under 80 words with value proposition.`),
      this.llm.generate(`${promptBase} Create recruiter call prep notes with strengths, concerns, questions.`)
    ]);

    return {
      candidateId: candidate.id,
      jobId: job.id,
      firstTouch,
      followUp,
      callPrep
    };
  }
}

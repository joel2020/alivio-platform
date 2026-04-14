import { Candidate, ResumeParseResult } from '../models/types';

export interface ResumeParserProvider {
  parse(content: string): Promise<ResumeParseResult>;
}

export class MockResumeParserProvider implements ResumeParserProvider {
  async parse(content: string): Promise<ResumeParseResult> {
    const lines = content.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const fullName = lines[0] ?? 'Unknown Candidate';
    const titleLine = lines.find((l) => /director|coordinator|manager/i.test(l)) ?? 'Nurse Manager';
    const lic = lines.find((l) => /\bRN\b|\bLPN\b|\bNHA\b/i.test(l));
    const location = lines.find((l) => /,\s*(NY|NJ|PA|FL|TX)\b/i.test(l)) ?? 'Unknown, NY';

    const candidate: Candidate = {
      id: `parsed-${Date.now()}`,
      fullName,
      title: titleLine,
      location,
      licenses: lic ? [lic.match(/RN|LPN|NHA|BSN|MSN/i)?.[0] ?? 'RN'] : [],
      specialties: ['Skilled Nursing'],
      yearsExperience: Number(content.match(/(\d{1,2})\+?\s+years/i)?.[1] ?? 0),
      careSettings: ['SNF'],
      leadershipExperience: /director|manager|lead/i.test(content),
      summary: lines.slice(0, 3).join(' | '),
      recentEmployers: [],
      preferredStates: [],
      compensationRange: { min: 0, max: 0, currency: 'USD' },
      status: 'active',
      email: content.match(/[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0],
      phone: content.match(/\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)?.[0],
      source: 'Resume Upload',
      sourceUrl: '',
      lastSeenAt: new Date().toISOString(),
      completenessScore: 0
    };

    const uncertainFields = ['recentEmployers', 'preferredStates', 'compensationRange'];
    return {
      candidate,
      uncertainFields,
      confidence: 0.72,
      rawTextPreview: content.slice(0, 300)
    };
  }
}

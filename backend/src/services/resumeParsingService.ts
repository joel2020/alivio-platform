import { ResumeParseResult } from '../models/types';
import { ResumeParserProvider } from '../providers/resumeParserProvider';

export class ResumeParsingService {
  constructor(private parser: ResumeParserProvider) {}

  async parse(content: string): Promise<ResumeParseResult> {
    return this.parser.parse(content);
  }
}

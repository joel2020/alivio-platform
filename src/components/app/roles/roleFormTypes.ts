export interface ScoringWeights {
  skills_match: number;
  experience_level: number;
  education: number;
  location_match: number;
  culture_signals: number;
}

export interface RoleFormData {
  title: string;
  department: string;
  seniority: string;
  employmentType: string;
  locationType: string;
  cityRegion: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  experienceMin: string;
  education: string;
  description: string;
  scoringWeights: ScoringWeights;
}

export const DEFAULT_FORM_DATA: RoleFormData = {
  title: '',
  department: '',
  seniority: '',
  employmentType: 'Full-time',
  locationType: 'Remote',
  cityRegion: '',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  mustHaveSkills: [],
  niceToHaveSkills: [],
  experienceMin: '',
  education: 'No requirement',
  description: '',
  scoringWeights: {
    skills_match: 8,
    experience_level: 7,
    education: 4,
    location_match: 5,
    culture_signals: 5,
  },
};

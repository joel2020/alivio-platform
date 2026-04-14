import { GoogleAuth } from 'google-auth-library';
import { env } from '../config/env';
import { Candidate, Job, SearchQuery } from '../models/types';
import { logger } from '../utils/logger';
import { RetrievalProvider } from './retrievalProvider';

interface VertexDocument {
  id?: string;
  derivedStructData?: Record<string, unknown>;
  structData?: Record<string, unknown>;
}

export class VertexDiscoveryEngineProvider implements RetrievalProvider {
  private auth: GoogleAuth;

  constructor() {
    this.auth = new GoogleAuth({
      credentials: env.googleServiceAccountKey
        ? {
            client_email: env.googleServiceAccountEmail,
            private_key: env.googleServiceAccountKey.replace(/\\n/g, '\n')
          }
        : undefined,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  }

  private async callSearch(query: SearchQuery): Promise<VertexDocument[]> {
    const token = await this.auth.getAccessToken();
    if (!token) throw new Error('Unable to get Google access token.');

    const servingConfigPath = `projects/${env.googleProjectId}/locations/${env.googleLocation}/collections/default_collection/engines/${env.googleEngineId}/servingConfigs/${env.googleServingConfig}`;
    const endpoint = `https://discoveryengine.googleapis.com/v1/${servingConfigPath}:search`;

    const body = {
      query: [query.role, query.specialty, query.geography, query.careSetting].filter(Boolean).join(' '),
      pageSize: query.limit ?? 25,
      contentSearchSpec: {
        snippetSpec: { returnSnippet: true }
      }
    };

    logger.info('Vertex search request', { endpoint, body });
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error('Vertex search failure', { status: response.status, text });
      throw new Error(`Vertex search failed: ${response.status}`);
    }

    const result = (await response.json()) as { results?: Array<{ document?: VertexDocument }> };
    return (result.results ?? []).map((r) => r.document ?? {});
  }

  private normalizeCandidate(doc: VertexDocument, idx: number): Candidate {
    const d = (doc.derivedStructData ?? doc.structData ?? {}) as Record<string, any>;
    return {
      id: d.id ?? doc.id ?? `vertex-candidate-${idx}`,
      fullName: d.fullName ?? d.name ?? 'Unknown Candidate',
      title: d.title ?? 'Unknown Title',
      location: d.location ?? 'Unknown Location',
      licenses: d.licenses ?? [],
      specialties: d.specialties ?? [],
      yearsExperience: Number(d.yearsExperience ?? 0),
      careSettings: d.careSettings ?? [],
      leadershipExperience: Boolean(d.leadershipExperience),
      summary: d.summary ?? '',
      recentEmployers: d.recentEmployers ?? [],
      preferredStates: d.preferredStates ?? [],
      compensationRange: d.compensationRange ?? { min: 0, max: 0, currency: 'USD' },
      status: d.status ?? 'active',
      email: d.email,
      phone: d.phone,
      source: 'Vertex AI Search',
      sourceUrl: d.sourceUrl ?? '',
      lastSeenAt: d.lastSeenAt ?? new Date().toISOString(),
      completenessScore: Number(d.completenessScore ?? 0)
    };
  }

  async searchCandidates(query: SearchQuery): Promise<Candidate[]> {
    const docs = await this.callSearch(query);
    return docs.map((doc, idx) => this.normalizeCandidate(doc, idx));
  }

  async searchJobs(query: SearchQuery): Promise<Job[]> {
    const docs = await this.callSearch(query);
    return docs.map((doc, idx) => {
      const d = (doc.derivedStructData ?? doc.structData ?? {}) as Record<string, any>;
      return {
        id: d.id ?? doc.id ?? `vertex-job-${idx}`,
        title: d.title ?? 'Unknown Job',
        client: d.client ?? 'Unknown Client',
        location: d.location ?? 'Unknown Location',
        salaryRange: d.salaryRange ?? { min: 0, max: 0, currency: 'USD' },
        setting: d.setting ?? 'Unknown',
        requiredLicenses: d.requiredLicenses ?? [],
        requiredExperience: Number(d.requiredExperience ?? 0),
        mustHaveKeywords: d.mustHaveKeywords ?? [],
        description: d.description ?? '',
        priority: d.priority ?? 'medium',
        status: d.status ?? 'open'
      } as Job;
    });
  }
}

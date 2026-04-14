const PORT = Number.parseInt(process.env.PORT || '8080', 10);

const DEFAULT_VERTEX_SEARCH_ENDPOINT =
  'https://discoveryengine.googleapis.com/v1alpha/projects/807488403515/locations/global/collections/default_collection/engines/alivio-search_1776189054215/servingConfigs/default_search:search';

const DEFAULT_VERTEX_SEARCH_SERVING_CONFIG =
  'projects/807488403515/locations/global/collections/default_collection/engines/alivio-search_1776189054215/servingConfigs/default_search';

const SAMPLE_RECRUITER_QUERY =
  'Find Directors of Nursing in New Jersey with SNF experience and multi-site leadership';

module.exports = {
  serviceName: process.env.SERVICE_NAME || 'alivio-search-partners-backend',
  env: process.env.NODE_ENV || 'development',
  port: Number.isFinite(PORT) && PORT > 0 ? PORT : 8080,
  maxRequestBytes: process.env.MAX_REQUEST_BYTES || '1mb',
  requestIdHeader: process.env.REQUEST_ID_HEADER || 'x-request-id',
  enableCors: process.env.ENABLE_CORS === 'true',
  corsOrigin: process.env.CORS_ORIGIN || '',
  vertex: {
    endpoint: process.env.VERTEX_SEARCH_ENDPOINT || DEFAULT_VERTEX_SEARCH_ENDPOINT,
    servingConfig:
      process.env.VERTEX_SEARCH_SERVING_CONFIG || DEFAULT_VERTEX_SEARCH_SERVING_CONFIG,
    timeoutMs: Number.parseInt(process.env.VERTEX_TIMEOUT_MS || '15000', 10),
    minPageSize: 1,
    maxPageSize: 20,
    defaultPageSize: 10
  },
  openai: {
    apiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
    model: process.env.LLM_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    timeoutMs: Number.parseInt(process.env.OPENAI_TIMEOUT_MS || '30000', 10)
  },
  defaults: {
    vertexSearchEndpoint: DEFAULT_VERTEX_SEARCH_ENDPOINT,
    vertexSearchServingConfig: DEFAULT_VERTEX_SEARCH_SERVING_CONFIG,
    sampleRecruiterQuery: SAMPLE_RECRUITER_QUERY
  }
};

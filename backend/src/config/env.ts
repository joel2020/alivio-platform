import dotenv from 'dotenv';

dotenv.config();

const bool = (v?: string) => v === 'true';

export const env = {
  port: Number(process.env.PORT ?? 8787),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appMode: process.env.APP_MODE ?? 'mock',
  googleProjectId: process.env.GOOGLE_PROJECT_ID ?? 'alivio-475419',
  googleLocation: process.env.GOOGLE_LOCATION ?? 'us',
  googleEngineId: process.env.GOOGLE_ENGINE_ID ?? 'AQ.Ab8RN6Ik78BXLwMDA05UnoNhsV6lgiDGUFHcSaGyCyT6p-20UQ',
  googleServingConfig: process.env.GOOGLE_SERVING_CONFIG ?? 'default_search',
  googleServiceAccountEmail:
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? 'vertex-express@alivio-475419.iam.gserviceaccount.com',
  googleServiceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  llmBaseUrl: process.env.LLM_BASE_URL,
  llmApiKey: process.env.LLM_API_KEY,
  llmModel: process.env.LLM_MODEL ?? 'gpt-4o-mini',
  debug: bool(process.env.DEBUG_LOGS)
} as const;

export const isLiveMode = env.appMode === 'live';

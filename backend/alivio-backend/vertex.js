const { GoogleAuth } = require('google-auth-library');
const { AppError } = require('./errors');

const auth = new GoogleAuth({
  credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    : undefined,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

async function runVertexSearch({ query, pageSize, config }) {
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token?.token || token}`
      },
      body: JSON.stringify({
        servingConfig: config.servingConfig,
        query,
        pageSize,
        queryExpansionSpec: { condition: 'AUTO' },
        spellCorrectionSpec: { mode: 'AUTO' }
      }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new AppError('Vertex AI Search request failed', {
        status: response.status,
        code: 'VERTEX_REQUEST_FAILED',
        details: {
          endpoint: config.endpoint,
          statusText: response.statusText,
          vertex: data
        }
      });
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AppError('Vertex AI Search timeout', {
        status: 504,
        code: 'VERTEX_TIMEOUT',
        details: { timeoutMs: config.timeoutMs }
      });
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Vertex AI Search unavailable', {
      status: 502,
      code: 'VERTEX_UNAVAILABLE',
      details: { cause: error.message }
    });
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  runVertexSearch
};

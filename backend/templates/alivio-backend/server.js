require('dotenv').config();

const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const OpenAI = require('openai');

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT || 8080);
const VERTEX_SEARCH_ENDPOINT = process.env.VERTEX_SEARCH_ENDPOINT ||
  'https://discoveryengine.googleapis.com/v1alpha/projects/807488403515/locations/global/collections/default_collection/engines/alivio-search_1776189054215/servingConfigs/default_search:search';

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function normalizeVertexResults(searchResponse) {
  const results = Array.isArray(searchResponse?.results) ? searchResponse.results : [];

  return results.map((item, index) => {
    const doc = item?.document || {};
    const derived = doc?.derivedStructData || {};
    const struct = doc?.structData || {};

    return {
      rank: index + 1,
      id: doc?.id || null,
      name: doc?.name || null,
      uri: derived?.link || derived?.uri || null,
      title: struct?.title || derived?.title || null,
      snippet: derived?.snippets?.[0]?.snippet || null,
      extractiveAnswers: (derived?.extractive_answers || []).map((ans) => ({
        content: ans?.content || null,
        pageNumber: ans?.pageNumber || null
      })),
      metadata: {
        source: struct?.source || derived?.source || null,
        location: struct?.location || null,
        company: struct?.company || null
      },
      raw: {
        structData: struct,
        derivedStructData: derived
      }
    };
  });
}

async function runVertexSearch(query, pageSize = 10) {
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const response = await fetch(VERTEX_SEARCH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.token || token}`
    },
    body: JSON.stringify({
      query,
      pageSize,
      queryExpansionSpec: {
        condition: 'AUTO'
      },
      spellCorrectionSpec: {
        mode: 'AUTO'
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error('Vertex AI Search request failed');
    err.status = response.status;
    err.details = data;
    throw err;
  }

  return data;
}

function requireQuery(req, res) {
  const query = req.body?.query;
  if (!query || typeof query !== 'string') {
    res.status(400).json({
      ok: false,
      error: 'Missing required string field: query'
    });
    return null;
  }
  return query.trim();
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'alivio-backend',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/vertex-search', async (req, res) => {
  try {
    const query = requireQuery(req, res);
    if (!query) return;

    const pageSize = Number(req.body?.pageSize || 10);
    const vertexRaw = await runVertexSearch(query, Math.min(Math.max(pageSize, 1), 20));
    const grounded = normalizeVertexResults(vertexRaw);

    res.json({
      ok: true,
      query,
      grounded,
      totalSize: vertexRaw?.totalSize || grounded.length,
      attributionToken: vertexRaw?.attributionToken || null
    });
  } catch (error) {
    console.error('vertex-search error:', error);
    res.status(error.status || 500).json({
      ok: false,
      error: error.message || 'Unexpected error',
      details: error.details || null
    });
  }
});

app.post('/api/recruiter-search', async (req, res) => {
  try {
    const query = requireQuery(req, res);
    if (!query) return;

    const pageSize = Number(req.body?.pageSize || 10);
    const vertexRaw = await runVertexSearch(query, Math.min(Math.max(pageSize, 1), 20));
    const grounded = normalizeVertexResults(vertexRaw);

    const messages = [
      {
        role: 'system',
        content: 'You are a recruiter copilot. Use ONLY grounded search results provided by the user. If data is missing, explicitly say so.'
      },
      {
        role: 'user',
        content: `Recruiter query: ${query}\n\nGrounded results JSON:\n${JSON.stringify(grounded, null, 2)}`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      messages
    });

    const generated = completion?.choices?.[0]?.message?.content || '';

    res.json({
      ok: true,
      query,
      grounded,
      generated
    });
  } catch (error) {
    console.error('recruiter-search error:', error);
    res.status(error.status || 500).json({
      ok: false,
      error: error.message || 'Unexpected error',
      details: error.details || null
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error('unhandled error:', err);
  res.status(500).json({
    ok: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

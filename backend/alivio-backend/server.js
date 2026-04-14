require('dotenv').config();

const crypto = require('node:crypto');
const express = require('express');
const OpenAI = require('openai');

const config = require('./config');
const logger = require('./logger');
const { AppError, errorToResponse } = require('./errors');
const { runVertexSearch } = require('./vertex');
const { buildGroundedPayload, validateGroundedPayload } = require('./normalize');
const { buildRankedGrounding } = require('./ranking');

const app = express();
app.use(express.json({ limit: config.maxRequestBytes }));

app.use((req, res, next) => {
  const incomingRequestId = req.headers[config.requestIdHeader];
  const requestId =
    typeof incomingRequestId === 'string' && incomingRequestId.trim()
      ? incomingRequestId.trim()
      : crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader(config.requestIdHeader, requestId);

  next();
});

if (config.enableCors) {
  app.use((req, res, next) => {
    const allowedOrigin = config.corsOrigin;

    if (allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', `Content-Type,${config.requestIdHeader}`);

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    return next();
  });
}

const openai = new OpenAI({ apiKey: config.openai.apiKey });

function getRequestId(req) {
  return req.requestId || crypto.randomUUID();
}

function parseSearchInput(body, pageBounds) {
  const query = typeof body?.query === 'string' ? body.query.trim() : '';
  if (!query) {
    throw new AppError('Missing required string field: query', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'query' }
    });
  }

  if (query.length > 500) {
    throw new AppError('query exceeds max length of 500 characters', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'query', maxLength: 500 }
    });
  }

  const inputPageSize = Number.parseInt(String(body?.pageSize ?? pageBounds.defaultPageSize), 10);
  if (!Number.isFinite(inputPageSize)) {
    throw new AppError('pageSize must be an integer when provided', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'pageSize' }
    });
  }

  const pageSize = Math.min(Math.max(inputPageSize, pageBounds.minPageSize), pageBounds.maxPageSize);

  return {
    query,
    pageSize
  };
}

function parseGeneratedOutput(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new AppError('Generated response failed validation', {
      status: 502,
      code: 'OPENAI_INVALID_RESPONSE'
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_error) {
    throw new AppError('Generated response was not valid JSON', {
      status: 502,
      code: 'OPENAI_INVALID_RESPONSE'
    });
  }

  const rankedMatches = Array.isArray(parsed?.ranked_matches) ? parsed.ranked_matches : null;
  const explanation = typeof parsed?.explanation === 'string' ? parsed.explanation : null;
  const outreachDraft = typeof parsed?.outreach_draft === 'string' ? parsed.outreach_draft : null;

  if (!rankedMatches || !explanation || !outreachDraft) {
    throw new AppError('Generated response missing required recruiter fields', {
      status: 502,
      code: 'OPENAI_INVALID_RESPONSE'
    });
  }

  return {
    ranked_matches: rankedMatches,
    explanation,
    outreach_draft: outreachDraft
  };
}

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    status: 'healthy',
    service: config.serviceName,
    env: config.env,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/vertex-search', async (req, res, next) => {
  try {
    const { query, pageSize } = parseSearchInput(req.body, config.vertex);
    const vertexResponse = await runVertexSearch({ query, pageSize, config: config.vertex });
    const grounded = buildGroundedPayload(vertexResponse);

    if (!validateGroundedPayload(grounded)) {
      throw new AppError('Grounded payload failed validation', {
        status: 502,
        code: 'GROUNDING_VALIDATION_FAILED'
      });
    }

    res.json({
      ok: true,
      query,
      grounded
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/recruiter-search', async (req, res, next) => {
  const requestId = getRequestId(req);

  try {
    if (!config.openai.apiKey) {
      throw new AppError('OPENAI_API_KEY is required for recruiter generation', {
        status: 500,
        code: 'OPENAI_MISSING_API_KEY',
        expose: true
      });
    }

    const { query, pageSize } = parseSearchInput(req.body, config.vertex);
    const vertexResponse = await runVertexSearch({ query, pageSize, config: config.vertex });
    const grounded = buildGroundedPayload(vertexResponse);

    if (!validateGroundedPayload(grounded)) {
      throw new AppError('Grounded payload failed validation', {
        status: 502,
        code: 'GROUNDING_VALIDATION_FAILED'
      });
    }

    const deterministicRanking = buildRankedGrounding({ query, grounded });

    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content:
            'You are an Alivio recruiter copilot. Use only provided grounded JSON results. Never fabricate details. Respond with strict JSON containing keys: ranked_matches (array), explanation (string), outreach_draft (string).'
        },
        {
          role: 'user',
          content: JSON.stringify({
            query,
            grounded,
            deterministic_ranking: deterministicRanking
          })
        }
      ],
      timeout: config.openai.timeoutMs
    });

    const rawGenerated = completion?.choices?.[0]?.message?.content || '';
    const generated = parseGeneratedOutput(rawGenerated);

    if (!generated.ranked_matches.length && deterministicRanking.rankedMatches.length) {
      generated.ranked_matches = deterministicRanking.rankedMatches;
    }

    res.json({
      ok: true,
      query,
      grounded,
      generated
    });
  } catch (error) {
    if (error?.status >= 400) {
      return next(error);
    }

    const status = error?.status || error?.statusCode;
    const openaiCode = error?.code || null;
    const openaiType = error?.type || null;

    if (typeof status === 'number' || openaiCode || openaiType) {
      return next(
        new AppError('OpenAI request failed', {
          status: typeof status === 'number' ? status : 502,
          code: 'OPENAI_REQUEST_FAILED',
          details: {
            requestId,
            openaiCode,
            openaiType,
            message: error?.message || null
          }
        })
      );
    }

    return next(error);
  }
});

app.use((error, req, res, _next) => {
  const { status, payload } = errorToResponse(error);
  const requestId = getRequestId(req);

  logger.error('request_error', {
    requestId,
    method: req.method,
    path: req.path,
    status,
    code: payload.error.code,
    message: payload.error.message
  });

  res.status(status).json({
    ...payload,
    requestId
  });
});

app.listen(config.port, () => {
  logger.info('server_started', {
    service: config.serviceName,
    env: config.env,
    port: config.port,
    corsEnabled: config.enableCors,
    hasGoogleCredentialsPath: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    hasOpenAiApiKey: Boolean(config.openai.apiKey)
  });
  logger.info('sample_query_ready', {
    sampleRecruiterQuery: config.defaults.sampleRecruiterQuery
  });
});

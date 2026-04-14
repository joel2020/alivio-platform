require('dotenv').config();

const express = require('express');
const OpenAI = require('openai');

const config = require('./config');
const { AppError, errorToResponse } = require('./errors');
const { runVertexSearch } = require('./vertex');
const { buildGroundedPayload, validateGroundedPayload } = require('./normalize');

const app = express();
app.use(express.json({ limit: config.maxRequestBytes }));

if (config.enableCors) {
  app.use((req, res, next) => {
    const allowedOrigin = config.corsOrigin;

    if (allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      `Content-Type,${config.requestIdHeader}`
    );

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    return next();
  });
}

const openai = new OpenAI({ apiKey: config.openai.apiKey });

function getRequestId(req) {
  return req.headers[config.requestIdHeader] || `req_${Date.now()}`;
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
  const pageSize = Number.isFinite(inputPageSize) ? inputPageSize : pageBounds.defaultPageSize;

  return {
    query,
    pageSize: Math.min(Math.max(pageSize, pageBounds.minPageSize), pageBounds.maxPageSize)
  };
}

function validateGeneratedOutput(generated) {
  if (typeof generated !== 'string') {
    throw new AppError('Generated response failed validation', {
      status: 502,
      code: 'OPENAI_INVALID_RESPONSE'
    });
  }
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
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

    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are an Alivio recruiter copilot. Use only provided grounded JSON results. Never fabricate details. If grounded results are insufficient, say exactly what is missing.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            query,
            grounded
          })
        }
      ],
      timeout: config.openai.timeoutMs
    });

    const generated = completion?.choices?.[0]?.message?.content || '';
    validateGeneratedOutput(generated);

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

  console.error('request_error', {
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
  console.log(`Backend listening on http://localhost:${config.port}`);
  console.log(`Sample recruiter query: ${config.defaults.sampleRecruiterQuery}`);
});

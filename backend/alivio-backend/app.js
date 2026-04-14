require('dotenv').config();

const crypto = require('node:crypto');
const express = require('express');

const config = require('./config');
const logger = require('./logger');
const { errorToResponse } = require('./errors');
const { createHealthRouter } = require('./routes/health');
const { createVertexSearchRouter } = require('./routes/vertex-search');
const { createRecruiterSearchRouter } = require('./routes/recruiter-search');
const { createWebhookN8nRouter } = require('./routes/webhook-n8n');
const { createRecruiterSearchService, getRequestId } = require('./services/search');

const mockVertexFixture = require('./examples/mock-fixtures/recruiter-search-result-list.json');
const mockRecruiterFixture = require('./examples/mock-fixtures/recruiter-copilot-answer-card.json');

function createApp() {
  const app = express();
  const isMockMode = config.appMode === 'mock';

  app.use(express.json({ limit: config.maxRequestBytes }));

  app.use((req, res, next) => {
    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
      if (res.statusCode < 400) {
        return;
      }

      const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;
      const errorContext = res.locals.errorContext || {};

      logger.error('request_failed', {
        timestamp: new Date().toISOString(),
        requestId: req.requestId || null,
        route: req.originalUrl || req.path,
        statusCode: res.statusCode,
        errorCode: errorContext.errorCode || 'HTTP_ERROR',
        message: errorContext.message || 'Request failed',
        durationMs: Number(durationMs.toFixed(2))
      });
    });

    next();
  });

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

  const runRecruiterSearch = createRecruiterSearchService({
    config,
    isMockMode,
    mockRecruiterFixture
  });

  app.use(createHealthRouter({ config }));
  app.use(createVertexSearchRouter({ config, isMockMode, mockVertexFixture }));
  app.use(createRecruiterSearchRouter({ runRecruiterSearch }));
  app.use(createWebhookN8nRouter({ config, runRecruiterSearch }));

  app.use((error, req, res, _next) => {
    const { status, payload } = errorToResponse(error);
    const requestId = getRequestId(req);

    res.locals.errorContext = {
      errorCode: payload.error.code,
      message: payload.error.message
    };

    res.status(status).json({
      ...payload,
      requestId
    });
  });

  return app;
}

module.exports = {
  createApp
};

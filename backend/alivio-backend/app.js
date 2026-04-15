require('dotenv').config();

const crypto = require('node:crypto');
const express = require('express');

const config = require('./config');
const logger = require('./logger');
const { errorToResponse } = require('./errors');

const healthRoutes = require('./routes/health');
const vertexSearchRoutes = require('./routes/vertex-search');
const recruiterSearchRoutes = require('./routes/recruiter-search');
const webhookN8nRoutes = require('./routes/webhook-n8n');

function attachErrorLogging(app) {
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
}

function attachRequestId(app) {
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
}

function attachCors(app) {
  if (!config.enableCors) {
    return;
  }

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

function attachErrorHandler(app) {
  app.use((error, req, res, _next) => {
    const { status, payload } = errorToResponse(error);

    res.locals.errorContext = {
      errorCode: payload.error.code,
      message: payload.error.message
    };

    res.status(status).json({
      ...payload,
      requestId: req.requestId || crypto.randomUUID()
    });
  });
}

function createApp() {
  const app = express();
  app.use(express.json({ limit: config.maxRequestBytes }));

  attachErrorLogging(app);
  attachRequestId(app);
  attachCors(app);

  app.use(healthRoutes);
  app.use(vertexSearchRoutes);
  app.use(recruiterSearchRoutes);
  app.use(webhookN8nRoutes);

  attachErrorHandler(app);
  return app;
}

module.exports = {
  createApp
};

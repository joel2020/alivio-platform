const express = require('express');

const config = require('../config');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    status: 'healthy',
    service: config.serviceName,
    env: config.env,
    timestamp: new Date().toISOString()
  });
});

router.get('/api/status', (_req, res) => {
  res.status(200).json({
    ok: true,
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    mode: process.env.APP_MODE || 'live',
    vertexEndpoint: config.vertex.endpoint ? 'configured' : 'missing',
    openaiKey: config.openai.apiKey ? 'configured' : 'missing',
    gcpCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

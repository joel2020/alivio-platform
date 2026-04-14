const express = require('express');

const { getRequestId, parseMetadata, parseWorkflowType, validateWebhookSecret } = require('../services/search');
const { toOpenAiAppError } = require('./recruiter-search');

function createWebhookN8nRouter({ config, runRecruiterSearch }) {
  const router = express.Router();

  router.post('/api/webhook/n8n', async (req, res, next) => {
    const requestId = getRequestId(req);

    try {
      validateWebhookSecret(req, config);
      parseWorkflowType(req.body?.workflow_type);
      parseMetadata(req.body?.metadata);

      const payload = await runRecruiterSearch(
        {
          query: req.body?.query,
          pageSize: req.body?.pageSize
        },
        requestId
      );

      return res.json(payload);
    } catch (error) {
      return next(toOpenAiAppError(error, requestId));
    }
  });

  return router;
}

module.exports = { createWebhookN8nRouter };

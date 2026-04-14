const express = require('express');

const {
  normalizeOpenAiError,
  parseMetadata,
  parseWorkflowType,
  searchRecruiter,
  validateWebhookSecret
} = require('../services/search-service');

const router = express.Router();

router.post('/api/webhook/n8n', async (req, res, next) => {
  const requestId = req.requestId;

  try {
    validateWebhookSecret(req);
    parseWorkflowType(req.body?.workflow_type);
    parseMetadata(req.body?.metadata);

    const payload = await searchRecruiter(
      {
        query: req.body?.query,
        pageSize: req.body?.pageSize
      },
      requestId
    );

    res.json(payload);
  } catch (error) {
    next(normalizeOpenAiError(error, requestId));
  }
});

module.exports = router;

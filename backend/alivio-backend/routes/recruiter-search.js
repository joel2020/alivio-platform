const express = require('express');

const { normalizeOpenAiError, searchRecruiter } = require('../services/search-service');

const router = express.Router();

router.post('/api/recruiter-search', async (req, res, next) => {
  const requestId = req.requestId;

  try {
    const payload = await searchRecruiter(req.body, requestId);
    res.json(payload);
  } catch (error) {
    next(normalizeOpenAiError(error, requestId));
  }
});

module.exports = router;

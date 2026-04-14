const express = require('express');

const { AppError } = require('../errors');
const { getRequestId } = require('../services/search');

function toOpenAiAppError(error, requestId) {
  if (error?.status >= 400) {
    return error;
  }

  const status = error?.status || error?.statusCode;
  const openaiCode = error?.code || null;
  const openaiType = error?.type || null;

  if (typeof status === 'number' || openaiCode || openaiType) {
    return new AppError('OpenAI request failed', {
      status: typeof status === 'number' ? status : 502,
      code: 'OPENAI_REQUEST_FAILED',
      details: {
        requestId,
        openaiCode,
        openaiType,
        message: error?.message || null
      }
    });
  }

  return error;
}

function createRecruiterSearchRouter({ runRecruiterSearch }) {
  const router = express.Router();

  router.post('/api/recruiter-search', async (req, res, next) => {
    const requestId = getRequestId(req);

    try {
      const payload = await runRecruiterSearch(req.body, requestId);
      return res.json(payload);
    } catch (error) {
      return next(toOpenAiAppError(error, requestId));
    }
  });

  return router;
}

module.exports = { createRecruiterSearchRouter, toOpenAiAppError };

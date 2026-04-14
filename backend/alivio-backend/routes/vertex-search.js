const express = require('express');

const { AppError } = require('../errors');
const { runVertexSearch } = require('../vertex');
const { buildGroundedPayload, validateGroundedPayload } = require('../normalize');
const { buildMockResponse, getRequestId, parseSearchInput } = require('../services/search');

function createVertexSearchRouter({ config, isMockMode, mockVertexFixture }) {
  const router = express.Router();

  router.post('/api/vertex-search', async (req, res, next) => {
    try {
      const { query, pageSize } = parseSearchInput(req.body, config.vertex);

      if (isMockMode) {
        return res.json(buildMockResponse(mockVertexFixture, query, getRequestId(req)));
      }

      const vertexResponse = await runVertexSearch({ query, pageSize, config: config.vertex });
      const grounded = buildGroundedPayload(vertexResponse);

      if (!validateGroundedPayload(grounded)) {
        throw new AppError('Grounded payload failed validation', {
          status: 502,
          code: 'GROUNDING_VALIDATION_FAILED'
        });
      }

      return res.json({
        ok: true,
        query,
        grounded
      });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = { createVertexSearchRouter };

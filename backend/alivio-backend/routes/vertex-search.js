const express = require('express');

const { searchVertex } = require('../services/search-service');

const router = express.Router();

router.post('/api/vertex-search', async (req, res, next) => {
  try {
    const payload = await searchVertex(req.body, req.requestId);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

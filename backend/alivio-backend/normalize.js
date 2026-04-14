function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeVertexResults(searchResponse) {
  const results = toArray(searchResponse?.results);

  return results.map((item, index) => {
    const document = item?.document || {};
    const derived = document?.derivedStructData || {};
    const struct = document?.structData || {};
    const extractiveSegments = toArray(derived?.extractive_answers || derived?.extractiveAnswers)
      .map((answer, segmentIndex) => ({
        rank: segmentIndex + 1,
        content: answer?.content || '',
        pageNumber: answer?.pageNumber || null,
        confidenceScore: typeof answer?.score === 'number' ? answer.score : null
      }))
      .filter((segment) => segment.content);

    const snippets = toArray(derived?.snippets).map((snippet) => snippet?.snippet).filter(Boolean);

    const title = struct?.title || derived?.title || document?.id || `result-${index + 1}`;
    const uri = derived?.link || derived?.uri || struct?.uri || null;

    return {
      rank: index + 1,
      id: document?.id || null,
      title,
      uri,
      snippet: snippets[0] || extractiveSegments[0]?.content || null,
      snippets,
      extractiveSegments,
      metadata: {
        source: struct?.source || derived?.source || null,
        company: struct?.company || null,
        location: struct?.location || null
      },
      rawDocumentName: document?.name || null
    };
  });
}

function buildGroundedPayload(vertexResponse) {
  const results = normalizeVertexResults(vertexResponse);

  return {
    totalSize: Number.isFinite(Number(vertexResponse?.totalSize)) ? Number(vertexResponse.totalSize) : results.length,
    attributionToken: vertexResponse?.attributionToken || null,
    results
  };
}

function validateGroundedPayload(grounded) {
  if (!grounded || typeof grounded !== 'object') return false;
  if (!Array.isArray(grounded.results)) return false;
  return grounded.results.every((result) => result && typeof result === 'object' && typeof result.rank === 'number' && typeof result.title === 'string');
}

module.exports = {
  buildGroundedPayload,
  normalizeVertexResults,
  validateGroundedPayload
};

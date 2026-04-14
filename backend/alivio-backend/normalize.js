function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function normalizeLocation(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'object') {
    const city = firstString(value.city, value.town);
    const state = firstString(value.state, value.region);
    const country = firstString(value.country);
    const parts = [city, state, country].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }
  return null;
}

function inferSourceType(struct = {}, derived = {}) {
  const explicit = firstString(struct.sourceType, struct.type, derived.sourceType, derived.type);
  if (explicit) return explicit.toLowerCase();

  const kind = JSON.stringify({ struct, derived }).toLowerCase();
  if (kind.includes('candidate') || kind.includes('resume') || kind.includes('profile')) {
    return 'candidate';
  }
  if (kind.includes('job') || kind.includes('req') || kind.includes('requisition')) {
    return 'job';
  }
  return 'document';
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

    const title =
      firstString(struct?.title, struct?.name, derived?.title, derived?.name, document?.id) ||
      `result-${index + 1}`;
    const role = firstString(struct?.role, struct?.jobTitle, struct?.position, derived?.role);
    const uri = firstString(derived?.link, derived?.uri, struct?.uri);
    const location = normalizeLocation(struct?.location || derived?.location);
    const sourceType = inferSourceType(struct, derived);

    return {
      rank: index + 1,
      id: document?.id || null,
      title,
      role,
      location,
      uri,
      snippet: snippets[0] || extractiveSegments[0]?.content || null,
      snippets,
      extractiveSegments,
      sourceType,
      metadata: {
        source: firstString(struct?.source, derived?.source),
        company: firstString(struct?.company, struct?.organization, derived?.company),
        location,
        structured: {
          compensation: struct?.compensation || null,
          skills: toArray(struct?.skills || derived?.skills),
          seniority: firstString(struct?.seniority, derived?.seniority),
          employmentType: firstString(struct?.employmentType, derived?.employmentType)
        }
      },
      rawDocumentName: document?.name || null
    };
  });
}

function buildGroundedPayload(vertexResponse) {
  const results = normalizeVertexResults(vertexResponse);

  return {
    totalSize: Number.isFinite(Number(vertexResponse?.totalSize))
      ? Number(vertexResponse.totalSize)
      : results.length,
    attributionToken: vertexResponse?.attributionToken || null,
    results
  };
}

function validateGroundedPayload(grounded) {
  if (!grounded || typeof grounded !== 'object') return false;
  if (!Array.isArray(grounded.results)) return false;

  return grounded.results.every(
    (result) =>
      result &&
      typeof result === 'object' &&
      typeof result.rank === 'number' &&
      typeof result.title === 'string' &&
      Object.prototype.hasOwnProperty.call(result, 'role') &&
      Object.prototype.hasOwnProperty.call(result, 'location') &&
      Object.prototype.hasOwnProperty.call(result, 'sourceType')
  );
}

module.exports = {
  buildGroundedPayload,
  normalizeVertexResults,
  validateGroundedPayload
};

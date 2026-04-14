function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function uniqueTokens(text) {
  return new Set(tokenize(text));
}

function scoreResult({ queryTokens, result }) {
  const corpus = [
    result.title,
    result.role,
    result.location,
    result.snippet,
    ...(Array.isArray(result.snippets) ? result.snippets : [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    if (corpus.includes(token)) score += 2;
  }

  if (result.sourceType === 'candidate') score += 3;
  if (result.sourceType === 'job') score += 2;
  if (result.role) score += 1;
  if (result.location) score += 1;

  return score;
}

function buildRankedGrounding({ query, grounded, limit = 5 }) {
  const queryTokens = uniqueTokens(query);
  const ranked = grounded.results
    .map((result) => ({
      ...result,
      fitScore: scoreResult({ queryTokens, result })
    }))
    .sort((a, b) => b.fitScore - a.fitScore || a.rank - b.rank)
    .slice(0, limit)
    .map((result, idx) => ({
      rank: idx + 1,
      id: result.id,
      title: result.title,
      role: result.role,
      location: result.location,
      sourceType: result.sourceType,
      fitScore: result.fitScore,
      evidence: result.snippets?.slice(0, 2) || []
    }));

  return {
    rankedMatches: ranked,
    topResultIds: ranked.map((item) => item.id).filter(Boolean)
  };
}

module.exports = {
  buildRankedGrounding
};

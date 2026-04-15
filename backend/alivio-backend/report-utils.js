const { AppError } = require('./errors');
const { validateGroundedPayload } = require('./normalize');

function inferSearchType(query, overrideValue) {
  const fromOverride = typeof overrideValue === 'string' ? overrideValue.trim() : '';
  if (fromOverride) {
    return fromOverride;
  }

  const normalized = query.toLowerCase();
  if (normalized.includes('match this role') || normalized.includes('candidate-to-job')) {
    return 'matching';
  }

  if (normalized.includes('job')) {
    return 'job_search';
  }

  if (normalized.includes('candidate')) {
    return 'candidate_search';
  }

  return 'recruiter_copilot';
}

function pickTopRole(rankedMatches, overrideValue) {
  const fromOverride = typeof overrideValue === 'string' ? overrideValue.trim() : '';
  if (fromOverride) {
    return fromOverride;
  }

  const top = rankedMatches[0] || {};
  return (
    top.name_or_title ||
    top.candidate_name ||
    top.role ||
    top.title ||
    'Not specified'
  );
}

function pickGeography(groundedResults, overrideValue) {
  const fromOverride = typeof overrideValue === 'string' ? overrideValue.trim() : '';
  if (fromOverride) {
    return fromOverride;
  }

  for (const result of groundedResults) {
    const location = typeof result?.location === 'string' ? result.location.trim() : '';
    if (location) {
      return location;
    }
  }

  return 'Unspecified';
}

function normalizeSummary(summaryInput, query, groundedResults, rankedMatches) {
  const summary =
    summaryInput && typeof summaryInput === 'object' && !Array.isArray(summaryInput)
      ? summaryInput
      : {};

  return {
    top_role: pickTopRole(rankedMatches, summary.top_role),
    geography: pickGeography(groundedResults, summary.geography),
    search_type: inferSearchType(query, summary.search_type)
  };
}

function parseReportCreateInput(body) {
  const payload = body?.recruiter_result && typeof body.recruiter_result === 'object' ? body.recruiter_result : body;

  const query = typeof payload?.query === 'string' ? payload.query.trim() : '';
  if (!query) {
    throw new AppError('Missing required string field: query', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'query' }
    });
  }

  if (query.length > 500) {
    throw new AppError('query exceeds max length of 500 characters', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'query', maxLength: 500 }
    });
  }

  const grounded = payload?.grounded;
  if (!validateGroundedPayload(grounded)) {
    throw new AppError('grounded payload failed validation', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'grounded' }
    });
  }

  const rankedMatches = Array.isArray(payload?.generated?.ranked_matches)
    ? payload.generated.ranked_matches
    : null;

  if (!rankedMatches) {
    throw new AppError('generated.ranked_matches must be an array', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'generated.ranked_matches' }
    });
  }

  const explanation = typeof payload?.generated?.explanation === 'string' ? payload.generated.explanation.trim() : '';
  if (!explanation) {
    throw new AppError('generated.explanation must be a non-empty string', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'generated.explanation' }
    });
  }

  const outreachDraft = typeof payload?.generated?.outreach_draft === 'string' ? payload.generated.outreach_draft.trim() : '';
  if (!outreachDraft) {
    throw new AppError('generated.outreach_draft must be a non-empty string', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'generated.outreach_draft' }
    });
  }

  return {
    query,
    grounded,
    generated: {
      ranked_matches: rankedMatches,
      explanation,
      outreach_draft: outreachDraft
    },
    summary: normalizeSummary(payload?.summary, query, grounded.results, rankedMatches)
  };
}

module.exports = {
  parseReportCreateInput
};

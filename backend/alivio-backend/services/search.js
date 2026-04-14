const crypto = require('node:crypto');
const OpenAI = require('openai');

const { AppError } = require('../errors');
const { runVertexSearch } = require('../vertex');
const { buildGroundedPayload, validateGroundedPayload } = require('../normalize');
const { buildRankedGrounding } = require('../ranking');

function getRequestId(req) {
  return req.requestId || crypto.randomUUID();
}

function buildMockResponse(template, query, requestId) {
  return {
    ...template,
    query,
    requestId: requestId || `mock-${crypto.randomUUID()}`
  };
}

function parseSearchInput(body, pageBounds) {
  const query = typeof body?.query === 'string' ? body.query.trim() : '';
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

  const inputPageSize = Number.parseInt(String(body?.pageSize ?? pageBounds.defaultPageSize), 10);
  if (!Number.isFinite(inputPageSize)) {
    throw new AppError('pageSize must be an integer when provided', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'pageSize' }
    });
  }

  const pageSize = Math.min(Math.max(inputPageSize, pageBounds.minPageSize), pageBounds.maxPageSize);

  return {
    query,
    pageSize
  };
}

function parseGeneratedOutput(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new AppError('Generated response failed validation', {
      status: 502,
      code: 'OPENAI_INVALID_RESPONSE'
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_error) {
    throw new AppError('Generated response was not valid JSON', {
      status: 502,
      code: 'OPENAI_INVALID_RESPONSE'
    });
  }

  const rankedMatches = Array.isArray(parsed?.ranked_matches) ? parsed.ranked_matches : null;
  const explanation = typeof parsed?.explanation === 'string' ? parsed.explanation : null;
  const outreachDraft = typeof parsed?.outreach_draft === 'string' ? parsed.outreach_draft : null;

  if (!rankedMatches || !explanation || !outreachDraft) {
    throw new AppError('Generated response missing required recruiter fields', {
      status: 502,
      code: 'OPENAI_INVALID_RESPONSE'
    });
  }

  return {
    ranked_matches: rankedMatches,
    explanation,
    outreach_draft: outreachDraft
  };
}

function parseWorkflowType(value) {
  const workflowType = typeof value === 'string' ? value.trim() : '';
  const allowedWorkflowTypes = new Set(['candidate_search', 'job_search', 'match', 'copilot']);

  if (!allowedWorkflowTypes.has(workflowType)) {
    throw new AppError('workflow_type must be one of: candidate_search, job_search, match, copilot', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'workflow_type' }
    });
  }

  return workflowType;
}

function parseMetadata(value) {
  if (value === undefined) {
    return {};
  }

  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new AppError('metadata must be an object when provided', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'metadata' }
    });
  }

  return value;
}

function validateWebhookSecret(req, config) {
  if (!config.webhookSecret) {
    return;
  }

  const incomingSecret = req.headers['x-webhook-secret'];
  if (typeof incomingSecret !== 'string' || incomingSecret !== config.webhookSecret) {
    throw new AppError('Invalid x-webhook-secret header', {
      status: 401,
      code: 'UNAUTHORIZED'
    });
  }
}

function buildRecruiterPrompt(query, grounded) {
  const hasGroundedResults = Array.isArray(grounded?.results) && grounded.results.length > 0;

  return [
    {
      role: 'system',
      content: [
        'You are a senior healthcare recruiter for Alivio Search Partners.',
        'Use grounded JSON results as the ONLY source of candidate and job data.',
        'Never invent, infer, or import details from outside the provided grounded payload.',
        'Respond with strict JSON only and include keys: ranked_matches (array), explanation (string), outreach_draft (string).'
      ].join(' ')
    },
    {
      role: 'user',
      content: JSON.stringify({
        query,
        grounded,
        instructions: hasGroundedResults
          ? [
              'Rank the strongest matches for this recruiter query.',
              'For each ranked match include:',
              '- name_or_title: candidate or role name/title from grounded data',
              '- fit_reasoning: specific fit reasoning tied directly to the recruiter query',
              '- strengths: 2-3 concrete strengths explicitly supported by grounded data',
              '- gaps_or_unknowns: 1-2 honest gaps or unknowns from missing/unclear grounded data',
              '- confidence: { level: "high" | "medium" | "low", rationale: "brief reason grounded in evidence quality and completeness" }',
              'Write explanation in 2-3 sentences on why these are the top matches overall.',
              'Write outreach_draft as a personalized 3-sentence recruiter message based only on grounded data.'
            ].join('\n')
          : [
              'Grounded results are empty.',
              'Return JSON with ranked_matches as an empty array.',
              'Set explanation to a helpful 2-3 sentence note that the data store is still indexing and that broader match evidence will appear as indexing completes.',
              'Set outreach_draft to a short, professional 3-sentence message the recruiter can send internally while waiting for indexing to finish.'
            ].join('\n')
      })
    }
  ];
}

function createRecruiterSearchService({ config, isMockMode, mockRecruiterFixture }) {
  const openai = new OpenAI({ apiKey: config.openai.apiKey });

  return async function runRecruiterSearch(body, requestId) {
    if (isMockMode) {
      const { query } = parseSearchInput(body, config.vertex);
      return buildMockResponse(mockRecruiterFixture, query, requestId);
    }

    if (!config.openai.apiKey) {
      throw new AppError('LLM_API_KEY (or OPENAI_API_KEY) is required for recruiter generation', {
        status: 500,
        code: 'OPENAI_MISSING_API_KEY',
        expose: true
      });
    }

    const { query, pageSize } = parseSearchInput(body, config.vertex);
    const vertexResponse = await runVertexSearch({ query, pageSize, config: config.vertex });
    const grounded = buildGroundedPayload(vertexResponse);

    if (!validateGroundedPayload(grounded)) {
      throw new AppError('Grounded payload failed validation', {
        status: 502,
        code: 'GROUNDING_VALIDATION_FAILED'
      });
    }

    const deterministicRanking = buildRankedGrounding({ query, grounded });

    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      temperature: 0.1,
      messages: buildRecruiterPrompt(query, {
        ...grounded,
        deterministic_ranking: deterministicRanking
      }),
      timeout: config.openai.timeoutMs
    });

    const rawGenerated = completion?.choices?.[0]?.message?.content || '';
    const generated = parseGeneratedOutput(rawGenerated);

    if (!generated.ranked_matches.length && deterministicRanking.rankedMatches.length) {
      generated.ranked_matches = deterministicRanking.rankedMatches;
    }

    return {
      ok: true,
      query,
      grounded,
      generated
    };
  };
}

module.exports = {
  buildMockResponse,
  createRecruiterSearchService,
  getRequestId,
  parseMetadata,
  parseSearchInput,
  parseWorkflowType,
  validateWebhookSecret
};

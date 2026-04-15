const { AppError } = require('./errors');

const ALLOWED_TONES = new Set(['professional', 'warm', 'direct']);

function normalizeOptionalString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function parseOutreachDraftInput(body, pageBounds) {
  const role = normalizeOptionalString(body?.role);
  if (!role) {
    throw new AppError('Missing required string field: role', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'role' }
    });
  }

  if (role.length > 120) {
    throw new AppError('role exceeds max length of 120 characters', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'role', maxLength: 120 }
    });
  }

  const location = normalizeOptionalString(body?.location);
  const careSetting = normalizeOptionalString(body?.care_setting);
  const seniority = normalizeOptionalString(body?.seniority);
  const reasonForFit = normalizeOptionalString(body?.reason_for_fit);

  const outreachToneRaw = normalizeOptionalString(body?.outreach_tone);
  const outreachTone = outreachToneRaw ? outreachToneRaw.toLowerCase() : 'professional';

  if (!ALLOWED_TONES.has(outreachTone)) {
    throw new AppError('outreach_tone must be one of: professional, warm, direct', {
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { field: 'outreach_tone' }
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
    role,
    location,
    care_setting: careSetting,
    seniority,
    outreach_tone: outreachTone,
    reason_for_fit: reasonForFit,
    pageSize
  };
}

function buildOutreachQuery(input) {
  const filters = [
    `Role: ${input.role}`,
    input.location ? `Location: ${input.location}` : null,
    input.care_setting ? `Care setting: ${input.care_setting}` : null,
    input.seniority ? `Seniority: ${input.seniority}` : null
  ].filter(Boolean);

  return `Find healthcare candidates for recruiter outreach. ${filters.join('. ')}`;
}

function buildOutreachPrompt({ input, grounded, deterministicRanking }) {
  return [
    {
      role: 'system',
      content: [
        'You are a healthcare recruiter outreach assistant for Alivio Search Partners.',
        'Use grounded data only and never invent candidate facts.',
        'Return strict JSON only with keys: outreach_message, subject_line, fit_summary, talking_points.'
      ].join(' ')
    },
    {
      role: 'user',
      content: JSON.stringify({
        recruiter_request: input,
        grounded,
        deterministic_ranking: deterministicRanking,
        required_style: {
          max_message_sentences: 4,
          tone: input.outreach_tone,
          audience: 'healthcare candidates',
          target_roles: [
            'Directors of Nursing',
            'LNHAs',
            'MDS Coordinators',
            'allied health',
            'physicians'
          ]
        },
        instructions: [
          'Write a practical outreach_message recruiters can send immediately.',
          'Reference role, location, care_setting, seniority, and reason_for_fit when present.',
          'Return fit_summary as 2 bullet-style strings that explain why this outreach is targeted.',
          'Return talking_points as 3 short call prep points tied to grounded evidence.',
          'If grounded results are empty, still provide a safe outreach_message that asks for an exploratory conversation.'
        ]
      })
    }
  ];
}

function parseOutreachGeneratedOutput(raw) {
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

  const outreachMessage = normalizeOptionalString(parsed?.outreach_message);
  const subjectLine = normalizeOptionalString(parsed?.subject_line);
  const fitSummary = Array.isArray(parsed?.fit_summary)
    ? parsed.fit_summary.map((item) => normalizeOptionalString(item)).filter(Boolean)
    : [];
  const talkingPoints = Array.isArray(parsed?.talking_points)
    ? parsed.talking_points.map((item) => normalizeOptionalString(item)).filter(Boolean)
    : [];

  if (!outreachMessage || !subjectLine || !fitSummary.length || !talkingPoints.length) {
    throw new AppError('Generated response missing required outreach fields', {
      status: 502,
      code: 'OPENAI_INVALID_RESPONSE'
    });
  }

  return {
    outreach_message: outreachMessage,
    subject_line: subjectLine,
    fit_summary: fitSummary,
    talking_points: talkingPoints
  };
}

module.exports = {
  buildOutreachPrompt,
  buildOutreachQuery,
  parseOutreachDraftInput,
  parseOutreachGeneratedOutput
};

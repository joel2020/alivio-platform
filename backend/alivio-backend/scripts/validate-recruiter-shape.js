const fs = require('node:fs');

function isArray(value) {
  return Array.isArray(value);
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateRecruiterShape(payload) {
  const errors = [];

  if (!isObject(payload)) {
    errors.push('response must be a JSON object');
    return { ok: false, errors };
  }

  if (typeof payload.ok !== 'boolean') {
    errors.push('missing or invalid field: ok (boolean)');
  }

  if (typeof payload.query !== 'string' || !payload.query.trim()) {
    errors.push('missing or invalid field: query (non-empty string)');
  }

  if (!isObject(payload.grounded)) {
    errors.push('missing or invalid field: grounded (object)');
  } else if (!isArray(payload.grounded.results)) {
    errors.push('missing or invalid field: grounded.results (array)');
  }

  if (!isObject(payload.generated)) {
    errors.push('missing or invalid field: generated (object)');
  } else {
    if (!isArray(payload.generated.ranked_matches)) {
      errors.push('missing or invalid field: generated.ranked_matches (array)');
    }

    if (typeof payload.generated.explanation !== 'string' || !payload.generated.explanation.trim()) {
      errors.push('missing or invalid field: generated.explanation (non-empty string)');
    }

    if (typeof payload.generated.outreach_draft !== 'string' || !payload.generated.outreach_draft.trim()) {
      errors.push('missing or invalid field: generated.outreach_draft (non-empty string)');
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

function readInputFromArgs(argv) {
  const argPath = argv[2];
  if (!argPath) {
    return null;
  }

  return JSON.parse(fs.readFileSync(argPath, 'utf8'));
}

function readInputFromStdin() {
  const input = fs.readFileSync(0, 'utf8').trim();
  if (!input) {
    return null;
  }

  return JSON.parse(input);
}

if (require.main === module) {
  try {
    const payload = readInputFromArgs(process.argv) || readInputFromStdin();

    if (!payload) {
      console.error('Usage: node scripts/validate-recruiter-shape.js <response.json>');
      console.error('   or: cat response.json | node scripts/validate-recruiter-shape.js');
      process.exit(1);
    }

    const result = validateRecruiterShape(payload);

    if (!result.ok) {
      console.error('Recruiter response shape validation failed:');
      result.errors.forEach((error) => console.error(`- ${error}`));
      process.exit(1);
    }

    console.log('Recruiter response shape is valid.');
  } catch (error) {
    console.error(`Validation script error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  validateRecruiterShape
};

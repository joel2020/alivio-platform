const DEFAULT_QUERY = 'Director of Nursing New Jersey';

function resolveBaseUrl() {
  const input = process.argv[2] || process.env.ALIVIO_API_BASE_URL;
  if (!input || !String(input).trim()) {
    console.error('Missing backend URL. Provide ALIVIO_API_BASE_URL or first CLI argument.');
    process.exit(1);
  }

  return String(input).trim().replace(/\/$/, '');
}

function formatDuration(ms) {
  return `${Math.round(ms)}ms`;
}

async function timedRequest(baseUrl, path, options = {}) {
  const start = performance.now();
  const response = await fetch(`${baseUrl}${path}`, options);
  const elapsedMs = performance.now() - start;

  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch (_error) {
    json = null;
  }

  return {
    response,
    elapsedMs,
    text,
    json
  };
}

function printCheckResult(label, passed, elapsedMs, details) {
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${status} ${label} (${formatDuration(elapsedMs)})`);

  if (!passed && details) {
    console.error(`  ${details}`);
  }
}

function formatBody(bodyText) {
  if (!bodyText) {
    return '<empty body>';
  }

  try {
    return JSON.stringify(JSON.parse(bodyText));
  } catch (_error) {
    return bodyText;
  }
}

function hasAllStatusKeys(json) {
  const required = ['vertexEndpoint', 'openaiKey', 'gcpCredentials'];

  return required.every((key) => json && json[key] === 'configured');
}

function hasGroundedObject(json) {
  return Boolean(json && json.ok === true && json.grounded && typeof json.grounded === 'object');
}

function hasRankedMatches(json) {
  return Boolean(
    json &&
      json.ok === true &&
      json.generated &&
      Array.isArray(json.generated.ranked_matches)
  );
}

async function runChecks(baseUrl) {
  const checks = [
    {
      label: 'GET /health',
      run: () => timedRequest(baseUrl, '/health', { method: 'GET' }),
      validate: (result) => result.response.ok && result.json && result.json.ok === true
    },
    {
      label: 'GET /api/status',
      run: () => timedRequest(baseUrl, '/api/status', { method: 'GET' }),
      validate: (result) => result.response.ok && result.json && result.json.ok === true && hasAllStatusKeys(result.json)
    },
    {
      label: `POST /api/vertex-search query="${DEFAULT_QUERY}"`,
      run: () =>
        timedRequest(baseUrl, '/api/vertex-search', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({ query: DEFAULT_QUERY })
        }),
      validate: (result) => result.response.ok && hasGroundedObject(result.json)
    },
    {
      label: `POST /api/recruiter-search query="${DEFAULT_QUERY}"`,
      run: () =>
        timedRequest(baseUrl, '/api/recruiter-search', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({ query: DEFAULT_QUERY })
        }),
      validate: (result) => result.response.ok && hasRankedMatches(result.json)
    }
  ];

  let passedCount = 0;

  for (const check of checks) {
    try {
      const result = await check.run();
      const passed = check.validate(result);
      if (passed) {
        passedCount += 1;
      }

      const details = passed
        ? ''
        : `HTTP ${result.response.status} body=${formatBody(result.text)}`;

      printCheckResult(check.label, passed, result.elapsedMs, details);
    } catch (error) {
      printCheckResult(check.label, false, 0, error.message);
    }
  }

  return {
    total: checks.length,
    passed: passedCount
  };
}

async function main() {
  const baseUrl = resolveBaseUrl();
  console.log(`Running deployment validation against ${baseUrl}`);

  const summary = await runChecks(baseUrl);

  console.log('');
  console.log('Deployment summary');
  console.log(`- Passed: ${summary.passed}/${summary.total}`);
  console.log(`- Backend URL: ${baseUrl}`);
  console.log(`- Timestamp: ${new Date().toISOString()}`);

  process.exit(summary.passed === summary.total ? 0 : 1);
}

main().catch((error) => {
  console.error(`Validation runner error: ${error.message}`);
  process.exit(1);
});

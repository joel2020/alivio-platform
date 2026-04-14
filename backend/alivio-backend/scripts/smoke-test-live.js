const BASE_URL = (process.env.ALIVIO_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const QUERY_FIXTURES = [
  'Director of Nursing New Jersey',
  'ICU travel nurse Texas compact RN license',
  'Healthcare operations VP multi-site P&L',
  'SNF Administrator California 5 years experience',
  'Director of Pharmacy hospital setting',
  'VP of Patient Services large health system'
];

function formatMs(value) {
  return `${Math.round(value)}ms`;
}

function printFailureBody(label, bodyText) {
  console.error(`  ${label}:`);
  if (!bodyText) {
    console.error('  <empty body>');
    return;
  }

  try {
    const parsed = JSON.parse(bodyText);
    console.error(JSON.stringify(parsed, null, 2));
  } catch (_error) {
    console.error(bodyText);
  }
}

async function timedJsonRequest(path, method, payload) {
  const start = performance.now();
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: payload
      ? {
          'content-type': 'application/json'
        }
      : undefined,
    body: payload ? JSON.stringify(payload) : undefined
  });
  const elapsedMs = performance.now() - start;

  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch (_error) {
    json = null;
  }

  return {
    elapsedMs,
    response,
    text,
    json
  };
}

function assertVertexResponse(json) {
  return Boolean(json && json.ok === true && json.grounded && Array.isArray(json.grounded.results));
}

function assertRecruiterResponse(json) {
  return Boolean(
    json &&
      json.ok === true &&
      json.grounded &&
      json.generated &&
      Array.isArray(json.generated.ranked_matches) &&
      typeof json.generated.explanation === 'string' &&
      json.generated.explanation.trim().length > 0 &&
      typeof json.generated.outreach_draft === 'string' &&
      json.generated.outreach_draft.trim().length > 0
  );
}

async function runHealthCheck() {
  const result = await timedJsonRequest('/health', 'GET');
  const passed = result.response.ok && result.json && result.json.ok === true;

  if (passed) {
    console.log(`PASS GET /health (${formatMs(result.elapsedMs)})`);
  } else {
    console.error(`FAIL GET /health (${formatMs(result.elapsedMs)})`);
    console.error(`  HTTP ${result.response.status}`);
    printFailureBody('Response body', result.text);
  }

  return passed;
}

async function runVertexCheck(query) {
  const result = await timedJsonRequest('/api/vertex-search', 'POST', { query });
  const passed = result.response.ok && assertVertexResponse(result.json);

  if (passed) {
    console.log(`PASS POST /api/vertex-search query="${query}" (${formatMs(result.elapsedMs)})`);
  } else {
    console.error(`FAIL POST /api/vertex-search query="${query}" (${formatMs(result.elapsedMs)})`);
    console.error(`  HTTP ${result.response.status}`);
    printFailureBody('Response body', result.text);
  }

  return passed;
}

async function runRecruiterCheck(query) {
  const result = await timedJsonRequest('/api/recruiter-search', 'POST', { query });
  const passed = result.response.ok && assertRecruiterResponse(result.json);

  if (passed) {
    console.log(`PASS POST /api/recruiter-search query="${query}" (${formatMs(result.elapsedMs)})`);
  } else {
    console.error(`FAIL POST /api/recruiter-search query="${query}" (${formatMs(result.elapsedMs)})`);
    console.error(`  HTTP ${result.response.status}`);
    printFailureBody('Response body', result.text);
  }

  return passed;
}

async function main() {
  console.log(`Running live smoke tests against ${BASE_URL}`);

  let allPassed = true;

  const healthPassed = await runHealthCheck();
  allPassed = allPassed && healthPassed;

  for (const query of QUERY_FIXTURES) {
    const vertexPassed = await runVertexCheck(query);
    allPassed = allPassed && vertexPassed;

    const recruiterPassed = await runRecruiterCheck(query);
    allPassed = allPassed && recruiterPassed;
  }

  if (allPassed) {
    console.log('All live smoke tests passed.');
    process.exit(0);
  }

  console.error('One or more live smoke tests failed.');
  process.exit(1);
}

main().catch((error) => {
  console.error(`Smoke test runner error: ${error.message}`);
  process.exit(1);
});

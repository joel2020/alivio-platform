const { getBaseUrl, getJson } = require('./lib/http');

async function main() {
  const { response, text, json } = await getJson('/health');

  if (!response.ok) {
    console.error(`Health check failed with HTTP ${response.status}`);
    console.error(text);
    process.exit(1);
  }

  if (!json || json.ok !== true || typeof json.status !== 'string') {
    console.error('Health check response did not contain expected shape.');
    console.error(text);
    process.exit(1);
  }

  console.log(`Health smoke passed at ${getBaseUrl()}/health`);
  console.log(JSON.stringify({ ok: json.ok, status: json.status, service: json.service }, null, 2));
}

main().catch((error) => {
  console.error(`Health smoke errored: ${error.message}`);
  process.exit(1);
});

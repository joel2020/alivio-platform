const path = require('node:path');
const { getBaseUrl, postJson, readJsonFile } = require('./lib/http');

const defaultPayloadPath = path.join(__dirname, '..', 'examples', 'payloads', 'candidate-search.json');

async function main() {
  const payloadPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultPayloadPath;
  const payload = readJsonFile(payloadPath);

  const { response, text, json } = await postJson('/api/vertex-search', payload);

  if (!response.ok) {
    console.error(`Vertex smoke failed with HTTP ${response.status}`);
    console.error(text);
    process.exit(1);
  }

  if (!json || json.ok !== true || !json.grounded || !Array.isArray(json.grounded.results)) {
    console.error('Vertex smoke response did not contain expected fields (ok, grounded.results).');
    console.error(text);
    process.exit(1);
  }

  console.log(`Vertex smoke passed at ${getBaseUrl()}/api/vertex-search`);
  console.log(`Payload: ${payloadPath}`);
  console.log(`Grounded results count: ${json.grounded.results.length}`);
}

main().catch((error) => {
  console.error(`Vertex smoke errored: ${error.message}`);
  process.exit(1);
});

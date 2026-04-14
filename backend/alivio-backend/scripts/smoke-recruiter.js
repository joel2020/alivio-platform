const path = require('node:path');
const { getBaseUrl, postJson, readJsonFile } = require('./lib/http');
const { validateRecruiterShape } = require('./validate-recruiter-shape');

const defaultPayloadPath = path.join(__dirname, '..', 'examples', 'payloads', 'recruiter-copilot.json');

async function main() {
  const payloadPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultPayloadPath;
  const payload = readJsonFile(payloadPath);

  const { response, text, json } = await postJson('/api/recruiter-search', payload);

  if (!response.ok) {
    console.error(`Recruiter smoke failed with HTTP ${response.status}`);
    console.error(text);
    process.exit(1);
  }

  const validation = validateRecruiterShape(json);
  if (!validation.ok) {
    console.error('Recruiter smoke returned unexpected response shape:');
    validation.errors.forEach((error) => console.error(`- ${error}`));
    console.error(text);
    process.exit(1);
  }

  console.log(`Recruiter smoke passed at ${getBaseUrl()}/api/recruiter-search`);
  console.log(`Payload: ${payloadPath}`);
  console.log(`Ranked matches: ${json.generated.ranked_matches.length}`);
}

main().catch((error) => {
  console.error(`Recruiter smoke errored: ${error.message}`);
  process.exit(1);
});

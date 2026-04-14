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

  const rankedMatches = json?.generated?.ranked_matches || [];
  const confidenceErrors = [];

  rankedMatches.forEach((match, index) => {
    const confidence = match?.confidence;
    const level = confidence?.level;
    const rationale = confidence?.rationale;
    const validLevel = level === 'high' || level === 'medium' || level === 'low';
    const validRationale = typeof rationale === 'string' && rationale.trim().length > 0;

    if (!validLevel || !validRationale) {
      confidenceErrors.push(
        `ranked_matches[${index}] must include confidence.level (high|medium|low) and confidence.rationale (non-empty string)`
      );
    }
  });

  if (confidenceErrors.length > 0) {
    console.error('Recruiter smoke missing confidence rationale shape:');
    confidenceErrors.forEach((error) => console.error(`- ${error}`));
    console.error(text);
    process.exit(1);
  }

  console.log(`Recruiter smoke passed at ${getBaseUrl()}/api/recruiter-search`);
  console.log(`Payload: ${payloadPath}`);
  console.log(`Ranked matches: ${rankedMatches.length}`);
}

main().catch((error) => {
  console.error(`Recruiter smoke errored: ${error.message}`);
  process.exit(1);
});

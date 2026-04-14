'use strict';

/**
 * Framework-agnostic frontend integration examples.
 *
 * 1) Static site:
 *    - Include ../frontend/alivio-api-client.js via <script>.
 *    - Call window.AlivioApiClient.createClient({ baseUrl }).recruiterSearch(...)
 *
 * 2) Simple JavaScript app:
 *    - Import this file and call runSimpleAppFlow(client, query).
 *
 * 3) Server-rendered page (Node/CommonJS):
 *    - Use createServerRenderedModel(reqBody) to prefetch data on the server.
 */

const { createAlivioApiClient } = require('../frontend/alivio-api-client');

const SAMPLE_QUERIES = {
  candidateSearch:
    'Find senior healthcare operations candidates in New Jersey with SNF and multi-site leadership experience.',
  jobSearch:
    'Find open Director of Nursing roles in New Jersey requiring SNF and multi-site leadership background.',
  jobToCandidateMatch:
    'Match this role to likely candidates: Director of Nursing in New Jersey, SNF and multi-site leadership required.',
  candidateToJobMatch:
    'Given this candidate profile: RN leader with SNF and multi-site oversight in NJ, find best-fit open roles.',
  recruiterCopilot:
    'Draft a recruiter-ready shortlist and outreach for Directors of Nursing in New Jersey with SNF experience and multi-site leadership.'
};

async function runSimpleAppFlow(client, query) {
  return client.recruiterSearch({ query, pageSize: 10 });
}

async function createServerRenderedModel(reqBody, options) {
  const config = options || {};
  const client = createAlivioApiClient({
    baseUrl: config.baseUrl || 'https://api.aliviosearchpartners.com',
    fetchImpl: config.fetchImpl || fetch,
    defaultHeaders: config.defaultHeaders || {}
  });

  const query =
    typeof reqBody?.query === 'string' && reqBody.query.trim()
      ? reqBody.query.trim()
      : SAMPLE_QUERIES.recruiterCopilot;

  const [grounded, copilot] = await Promise.all([
    client.vertexSearch({ query, pageSize: 8 }),
    client.recruiterSearch({ query, pageSize: 8 })
  ]);

  return {
    query,
    groundedResults: grounded?.grounded?.results || [],
    rankedMatches: copilot?.generated?.ranked_matches || [],
    explanation: copilot?.generated?.explanation || '',
    outreachDraft: copilot?.generated?.outreach_draft || ''
  };
}

module.exports = {
  SAMPLE_QUERIES,
  runSimpleAppFlow,
  createServerRenderedModel
};

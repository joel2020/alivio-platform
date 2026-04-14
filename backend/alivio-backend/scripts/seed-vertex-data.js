#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const PROJECT_NUMBER = '807488403515';
const LOCATION = 'global';
const COLLECTION = 'default_collection';
const DATA_STORE_ID = 'alivio-candidates_1776188933051';
const BRANCH = 'default_branch';

const IMPORT_URL = `https://discoveryengine.googleapis.com/v1alpha/projects/${PROJECT_NUMBER}/locations/${LOCATION}/collections/${COLLECTION}/dataStores/${DATA_STORE_ID}/branches/${BRANCH}/documents:import`;

const fixturePath = path.join(__dirname, '..', 'examples', 'seed-documents.json');

async function readFixtureDocuments() {
  const raw = await fs.readFile(fixturePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Fixture file must contain a non-empty array of documents.');
  }

  return parsed;
}

function toDiscoveryDocument(candidateDoc) {
  return {
    id: candidateDoc.id,
    structData: {
      title: candidateDoc.title,
      role: candidateDoc.role,
      location: candidateDoc.location,
      specialization: candidateDoc.specialization,
      yearsExperience: candidateDoc.yearsExperience,
      summary: candidateDoc.summary
    }
  };
}

async function importOneDocument(accessToken, candidateDoc) {
  const payload = {
    inlineSource: {
      documents: [toDiscoveryDocument(candidateDoc)]
    },
    reconciliationMode: 'INCREMENTAL'
  };

  const response = await fetch(IMPORT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${body}`);
  }

  const operation = await response.json();
  if (!operation.name) {
    throw new Error('Import request returned no operation name.');
  }

  return operation.name;
}

async function waitForOperation(accessToken, operationName) {
  const operationUrl = `https://discoveryengine.googleapis.com/v1alpha/${operationName}`;
  const pollLimit = 30;

  for (let attempt = 1; attempt <= pollLimit; attempt += 1) {
    const response = await fetch(operationUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Polling failed: HTTP ${response.status} ${response.statusText}: ${body}`);
    }

    const operation = await response.json();
    if (operation.done) {
      return operation;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Operation ${operationName} did not complete within timeout.`);
}

function getFailureReason(operation) {
  if (operation.error && operation.error.message) {
    return operation.error.message;
  }

  const sampleErrors = operation.response?.errorSamples;
  if (Array.isArray(sampleErrors) && sampleErrors.length > 0) {
    return sampleErrors[0].message || JSON.stringify(sampleErrors[0]);
  }

  return 'Unknown import error.';
}

async function main() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set.');
  }

  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  const accessToken = accessTokenResponse?.token || accessTokenResponse;

  if (!accessToken) {
    throw new Error('Failed to retrieve an access token from GoogleAuth.');
  }

  const docs = await readFixtureDocuments();

  console.log(`Seeding ${docs.length} documents into Vertex AI Search data store ${DATA_STORE_ID}...`);

  let successCount = 0;
  let failureCount = 0;

  for (const doc of docs) {
    try {
      const operationName = await importOneDocument(accessToken, doc);
      const operation = await waitForOperation(accessToken, operationName);

      const sampleErrors = operation.response?.errorSamples;
      if (operation.error || (Array.isArray(sampleErrors) && sampleErrors.length > 0)) {
        failureCount += 1;
        console.error(`❌ Failed to import ${doc.id}: ${getFailureReason(operation)}`);
      } else {
        successCount += 1;
        console.log(`✅ Imported ${doc.id} (${doc.title})`);
      }
    } catch (error) {
      failureCount += 1;
      console.error(`❌ Failed to import ${doc.id}: ${error.message}`);
    }
  }

  console.log(`Done. Success: ${successCount}, Failed: ${failureCount}`);

  if (failureCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Seeding aborted:', error.message);
  process.exit(1);
});

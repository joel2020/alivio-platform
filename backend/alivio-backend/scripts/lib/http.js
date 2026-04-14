const fs = require('node:fs');

function getBaseUrl() {
  return (process.env.ALIVIO_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function postJson(path, body) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch (_error) {
    json = null;
  }

  return { response, text, json };
}

async function getJson(path) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'GET'
  });

  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch (_error) {
    json = null;
  }

  return { response, text, json };
}

module.exports = {
  getBaseUrl,
  readJsonFile,
  postJson,
  getJson
};

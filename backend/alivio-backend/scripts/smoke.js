const path = require('node:path');
const { spawnSync } = require('node:child_process');

const scripts = ['smoke-health.js', 'smoke-vertex.js', 'smoke-recruiter.js'];

function runScript(scriptName) {
  const scriptPath = path.join(__dirname, scriptName);
  const result = spawnSync(process.execPath, [scriptPath], { stdio: 'inherit' });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

for (const script of scripts) {
  runScript(script);
}

console.log('All smoke checks passed.');

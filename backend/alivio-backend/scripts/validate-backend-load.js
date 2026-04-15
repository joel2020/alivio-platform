#!/usr/bin/env node
'use strict';

const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');

const modulesToLoad = [
  'config.js',
  'errors.js',
  'logger.js',
  'normalize.js',
  'ranking.js',
  'vertex.js',
  'scripts/lib/http.js',
  'scripts/validate-recruiter-shape.js'
];

const failed = [];

for (const relativePath of modulesToLoad) {
  const fullPath = path.join(rootDir, relativePath);

  try {
    require(fullPath);
    console.log(`PASS require ${relativePath}`);
  } catch (error) {
    failed.push({
      relativePath,
      message: error instanceof Error ? error.message : String(error)
    });
    console.error(`FAIL require ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed.length > 0) {
  console.error(`\nModule-load validation failed for ${failed.length} file(s).`);
  process.exit(1);
}

console.log(`\nModule-load validation passed for ${modulesToLoad.length} file(s).`);

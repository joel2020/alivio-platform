'use strict';

const path = require('node:path');

const modulesToLoad = [
  '../config',
  '../app',
  '../routes/health',
  '../routes/vertex-search',
  '../routes/recruiter-search',
  '../routes/webhook-n8n',
  '../services/search'
];

for (const modulePath of modulesToLoad) {
  require(path.join(__dirname, modulePath));
}

const { createApp } = require('../app');

createApp();

console.log('boot_safety_check_passed');

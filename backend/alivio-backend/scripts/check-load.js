function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const { createApp } = require('../app');

assert(typeof createApp === 'function', 'app.createApp must be a function');

const app = createApp();
assert(app && typeof app.use === 'function', 'createApp must return an Express app instance');

console.log('load_check_ok');

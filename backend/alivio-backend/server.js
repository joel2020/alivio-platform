const config = require('./config');
const logger = require('./logger');
const { createApp } = require('./app');

const app = createApp();
const server = app.listen(config.port, () => {
  logger.info('server_started', {
    service: config.serviceName,
    env: config.env,
    port: config.port,
    corsEnabled: config.enableCors,
    hasGoogleCredentialsPath: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    hasOpenAiApiKey: Boolean(config.openai.apiKey),
    appMode: config.appMode
  });
  logger.info('sample_query_ready', {
    sampleRecruiterQuery: config.defaults.sampleRecruiterQuery
  });
});

let isShuttingDown = false;

function logFatalAndExit(kind, error) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  const details =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error) };

  console.error(
    JSON.stringify({
      severity: 'ERROR',
      message: kind,
      timestamp: new Date().toISOString(),
      meta: details
    })
  );

  const forceExitTimer = setTimeout(() => process.exit(1), 5000);
  forceExitTimer.unref();

  server.close(() => {
    process.exit(1);
  });
}

process.on('unhandledRejection', (reason) => {
  logFatalAndExit('unhandled_rejection', reason);
});

process.on('uncaughtException', (error) => {
  logFatalAndExit('uncaught_exception', error);
});

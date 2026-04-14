function sanitizeMeta(meta) {
  if (!meta || typeof meta !== 'object') {
    return undefined;
  }

  return meta;
}

function writeLog(level, message, meta) {
  const payload = {
    severity: level.toUpperCase(),
    message,
    timestamp: new Date().toISOString()
  };

  const safeMeta = sanitizeMeta(meta);
  if (safeMeta) {
    payload.meta = safeMeta;
  }

  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }

  console.log(line);
}

module.exports = {
  info(message, meta) {
    writeLog('info', message, meta);
  },
  warn(message, meta) {
    writeLog('warn', message, meta);
  },
  error(message, meta) {
    writeLog('error', message, meta);
  }
};

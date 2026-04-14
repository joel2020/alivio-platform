class AppError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'AppError';
    this.status = options.status || 500;
    this.code = options.code || 'INTERNAL_ERROR';
    this.details = options.details || null;
    this.expose = options.expose !== false;
  }
}

function errorToResponse(error) {
  const status = Number.isInteger(error?.status) ? error.status : 500;
  const code = error?.code || 'INTERNAL_ERROR';

  return {
    status,
    payload: {
      ok: false,
      error: {
        code,
        message: error?.expose === false ? 'Internal server error' : error?.message || 'Internal server error',
        details: error?.details || null
      }
    }
  };
}

module.exports = {
  AppError,
  errorToResponse
};

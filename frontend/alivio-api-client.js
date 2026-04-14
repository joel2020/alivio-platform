(function (globalScope) {
  'use strict';

  function normalizeBaseUrl(baseUrl) {
    if (!baseUrl) return '';
    return String(baseUrl).replace(/\/$/, '');
  }

  function safeJsonParse(text) {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (_error) {
      return null;
    }
  }

  function buildApiError(response, payload) {
    var fallbackMessage = 'Request failed with status ' + response.status;
    var message =
      (payload && payload.error && payload.error.message) ||
      (payload && payload.message) ||
      fallbackMessage;

    var error = new Error(message);
    error.name = 'AlivioApiError';
    error.status = response.status;
    error.code = payload && payload.error ? payload.error.code : null;
    error.details = payload && payload.error ? payload.error.details : null;
    error.requestId = (payload && payload.requestId) || response.headers.get('x-request-id') || null;
    error.payload = payload;

    return error;
  }

  function createAlivioApiClient(options) {
    var config = options || {};
    var fetchImpl = config.fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalScope) : null);

    if (!fetchImpl) {
      throw new Error('No fetch implementation available. Provide options.fetchImpl.');
    }

    var baseUrl = normalizeBaseUrl(config.baseUrl || '');
    var defaultHeaders = config.defaultHeaders || {};

    async function post(path, body, requestOptions) {
      var opts = requestOptions || {};
      var headers = Object.assign({}, defaultHeaders, opts.headers || {}, {
        'Content-Type': 'application/json'
      });

      var response = await fetchImpl(baseUrl + path, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body || {}),
        signal: opts.signal
      });

      var rawText = await response.text();
      var payload = safeJsonParse(rawText);

      if (!response.ok || !(payload && payload.ok)) {
        throw buildApiError(response, payload);
      }

      return payload;
    }

    return {
      vertexSearch: function vertexSearch(params, requestOptions) {
        return post('/api/vertex-search', params, requestOptions);
      },
      recruiterSearch: function recruiterSearch(params, requestOptions) {
        return post('/api/recruiter-search', params, requestOptions);
      }
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createAlivioApiClient: createAlivioApiClient };
  }

  if (globalScope) {
    globalScope.AlivioApiClient = {
      createClient: createAlivioApiClient
    };
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);

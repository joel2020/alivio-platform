const crypto = require('node:crypto');

const DEFAULT_MAX_REPORTS = 200;

function createReportStore(options = {}) {
  const maxReports = Number.isInteger(options.maxReports) ? options.maxReports : DEFAULT_MAX_REPORTS;
  const reports = new Map();

  function pruneIfNeeded() {
    while (reports.size > maxReports) {
      const oldestKey = reports.keys().next().value;
      if (!oldestKey) {
        break;
      }
      reports.delete(oldestKey);
    }
  }

  return {
    save(reportPayload) {
      const id = `report_${crypto.randomUUID()}`;
      const createdAt = new Date().toISOString();
      const report = {
        id,
        createdAt,
        ...reportPayload
      };

      reports.set(id, report);
      pruneIfNeeded();

      return report;
    },
    getById(id) {
      return reports.get(id) || null;
    }
  };
}

module.exports = {
  createReportStore
};

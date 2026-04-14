async function loadMock(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load fixture: ${path}`);
  }
  return response.json();
}

function renderAnswerCard(data) {
  document.getElementById('query').textContent = data.query || '—';
  document.getElementById('explanation').textContent = data.generated?.explanation || '—';
  document.getElementById('outreach').textContent = data.generated?.outreach_draft || '—';

  const ranked = (data.generated?.ranked_matches || [])
    .map((item) => `#${item.rank} ${item.candidate_name} (${(item.fit_score * 100).toFixed(0)}%)`)
    .join('\n');
  document.getElementById('ranked').textContent = ranked || '—';

  const evidence = (data.grounded?.results || [])
    .map((item) => `#${item.rank} ${item.name}: ${item.evidence}`)
    .join('\n');
  document.getElementById('evidence').textContent = evidence || '—';
}

(async function init() {
  try {
    const data = await loadMock('../mock-fixtures/recruiter-copilot-answer-card.json');
    renderAnswerCard(data);
  } catch (error) {
    document.getElementById('status').textContent = error.message;
  }
})();

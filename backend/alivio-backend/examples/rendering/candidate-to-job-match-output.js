async function loadMock(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load fixture: ${path}`);
  }
  return response.json();
}

function renderHeader(data) {
  const profile = data.candidate_profile || {};
  document.getElementById('candidate-name').textContent = profile.name || 'Unknown candidate';
  document.getElementById('candidate-headline').textContent = profile.headline || '';
  document.getElementById('candidate-location').textContent = profile.location || '';
}

function renderJobs(data) {
  const container = document.getElementById('job-matches');
  container.innerHTML = '';

  (data.generated?.ranked_matches || []).forEach((job) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="row">
        <strong>#${job.rank} ${job.job_title}</strong>
        <span>Fit ${(job.fit_score * 100).toFixed(0)}%</span>
      </div>
      <div>${job.employer} • ${job.location}</div>
      <div>Comp: ${job.comp_band}</div>
      <ul>${(job.match_reasons || []).map((r) => `<li>${r}</li>`).join('')}</ul>
    `;
    container.appendChild(card);
  });
}

function renderNarrative(data) {
  document.getElementById('explanation').textContent = data.generated?.explanation || '—';
  document.getElementById('outreach').textContent = data.generated?.outreach_draft || '—';
}

(async function init() {
  try {
    const data = await loadMock('../mock-fixtures/candidate-to-job-match-output.json');
    renderHeader(data);
    renderJobs(data);
    renderNarrative(data);
  } catch (error) {
    document.getElementById('status').textContent = error.message;
  }
})();

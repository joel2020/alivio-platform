async function loadMock(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load fixture: ${path}`);
  }
  return response.json();
}

function renderGroundedResults(data) {
  const list = document.getElementById('grounded-results');
  list.innerHTML = '';

  (data.grounded?.results || []).forEach((item) => {
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `
      <div class="row">
        <strong>#${item.rank} ${item.name}</strong>
        <span>${item.location}</span>
      </div>
      <div>${item.title} • ${item.yearsExperience} years</div>
      <p>${item.snippet}</p>
      <small>Source: ${item.source}</small>
    `;
    list.appendChild(li);
  });
}

function renderRankedMatches(data) {
  const list = document.getElementById('ranked-matches');
  list.innerHTML = '';

  (data.generated?.ranked_matches || []).forEach((match) => {
    const li = document.createElement('li');
    li.className = 'card';
    const reasons = (match.match_reasons || []).map((r) => `<li>${r}</li>`).join('');
    li.innerHTML = `
      <div class="row">
        <strong>#${match.rank} ${match.candidate_name}</strong>
        <span>Fit ${(match.fit_score * 100).toFixed(0)}%</span>
      </div>
      <ul>${reasons}</ul>
    `;
    list.appendChild(li);
  });
}

function renderExplanationAndOutreach(data) {
  document.getElementById('explanation').textContent = data.generated?.explanation || '—';
  document.getElementById('outreach').textContent = data.generated?.outreach_draft || '—';
}

(async function init() {
  try {
    const data = await loadMock('../mock-fixtures/recruiter-search-result-list.json');
    renderGroundedResults(data);
    renderRankedMatches(data);
    renderExplanationAndOutreach(data);
  } catch (error) {
    document.getElementById('status').textContent = error.message;
  }
})();

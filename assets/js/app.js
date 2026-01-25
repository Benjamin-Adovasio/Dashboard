const ICONS = {
  shield: `<svg viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.5 9.5-8 12-4.5-2.5-8-7-8-12V6z"/></svg>`,
  cloud: `<svg viewBox="0 0 24 24"><path d="M6 18h11a4 4 0 0 0 0-8 5 5 0 0 0-9.7-1A4 4 0 0 0 6 18z"/></svg>`,
  printer: `<svg viewBox="0 0 24 24"><path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="7"/><rect x="4" y="9" width="16" height="5"/></svg>`,
  key: `<svg viewBox="0 0 24 24"><circle cx="7" cy="15" r="3"/><path d="M10 15h11l-2-2 2-2"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"/> <circle cx="12" cy="13" r="4"/></svg>`
};

fetch('/assets/data/services.json')
  .then(r => r.json())
  .then(data => {
    renderServices(data.core);
    renderServicesBar(data.core);
  });

function renderServices(services) {
  const grid = document.getElementById('grid-core');
  services.forEach(s => {
    const a = document.createElement('a');
    a.className = 'card service-card';
    a.href = s.url;
    a.target = '_blank';
    a.id = `service-${s.id}`;
    a.innerHTML = `
      <div class="service-icon">${ICONS[s.icon]}</div>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
    `;
    grid.appendChild(a);
  });
}

function renderServicesBar(services) {
  const bar = document.getElementById('services-bar-inner');
  services.forEach(s => {
    const btn = document.createElement('a');
    btn.href = `#service-${s.id}`;
    btn.innerHTML = `${ICONS[s.icon]}<span>${s.name}</span>`;
    bar.appendChild(btn);
  });
}


const STATUSPAGE_ID = 'qzblys3lm8jb';
const STATUS_BASE = `https://${STATUSPAGE_ID}.statuspage.io/api/v2`;

async function fetchStatus(endpoint) {
  const res = await fetch(`${STATUS_BASE}/${endpoint}`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(endpoint);
  return res.json();
}

async function renderStatusSummary() {
  const data = await fetchStatus('status.json');

  const indicator = data.status.indicator; // none, minor, major, critical
  const description = data.status.description;

  const el = document.getElementById('status-summary');
  el.innerHTML = `
    <div class="card">
      <h3>Overall Status</h3>
      <p>${description}</p>
      <span class="tag ${indicator}">${indicator.toUpperCase()}</span>
    </div>
  `;
}


async function renderStatusComponents() {
  const data = await fetchStatus('components.json');
  const el = document.getElementById('status-components');

  el.innerHTML = data.components.map(c => `
    <div class="card">
      <h3>${c.name}</h3>
      <p>Status: ${c.status.replace('_', ' ')}</p>
    </div>
  `).join('');
}


async function renderIncidents() {
  const data = await fetchStatus('incidents/unresolved.json');
  const el = document.getElementById('status-incidents');

  if (data.incidents.length === 0) {
    el.innerHTML = `
      <div class="card">
        <h3>No Active Incidents</h3>
        <p>All systems are operating normally.</p>
      </div>
    `;
    return;
  }

  el.innerHTML = data.incidents.map(i => `
    <div class="card">
      <h3>${i.name}</h3>
      <p>${i.status.toUpperCase()} — ${i.impact}</p>
    </div>
  `).join('');
}


document.addEventListener('DOMContentLoaded', () => {
  renderStatusSummary();
  renderStatusComponents();
  renderIncidents();

  const obsSection = document.getElementById('observability');
  const toggle = obsSection?.querySelector('.collapse-toggle');
  const icon = obsSection?.querySelector('.collapse-icon');
  const body = document.getElementById('observability-body');

  if (toggle && body && icon && obsSection) {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    body.hidden = !isExpanded;
    icon.textContent = isExpanded ? '−' : '+';
    obsSection.classList.toggle('is-expanded', isExpanded);
    obsSection.classList.toggle('is-collapsed', !isExpanded);

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      const nextExpanded = !expanded;
      toggle.setAttribute('aria-expanded', String(nextExpanded));
      body.hidden = !nextExpanded;
      icon.textContent = nextExpanded ? '−' : '+';
      obsSection.classList.toggle('is-expanded', nextExpanded);
      obsSection.classList.toggle('is-collapsed', !nextExpanded);
    });
  }
});

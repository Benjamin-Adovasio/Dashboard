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



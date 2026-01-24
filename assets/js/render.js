import { ICONS } from './icons.js';

export async function loadServices() {
  const res = await fetch('/assets/data/services.json');
  return res.json();
}

export function renderAll(data) {
  let total = 0;

  Object.entries(data).forEach(([section, list]) => {
    const root = document.getElementById(`grid-${section}`);
    if (!root) return;

    root.innerHTML = '';
    list.forEach(s => {
      total++;
      root.appendChild(card(s));
    });
  });

  document.getElementById('count').textContent = total;
}

function card(service) {
  const a = document.createElement('a');
  a.className = 'card';
  a.href = service.url;
  a.target = '_blank';
  a.rel = 'noopener';

  a.innerHTML = `
    <strong>${service.name}</strong>
    <p class="muted">${service.desc || ''}</p>
  `;
  return a;
}

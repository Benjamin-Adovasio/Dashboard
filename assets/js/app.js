fetch('/assets/data/services.json')
  .then(r => r.json())
  .then(data => {
    render('grid-core', data.core);
    render('grid-infra', data.infrastructure);
    render('grid-obs', data.observability);
  });

function render(id, items) {
  const root = document.getElementById(id);
  items.forEach(s => {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = s.url;
    a.target = '_blank';
    a.innerHTML = `<h3>${s.name}</h3><p>${s.desc}</p>`;
    a.setAttribute('data-animate','');
    root.appendChild(a);
  });
}

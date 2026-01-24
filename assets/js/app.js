function render(id, items) {
  const root = document.getElementById(id);
  items.forEach(s => {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = s.url;
    a.target = '_blank';
    a.innerHTML = `
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
    `;
    root.appendChild(a);
  });
}

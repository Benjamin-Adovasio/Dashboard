import { loadServices, renderAll } from './render.js';
import { initTheme } from './theme.js';
import { initSearch } from './search.js';

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initSearch();

  const services = await loadServices();
  renderAll(services);
});

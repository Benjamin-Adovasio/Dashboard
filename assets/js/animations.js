const observer = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
});

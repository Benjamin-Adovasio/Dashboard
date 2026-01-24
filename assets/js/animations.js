document.addEventListener('scroll', () => {
  const hero = document.getElementById('hero');
  const title = document.getElementById('hero-title');
  const sub = document.getElementById('hero-sub');

  const scrollY = window.scrollY;
  const max = window.innerHeight;

  const progress = Math.min(scrollY / max, 1);

  hero.style.opacity = 1 - progress * 0.6;
  title.style.transform = `
    translateY(${progress * 40}px)
    scale(${1 - progress * 0.15})
  `;
  sub.style.transform = `translateY(${progress * 20}px)`;
  sub.style.opacity = 1 - progress;
});

const serviceCards = document.querySelectorAll('.service-card');

const morphObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      serviceCards.forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
    }
  });
}, { threshold: 0.6 });

serviceCards.forEach(c => morphObserver.observe(c));

/* =========================================================
   HERO SCROLL MORPH (Apple-style, dramatic)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('hero');
  const title = document.getElementById('hero-title');
  const sub = document.getElementById('hero-sub');

  if (hero && title && sub) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Finish animation early (feels intentional)
      const progress = Math.min(scrollY / (vh * 0.45), 1);

      // Cubic easing (Apple-like)
      const ease = 1 - Math.pow(1 - progress, 3);

      // HERO container fade
      hero.style.opacity = 1 - ease * 0.55;

      // TITLE: camera-style movement
      title.style.transform = `
        translateY(${ease * 120}px)
        scale(${1.15 - ease * 0.35})
        perspective(1000px)
        translateZ(${ease * -180}px)
      `;
      title.style.opacity = 1 - ease * 0.25;
      title.style.filter = `blur(${ease * 2.5}px)`;

      // SUBTITLE exits faster
      sub.style.transform = `translateY(${ease * 80}px)`;
      sub.style.opacity = 1 - ease * 1.2;
    });
  }

  /* =========================================================
     SERVICE CARD MORPHING (scroll-driven focus)
     ========================================================= */

  const serviceCards = document.querySelectorAll('.service-card');

  if (serviceCards.length > 0) {
    const morphObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            serviceCards.forEach(card =>
              card.classList.remove('active')
            );
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.6
      }
    );

    serviceCards.forEach(card => morphObserver.observe(card));
  }
});

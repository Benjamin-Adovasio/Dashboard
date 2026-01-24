/* =========================================================
   APPLE-STYLE HERO + SERVICE SCROLL ORCHESTRATION
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================
     HERO ELEMENTS
     ========================== */

  const hero  = document.getElementById('hero');
  const title = document.getElementById('hero-title');
  const sub   = document.getElementById('hero-sub');

  const hasHero = hero && title && sub;

  /* ==========================
     HERO SCROLL CONFIG
     ========================== */

  // Longer scroll range = more cinematic
  const HERO_SCROLL_RANGE = window.innerHeight * 1.8;

  /* ==========================
     SCROLL HANDLER
     ========================== */

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    /* ----------------------------------
       HERO MORPH (Apple-style)
       ---------------------------------- */
    if (hasHero) {
      const raw = Math.min(scrollY / HERO_SCROLL_RANGE, 1);

      // Cubic ease-out (slow → dramatic → settle)
      const ease = 1 - Math.pow(1 - raw, 4);

      // HERO container fade
      hero.style.opacity = 1 - ease * 0.6;

      // TITLE: camera push + depth
      title.style.transform = `
        translateY(${ease * 160}px)
        scale(${1.15 - ease * 0.35})
        perspective(1200px)
        translateZ(${ease * -220}px)
      `;
      title.style.opacity = 1 - ease * 0.25;
      title.style.filter  = `blur(${ease * 3}px)`;

      // SUBTITLE exits faster (supporting role)
      sub.style.transform = `translateY(${ease * 110}px)`;
      sub.style.opacity  = 1 - ease * 1.4;
    }
  }, { passive: true });

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

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

  if (!hero || !title || !sub) return;

  /* ==========================
     HERO SCROLL CONFIG
     ========================== */

  // Total scroll distance for hero narrative
  const HERO_SCROLL_RANGE = window.innerHeight * 3;

  // When the hero starts exiting
  const HERO_EXIT_START = HERO_SCROLL_RANGE * 0.75;

  // How long the exit takes
  const HERO_EXIT_RANGE = window.innerHeight * 1;

  /* ==========================
     SCROLL HANDLER
     ========================== */

  window.addEventListener(
    'scroll',
    () => {
      const scrollY = window.scrollY;

      /* ----------------------------------
         PHASE 1 — HERO MORPH
         ---------------------------------- */

      const raw = Math.min(scrollY / HERO_SCROLL_RANGE, 1);

      // Apple-style easing (slow → dramatic → settle)
      const ease = 1 - Math.pow(1 - raw, 4);

      // HERO fade
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

      // SUBTITLE exits faster
      sub.style.transform = `translateY(${ease * 110}px)`;
      sub.style.opacity  = Math.max(1 - ease * 1.4, 0);

      /* ----------------------------------
         PHASE 2 — HERO EXIT (PUSHED AWAY)
         ---------------------------------- */

      if (scrollY > HERO_EXIT_START) {
        const exitRaw = Math.min(
          (scrollY - HERO_EXIT_START) / HERO_EXIT_RANGE,
          1
        );

        // Strong but smooth exit
        const exitEase = exitRaw * exitRaw;

        hero.style.transform = `
          translateY(${-exitEase * 100}vh)
          scale(${1 - exitEase * 0.05})
        `;
      } else {
        hero.style.transform = 'translateY(0)';
      }
    },
    { passive: true }
  );

  /* =========================================================
     SERVICE CARD MORPHING (SCROLL FOCUS)
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

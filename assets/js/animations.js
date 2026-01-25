/* =========================================================
   APPLE-STYLE HERO + SIGNUP + SERVICES SCROLL ORCHESTRATION
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================
     ELEMENT REFERENCES
     ========================== */

  const hero        = document.getElementById('hero');
  const heroTitle   = document.getElementById('hero-title');
  const heroSub     = document.getElementById('hero-sub');

  const signupStage = document.getElementById('signup-stage');
  const signupInner = document.querySelector('.signup-inner');

  const serviceCards = document.querySelectorAll('.service-card');

  if (!hero || !heroTitle || !heroSub) return;

  /* ==========================
     SCROLL CONFIGURATION
     ========================== */

  // Long cinematic hero duration (Apple-style)
  const HERO_SCROLL_RANGE = window.innerHeight * 3;

  // When hero begins exiting
  const HERO_EXIT_START = HERO_SCROLL_RANGE * 0.75;

  // How long the exit takes
  const HERO_EXIT_RANGE = window.innerHeight * 1.2;

  /* ==========================
     MAIN SCROLL HANDLER
     ========================== */

  window.addEventListener(
    'scroll',
    () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      /* =====================================================
         PHASE 1 — HERO MORPH (slow + dramatic)
         ===================================================== */

      const heroRaw = Math.min(scrollY / HERO_SCROLL_RANGE, 1);
      const heroEase = 1 - Math.pow(1 - heroRaw, 4);

      hero.style.opacity = 1 - heroEase * 0.6;

      heroTitle.style.transform = `
        translateY(${heroEase * 160}px)
        scale(${1.15 - heroEase * 0.35})
        perspective(1200px)
        translateZ(${heroEase * -220}px)
      `;
      heroTitle.style.opacity = 1 - heroEase * 0.25;
      heroTitle.style.filter  = `blur(${heroEase * 3}px)`;

      heroSub.style.transform = `translateY(${heroEase * 110}px)`;
      heroSub.style.opacity  = Math.max(1 - heroEase * 1.4, 0);

      /* =====================================================
         PHASE 2 — HERO EXIT (pushed upward, not covered)
         ===================================================== */

      if (scrollY > HERO_EXIT_START) {
        const exitRaw = Math.min(
          (scrollY - HERO_EXIT_START) / HERO_EXIT_RANGE,
          1
        );

        const exitEase = exitRaw * exitRaw;

        hero.style.transform = `
          translateY(${-exitEase * 100}vh)
          scale(${1 - exitEase * 0.05})
        `;
      } else {
        hero.style.transform = 'translateY(0)';
      }

      /* =====================================================
         PHASE 3 — SIGNUP STAGE REVEAL (inherits momentum)
         ===================================================== */

      if (signupStage && signupInner) {
        const stageTop = signupStage.offsetTop;

        const revealStart = stageTop - vh * 0.9;
        const revealEnd   = stageTop - vh * 0.25;

        const raw = Math.min(
          Math.max((scrollY - revealStart) / (revealEnd - revealStart), 0),
          1
        );

        const ease = 1 - Math.pow(1 - raw, 3);

        signupInner.style.opacity = ease;
        signupInner.style.transform = `
          translateY(${(1 - ease) * 90}px)
          scale(${0.94 + ease * 0.06})
        `;
      }

    },
    { passive: true }
  );

  /* =========================================================
     SERVICE CARD MORPHING (scroll-driven focus)
     ========================================================= */

  if (serviceCards.length > 0) {
    const observer = new IntersectionObserver(
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

    serviceCards.forEach(card => observer.observe(card));
  }

});

document.addEventListener("DOMContentLoaded", () => {
  setupRevealObserver();
});

function setupRevealObserver() {
  const animated = new Set();
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll("[data-animate]").forEach(element => {
      element.classList.add("visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  const observeAll = (root = document) => {
    root.querySelectorAll("[data-animate]").forEach(element => {
      if (animated.has(element)) {
        return;
      }

      animated.add(element);
      observer.observe(element);
    });
  };

  window.AdovasioMotion = {
    refresh: observeAll
  };

  observeAll();
}

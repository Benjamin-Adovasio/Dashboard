(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let prefersReducedMotion = reduceMotionQuery.matches;
  let frameRequested = false;
  let lastScrollY = window.scrollY;
  let horizontalStories = [];

  root.classList.add("js");

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  function setupNavigation() {
    const header = document.querySelector("[data-site-header]");
    const toggle = document.querySelector("[data-nav-toggle]");
    const panel = document.querySelector("[data-nav-panel]");

    if (!header || !toggle || !panel) {
      return;
    }

    let restoreFocus = null;

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(element => !element.hidden);

    const setOpen = (open, options = {}) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      body.classList.toggle("nav-open", open);
      panel.setAttribute(
        "aria-hidden",
        String(window.innerWidth <= 900 ? !open : false)
      );

      if (open) {
        restoreFocus = document.activeElement;
        window.requestAnimationFrame(() => getFocusable()[0]?.focus());
      } else if (options.restore !== false && restoreFocus instanceof HTMLElement) {
        restoreFocus.focus();
      }
    };

    const syncNavigationMode = () => {
      const isMobile = window.innerWidth <= 900;
      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      if (!isMobile) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
        body.classList.remove("nav-open");
        panel.setAttribute("aria-hidden", "false");
      } else {
        panel.setAttribute("aria-hidden", String(!isOpen));
      }
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    panel.addEventListener("click", event => {
      if (event.target.closest("a")) {
        setOpen(false, { restore: false });
      }
    });

    document.addEventListener("keydown", event => {
      const open = toggle.getAttribute("aria-expanded") === "true";

      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }

      if (event.key === "Tab" && open) {
        const focusable = getFocusable();
        if (!focusable.length) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false, { restore: false });
      }
      syncNavigationMode();
    });

    header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
    syncNavigationMode();
  }

  function setupReveals() {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    if (!elements.length) {
      return;
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(element => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.08
      }
    );

    elements.forEach(element => observer.observe(element));
  }

  function setupPointerFields() {
    if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    document.querySelectorAll("[data-pointer-field]").forEach(element => {
      let pointerFrame = false;
      let nextX = 50;
      let nextY = 50;

      element.addEventListener("pointermove", event => {
        const bounds = element.getBoundingClientRect();
        nextX = ((event.clientX - bounds.left) / bounds.width) * 100;
        nextY = ((event.clientY - bounds.top) / bounds.height) * 100;

        if (!pointerFrame) {
          pointerFrame = true;
          window.requestAnimationFrame(() => {
            element.style.setProperty("--pointer-x", `${nextX.toFixed(2)}%`);
            element.style.setProperty("--pointer-y", `${nextY.toFixed(2)}%`);
            pointerFrame = false;
          });
        }
      });

      element.addEventListener("pointerleave", () => {
        element.style.removeProperty("--pointer-x");
        element.style.removeProperty("--pointer-y");
      });
    });
  }

  function setupHorizontalStories() {
    horizontalStories = Array.from(document.querySelectorAll("[data-horizontal]")).map(story => {
      const pin = story.querySelector("[data-horizontal-pin]");
      const track = story.querySelector("[data-horizontal-track]");
      return { story, pin, track, distance: 0 };
    });

    measureHorizontalStories();

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(measureHorizontalStories);
      horizontalStories.forEach(({ track }) => {
        if (track) {
          resizeObserver.observe(track);
        }
      });
    }
  }

  function measureHorizontalStories() {
    horizontalStories.forEach(item => {
      if (!item.pin || !item.track) {
        item.distance = 0;
        return;
      }

      const pinWidth = item.pin.clientWidth;
      item.distance = Math.max(0, item.track.scrollWidth - pinWidth);
    });
  }

  function getSectionProgress(element) {
    const bounds = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const travel = Math.max(1, bounds.height - viewportHeight);
    return clamp(-bounds.top / travel);
  }

  function updateScrollEffects() {
    frameRequested = false;
    const scrollY = window.scrollY;
    const header = document.querySelector("[data-site-header]");
    const documentHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    root.style.setProperty("--page-progress", String(clamp(scrollY / documentHeight)));

    if (header) {
      header.classList.toggle("is-compact", scrollY > 72);

      const moved = Math.abs(scrollY - lastScrollY) > 6;
      const scrollingDown = scrollY > lastScrollY;
      const menuOpen = body.classList.contains("nav-open");
      header.classList.toggle(
        "is-hidden",
        moved && scrollingDown && scrollY > 520 && !menuOpen && !header.matches(":focus-within")
      );
    }

    if (!prefersReducedMotion) {
      document.querySelectorAll("[data-scroll-progress]").forEach(section => {
        const progress = getSectionProgress(section);
        section.style.setProperty("--progress", progress.toFixed(4));

        const steps = Array.from(section.querySelectorAll("[data-scene-step]"));
        if (steps.length) {
          const activeIndex = Math.min(steps.length - 1, Math.floor(progress * steps.length));
          section.dataset.activeStep = String(activeIndex);
          steps.forEach((step, index) => {
            step.classList.toggle("is-active", index === activeIndex);
          });
        }
      });

      horizontalStories.forEach(({ story, track, distance }) => {
        if (!track) {
          return;
        }

        const progress = getSectionProgress(story);
        track.style.setProperty("--track-shift", `${(-distance * progress).toFixed(2)}px`);
        story.style.setProperty("--progress", progress.toFixed(4));
      });
    }

    lastScrollY = scrollY;
  }

  function requestScrollFrame() {
    if (!frameRequested) {
      frameRequested = true;
      window.requestAnimationFrame(updateScrollEffects);
    }
  }

  function setupScrollEffects() {
    setupHorizontalStories();
    window.addEventListener("scroll", requestScrollFrame, { passive: true });
    window.addEventListener("resize", () => {
      measureHorizontalStories();
      requestScrollFrame();
    });
    requestScrollFrame();
  }

  function setupCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach(element => {
      element.textContent = String(new Date().getFullYear());
    });
  }

  function handleMotionPreference(event) {
    prefersReducedMotion = event.matches;
    root.classList.toggle("reduce-motion", prefersReducedMotion);

    if (prefersReducedMotion) {
      document.querySelectorAll("[data-reveal]").forEach(element => {
        element.classList.add("is-visible");
      });
      horizontalStories.forEach(({ track }) => {
        track?.style.removeProperty("--track-shift");
      });
    }

    requestScrollFrame();
  }

  function initialize() {
    root.classList.toggle("reduce-motion", prefersReducedMotion);
    setupCurrentYear();
    setupNavigation();
    setupReveals();
    setupPointerFields();
    setupScrollEffects();
  }

  reduceMotionQuery.addEventListener?.("change", handleMotionPreference);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();

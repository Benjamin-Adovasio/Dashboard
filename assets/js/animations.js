/* Scroll reveal */
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll("[data-animate]").forEach(el => observer.observe(el));

/* Background parallax */
window.addEventListener("scroll", () => {
  document.body.style.setProperty(
    "--bg-shift",
    `${window.scrollY * 0.08}px`
  );
});

/**
 * Scroll-reveal — animate elements into view using IntersectionObserver.
 * Adds .is-visible class when elements enter the viewport.
 * Works with [data-reveal] attribute on any element and known section selectors.
 */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var targets = document.querySelectorAll(
      "[data-reveal], .feature-split, .benefit-card, .step-card, .plan-card, .why, .workflow, .final-cta"
    );
    if (!targets.length) return;

    // Stagger delay for grid children
    document.querySelectorAll(".benefit-card, .step-card, .plan-card").forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 0.1 + "s";
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach(function (el) {
      el.classList.add("reveal-target");
      io.observe(el);
    });
  });
})();

// assets/js/main.js

document.addEventListener("DOMContentLoaded", () => {
  // --- Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll(
    "main section, .image-card, .highlight-card, .product-card, .team-card",
  );

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target); // Only animate once
        }
      });
    },
    {
      root: null,
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  revealElements.forEach((el) => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });

  // --- Dynamic Header ---
  const header = document.querySelector("header");
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScroll = currentScroll;
  });
});

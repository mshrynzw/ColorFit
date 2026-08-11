/* ============================================================
   ColorFit — Landing Page Interactions & Animations
   GSAP + ScrollTrigger / Mobile Menu / Smooth Scroll
   ============================================================ */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ----------------------------------------------------------
     Mobile menu toggle
     ---------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
    }

    function openMenu() {
      toggle.setAttribute("aria-expanded", "true");
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ----------------------------------------------------------
     Smooth scroll for CTA / anchor buttons
     ---------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll("[data-scroll-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetSel = btn.getAttribute("data-scroll-target");
        var target = document.querySelector(targetSel);
        if (!target) return;

        var headerOffset = 84;
        var top =
          target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: top,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      });
    });
  }

  /* ----------------------------------------------------------
     Header background state on scroll
     ---------------------------------------------------------- */
  function initHeaderScrollState() {
    var header = document.getElementById("site-header");
    if (!header) return;
    var lastState = false;

    function update() {
      var scrolled = window.scrollY > 12;
      if (scrolled !== lastState) {
        header.style.boxShadow = scrolled
          ? "0 12px 30px -20px rgba(0,0,0,0.8)"
          : "none";
        lastState = scrolled;
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ----------------------------------------------------------
     GSAP Animations
     ---------------------------------------------------------- */
  function initAnimations() {
    if (typeof gsap === "undefined") return;

    if (prefersReducedMotion) {
      // Ensure everything is simply visible, no motion.
      gsap.set(
        "[data-anim]",
        { clearProps: "all" }
      );
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ---------- Page load timeline ---------- */
    var tl = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    tl.from('[data-anim="logo"]', {
      opacity: 0,
      y: -12,
      duration: 0.7,
    })
      .from(
        '[data-anim="nav-item"]',
        {
          opacity: 0,
          y: -14,
          duration: 0.6,
          stagger: 0.08,
        },
        "-=0.4"
      )
      .from(
        ".eyebrow",
        {
          opacity: 0,
          y: 16,
          duration: 0.6,
        },
        "-=0.2"
      )
      .from(
        '[data-anim="hero-line"]',
        {
          yPercent: 120,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power4.out",
        },
        "-=0.3"
      )
      .from(
        '.hero-desc[data-anim="fade-up"]',
        {
          opacity: 0,
          y: 20,
          duration: 0.7,
        },
        "-=0.5"
      )
      .from(
        '.hero-ctas[data-anim="fade-up"]',
        {
          opacity: 0,
          y: 20,
          duration: 0.7,
        },
        "-=0.5"
      )
      .from(
        '[data-anim="visual-scale"]',
        {
          opacity: 0,
          scale: 0.94,
          y: 24,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.75"
      )
      .from(
        '[data-anim="chip"]',
        {
          opacity: 0,
          y: 14,
          scale: 0.85,
          duration: 0.5,
          stagger: 0.12,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      );

    /* ---------- Scroll: section fade-ins ---------- */
    gsap.utils.toArray('[data-anim="section-fade"]').forEach(function (el) {
      gsap.from(el, {
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    });

    /* ---------- Scroll: feature cards stagger ---------- */
    var cards = gsap.utils.toArray('[data-anim="feature-card"]');
    if (cards.length) {
      gsap.from(cards, {
        opacity: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".feature-grid",
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });
    }

    /* ---------- Scroll: hero visual parallax ---------- */
    var visual = document.querySelector(".hero-visual");
    if (visual) {
      gsap.to(visual, {
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }

    /* ---------- Scroll: background glows drift ---------- */
    gsap.to(".bg-glow--cyan", {
      y: 60,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });
    gsap.to(".bg-glow--violet", {
      y: -80,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    /* ---------- Scroll: before/after image reveal ---------- */
    var afterFrame = document.querySelector(".image-card--after .image-frame");
    if (afterFrame) {
      gsap.from(afterFrame, {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.1,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: ".visual-panel",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
    }

    /* ---------- Scroll: final CTA glow pulse-in ---------- */
    var ctaGlow = document.querySelector(".final-cta__glow");
    if (ctaGlow) {
      gsap.from(ctaGlow, {
        opacity: 0,
        scale: 0.7,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".final-cta",
          start: "top 75%",
        },
      });
    }
  }

  /* ----------------------------------------------------------
     Init
     ---------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initSmoothScroll();
    initHeaderScrollState();
    initAnimations();
  });
})();

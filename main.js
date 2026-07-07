/* ════════════════════════════════════════════════════════════════════
   TWINMIND 2.0 — MARKETING SITE
   1. Sunrise engine  — scroll progress drives sky colors, sun, stars
   2. Starfield       — canvas, drawn once, gentle twinkle
   3. Scroll reveals  — IntersectionObserver + per-section stagger
   4. Testimonial carousel
   5. Nav state
   All effects respect prefers-reduced-motion.
   ════════════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  /* ── 1. SUNRISE ENGINE ──────────────────────────────────────────
     The page is one continuous sunrise. Scroll progress (0 → 1) is
     mapped through color keyframes: pre-dawn night → warming purple
     → ember horizon → full gold dawn at the closer/footer.        */

  // [progress, skyTop, skyMid, skyLow]
  const SKY_KEYFRAMES = [
    [0.00, "#030612", "#071021", "#0C1A33"], // pre-dawn: deepest night
    [0.30, "#050A18", "#0B1730", "#16233F"], // manifesto: night holds
    [0.50, "#071026", "#151F3D", "#2B2647"], // first hint of purple
    [0.68, "#0B1730", "#241F44", "#3A2B4E"], // dusk-purple warming
    [0.80, "#101B38", "#3A2E52", "#7A4152"], // ember bleeds into the low sky
    [0.88, "#22304F", "#6E4A63", "#D97B4A"], // the sun is close
    [0.95, "#5C6B95", "#C98A6A", "#F5A94B"], // breaking light
    [1.00, "#FFD9A0", "#FFB066", "#FF8A3D"], // full dawn
  ];

  const hexToRgb = (hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const lerp = (a, b, t) => a + (b - a) * t;
  const mixHex = (h1, h2, t) => {
    const a = hexToRgb(h1), b = hexToRgb(h2);
    return `rgb(${Math.round(lerp(a[0], b[0], t))}, ${Math.round(lerp(a[1], b[1], t))}, ${Math.round(lerp(a[2], b[2], t))})`;
  };
  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  function skyAt(progress) {
    let i = 0;
    while (i < SKY_KEYFRAMES.length - 2 && progress > SKY_KEYFRAMES[i + 1][0]) i++;
    const [t0, top0, mid0, low0] = SKY_KEYFRAMES[i];
    const [t1, top1, mid1, low1] = SKY_KEYFRAMES[i + 1];
    const t = clamp01((progress - t0) / (t1 - t0 || 1));
    return {
      top: mixHex(top0, top1, t),
      mid: mixHex(mid0, mid1, t),
      low: mixHex(low0, low1, t),
    };
  }

  let ticking = false;

  function paintSunrise() {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? clamp01(window.scrollY / max) : 0;

    const sky = skyAt(p);
    root.style.setProperty("--sky-top", sky.top);
    root.style.setProperty("--sky-mid", sky.mid);
    root.style.setProperty("--sky-low", sky.low);

    // Stars fade as the sky warms; gone by ~65% of the journey.
    root.style.setProperty("--stars-alpha", clamp01(1 - p * 1.55).toFixed(3));

    // Ember horizon band grows from the halfway point.
    root.style.setProperty("--horizon-alpha", clamp01((p - 0.45) / 0.4).toFixed(3));

    // The sun starts below the viewport at 55% and clears the horizon by 100%.
    const rise = clamp01((p - 0.55) / 0.45);
    const eased = rise * rise * (3 - 2 * rise); // smoothstep
    root.style.setProperty("--sun-y", `${lerp(120, -8, eased)}%`);
    root.style.setProperty("--sun-glow", eased.toFixed(3));

    // Late in the journey the page flips to dawn styling (nav, etc.).
    document.body.classList.toggle("is-dawn", p > 0.9);
    document.getElementById("nav").classList.toggle("is-scrolled", window.scrollY > 40);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(paintSunrise);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  paintSunrise();

  /* ── 2. STARFIELD ───────────────────────────────────────────────
     A fixed canvas of small stars. Density scales with area; a slow
     sine twinkle runs only when motion is allowed and stars are
     still visible.                                                 */

  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function seedStars() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.floor((window.innerWidth * window.innerHeight) / 4200);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.1 + 0.25,
      base: Math.random() * 0.55 + 0.25,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.2,
    }));
  }

  function drawStars(time) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const s of stars) {
      const twinkle = reduceMotion ? 1 : 0.75 + 0.25 * Math.sin(s.phase + time * 0.001 * s.speed);
      ctx.globalAlpha = s.base * twinkle;
      ctx.fillStyle = "#DCE6FA";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function starLoop(time) {
    // Skip work once the stars have fully faded into daylight.
    const alpha = parseFloat(root.style.getPropertyValue("--stars-alpha") || "1");
    if (alpha > 0) drawStars(time);
    if (!reduceMotion) requestAnimationFrame(starLoop);
  }

  seedStars();
  window.addEventListener("resize", () => { seedStars(); drawStars(0); }, { passive: true });
  if (reduceMotion) {
    drawStars(0); // static sky, no twinkle
  } else {
    requestAnimationFrame(starLoop);
  }

  /* ── 3. SCROLL REVEALS ──────────────────────────────────────────
     Elements tagged [data-reveal] fade up when they enter the
     viewport. Siblings inside the same section stagger by index so
     lines arrive one at a time.                                    */

  const revealEls = document.querySelectorAll("[data-reveal]");

  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    // Stagger per section
    document.querySelectorAll("section, footer").forEach((section) => {
      section.querySelectorAll("[data-reveal]").forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i * 0.12, 0.72)}s`;
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ── 4. TESTIMONIAL CAROUSEL ────────────────────────────────────
     Fading slides, dot controls, gentle auto-advance that pauses on
     hover/focus and never runs under reduced motion.               */

  const slides = document.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".carousel-dot");
  const carousel = document.querySelector(".carousel");
  let current = 0;
  let autoTimer = null;

  function goTo(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    dots[current].setAttribute("aria-selected", "false");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    dots[current].setAttribute("aria-selected", "true");
  }

  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => { goTo(i); restartAuto(); })
  );

  function restartAuto() {
    if (reduceMotion) return;
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 6000);
  }

  if (carousel) {
    carousel.addEventListener("mouseenter", () => clearInterval(autoTimer));
    carousel.addEventListener("mouseleave", restartAuto);
    carousel.addEventListener("focusin", () => clearInterval(autoTimer));
    carousel.addEventListener("focusout", restartAuto);
    restartAuto();
  }
})();

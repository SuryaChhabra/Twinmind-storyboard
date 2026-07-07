/* ════════════════════════════════════════════════════════════════════
   TWINMIND 2.0 — MAIN LANDING PAGE
   1. Ground engine   — scroll drives the warm gradient (umber → dawn)
   2. Mind-thread     — canvas: dark warm strands, tangled at the top,
                        untangling down the page; gold light pulses
                        travel the strands; node glows under each card;
                        the thread bends to the cursor at the closer.
   3. The forge       — card 3: self-typing commands + assembling artifacts
   4. Globe of minds  — card 8: dots waking along the dawn arc
   5. Scroll reveals  — staggered per card
   All effects respect prefers-reduced-motion (static line drawing,
   content visible immediately).
   ════════════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  /* ── 1. GROUND ENGINE ───────────────────────────────────────────
     Scroll progress (0 → 1) mapped through warm keyframes:
     pre-dawn umber → rust → terracotta → dusty peach → cream dawn. */

  // [progress, groundTop, groundMid, groundLow]
  const GROUND_KEYFRAMES = [
    [0.00, "#1A0D06", "#241209", "#2E170D"], // pre-dawn: dormant umber
    [0.30, "#201008", "#2B1710", "#3A1E14"], // deep rust holds
    [0.55, "#2B1710", "#3F2114", "#5C2E1A"], // rust warming
    [0.75, "#3A1E14", "#6E3A22", "#9C4A2E"], // terracotta glow
    [0.88, "#6E3A22", "#B5563A", "#D98A5F"], // dusty peach approaching
    [0.95, "#B5563A", "#E0A377", "#F0C9A0"], // breaking light
    [1.00, "#F0C9A0", "#F7DCB4", "#FFF3E0"], // full dawn cream
  ];

  const hexToRgb = (hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const mixHex = (h1, h2, t) => {
    const a = hexToRgb(h1), b = hexToRgb(h2);
    return `rgb(${Math.round(lerp(a[0], b[0], t))}, ${Math.round(lerp(a[1], b[1], t))}, ${Math.round(lerp(a[2], b[2], t))})`;
  };

  function groundAt(p) {
    let i = 0;
    while (i < GROUND_KEYFRAMES.length - 2 && p > GROUND_KEYFRAMES[i + 1][0]) i++;
    const [t0, a0, b0, c0] = GROUND_KEYFRAMES[i];
    const [t1, a1, b1, c1] = GROUND_KEYFRAMES[i + 1];
    const t = clamp01((p - t0) / (t1 - t0 || 1));
    return { top: mixHex(a0, a1, t), mid: mixHex(b0, b1, t), low: mixHex(c0, c1, t) };
  }

  let progress = 0;

  function paintGround() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    progress = max > 0 ? clamp01(window.scrollY / max) : 0;
    const g = groundAt(progress);
    root.style.setProperty("--ground-top", g.top);
    root.style.setProperty("--ground-mid", g.mid);
    root.style.setProperty("--ground-low", g.low);
    document.body.classList.toggle("is-dawn", progress > 0.87);
    document.getElementById("nav").classList.toggle("is-scrolled", window.scrollY > 40);
  }

  /* ── 2. THE MIND-THREAD ─────────────────────────────────────────
     Strands live in DOCUMENT space and run the page's full height.
     Tangle factor decays down the page: chaotic, crossing wander at
     the top → smooth, near-parallel braid at the bottom. Each frame
     draws only the visible slice, in screen coordinates.

     Layers per strand:
       1. dark umber base line (the ink/root line)
       2. gold overlay whose alpha grows with depth (the gilding)
       3. traveling pulse glows (light moving along the mind)
     Plus soft node glows behind each [data-node] card anchor.       */

  const canvas = document.getElementById("thread");
  const ctx = canvas.getContext("2d");

  const STRANDS = 7;
  let strands = [];    // per strand: {baseX (0..1), waves: [{amp, freq, phase}]}
  let pulses = [];     // {strand, docY, speed}
  let nodes = [];      // {docY, strength} — card anchors
  let docH = 0, vw = 0, vh = 0;
  const mouse = { x: -9999, y: -9999 };

  // Deterministic pseudo-random so the drawing is stable across resizes
  function makeRng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function buildThread() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth;
    vh = window.innerHeight;
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    docH = document.documentElement.scrollHeight;

    const rng = makeRng(7231);
    strands = Array.from({ length: STRANDS }, (_, i) => ({
      baseX: 0.22 + (i / (STRANDS - 1)) * 0.56 + (rng() - 0.5) * 0.06,
      waves: Array.from({ length: 3 }, (_, w) => ({
        amp: (0.05 + rng() * 0.12) / (w + 1),
        freq: 2.5 + rng() * 4 + w * 3,
        phase: rng() * Math.PI * 2,
      })),
    }));

    pulses = [];
    for (let s = 0; s < STRANDS; s++) {
      const n = 3;
      for (let k = 0; k < n; k++) {
        pulses.push({ strand: s, docY: rng() * docH, speed: 40 + rng() * 50 });
      }
    }

    // Card anchors: a soft glow where each card sits on the thread
    nodes = [...document.querySelectorAll("[data-node]")].map((el) => {
      const r = el.getBoundingClientRect();
      const docY = r.top + window.scrollY + r.height * 0.35;
      return { docY, strength: el.hasAttribute("data-node-bloom") ? 1.6 : 1 };
    });
  }

  // Tangle: 1 at the top of the page (dense knot) → ~0.1 at the bottom
  function tangleAt(yFrac) {
    const t = 1 - yFrac;
    return 0.1 + 0.9 * t * t;
  }

  // Strand x-position (px) at a document y
  function strandX(strand, docY) {
    const yFrac = docY / docH;
    const tangle = tangleAt(yFrac);
    let x = strand.baseX * vw;
    for (const w of strand.waves) {
      x += Math.sin(yFrac * w.freq * Math.PI * 2 + w.phase) * w.amp * vw * tangle;
    }
    // At the closer, the fully-lit thread bends gently toward the cursor
    if (!reduceMotion && progress > 0.82 && mouse.x > -999) {
      const sy = docY - window.scrollY;
      const dx = mouse.x - x, dy = mouse.y - sy;
      const d2 = dx * dx + dy * dy;
      const influence = Math.exp(-d2 / (2 * 160 * 160)) * (progress - 0.82) / 0.18;
      x += dx * 0.25 * influence;
    }
    return x;
  }

  function drawThread(time) {
    ctx.clearRect(0, 0, vw, vh);
    const scrollY = window.scrollY;
    const step = 16;
    const yStart = scrollY - 60;
    const yEnd = scrollY + vh + 60;

    // Node glows first (behind the lines)
    for (const node of nodes) {
      const sy = node.docY - scrollY;
      if (sy < -300 || sy > vh + 300) continue;
      const depth = node.docY / docH;
      const alpha = (0.05 + depth * 0.12) * node.strength;
      const radius = 180 * node.strength;
      const grad = ctx.createRadialGradient(vw / 2, sy, 0, vw / 2, sy, radius);
      grad.addColorStop(0, `rgba(245, 169, 75, ${alpha})`);
      grad.addColorStop(1, "rgba(245, 169, 75, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(vw / 2 - radius, sy - radius, radius * 2, radius * 2);
    }

    for (const strand of strands) {
      // Layer 1: the dark warm ink line
      ctx.beginPath();
      for (let y = yStart; y <= yEnd; y += step) {
        const x = strandX(strand, y);
        const sy = y - scrollY;
        y === yStart ? ctx.moveTo(x, sy) : ctx.lineTo(x, sy);
      }
      ctx.strokeStyle = "rgba(26, 12, 6, 0.85)";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Layer 2: gold gilding — alpha grows with depth down the page
      const depthHere = clamp01((scrollY + vh / 2) / docH);
      const gild = 0.06 + depthHere * 0.5;
      ctx.beginPath();
      for (let y = yStart; y <= yEnd; y += step) {
        const x = strandX(strand, y);
        const sy = y - scrollY;
        y === yStart ? ctx.moveTo(x, sy) : ctx.lineTo(x, sy);
      }
      ctx.strokeStyle = `rgba(245, 169, 75, ${gild})`;
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    // Layer 3: traveling gold pulses (light moving along the mind)
    for (const p of pulses) {
      if (!reduceMotion) {
        p.docY += p.speed * 0.016;
        if (p.docY > docH) p.docY -= docH;
      }
      const sy = p.docY - scrollY;
      if (sy < -40 || sy > vh + 40) continue;
      const x = strandX(strands[p.strand], p.docY);
      const depth = p.docY / docH;
      const glow = 0.35 + depth * 0.55;
      const r = 26 + depth * 26;
      const grad = ctx.createRadialGradient(x, sy, 0, x, sy, r);
      grad.addColorStop(0, `rgba(255, 223, 173, ${glow})`);
      grad.addColorStop(0.35, `rgba(245, 169, 75, ${glow * 0.5})`);
      grad.addColorStop(1, "rgba(245, 169, 75, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, sy - r, r * 2, r * 2);
      ctx.fillStyle = `rgba(255, 243, 224, ${glow})`;
      ctx.beginPath();
      ctx.arc(x, sy, 1.6 + depth * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let rafId = null;
  function frame(time) {
    paintGround();
    drawThread(time);
    if (!reduceMotion) rafId = requestAnimationFrame(frame);
  }

  function staticRedraw() {
    // Reduced-motion path: repaint only on scroll/resize, no rAF loop
    paintGround();
    drawThread(0);
  }

  buildThread();
  if (reduceMotion) {
    staticRedraw();
    window.addEventListener("scroll", staticRedraw, { passive: true });
    window.addEventListener("resize", () => { buildThread(); staticRedraw(); }, { passive: true });
  } else {
    window.addEventListener("resize", buildThread, { passive: true });
    window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    rafId = requestAnimationFrame(frame);
  }
  // Content (fonts/images) can change document height after load
  window.addEventListener("load", buildThread);

  /* ── 3. THE FORGE (card 3) ──────────────────────────────────────
     A command types itself; when it completes, the artifact cards
     assemble. Then it clears and a different command builds
     different things. Reduced motion: one static built state.      */

  const COMMANDS = [
    {
      text: "Make me a study guide from today's lecture…",
      artifacts: [
        ["Study guide", "Thermodynamics — Lecture 12"],
        ["Key concepts", "Entropy, explained your way"],
        ["Practice", "12 questions you'll be asked"],
      ],
    },
    {
      text: "Turn this week into a memo…",
      artifacts: [
        ["Memo", "The week, in one page"],
        ["Decisions", "What you chose, and why"],
        ["Next", "Three things that can't slip"],
      ],
    },
    {
      text: "Build my playlist…",
      artifacts: [
        ["Playlist", "Everything you hummed this week"],
        ["Discovered", "The song from Tuesday's drive"],
        ["For focus", "Your deep-work hour, scored"],
      ],
    },
  ];

  const typedEl = document.getElementById("forgeTyped");
  const artifactsEl = document.getElementById("forgeArtifacts");

  function setArtifacts(cmd) {
    cmd.artifacts.forEach(([kind, title], i) => {
      const kindEl = artifactsEl.querySelector(`[data-slot="kind${i + 1}"]`);
      const titleEl = artifactsEl.querySelector(`[data-slot="title${i + 1}"]`);
      if (kindEl) kindEl.textContent = kind;
      if (titleEl) titleEl.textContent = title;
    });
  }

  if (typedEl && artifactsEl) {
    if (reduceMotion) {
      setArtifacts(COMMANDS[0]);
      artifactsEl.classList.add("is-built");
    } else {
      let cmdIndex = 0;
      let running = false;

      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

      async function typeCommand(text) {
        typedEl.textContent = "";
        for (const ch of text) {
          typedEl.textContent += ch;
          await sleep(26 + Math.random() * 34);
        }
      }

      async function forgeLoop() {
        running = true;
        let first = true;
        for (;;) {
          const cmd = COMMANDS[cmdIndex % COMMANDS.length];
          cmdIndex++;
          if (first) {
            // First build assembles from nothing
            artifactsEl.classList.remove("is-built");
            setArtifacts(cmd);
            await typeCommand(cmd.text);
            await sleep(180); // "done before you finish the sentence"
            artifactsEl.classList.add("is-built");
            first = false;
          } else {
            // Later cycles: previous build dims while the next command
            // types, then the new artifacts snap in — never an empty card
            artifactsEl.classList.add("is-dim");
            await typeCommand(cmd.text);
            setArtifacts(cmd);
            await sleep(120);
            artifactsEl.classList.remove("is-dim");
          }
          await sleep(4200);
        }
      }

      const forgeIo = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting) && !running) {
          forgeLoop();
          forgeIo.disconnect();
        }
      }, { threshold: 0.3 });
      forgeIo.observe(artifactsEl);
    }
  }

  /* ── 4. GLOBE OF MINDS (card 8) ─────────────────────────────────
     Seed dots along the dawn arc — thousands of minds waking.      */

  const globeSvg = document.getElementById("globeSvg");
  if (globeSvg) {
    const arc = globeSvg.querySelector(".globe-arc");
    const len = arc.getTotalLength();
    const rng = makeRng(140);
    const DOTS = 46;
    for (let i = 0; i < DOTS; i++) {
      const pt = arc.getPointAtLength(rng() * len);
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("class", "mind-dot");
      dot.setAttribute("cx", (pt.x + (rng() - 0.5) * 14).toFixed(1));
      dot.setAttribute("cy", (pt.y - rng() * 26).toFixed(1));
      dot.setAttribute("r", (1 + rng() * 1.8).toFixed(1));
      dot.style.animationDelay = `${(rng() * 4).toFixed(2)}s`;
      globeSvg.appendChild(dot);
    }
  }

  /* ── 5. SCROLL REVEALS ──────────────────────────────────────────
     Elements tagged [data-reveal] fade up on entry, staggered per
     card so lines arrive one at a time.                            */

  const revealEls = document.querySelectorAll("[data-reveal]");

  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
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
})();

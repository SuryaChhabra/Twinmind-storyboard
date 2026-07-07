# TwinMind 2.0 — Marketing Site

A single-page, scroll-based marketing site for TwinMind 2.0. The signature:
**the page is a sunrise** — it opens in pre-dawn night (stars) and the sky
warms as you scroll, with the sun breaking the horizon at the final CTA.
Evolution = a new dawn for the mind.

No build step, no dependencies. Open `index.html` in a browser, or serve the
folder with any static server:

```bash
python3 -m http.server 8000
```

## Files

| File | What it is |
| --- | --- |
| `index.html` | All 12 story beats, each marked with a `BEAT n` comment block |
| `styles.css` | Design tokens, sunrise layers, type system, all section styles |
| `main.js` | Sunrise engine (scroll → sky color/sun/stars), reveals, carousel |

## Design system

- **Palette** — night blues `#050A18` / `#0C1A33` warming through dusk purple
  `#3A2B4E` to ember `#F5A94B` / `#FF8A3D` and dawn light `#FFD9A0`.
  TwinMind brand blue `#3E7BFA` anchors the wordmark and CTA buttons.
  All tokens live in `:root` at the top of `styles.css`.
- **Type** — Fraunces (serif display, headlines + growth lines), Instrument
  Sans (body), IBM Plex Mono (eyebrows, proof lines, labels). Loaded from
  Google Fonts.
- **Motion** — scroll-linked sunrise, staggered line reveals per section,
  gentle hover lifts. Everything respects `prefers-reduced-motion`
  (static mid-night sky, no twinkle, content visible immediately).

## Placeholder slots to swap in Fable

Search `index.html` for `PLACEHOLDER SLOT` — every slot is commented and
carries a visible `Placeholder · swap in Fable` tag:

1. **Beat 5** — phone mockup: live capture screen screenshot
2. **Beat 6** — Mac mockup: memory search / ask-anything screenshot
3. **Beat 7** — browser mockup: drafted-email screenshot (peak feature)
4. **Beats 4, 7, 11** — testimonial photos (currently initial avatars)
5. **Beat 11** — carousel slides 3–4: real customer quotes
6. **Beat 11** — logo strip: swap text wordmarks for SVG logos

The CTA buttons currently link to `#closer` (in-page) and the final button to
`https://twinmind.com` — point them at the real signup/download URL.

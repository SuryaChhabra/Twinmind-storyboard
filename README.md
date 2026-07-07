# TwinMind 2.0 — Main Landing Page

The primary homepage for TwinMind 2.0. The signature: **a warm mind-thread**
— a network of fine dark umber strands running the full page, tangled in a
dense knot at the top and untangling as you scroll, with gold light
traveling and blooming along the lines. The ground evolves from pre-dawn
umber through rust and terracotta to full cream dawn at the closer, where
the fully-lit thread bends gently toward the cursor.

No build step, no dependencies. Open `index.html` in a browser, or serve
the folder with any static server:

```bash
python3 -m http.server 8000
```

## Files

| File | What it is |
| --- | --- |
| `index.html` | All 12 cards, each marked with a numbered comment block |
| `styles.css` | Warm dawn-desert tokens, thread layers, type system, card styles |
| `main.js` | Ground engine, mind-thread canvas, the forge, globe, reveals |

## Design system

- **Palette** — warm dawn-desert: umber `#3A1E14` / rust `#5C2E1A` /
  terracotta `#B5563A` / dusty peach `#E8B893` / peach `#F0C9A0` /
  gold `#F5A94B` / cream `#FFF3E0`. Thread lines are near-black umber
  with gold light. All tokens live in `:root` at the top of `styles.css`.
- **Type** — Fraunces (serif display, headlines + loop lines), Instrument
  Sans (body), IBM Plex Mono (eyebrows, proof lines, labels). Google Fonts.
- **The mind-thread** — canvas (`#thread` in `main.js`): 7 strands in
  document space whose wander decays down the page (tangle → braid), a
  dark ink pass plus a gold gilding pass whose alpha grows with depth,
  traveling pulse glows, node glows behind each `[data-node]` card, and
  cursor-bending past 82% scroll. Degrades to a static line drawing under
  `prefers-reduced-motion`.
- **Motion** — the forge (card 3) types commands and assembles artifact
  cards; staggered line reveals per card; waking mind-dots on the globe;
  gentle hover lifts. All gated on `prefers-reduced-motion`.

## Placeholder slots to swap in Fable

Search `index.html` for `PLACEHOLDER SLOT`:

1. **Card 2 + 10** — testimonial photos (currently initial avatars) and
   real quotes for Michael, Ozcan, Yash, Sharnam (Gautam's is real)
2. **Card 3** — the forge artifact cards, if you want real demo content
3. **Card 7** — the memory-card content
4. **Card 10** — logo strip: swap text wordmarks for SVG logos

CTAs link to `#closer` in-page; the final button points at
`https://twinmind.com` — swap in the real signup/download URL.

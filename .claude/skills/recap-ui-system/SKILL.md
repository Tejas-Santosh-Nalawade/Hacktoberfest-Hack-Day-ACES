---
name: recap-ui-system
description: Set up the Recap Buddy design system — Vite + React scaffold, Tailwind v4, Motion animations, Inter font, YC-startup-style tokens and base components (Button, Card, Badge, ScoreRing, Skeleton, EmptyState). Use before building any screen, and whenever styling or animation decisions come up.
---

# Recap UI System

**Goal:** a clean, calm, Linear/Vercel-style look with subtle professional motion, defined once and reused everywhere.

**Read first:** PRD §9, §13 · CLAUDE.md "Frontend rules".

## Setup
```
npm create vite@latest frontend -- --template react
cd frontend
npm i react-markdown remark-gfm motion lucide-react
npm i -D tailwindcss @tailwindcss/vite
```
- `vite.config.js`: plugins `[react(), tailwindcss()]`; `server.proxy: { "/api": "http://localhost:8000" }`.
- `src/index.css`: `@import "tailwindcss";` plus a `@theme` block with the tokens below.
- `index.html`: Google Fonts Inter (400/500/600/700) and JetBrains Mono (500); title "Recap Buddy".

## Design tokens
| Token | Value |
|---|---|
| Background / surface | `#ffffff` / `zinc-50` sections |
| Text | `zinc-900` headings, `zinc-600` body, `zinc-400` meta |
| Border | 1px `zinc-200`; hover `zinc-300` |
| Accent | `indigo-600` (hover `indigo-700`), one accent only |
| Radius | `rounded-xl` cards, `rounded-lg` controls, `rounded-full` badges |
| Shadow | `shadow-[0_1px_2px_rgba(0,0,0,0.04)]`, hover `0_4px_12px_rgba(0,0,0,0.06)` |
| Type | Inter 15px base, headings `tracking-tight font-semibold`; numbers in JetBrains Mono |
| Layout | max-w 1120px, 8pt spacing, sidebar 280px; single column <768px |
| Buckets | correct `emerald`, partial `amber`, wrong `rose`, missed `sky` — `bg-*-50`, `border-l-4 border-*-500`, `text-*-700` labels |

Style rules: lots of whitespace, no gradients except one faint hero glow, no heavy shadows, no emoji in chrome (emoji only inside bucket titles), visible `focus-visible:ring-2 ring-indigo-500/40`.

## Motion rules (`motion/react`)
- Defaults: `duration 0.2–0.3`, `ease: [0.16, 1, 0.3, 1]`. Nothing over 400ms except the score count-up.
- Card enter: `initial {opacity:0, y:8}` → `animate {opacity:1, y:0}`.
- Bucket items: parent `staggerChildren: 0.04`.
- ScoreRing: SVG circle `strokeDashoffset` animates over 0.8s; the number counts up with `animate()` from `motion`.
- Recording: pulsing red dot (`scale [1,1.4,1]`, repeat) + 5 bars animating heights.
- Reviewing: `Skeleton` shimmer blocks with the text "Checking your concepts…".
- Sidebar list: `AnimatePresence` + `layout` for add/delete.
- View switch (teach ↔ diary): crossfade with `AnimatePresence mode="wait"`.
- Buttons: `whileTap {scale: 0.98}`.
- Wrap the app in `<MotionConfig reducedMotion="user">`.

## Base components (`src/components/ui/`)
`Button` (variants primary / secondary / ghost, sizes sm/md, loading spinner) · `Card` · `Badge` (score colour: ≥80 emerald, ≥50 amber, else rose) · `ScoreRing` · `Skeleton` · `EmptyState` (icon + one line + optional action).

## Done when
- [ ] A test page shows every base component in both states (idle/loading)
- [ ] `npm run build` passes
- [ ] Looks right at 375px and 1280px wide

## Tools
`devrelay-community-wisdom` (Tailwind v4 / Motion gotchas) · `design:ux-copy` (labels, empty states) · `design:accessibility-review` (contrast, focus) · Claude in Chrome (visual check, screenshots).

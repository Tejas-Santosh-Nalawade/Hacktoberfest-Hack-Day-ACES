---
name: recap-ui-system
description: The Recap Buddy design system — "Playful study buddy" look built from school supplies (graph paper, ballpoint ink, green tick, highlighter, red pen, sticky notes), Buddy the mascot, Tailwind v4 tokens, Motion rules and base components. Use before building or restyling any screen, and whenever styling or animation decisions come up.
---

# Recap UI System — Playful study buddy

**Goal:** a friendly, Duolingo-like study companion that doesn't look AI-generated. Every visual device comes from the student's desk.

**Read first:** `frontend-design`, `emil-design-eng`, `redesign-existing-projects` (installed skills) · PRD §13.

## Stack
Vite + React · Tailwind v4 (`@tailwindcss/vite`, tokens in `src/index.css` `@theme`) · `motion/react` · `@phosphor-icons/react` (not Lucide) · `canvas-confetti` · `react-markdown` + `remark-gfm`.

## Tokens (`src/index.css`)
| Role | Token | Value |
|---|---|---|
| Page | `paper` + `grid` | `#FBFCFF`, 28px graph-paper grid `#E8EEF9` |
| Ink | `ink` / `ink-soft` / `ink-faint` | `#1F2A44` / `#55607A` / `#8A93A8` |
| Primary (ballpoint) | `pen`, `pen-dark`, `pen-50` | `#2F5BFF` |
| Buddy / warm | `sun`, `sun-50` | `#FFD43B` |
| Correct (green tick) | `tick-50/500/700` | `#2FB36B` |
| Partial (highlighter) | `hi-50/300/700` | `#FFE45C` |
| Wrong (red pen) | `redpen-50/500/700` | `#E5484D` |
| Missed (sticky note) | `sticky-50/200/700` | `#C4E3FF` |

**Type:** Fredoka (`font-display`: headings, buttons) · Nunito (`font-sans`: body) · Caveat (`font-hand`: Buddy's speech, corrections, diary). No Inter, no monospace labels.

**Shape:** 2px `border-ink`, `rounded-2xl` controls, `rounded-[28px]` panels, hard shadow `shadow-chunky` (`0 4px 0 ink`). `.press` collapses the shadow on press. Slight ±1° tilt on stickers, chips and sticky notes.

**Helpers:** `.press`, `.lift` (hover-gated), `.focus-ring`, `.ruled` (notebook lines + red margin), `.tape` (washi tape), `.skeleton`, `.diary` (markdown).

## Buddy (`components/Buddy.jsx`)
`BuddyStage` at the top of main shows Buddy, a speech bubble and the stepper. Its moods are `idle | listening | thinking | happy | proud | encouraging`, and `App.jsx#buddyFor` picks the mood and line from app state. While listening, `useMicLevel` drives the mouth and body scale from the real mic level.

## Motion rules
- One orchestrated moment: **the review reveal**. The grade sticker stamps in (spring), the buckets cascade, the ticks draw, the highlighter sweeps, the red pen strikes through and the sticky notes drop in. Confetti fires for fresh scores of 80 or more.
- Everything else only moves in response to the user, such as the mic rings, the stepper pill (`layoutId`) and chip presses.
- Easing `cubic-bezier(0.23,1,0.32,1)`. Springs use `{type:'spring', duration≈0.45, bounce 0.2–0.35}`. UI motion stays under 300ms, except celebrations and the diary reveal.
- Don't animate from scale 0. Hover effects only apply under `(hover:hover)`. `MotionConfig reducedMotion="user"`, and confetti uses `disableForReducedMotion`.

## Copy
Buddy speaks in first person, plain and kind ("Teach me Photosynthesis. Pretend I've never heard of it."). Errors say what happened and what to do next. Don't use "Oops", ALL-CAPS labels, "→" in buttons, or "A · B · C" strings.

## Done when
- [ ] `npm run build` passes
- [ ] `?demo` shows the full review reveal
- [ ] Works at 375px and 1280px, keyboard focus visible, reduced motion respected

---
name: recap-frontend
description: Build the Recap Buddy React screens and flow — api.js, storage.js, TopicForm, ReferenceUpload, ReviewCard, BucketList, SessionSidebar, DiaryView, Header/footer, and App.jsx state wiring. Use after recap-ui-system when building or fixing any screen.
---

# Recap Frontend

**Goal:** the full flow from PRD §5 works in the browser with the polished UI system.

**Read first:** PRD §5, §6 (FR-1…14), §13 · CLAUDE.md "Frontend rules" · `recap-ui-system` for styling/motion · `recap-voice` for the mic.

## Files
`src/api.js` · `src/storage.js` · `src/App.jsx` · `src/components/{Header,TopicForm,ReferenceUpload,ReviewCard,BucketList,SessionSidebar,DiaryView}.jsx` · `src/sampleReview.js` (temporary mock)

## Steps
1. **api.js** — `getHealth()`, `extractFile(file)` (FormData), `getReview({topic, transcript, reference})`, `getReport({date, reviews})`. Relative `/api/...` URLs only; on `!res.ok`, throw `new Error(body.detail || "Something went wrong")`.
2. **storage.js** — key `recapbuddy:${YYYY-MM-DD}` (local date); `loadToday()`, `saveSession(review)` → `{id: crypto.randomUUID(), topic, createdAt, score, review}`, `deleteSession(id)`, `clearToday()`. Every call in try/catch with an in-memory fallback.
3. **Layout (App.jsx)**
   - Header: logo mark + "Recap Buddy", tagline "Teach it. We'll check it.", today's date on the right.
   - Grid: sidebar 280px | main. Stack under 768px with the sidebar *below* the main panel.
   - Footer: "Powered by open-weight `{health.model}` on DigitalOcean · MIT licensed · GitHub".
4. **State:** `topic, reference, transcript, review, loading, error, sessions, view ("teach"|"diary"), health`.
5. **Main panel** — three numbered step cards:
   1. **Topic & Notes:** `TopicForm` (max 120) + `ReferenceUpload` (drop zone; shows "notes.pdf · 3 pages" chip with remove ×; errors inline).
   2. **Teach:** `VoiceRecorder` + `TranscriptBox`. "Get Review" is primary and disabled until topic + ≥15 words, with a hint showing why.
   3. **Review:** while loading show the Skeleton; then `ReviewCard`.
6. **ReviewCard** — `ScoreRing` + summary + "Checked against your notes" badge if `grounded`; four `BucketList`s (✅ Correct, ⚠️ Partially correct, ❌ Wrong, 🕳️ Missed), each "None 🎉" when empty; a "Revise next" callout; buttons New Topic / Retry.
7. **Flow:** Get Review → `loading` → `review` → `saveSession` → refresh `sessions`. New Topic resets topic/transcript/reference/review. Clicking a sidebar item opens its review.
8. **SessionSidebar** — "Today's sessions", rows with topic + time + score `Badge`, delete on hover, `EmptyState` when none, primary "Generate today's diary" (disabled if 0), "Clear today" ghost link.
9. **DiaryView** — calls `getReport`, renders with `react-markdown` + `remark-gfm` (styled tables), buttons Download `.md` (`Blob` → `recap-diary-YYYY-MM-DD.md`) and Back.
10. **Errors:** a dismissible rose banner with Retry at the top of main — never a blank screen.
11. Build `ReviewCard` against `sampleReview.js` first, then swap in the real API.

## Done when
- [ ] PRD §5 flow works end-to-end against the local backend, with and without notes
- [ ] Refresh keeps today's sessions
- [ ] Backend stopped → error banner, not a crash
- [ ] `npm run build` passes; `package-lock.json` committed

## Tools
`run` skill (backend + frontend together) · Claude in Chrome (click through the flow, record a GIF) · `design:ux-copy` · `design:accessibility-review`.

# CLAUDE.md — Recap Buddy

Source of truth: `Research/RecapBuddy_PRD.md`. Read it for detail; if this file and the PRD disagree, the PRD wins. (`RecapBuddy_Build_Plan.md` is older — it assumes a single service; ignore it.)

## What it is
Student explains a topic out loud (Feynman technique) → browser transcribes → open-weight AI reviews **concepts only** → 4 buckets (✅ correct, ⚠️ partial, ❌ wrong, 🕳️ missed) + score → daily Markdown "Learning Diary".

Event: Hacktoberfest Hack Day Pune x ACES (MLH). Prize: **Best Open-Source AI Project (DigitalOcean)**. Team of 2, 2-hour build, goal = fully working deployed demo.

## MLH / prize rules (non-negotiable)
- Public GitHub repo, **MIT** `LICENSE` at root.
- Open-weight AI must be core: **Gemma 4 31B** (`gemma-4-31B-it`), fallback **gpt-oss-120b** (`openai-gpt-oss-120b`) via DigitalOcean Serverless Inference. Confirm exact IDs via `GET https://inference.do-ai.run/v1/models`.
- Agent Skill standard: `skills/recap-review/SKILL.md` (frontmatter `name: recap-review` = folder name, `description`, `license: MIT`) + `references/schema.md`, `references/rubric.md`.
- Built/hosted on DigitalOcean (live `*.ondigitalocean.app` URL).
- Follow MLH Code of Conduct. Disclose AI coding tools used on submission.
- Never commit secrets; the repo is public.

## AI behaviour rules (in prompts)
- Judge **concepts only** — never grammar, accent, filler words, transcription errors.
- Uploaded notes = source of truth; otherwise textbook-level model knowledge.
- Never invent mistakes the student didn't make. Max 5 missed concepts.
- Score ≈ 60% accuracy + 40% coverage. Temp ~0.2, max tokens ~3000.

## Stack
- Frontend: React + Vite (JS), plain CSS or Tailwind, `react-markdown` + `remark-gfm`, Web Speech API (`en-IN`, continuous, interim).
- Backend: FastAPI + Uvicorn (Python 3.11+), `openai` SDK (base_url = DO endpoint), `pypdf`, `python-docx`, `python-multipart`, `python-dotenv`, Pydantic.
- No DB, no auth, no server-side STT. Sessions live in browser `localStorage`.

## Repo layout
```
backend/   main.py llm.py prompts.py extract.py schemas.py requirements.txt .env.example
frontend/  package.json vite.config.js index.html src/{main.jsx,App.jsx,api.js,storage.js,hooks/useSpeech.js,components/*}
skills/recap-review/  SKILL.md  references/{schema.md,rubric.md}
README.md LICENSE .gitignore
```
Components: Header, TopicForm, ReferenceUpload, VoiceRecorder, TranscriptBox, ReviewCard, BucketList, SessionSidebar, DiaryView.

## Backend API (all under `/api` router)
| Route | Notes |
|---|---|
| `GET /health` | `{status:"ok", model, fallback_model}` — footer + deploy check |
| `POST /extract` | multipart `file` (PDF/DOCX/TXT ≤10 MB) → `filename, pages, chars, text (≤~80k), truncated`. 400 bad type · 413 too big · 422 no text |
| `POST /review` | `{topic, transcript (≥15 words), reference?}` → `{topic, score 0–100, summary, correct[{concept,note}], partial[{concept,what_was_said,fix}], wrong[{concept,what_was_said,correct_version}], missed[{concept,why_it_matters}], next_step, grounded, model}`. 400 short · 502 both models failed |
| `POST /report` | `{date, reviews[]}` → `{markdown, model}`. 400 empty · 502 failure |

**This review JSON shape is the contract between the two devs — don't change it without telling the other.**

Backend rules: env vars `MODEL_ACCESS_KEY`, `MODEL_ID`, `FALLBACK_MODEL_ID`; primary → retry once on fallback on any error/bad JSON; strip ```json fences, take outermost `{...}`, validate with Pydantic, default missing lists to `[]`, clamp score; CORS only for `http://localhost:5173`.

## Frontend rules
- Relative `/api/...` calls only (same domain in prod); Vite dev proxy `/api` → `http://localhost:8000`.
- Layout: header (name, "Teach it. We'll check it.", date) · left sidebar (today's sessions, Generate Diary, Clear today) · main (1 Topic & Notes → 2 Teach → 3 Review) · footer ("Powered by open-weight `<model>` on DigitalOcean · MIT · GitHub"). Single column <768px.
- Bucket colours: green / amber / red / blue. Empty bucket shows "None 🎉".
- "Get Review" disabled until topic set and transcript ≥15 words. Transcript always editable (typing is the mic fallback). Topic max 120 chars.
- `useSpeech`: auto-restart on `onend` until user presses Stop; expose `supported, listening, error, start, stop, reset`.
- Storage key `recapbuddy:YYYY-MM-DD` → `[{id, topic, createdAt, score, review}]`; every read/write in try/catch.
- Errors show a banner with Retry — never a blank screen. States: idle · recording · uploading · reviewing ("Checking your concepts…") · review · error · generating diary · diary.
- Diary download: `recap-diary-YYYY-MM-DD.md`.

## Local dev
```
cd backend && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt
uvicorn main:app --reload --port 8000        # Swagger at /docs
cd frontend && npm install && npm run dev    # :5173
```
`backend/.env` (git-ignored): `MODEL_ACCESS_KEY`, `MODEL_ID=gemma-4-31B-it`, `FALLBACK_MODEL_ID=openai-gpt-oss-120b`. Commit `.env.example` with empty values. `.gitignore`: `.env`, `node_modules/`, `dist/`, `.venv/`, `__pycache__/`.

## Deploy — DigitalOcean App Platform (one app, two components, region BLR1)
Pre-deploy: repo public on `main`; `requirements.txt` complete; `package-lock.json` committed; `npm run build` passes; no key in repo; all routes under `/api`.

Create: Control panel → Create → App Platform → GitHub → `recap-buddy`, `main`, Autodeploy on.

| | backend (Web Service) | frontend (Static Site) |
|---|---|---|
| Source dir | `backend` | `frontend` |
| Command | `uvicorn main:app --host 0.0.0.0 --port 8080` | build: `npm ci && npm run build` |
| Port / output | HTTP port `8080` | output `dist` |
| Route | `/api`, **Preserve path prefix ON** | `/`, catch-all doc `index.html` |
| Health check | `/api/health` | — |
| Size | smallest shared, 1 container | free |
| Env (runtime) | `MODEL_ACCESS_KEY` (**Encrypt**), `MODEL_ID`, `FALLBACK_MODEL_ID` | — |

Inference key: DO panel → Inference → Model Access Keys → create `recap-buddy`. Use **Serverless Inference only** — no GPU Droplets / Dedicated Inference (hourly billing). Credits: $25 Hacktoberfest credit; serverless is prepaid and stops when credits run out.

Verify live: `/api/health` returns ok + model → `/` loads, footer shows model → full flow (topic → mic → review → 2nd topic → diary → download). Debug via backend Runtime Logs.

Common failures: `/api` 404 → Preserve path prefix off · health fails → run port ≠ 8080 · 502 on review → bad model ID / missing key · refresh 404 → catch-all not `index.html` · no mic → needs Chrome/Edge + HTTPS.

Fallback: if deploy blocks, record a 60–90 s local demo video and submit it. After judging: destroy the app and delete the access key.

## Acceptance tests (must pass)
Health ok on live URL · deliberate "plants release CO₂" lands in **Wrong** · skipped Calvin cycle lands in **Missed** · no grammar feedback · PDF/DOCX/TXT notes → "Checked against your notes" · mic denied → clear message, typing works · 3 topics → diary table + tomorrow's priorities · `.md` download · refresh keeps sessions · invalid `MODEL_ID` → fallback answers.

## Working rules for the agent
- Build in PRD order: backend (Phase 1) and frontend (Phase 2) in parallel, then integrate, skill, README, deploy.
- Keep it simple: no accounts, DB, or extras until all acceptance tests pass. Stretch goals are PRD §20.
- Run `npm run build` and test every route in Swagger before declaring done.
- Feature freeze before the final hour; only fixes afterwards.

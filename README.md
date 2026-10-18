# Recap Buddy

**Teach it. We'll check it.** Explain a topic out loud and an open-weight AI tells you what you got right, what was close, what was wrong and what you missed. At the end of the day it turns every recap into a one-page learning diary.

Built at **Hacktoberfest Hack Day Pune x ACES (MLH)** for the **Best Open-Source AI Project (DigitalOcean)** category.

- **Live demo:** _add App Platform URL_
- **Demo video:** _add link_

## Problem

Many students learn best by teaching a concept out loud (the Feynman technique). Others revise 4–5 concepts a day and can't recap them properly by evening. Both hit the same wall: there's nobody to explain to, and even if someone listens, they can't tell what was **correct**, **wrong** or **missed**.

## Solution

1. Pick a topic and optionally upload your notes (PDF, DOCX or TXT).
2. Press **Start teaching** and explain it out loud. The browser transcribes live, and you can also type.
3. Get a review sorted into ✅ correct · ⚠️ partially correct · ❌ wrong · 🕳️ missed, with a score and a "revise next" tip.
4. Repeat for more topics, then **Generate today's diary** and download it as Markdown.

The AI judges **concepts only**: never grammar, accent or filler words. If you upload notes, they're the source of truth.

## How it works

```
Browser (React + Vite)
  ├─ Web Speech API  → live transcript
  ├─ localStorage    → today's sessions
  └─ fetch("/api/...")
            │
DigitalOcean App Platform (one app)
  ├─ Static Site  "frontend"  → /
  └─ Web Service  "backend"   → /api   (FastAPI)
            │  OpenAI-compatible HTTPS
DigitalOcean Serverless Inference
  ├─ gemma-4-31B-it        (primary, open-weight)
  └─ openai-gpt-oss-120b   (fallback, open-weight)
```

| Route | Purpose |
|---|---|
| `GET /api/health` | Status + model in use |
| `POST /api/extract` | Extract text from PDF / DOCX / TXT notes |
| `POST /api/review` | Review an explanation → 4 buckets + score |
| `POST /api/report` | Write today's Markdown learning diary |

## Open-source AI

- **Gemma 4 31B** (open-weight) is the review and diary engine, served by **DigitalOcean Serverless Inference**.
- **gpt-oss-120b** (open-weight) is an automatic fallback if the primary model fails or returns invalid JSON.
- Model IDs are environment variables, so any open-weight model on DigitalOcean can be swapped in.

## Agent Skill

The grading rubric is published as an [Agent Skill Open Standard](https://agentskills.io/) skill: [`skills/recap-review/SKILL.md`](skills/recap-review/SKILL.md), with its [JSON schema](skills/recap-review/references/schema.md) and [rubric](skills/recap-review/references/rubric.md). The backend prompts in `backend/prompts.py` implement this same skill, so any skills-compatible agent can reuse the rubric.

## Run locally

Requirements: Python 3.11+ and Node 20+. Use Chrome or Edge for voice input.

```bash
# backend
cd backend
python -m venv .venv
.venv/Scripts/activate        # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
cp .env.example .env          # then add your DigitalOcean MODEL_ACCESS_KEY
uvicorn main:app --reload --port 8000

# frontend (new terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173  (proxies /api → :8000)
```

Open `http://localhost:5173/?demo` in dev to see a sample review without calling the model.

## Deploy on DigitalOcean

Create one App Platform app from this repo with two components (or use [`.do/app.yaml`](.do/app.yaml)):

| | backend (Web Service) | frontend (Static Site) |
|---|---|---|
| Source dir | `backend` | `frontend` |
| Run / build | `uvicorn main:app --host 0.0.0.0 --port 8080` | `npm ci && npm run build` |
| Port / output | `8080` | `dist` |
| Route | `/api` (preserve path prefix) | `/` (catch-all `index.html`) |
| Env | `MODEL_ACCESS_KEY` (encrypted), `MODEL_ID`, `FALLBACK_MODEL_ID` | — |

Create the key under **Inference → Model Access Keys** in the DigitalOcean control panel.

## Tech

React · Vite · Tailwind CSS · Motion · Web Speech API · FastAPI · pypdf · python-docx · DigitalOcean App Platform · DigitalOcean Serverless Inference · Gemma 4 · gpt-oss

## License

[MIT](LICENSE)

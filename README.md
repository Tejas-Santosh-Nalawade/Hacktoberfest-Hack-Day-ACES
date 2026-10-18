<div align="center">

<img src="docs/logo.svg" alt="Recap Buddy" width="120" height="124" />

# Recap Buddy

*Teach it out loud. Buddy checks it.*

Explain a topic out loud and an open-weight AI model tells you what you got right, what was close, what was wrong and what you missed. At the end of the day it writes everything you learned up as a diary page.

[![License: MIT](https://img.shields.io/badge/license-MIT-2F5BFF.svg)](LICENSE)
[![Gemma 4](https://img.shields.io/badge/AI-Gemma%204%2031B-FFD43B.svg)](https://docs.digitalocean.com/products/inference/details/models/)
[![DigitalOcean](https://img.shields.io/badge/hosted%20on-DigitalOcean-0080FF.svg?logo=digitalocean&logoColor=white)](https://www.digitalocean.com/products/app-platform)
[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026-E5484D.svg)](https://hacktoberfest.com)

<img src="docs/screenshots/home.jpg" alt="Recap Buddy home screen: Buddy the mascot asks what you learned today, next to a topic picker and today's notebook sidebar" width="860" />

</div>

## Why

Teaching a concept out loud is one of the best ways to learn it (the [Feynman technique](https://en.wikipedia.org/wiki/Learning_by_teaching)), but there's rarely someone to listen, and even when there is, they can't tell you what was correct, wrong or missing. Recap Buddy is that listener. It ignores grammar and accent, and checks your explanation against your own notes when you have them.

## Features

- *Teach out loud.* Live speech-to-text in the browser, or type instead.
- *Four-way review.* Every idea lands in Got it right, Almost there (with the fix), Needs fixing (with the correct version) or You skipped (with why it matters), plus a score out of 100.
- *Your notes as the answer key.* Upload a PDF, DOCX or TXT and the review is checked against it. Without notes it uses standard textbook knowledge.
- *Concepts only.* Grammar, filler words and speech-to-text errors are ignored, and the model is told never to invent mistakes.
- *Read it to me.* Buddy reads the summary and what to revise next aloud.
- *Daily diary.* One click turns today's sessions into a diary page with a score table and three priorities for tomorrow. Print it or download it as Markdown.
- *No accounts.* Sessions stay in your browser; the API key never leaves the server.

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/review.jpg" alt="Review card with a grade sticker scoring 68, a summary, and the Got it right and Almost there buckets" /></td>
    <td width="50%"><img src="docs/screenshots/feedback.jpg" alt="Wrong answer struck through in red pen with the correction handwritten, missed concepts shown as sticky notes, and a Revise next panel" /></td>
  </tr>
</table>

## How it works

mermaid
flowchart LR
    subgraph Browser["Browser · React + Vite"]
        Mic["Web Speech API<br/>live transcript"]
        Store[("localStorage<br/>today's sessions")]
        UI["Recap Buddy UI"]
    end

    subgraph DO["DigitalOcean App Platform"]
        Static["Static Site<br/>route /"]
        API["FastAPI Web Service<br/>route /api"]
    end

    subgraph Inference["DigitalOcean Serverless Inference"]
        Gemma["gemma-4-31B-it<br/>primary"]
        GPT["openai-gpt-oss-120b<br/>fallback"]
    end

    Mic --> UI
    UI <--> Store
    Static -. serves .-> UI
    UI -- "fetch /api/*" --> API
    API -- "OpenAI-compatible HTTPS" --> Gemma
    API -. "on error or bad JSON" .-> GPT


1. *Pick a topic* and optionally upload notes (POST /api/extract).
2. *Teach it.* The browser transcribes you live and keeps listening through pauses until you press stop.
3. *Check it.* POST /api/review sends the topic, transcript and notes to the model. The backend extracts and validates the JSON, and retries once on the fallback model if the first reply fails or is malformed.
4. *Write the diary.* Reviews are saved in localStorage for the day, and POST /api/report turns them into a Markdown diary page.

Frontend and backend share one domain, so the frontend only calls relative /api/... paths: no CORS and no API URL to configure.

## Models

| Role | Model |
|---|---|
| Review and diary | *Gemma 4 31B Instruct* (gemma-4-31B-it) |
| Fallback | *gpt-oss-120b* (openai-gpt-oss-120b) |

Both are open-weight and served by DigitalOcean Serverless Inference by default. Gemma 4 can also run on Google AI Studio or fully offline with Ollama (see [Configuration](#configuration)). The grading rules live in [backend/prompts.py](backend/prompts.py).

## Getting started

*Prerequisites:* Python 3.11+, Node.js 20.19+, and a DigitalOcean model access key (Control panel → *Inference* → *Model Access Keys*). Voice input needs Chrome or Edge; typing works everywhere.

bash
git clone https://github.com/Tejas-Santosh-Nalawade/Hacktoberfest-Hack-Day-ACES.git recap-buddy
cd recap-buddy


*Backend*

bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # paste your key into MODEL_ACCESS_KEY
uvicorn main:app --reload --port 8000


Swagger UI is at <http://localhost:8000/docs>.

*Frontend*

bash
cd frontend
npm install
npm run dev                        # http://localhost:5173, proxies /api to :8000


> [!TIP]
> Open <http://localhost:5173/?demo> to see a sample review without calling the model (dev build only).

## Configuration

Set these in the environment or in backend/.env (see [.env.example](backend/.env.example)).

| Variable | Default | Description |
|---|---|---|
| LLM_PROVIDER | digitalocean | digitalocean, gemini or ollama |
| MODEL_ACCESS_KEY | none | DigitalOcean key. *Never commit keys.* |
| GEMINI_API_KEY | none | Google AI Studio key |
| OLLAMA_BASE_URL | http://localhost:11434/v1/ | Where Ollama is listening |
| MODEL_ID | per provider | Primary model |
| FALLBACK_PROVIDER | same as LLM_PROVIDER | Provider for the retry, e.g. ollama as an offline backup |
| FALLBACK_MODEL_ID | per provider | Model for the retry |
| LLM_TIMEOUT | 150 | Seconds to wait for a reply |

Default models per provider: digitalocean uses gemma-4-31B-it then openai-gpt-oss-120b; gemini uses gemma-4-26b-a4b-it then gemma-4-31b-it; ollama uses gemma4.

To run offline, ollama pull gemma4 (about 7 GB; use gemma4:e2b on low-memory machines), set LLM_PROVIDER=ollama and restart the backend.

*Limits:* topic ≤ 120 characters, explanation ≥ 15 words, notes ≤ 10 MB (text beyond 80,000 characters is trimmed).

## API

| Method | Route | Purpose |
|---|---|---|
| GET | /api/health | Status and models in use |
| POST | /api/extract | Extract text from a PDF, DOCX or TXT (multipart/form-data, field file) |
| POST | /api/review | Review an explanation |
| POST | /api/report | Write today's diary from a list of reviews |

<details>
<summary><strong>Example: POST /api/review</strong></summary>

bash
curl -s http://localhost:8000/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Photosynthesis",
    "transcript": "Photosynthesis happens in the chloroplasts. Chlorophyll absorbs light. Plants take in oxygen and release carbon dioxide.",
    "reference": null
  }'


json
{
  "topic": "Photosynthesis",
  "score": 62,
  "summary": "Good start. You know where it happens and what chlorophyll does, but the gas exchange is reversed.",
  "correct": [{ "concept": "Chlorophyll", "note": "Chlorophyll absorbs light energy." }],
  "partial": [{ "concept": "Light reactions", "what_was_said": "...", "fix": "..." }],
  "wrong":   [{ "concept": "Gas exchange", "what_was_said": "Plants take in oxygen and release carbon dioxide.", "correct_version": "Plants take in CO₂ and release O₂." }],
  "missed":  [{ "concept": "Calvin cycle", "why_it_matters": "This is where CO₂ is fixed into sugar." }],
  "next_step": "Revise the Calvin cycle.",
  "grounded": false,
  "model": "gemma-4-31B-it"
}


Full field reference: [schema.md](skills/recap-review/references/schema.md).

</details>

*Errors* use FastAPI's {"detail": "..."} shape: 400 bad file type, short explanation or empty review list · 413 file over 10 MB · 422 no readable text or invalid body · 502 both models failed.

## Project structure


.
├── backend/                  FastAPI service
│   ├── main.py               /api routes
│   ├── llm.py                Model client, fallback, JSON repair
│   ├── prompts.py            Review and diary prompts
│   ├── extract.py            PDF / DOCX / TXT extraction
│   └── schemas.py            Pydantic models
├── frontend/src/             React + Vite app
│   ├── App.jsx               App state and flow
│   ├── api.js                Fetch helpers
│   ├── storage.js            Today's sessions in localStorage
│   ├── hooks/                useSpeech, useMicLevel
│   └── components/           Buddy, VoiceRecorder, ReviewCard, DiaryView, …
├── skills/recap-review/      Grading rubric as an Agent Skill
├── .do/app.yaml              DigitalOcean App Platform spec
└── docs/                     Logo and screenshots


## Deploying to DigitalOcean

The app runs as one App Platform app with two components on a single domain.

bash
doctl apps create --spec .do/app.yaml


Then set MODEL_ACCESS_KEY on the *backend* component as an encrypted environment variable. To set it up by hand in the control panel instead:

| | backend (Web Service) | frontend (Static Site) |
|---|---|---|
| Source directory | backend | frontend |
| Run / build command | uvicorn main:app --host 0.0.0.0 --port 8080 | npm ci && npm run build |
| HTTP port / output | 8080 | dist |
| Route | /api, *Preserve path prefix* on | /, catch-all document index.html |
| Health check | /api/health | none |

Use Serverless Inference only; GPU Droplets and Dedicated Inference bill by the hour and aren't needed.

<details>
<summary><strong>Troubleshooting</strong></summary>

| Symptom | Fix |
|---|---|
| /api/* returns 404 | Turn on **Preserve path prefix** for the backend route |
| Health check fails | Run command port and HTTP port must both be 8080 |
| 502 on review | Missing MODEL_ACCESS_KEY or wrong model ID; check backend Runtime Logs |
| Page refresh returns 404 | Set the static site's catch-all document to index.html |
| Mic doesn't start | Use Chrome or Edge over HTTPS and allow microphone access |

</details>

## Agent Skill

The grading rubric is published as an [Agent Skill](https://agentskills.io/), so any skills-compatible agent can review explanations the same way: [SKILL.md](skills/recap-review/SKILL.md), [schema.md](skills/recap-review/references/schema.md) and [rubric.md](skills/recap-review/references/rubric.md) (60% accuracy, 40% coverage).

## Privacy

- No accounts and no database. Sessions live in your browser's localStorage; Clear today deletes them.
- Transcripts and notes are sent to DigitalOcean Serverless Inference for review and are not stored by Recap Buddy.
- Speech recognition uses your browser's Web Speech API (in Chrome, Google's speech service).

## Browser support

| | Chrome / Edge | Safari | Firefox |
|---|---|---|---|
| Typing, review, diary, read aloud | ✅ | ✅ | ✅ |
| Voice input | ✅ | ⚠️ partial | ❌ |

## Roadmap

- [ ] Follow-up question on your weakest area
- [ ] In-browser Whisper for browsers without the Web Speech API
- [ ] Streaks and score history across days
- [ ] Web-search grounding for topics without notes

## Contributing

1. Fork the repo and create a branch: git checkout -b feat/your-idea
2. Make your change and check the frontend: cd frontend && npm run build && npx oxlint src
3. Open a pull request explaining what and why, with a screenshot for UI changes.

Please keep the review JSON shape in [schema.md](skills/recap-review/references/schema.md) stable: the frontend, backend and Agent Skill all depend on it.

## Acknowledgements

Built at [Hacktoberfest Hack Day Pune × ACES](https://events.mlh.io/events/15423-hacktoberfest-hack-day-pune-x-aces-association-of-computer-engineering-students) with [MLH](https://mlh.io), for DigitalOcean's Best Open-Source AI Project category. Powered by [Gemma](https://ai.google.dev/gemma) and [gpt-oss](https://openai.com/index/introducing-gpt-oss/), and built with [FastAPI](https://fastapi.tiangolo.com), [React](https://react.dev) and [Vite](https://vite.dev). Developed with help from [Claude Code](https://claude.com/claude-code).

## License

[MIT](LICENSE)
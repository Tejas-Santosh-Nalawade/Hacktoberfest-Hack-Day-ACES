# Recap Buddy — 2-Hour Hackathon Build Plan

**Event:** Hacktoberfest Hack Day Pune x ACES (MLH)
**Track:** DigitalOcean — *Best Open-Source AI Project*
**Submission deadline:** Sun 18 Oct 2026, 4:00 PM IST → **aim to submit by 3:45 PM**
**Team:** 2 people

---

## 1. The idea in one line

> **Recap Buddy** — Teach a concept out loud to an open-weight AI. It tells you what you got right, what you got wrong, and what you missed — grounded in your own notes/PDF — and writes you a daily "learning diary".

It's the Feynman Technique ("learn by teaching") with a knowledgeable listener who never gets tired and **never judges your grammar**, only your concepts.

---

## 2. Does this fit the DigitalOcean prize rules? ✅

| Rule (Best Open-Source AI Project) | How Recap Buddy satisfies it |
|---|---|
| Open-source / open-weight AI is an *important* part | The whole review engine is an **open-weight LLM** (Gemma 4 31B or gpt-oss-120b) served by DigitalOcean Serverless Inference. No model = no product. |
| Public GitHub repo + open-source license | Public repo with `LICENSE` (MIT or Apache-2.0) committed in the first 5 minutes. |
| Agent skill must follow the Agent Skill Open Standard (if you make one) | We ship `skills/recap-review/SKILL.md` (YAML frontmatter `name` + `description` + instructions) — the review rubric packaged so any skills-compatible agent can reuse it. Bonus, cheap, strengthens the entry. |
| "Build with DigitalOcean" | Model via **DigitalOcean Serverless Inference**; app hosted on **DigitalOcean App Platform**. |

The Hacktoberfest 2026 theme is explicitly "build with open-source AI" and the DigitalOcean category suggests hosting your app on DO or building on the Gradient AI Platform — we do both the inference and the hosting there.

---

## 3. Existing solutions (and why ours is different)

| Existing | What it does | Gap we fill |
|---|---|---|
| **Feynman Learning** (open-source Obsidian plugin) | Text-based Feynman workflow, AI gap analysis, spaced repetition — inside Obsidian | Text-only, Obsidian-only, not voice, not grounded on an uploaded PDF |
| **Feynman Apprentice** (feynmans.us) | Record a video explaining a topic; AI scores 0–100 and lists gaps | Closed product, video-based, proprietary models |
| **Feynman AI** (iOS app) | Explain a concept, get clarity score | Paid subscription, closed, no daily report |
| **Teach Simple** (AI Tinkerers hackathon) | Real-time voice tutor | Built on proprietary OpenAI Realtime/o1; AI does the explaining, not the student |
| **algernon-feynman** (agent skill) | Feynman study session as an agent skill | CLI/agent only, no voice UI |

**Our differentiators (say these in the demo):**
1. **Voice-first** — you talk, like teaching a friend.
2. **Grounded** — optional PDF/notes become the "answer key"; without it, the model uses its own knowledge.
3. **Concept-only grading** — prompt explicitly ignores grammar, filler words, accent.
4. **4-bucket review**: ✅ Correct · ⚠️ Partially right · ❌ Wrong · 🕳️ Missed.
5. **Daily diary report** — one page summarising every concept you recapped today.
6. **100% open-weight model + open-source code + reusable agent skill.**

---

## 4. Tech stack (chosen for "working in 2 hours")

| Layer | Choice | Why |
|---|---|---|
| LLM | **DigitalOcean Serverless Inference** → `gemma-4-31B-it` (primary), `openai-gpt-oss-120b` (fallback) | Both open-weight, DO-hosted, OpenAI-compatible API → just the `openai` Python SDK with a different `base_url`. Gemma 4 has a 256K context window (fits whole PDFs). |
| Backend | **Python + FastAPI** (single `main.py`) | 3 endpoints, ~100 lines |
| PDF parsing | `pypdf` | Pure Python, no system deps |
| Voice → text | **Browser Web Speech API** (`webkitSpeechRecognition`) with a text box fallback | Zero setup, real-time. *(Stretch: in-browser open-source Whisper via transformers.js — DO doesn't list a speech-to-text model on serverless inference.)* |
| Frontend | One `static/index.html` + Tailwind CDN + vanilla JS | No build step, served by FastAPI |
| Storage | Browser `localStorage` for today's sessions | No DB to set up; App Platform filesystem is ephemeral anyway |
| Hosting | **DigitalOcean App Platform** (deploy from GitHub) | Push → live URL for judges |
| License | MIT | Required by the category |

> ⚠️ Model IDs change — run `GET https://inference.do-ai.run/v1/models` with your key first and use whatever ID it returns for Gemma 4 / gpt-oss.

---

## 5. Architecture

```
┌──────────── Browser (index.html) ─────────────┐
│ 1. Topic name   2. (optional) upload PDF      │
│ 3. 🎙 Start teaching → Web Speech API → text  │
│ 4. Show review cards  5. "Today's Diary" btn  │
│    sessions saved in localStorage             │
└───────────────┬───────────────────────────────┘
                │ fetch (JSON)
┌───────────────▼──────── FastAPI on DO App Platform ┐
│ POST /api/extract  → pypdf → reference text         │
│ POST /api/review   → topic + transcript + ref → LLM │
│ POST /api/report   → today's reviews → diary (MD)   │
└───────────────┬─────────────────────────────────────┘
                │ OpenAI-compatible HTTPS
┌───────────────▼──────────────────────────────┐
│ DigitalOcean Serverless Inference             │
│ https://inference.do-ai.run/v1                │
│ model: gemma-4-31B-it  (open-weight)          │
└───────────────────────────────────────────────┘
```

---

## 6. MVP scope — what MUST work in the demo

- [ ] Enter topic (e.g. "Photosynthesis")
- [ ] Optional PDF upload → text extracted
- [ ] Press mic, speak for 30–60 s, live transcript appears (editable)
- [ ] Click **Review** → 4 colour-coded sections + a short score/summary
- [ ] Do 2–3 topics → click **Today's Diary** → one-page Markdown report, downloadable `.md`
- [ ] Live on a DigitalOcean App Platform URL

**Cut if short on time:** .docx upload, web search grounding, auth, database, Whisper, TTS.

---

## 7. The core prompt (this is the heart of the project)

```text
SYSTEM:
You are Recap Buddy, a patient expert listener. A student is TEACHING you a
topic out loud to check their own understanding. Their words come from
speech-to-text, so IGNORE grammar, filler words, repetition, and
transcription errors. Judge ONLY the concepts.

If REFERENCE MATERIAL is provided, treat it as the primary source of truth
and judge coverage against it. If not, use your own well-established
knowledge of the topic at a standard textbook level.

Return ONLY valid JSON, no markdown fences, with this exact shape:
{
  "topic": string,
  "score": integer 0-100,          // conceptual accuracy + coverage
  "summary": string,               // 1-2 encouraging sentences
  "correct":   [{"concept": string, "note": string}],
  "partial":   [{"concept": string, "what_was_said": string, "fix": string}],
  "wrong":     [{"concept": string, "what_was_said": string, "correct_version": string}],
  "missed":    [{"concept": string, "why_it_matters": string}],
  "next_step": string              // one concrete thing to revise next
}
Be specific and short. Never invent mistakes the student did not make.

USER:
TOPIC: {topic}
REFERENCE MATERIAL (may be empty): {reference_text}
STUDENT'S EXPLANATION (speech transcript): {transcript}
```

**Diary prompt** (for `/api/report`):
```text
You are writing a student's end-of-day learning diary. Given the JSON reviews
below, write a warm, concise Markdown page: a heading with today's date,
a table (Topic | Score | Key gap), then a short section per topic with
"Nailed it", "Fix this", "Revise next". End with 3 priorities for tomorrow.
REVIEWS: {reviews_json}
```

---

## 8. Starter code

### `requirements.txt`
```
fastapi
uvicorn[standard]
openai
pypdf
python-multipart
```

### `main.py`
```python
import os, io, json, re
from datetime import date
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from openai import OpenAI
from pypdf import PdfReader

client = OpenAI(base_url="https://inference.do-ai.run/v1/",
                api_key=os.environ["MODEL_ACCESS_KEY"])
MODEL = os.getenv("MODEL_ID", "gemma-4-31B-it")
FALLBACK = os.getenv("FALLBACK_MODEL_ID", "openai-gpt-oss-120b")

REVIEW_SYSTEM = """<paste SYSTEM prompt from section 7>"""
REPORT_SYSTEM = """<paste diary prompt from section 7>"""

app = FastAPI(title="Recap Buddy")

class ReviewIn(BaseModel):
    topic: str
    transcript: str
    reference: str = ""

class ReportIn(BaseModel):
    reviews: list[dict]

def chat(system: str, user: str) -> str:
    for model in (MODEL, FALLBACK):
        try:
            r = client.chat.completions.create(
                model=model, temperature=0.2, max_tokens=3000,
                messages=[{"role": "system", "content": system},
                          {"role": "user", "content": user}])
            return r.choices[0].message.content
        except Exception as e:
            last = e
    raise HTTPException(502, f"Model error: {last}")

def parse_json(raw: str) -> dict:
    raw = re.sub(r"^```(json)?|```$", "", raw.strip(), flags=re.M)
    start, end = raw.find("{"), raw.rfind("}")
    return json.loads(raw[start:end + 1])

@app.post("/api/extract")
async def extract(file: UploadFile = File(...)):
    reader = PdfReader(io.BytesIO(await file.read()))
    text = "\n".join((p.extract_text() or "") for p in reader.pages)
    return {"text": text[:80000], "pages": len(reader.pages)}

@app.post("/api/review")
def review(body: ReviewIn):
    if len(body.transcript.split()) < 5:
        raise HTTPException(400, "Say a bit more before reviewing.")
    user = (f"TOPIC: {body.topic}\nREFERENCE MATERIAL: {body.reference or '(none)'}\n"
            f"STUDENT'S EXPLANATION: {body.transcript}")
    raw = chat(REVIEW_SYSTEM, user)
    try:
        return parse_json(raw)
    except Exception:
        return {"topic": body.topic, "score": None, "summary": raw,
                "correct": [], "partial": [], "wrong": [], "missed": [], "next_step": ""}

@app.post("/api/report")
def report(body: ReportIn):
    md = chat(REPORT_SYSTEM,
              f"DATE: {date.today().isoformat()}\nREVIEWS: {json.dumps(body.reviews)}")
    return {"markdown": md}

app.mount("/", StaticFiles(directory="static", html=True), name="static")  # keep last
```

### Voice capture snippet (in `static/index.html`)
```js
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec, listening = false, finalText = "";
function startMic() {
  if (!SR) { alert("Use Chrome/Edge for voice, or type in the box."); return; }
  rec = new SR(); rec.lang = "en-IN"; rec.continuous = true; rec.interimResults = true;
  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      e.results[i].isFinal ? (finalText += t + " ") : (interim += t);
    }
    document.getElementById("transcript").value = finalText + interim;
  };
  rec.onend = () => { if (listening) rec.start(); }; // Chrome stops on silence
  listening = true; rec.start();
}
function stopMic() { listening = false; rec && rec.stop(); }
```
Save each review: `localStorage.setItem("recap-" + new Date().toDateString(), JSON.stringify(list))` (wrap in try/catch). Diary button posts that list to `/api/report` and offers the Markdown as a download.

### `skills/recap-review/SKILL.md` (Agent Skill Open Standard)
```markdown
---
name: recap-review
description: Review a student's spoken or written explanation of a topic (Feynman technique). Use when a learner explains a concept and wants to know what was correct, partially correct, wrong, or missed. Ignores grammar; judges concepts only.
license: MIT
---
# Recap Review
1. Identify the topic and any reference material the user supplied.
2. Ignore grammar, filler words and transcription errors.
3. Sort every claim into correct / partial / wrong; list important missed concepts.
4. Output the JSON schema in references/schema.md, then a 1-2 sentence encouraging summary.
```

### Repo layout
```
recap-buddy/
├── main.py
├── requirements.txt
├── static/index.html
├── skills/recap-review/SKILL.md
├── skills/recap-review/references/schema.md
├── README.md          (problem, demo GIF/screens, DO models used, how to run)
├── LICENSE            (MIT)
└── .env.example       (MODEL_ACCESS_KEY=, MODEL_ID=gemma-4-31B-it)
```

---

## 9. DigitalOcean setup & deployment (with your $25 Hacktoberfest credit)

### 9.0 What your $25 covers (plenty)

| Item | Price | Hackathon usage | Cost |
|---|---|---|---|
| Gemma 4 31B (serverless) | $0.18 / 1M input, $0.50 / 1M output tokens | ~200 reviews × (4k in + 1k out) | **≈ $0.25** |
| gpt-oss-120b (fallback) | $0.10 / 1M input, $0.70 / 1M output | a few calls | ≈ $0.01 |
| App Platform web service (smallest) | ~$5/month, billed per second | 3–4 days | **≈ $0.50–0.70** |
| **Total** | | | **< $2 of your $25** |

- Serverless inference is **prepaid** — it runs on promo credits or a prepaid balance; if both hit zero, requests are blocked. Your $25 credit covers it.
- Credits expire **21 Oct 2026** → **destroy the app after judging** so nothing gets billed later.
- Don't use Dedicated Inference / GPU Droplets — those cost $2.59–$4.41+ per hour and you don't need them.

### 9.1 Get a model access key (5 min) — Person A

1. Go to https://cloud.digitalocean.com and log in with the account that has the credit.
2. Left sidebar → **Inference** (may be labelled *Gradient AI* / *Inference Hub*) → **Model Access Keys** → **Create key** → name it `recap-buddy` → copy it now (it's shown once).
3. Optional sanity check: open **Model Playground**, pick Gemma 4, type "hi".
4. Test from your laptop:
   ```bash
   export MODEL_ACCESS_KEY="paste-key-here"          # Windows PowerShell: $env:MODEL_ACCESS_KEY="..."

   # list model IDs (copy the exact Gemma 4 + gpt-oss IDs)
   curl https://inference.do-ai.run/v1/models -H "Authorization: Bearer $MODEL_ACCESS_KEY"

   # chat test
   curl https://inference.do-ai.run/v1/chat/completions \
     -H "Authorization: Bearer $MODEL_ACCESS_KEY" -H "Content-Type: application/json" \
     -d '{"model":"gemma-4-31B-it","messages":[{"role":"user","content":"Explain photosynthesis in 1 line"}]}'
   ```
   - Reply received → you're good.
   - 401 → wrong key.
   - 404 / model error → use the ID from `/v1/models`.
   - Balance or quota error → check under Billing that the credit applies to Inference.

### 9.2 Run locally (5 min)

```bash
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
# open http://localhost:8080  (mic works on localhost)
```

Create `.gitignore` **before the first commit**:
```
.env
.venv/
__pycache__/
```
⚠️ Never commit the key — the repo must be public. Put it only in App Platform environment variables.

### 9.3 Push to GitHub — Person B
```bash
git init && git add . && git commit -m "Recap Buddy MVP"
git branch -M main
git remote add origin https://github.com/<you>/recap-buddy.git
git push -u origin main
```
Repo → Settings → confirm it's **Public** and `LICENSE` (MIT) is in the root.

### 9.4 Deploy on App Platform (10 min — do a "hello" deploy by 14:45)

1. Control Panel → **Create** (top right) → **App Platform**.
2. Source: **GitHub** → authorize DigitalOcean → pick `recap-buddy`, branch `main`, ✅ **Autodeploy** (every push redeploys).
3. It detects **Python** from `requirements.txt` (must be in the repo root). Check the component type is **Web Service**, not Static Site.
4. Edit the component:
   - **Run command:** `uvicorn main:app --host 0.0.0.0 --port 8080`
   - **HTTP port:** `8080`
   - **Size:** smallest shared plan, **1 container**
5. **Environment variables** (component level, run time):
   - `MODEL_ACCESS_KEY` = your key → tick **Encrypt**
   - `MODEL_ID` = `gemma-4-31B-it`
   - `FALLBACK_MODEL_ID` = `openai-gpt-oss-120b`
6. **Region:** Bangalore (BLR1) — closest to Pune.
7. **Create Resources** → build takes ~3–5 min → you get `https://recap-buddy-xxxxx.ondigitalocean.app` (HTTPS, so the mic works).
8. Test the live URL end to end. Errors → open the app → **Runtime Logs** / **Build Logs** tabs.

### 9.5 Common deploy errors

| Symptom | Fix |
|---|---|
| Build: "no start command" | Set the run command from step 4 |
| Health check fails / 502 | Port mismatch — uvicorn port and HTTP port must both be 8080 |
| `KeyError: MODEL_ACCESS_KEY` | Env var missing or set for build time only — set it for run time |
| Model 404 | Use the exact ID returned by `/v1/models` |
| Static page 404 | `static/index.html` must exist and `app.mount(...)` must be the last line of `main.py` |
| Mic not working | Use Chrome/Edge; page must be HTTPS (the App Platform URL is) |

### 9.6 After the hackathon
Once judging ends: app → **Settings** → **Destroy app**, then delete the model access key.

**Plan B if deploy breaks:** run locally, record a 60–90 s screen video, and submit that as the demo link. Repo + video still satisfies the rules.

---

## 10. 2-person timeline (starting 13:35)

| Time | Person A — Backend / DO | Person B — Frontend / Voice |
|---|---|---|
| 13:35–13:45 | DO key, test curl, pick model IDs | Create public GitHub repo + MIT LICENSE + README stub, invite A |
| 13:45–14:15 | `main.py` `/api/review` + prompt, test with curl on "photosynthesis" | `index.html` layout: topic, upload, mic, transcript box, review cards |
| 14:15–14:40 | `/api/extract` (PDF), `/api/report` (diary), fallback model | Web Speech API, call `/api/review`, render 4 coloured sections |
| 14:40–15:00 | **Deploy to App Platform**, fix env vars | localStorage history + "Today's Diary" + download .md |
| 15:00–15:15 | Write `SKILL.md`, test end-to-end on live URL | Polish UI, loading spinners, error messages |
| 15:15–15:30 | README: problem, stack, DO models, screenshots | Record demo video (see script below) |
| **15:30–15:45** | **Submit on MLH** (see section 12) | Double-check repo is public, links work |
| 15:45–16:00 | Buffer | Buffer |

**Rule:** at 15:00, feature freeze. Only fixes after that.

---

## 11. Demo script (90 seconds)

1. "Students learn best by teaching — but nobody's there to listen and correct them." (10 s)
2. Type **Photosynthesis**, no PDF. Press mic and explain with **one deliberate mistake** (e.g. "plants release carbon dioxide") and skip the Calvin cycle. (30 s)
3. Click Review → show ✅ correct, ❌ "releases CO₂" corrected, 🕳️ "Calvin cycle missed". (20 s)
4. Upload a short PDF (e.g. 1-page notes on TCP handshake), explain, review — show it uses *your* notes. (15 s)
5. Click **Today's Diary** → one-page summary. (10 s)
6. "Open-weight Gemma 4 on DigitalOcean, open-source code, reusable agent skill." (5 s)

---

## 12. MLH submission — ready-to-paste text

- **Project name:** Recap Buddy
- **One-line pitch:** Teach any topic out loud to an open-weight AI and instantly see what you got right, wrong, and missed — plus a daily learning diary.
- **Technologies:** Python, FastAPI, JavaScript, Web Speech API, pypdf, DigitalOcean App Platform, DigitalOcean Serverless Inference, Gemma 4 (31B, open-weight), gpt-oss-120b (fallback)
- **AI your project calls:** tick **Gemma** (and any other open model you actually call)
- **Prize category:** ✅ **Best Open-Source AI Project (DigitalOcean)**
  - *How we use it:* "Recap Buddy's review engine is an open-weight model (Gemma 4 31B, with gpt-oss-120b fallback) served via DigitalOcean Serverless Inference and hosted on DigitalOcean App Platform. The code is MIT-licensed on public GitHub and the grading rubric ships as an Agent-Skill-standard SKILL.md so other agents can reuse it."
- **Best Use of Gemma 4:** that category says Gemma 4 is accessed through the **Gemini API**. If you only call Gemma via DigitalOcean, enter only if the organisers confirm DO-hosted Gemma counts — ask a mentor rather than guess.
- **AI coding tools:** tick whatever you actually used.

---

## 13. Risks & quick fixes

| Risk | Fix |
|---|---|
| Model returns non-JSON | `parse_json` strips fences; fallback shows raw text as summary |
| Gemma ID wrong / slow | Switch `MODEL_ID` env var to gpt-oss-120b — no code change |
| Mic blocked / Firefox | Editable textarea — judges can type |
| Speech API needs HTTPS | App Platform gives HTTPS by default; `localhost` also works |
| Huge PDF | Truncated to ~80k chars; fine for Gemma's 256K context |
| App Platform build fails | Check `requirements.txt` at repo root and run command/port 8080; else Plan B video |

---

## Sources

- DigitalOcean — Supported models on Inference (model IDs, open-weight list): https://docs.digitalocean.com/products/inference/details/models/
- DigitalOcean — Use Serverless Inference: https://docs.digitalocean.com/products/gradient-ai-platform/how-to/use-serverless-inference
- DigitalOcean — Retrieve available models: https://docs.digitalocean.com/products/inference-hub/how-to/retrieve-available-models/
- DigitalOcean — Inference pricing (Gemma 4, gpt-oss, prepaid rule): https://docs.digitalocean.com/products/inference/details/pricing/
- DigitalOcean — App Platform pricing: https://docs.digitalocean.com/products/app-platform/details/pricing/
- DEV — Hacktoberfest 2026 challenge details: https://dev.to/challenges/hacktoberfest-weekend-2026-10-01
- Hacktoberfest 2026 overview: https://hacktoberfest.com/llms.txt
- Agent Skills open standard: https://agentskills.io/
- Feynman Learning (Obsidian plugin): https://community.obsidian.md/plugins/feynman-learning
- Feynman Apprentice: https://www.producthunt.com/products/feynman-apprentice-feynmans-us
- Feynman AI (iOS): https://apps.apple.com/us/app/-/id6738237030
- Teach Simple (AI Tinkerers): https://aitinkerers.org/hackathons/h_q2ugc3T5gts/entries/ht_cp1KmVz9ocM
- algernon-feynman skill: https://getclawkit.com/skills/official-antoniovfranco-algernon-feynman

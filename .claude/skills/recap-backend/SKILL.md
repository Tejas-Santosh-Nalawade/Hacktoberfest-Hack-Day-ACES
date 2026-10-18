---
name: recap-backend
description: Build the Recap Buddy FastAPI backend — Pydantic schemas, review/diary prompts, DigitalOcean LLM client with fallback and JSON repair, PDF/DOCX/TXT extraction, and the /api routes. Use when writing or fixing anything in backend/.
---

# Recap Backend

**Goal:** four working `/api` routes that match the review JSON contract exactly.

**Read first:** PRD §11 (API spec — the contract), §12 (prompts), §14 Phase 1 · CLAUDE.md "Backend API", "AI behaviour rules".

## Files (build in this order)
`backend/requirements.txt` → `schemas.py` → `prompts.py` → `llm.py` → `extract.py` → `main.py`

## Steps
1. venv + install: `fastapi uvicorn[standard] openai pypdf python-docx python-multipart python-dotenv pydantic` → `pip freeze > requirements.txt`.
2. **schemas.py** — `HealthResponse`, `ExtractResponse`, `ReviewRequest` (topic ≤120, transcript, reference optional), item models (`CorrectItem{concept,note}`, `PartialItem{concept,what_was_said,fix}`, `WrongItem{concept,what_was_said,correct_version}`, `MissedItem{concept,why_it_matters}`), `ReviewResponse`, `ReportRequest{date, reviews}`, `ReportResponse{markdown, model}`. Lists default to `[]`.
3. **prompts.py** — `REVIEW_SYSTEM` and `DIARY_SYSTEM` copied from PRD §12; `build_review_user(topic, transcript, reference)` → `TOPIC: … / REFERENCE MATERIAL: … or (none) / STUDENT'S EXPLANATION: …`. Include the JSON shape in the prompt.
4. **llm.py**
   - `OpenAI(base_url="https://inference.do-ai.run/v1/", api_key=os.environ["MODEL_ACCESS_KEY"])`
   - `chat(system, user, want_json) -> (text, model_used)`: try `MODEL_ID`, on exception **or** parse failure retry once with `FALLBACK_MODEL_ID`; both fail → `HTTPException(502, "AI is busy, please retry")`. temperature 0.2, max_tokens 3000.
   - `parse_json(text)`: strip ```json fences, slice from the first `{` to the last `}`, `json.loads`.
   - `normalize_review(d)`: fill missing lists/strings, clamp `score` to int 0–100, cap `missed` at 5.
5. **extract.py** — by extension: `.pdf` → pypdf join page text (pages = len), `.docx` → python-docx paragraphs, `.txt` → utf-8 (errors="ignore"). >10 MB → 413; other types → 400; empty text → 422 "This file has no readable text. Try a text-based PDF or paste notes."; truncate to 80,000 chars and set `truncated`.
6. **main.py** — `load_dotenv()`; `router = APIRouter(prefix="/api")`; routes `GET /health`, `POST /extract`, `POST /review` (400 if <15 words; set `grounded = bool(reference)`, `model = model_used`), `POST /report` (400 if empty). CORS for `http://localhost:5173`. `app.include_router(router)`.
7. Run: `uvicorn main:app --reload --port 8000`, test in `/docs`.

## Done when (Swagger)
- [ ] `/api/health` returns ok + model IDs
- [ ] `/api/extract` works for a PDF, a DOCX and a TXT; a scanned PDF → 422
- [ ] Photosynthesis with "plants release CO₂ and take in oxygen" → item in `wrong`
- [ ] With reference text → `grounded: true`
- [ ] `/api/report` with 2 reviews → Markdown with a table
- [ ] Setting `MODEL_ID=bogus` → answer comes from the fallback and `model` shows it

## Pitfalls
- Sync `openai` calls are fine inside `def` (not `async def`) routes — FastAPI runs them in a threadpool.
- Never log the key or the full reference text.
- Don't change the response shape without telling the frontend dev.

## Tools
`run` skill (start the server) · `devrelay-community-wisdom` (library questions) · DO App Platform sponsor skill (Gradient inference reference) · `engineering:code-review` before pushing.

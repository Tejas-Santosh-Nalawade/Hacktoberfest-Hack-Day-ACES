---
name: recap-setup
description: Phase 0 setup for Recap Buddy — public repo, MIT license, .gitignore, folder skeleton, DigitalOcean model access key and model ID check. Use first, before any backend or frontend code.
---

# Recap Setup

**Goal:** an empty-but-correct repo skeleton plus a working DO inference key.

**Read first:** PRD §4, §10, §14 Phase 0 · CLAUDE.md "MLH / prize rules", "Repo layout".

## Files
`LICENSE` (MIT, current year, team names) · `.gitignore` · `backend/.env.example` · empty `backend/`, `frontend/`, `skills/recap-review/references/` folders.

## Steps
1. Confirm the GitHub repo is **public** (`gh repo view --json visibility`). If not, ask the user before changing visibility.
2. Add `LICENSE` (MIT) at the root.
3. `.gitignore`: `.env`, `node_modules/`, `dist/`, `.venv/`, `__pycache__/`, `*.pyc`, `.DS_Store`.
4. `backend/.env.example`:
   ```
   MODEL_ACCESS_KEY=
   MODEL_ID=gemma-4-31B-it
   FALLBACK_MODEL_ID=openai-gpt-oss-120b
   ```
5. The user creates the key: DO panel → Inference → Model Access Keys → `recap-buddy`. They put it in `backend/.env` themselves — never paste it into chat or commit it.
6. Verify the model IDs (user runs it, so the key stays local):
   `curl -s https://inference.do-ai.run/v1/models -H "Authorization: Bearer $MODEL_ACCESS_KEY"`
   If the Gemma 4 / gpt-oss IDs differ, update `.env.example` and CLAUDE.md.
7. Send one test chat completion to confirm credits work.

## Done when
- [ ] `LICENSE` is detected by GitHub as MIT
- [ ] `git status` doesn't show `.env`
- [ ] `/v1/models` lists both model IDs

## Pitfalls
- Don't create GPU Droplets or Dedicated Inference (billed hourly).
- Check in at the MLH venue with the venue code.

## Tools
`gh` CLI · `devrelay-sponsor-skills` (DigitalOcean App Platform skill — ask before installing).

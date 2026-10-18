---
name: recap-deploy-do
description: Deploy Recap Buddy to DigitalOcean App Platform as one app with two components (FastAPI Web Service on /api, Vite Static Site on /), set encrypted env vars, verify the live URL, and fix common failures. Use when deploying, redeploying or debugging the live app.
---

# Recap Deploy — DigitalOcean App Platform

**Goal:** one public HTTPS `*.ondigitalocean.app` URL serving `/` (React) and `/api` (FastAPI).

**Read first:** PRD §15 · CLAUDE.md "Deploy". If installed, also load the DigitalOcean App Platform sponsor skill (`digitalocean-labs/do-app-platform-skills`).

## Pre-deploy gate
- [ ] Repo is public, pushed to `main`
- [ ] `backend/requirements.txt` complete; `frontend/package-lock.json` committed
- [ ] `npm run build` passes locally
- [ ] No key in the repo: `git grep -n "sk-\|MODEL_ACCESS_KEY="` shows only `.env.example`
- [ ] All routes under `/api`

## Steps (control panel)
1. Create → App Platform → GitHub → repo, branch `main`, Autodeploy ON.
2. Make sure there are **two** components:

| | backend — Web Service | frontend — Static Site |
|---|---|---|
| Source dir | `backend` | `frontend` |
| Run / build | `uvicorn main:app --host 0.0.0.0 --port 8080` | `npm ci && npm run build` |
| Port / output | HTTP port `8080` | `dist` |
| Route | `/api`, **Preserve path prefix ON** | `/`, catch-all `index.html` |
| Health check | `/api/health` | — |
| Size | smallest shared, 1 instance | free |
| Env (runtime) | `MODEL_ACCESS_KEY` (Encrypt), `MODEL_ID`, `FALLBACK_MODEL_ID` | — |

3. Region **BLR1** → Create Resources → wait for both builds.
4. *Optional:* save the result as `.do/app.yaml` (app spec) so redeploys are reproducible (`doctl apps create --spec .do/app.yaml`).

## Verify live
1. `curl https://<app>/api/health` → `ok` + model
2. `/` loads; footer shows the model
3. Full flow incl. mic (HTTPS) → review → 2nd topic → diary → download
4. Failure → backend **Runtime Logs**

## Troubleshooting
| Symptom | Fix |
|---|---|
| `/api/*` 404 | Turn Preserve path prefix ON (or drop the router prefix) |
| Health check failing | Run port and HTTP port must both be 8080 |
| 502 on review | Wrong model ID / missing key at runtime — check logs |
| Frontend build fails | Commit `package-lock.json`; fix the local build first |
| Refresh 404 | Catch-all document = `index.html` |
| Mic blocked | Chrome/Edge + allow permission |

**Plan B:** record a 60–90 s local demo video and submit it while fixing the deploy.
**After judging:** Destroy the app and delete the model access key.

## Tools
DigitalOcean App Platform sponsor skill (ask before `npx skills add digitalocean-labs/do-app-platform-skills`) · `engineering:deploy-checklist` · `security-review` · optional DigitalOcean MCP server / `doctl` · Claude in Chrome (live acceptance run).

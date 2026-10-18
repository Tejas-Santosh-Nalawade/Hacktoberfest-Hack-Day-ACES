# Recap Buddy — Claude Code build kit

Copy everything in this folder into the **root of your `recap-buddy` repo** (next to `Research/RecapBuddy_PRD.md`). Then open the repo in Claude Code. It reads `CLAUDE.md` automatically and finds the skills in `.claude/skills/`.

```
recap-buddy/
├── CLAUDE.md                     project rules (yours + a "Skills and tools" table)
├── .mcp.json                     MCP servers: DigitalOcean, Playwright, Context7
├── Research/RecapBuddy_PRD.md    source of truth (already yours)
└── .claude/skills/
    ├── rb-setup/                 repo, license, env, DO key, model IDs
    ├── rb-backend/               FastAPI routes, LLM client, prompts, extraction
    │   └── references/           api-contract.md, prompts.md
    ├── rb-frontend-ui/           YC-style design system, components, animations
    │   └── references/           design-tokens.md, motion.md
    ├── rb-frontend-app/          API client, voice hook, storage, state, wiring
    ├── rb-integration-test/      16 acceptance tests, local + live
    ├── rb-agent-skill/           builds the product's skills/recap-review (prize item)
    ├── rb-deploy-do/             App Platform deploy, verify, troubleshoot
    │   └── references/           app-settings.md
    └── rb-submit/                README, screenshots, demo video, MLH form
```

## Build order and who runs which skill

| Order | Person A (backend / AI / DigitalOcean) | Person B (frontend / UX / docs) |
|---|---|---|
| 1 | `rb-setup` (DO key, model IDs) | `rb-setup` (repo, license, .gitignore) |
| 2 | `rb-backend` | `rb-frontend-ui` (uses mock review data) |
| 3 | `rb-agent-skill` | `rb-frontend-app` |
| 4 | `rb-integration-test` together | `rb-integration-test` together |
| 5 | `rb-deploy-do` | screenshots + README via `rb-submit` |
| 6 | `rb-submit` (MLH form) | demo video via `rb-submit` |

The review JSON in `rb-backend/references/api-contract.md` is the contract between the two of you. Agree on it first and don't change it silently.

## How to invoke a skill in Claude Code
Say what you want ("build the backend", "make the review card look great", "deploy to DigitalOcean"). Claude loads the matching skill from its description. You can also type `/rb-backend`, `/rb-frontend-ui`, etc.

Suggested prompts:
- "Use rb-setup. Check my model access key in backend/.env against /v1/models."
- "Use rb-backend and build all four routes, then test them in Swagger."
- "Use frontend-design and rb-frontend-ui to scaffold the React app and build every component with the motion spec."
- "Use rb-frontend-app to wire the full flow against the real backend."
- "Run rb-integration-test locally and fix anything failing."
- "Use rb-deploy-do to deploy with the DigitalOcean MCP server."

## Helper skills to install or enable (Claude Code)
| Skill | Used by | Why |
|---|---|---|
| `frontend-design` | rb-frontend-ui | Distinctive, non-template UI direction |
| `design:ux-copy` | rb-frontend-ui | Button labels, empty states, errors |
| `design:accessibility-review` | rb-frontend-ui | Contrast, focus, keyboard, aria-live |
| `design:design-critique` | rb-frontend-ui | Critique of screenshots before demo |
| `engineering:code-review` | backend + frontend | Catch bugs and leaked secrets before push |
| `engineering:debug` | rb-integration-test | Structured fix loop |
| `engineering:testing-strategy` | rb-integration-test | Coverage of edge cases |
| `engineering:deploy-checklist` | rb-deploy-do | Pre-flight checks |
| `engineering:documentation` | rb-submit | README |
| `skill-creator` | rb-agent-skill | Spec-compliant SKILL.md |
| `chrome-browser` (Claude in Chrome) | deploy, testing, submit | Drive the DO panel and live site with your sign-in |

The `design:*` and `engineering:*` skills come from the Design and Engineering plugins. If they're not installed, the `rb-*` skills still work on their own.

## MCP servers (`.mcp.json`)
| Server | What it does here | Setup |
|---|---|---|
| **DigitalOcean** (`@digitalocean/mcp`, `apps` service) | Create the App Platform app, update env vars, check deployment status and logs | Create a DO **API token** (Control panel → API → Tokens, apps read/write). Set it in your shell as `DIGITALOCEAN_API_TOKEN` before starting Claude Code. Never commit it. |
| **Playwright** (`@playwright/mcp`) | Open the app in a real browser, click through the flow, take screenshots | Needs Node.js; first run downloads a browser |
| **Context7** (`@upstash/context7-mcp`) | Current docs for FastAPI, openai SDK, Vite, Tailwind v4, Motion | No key needed for basic use |

Check they're connected with `claude mcp list`. All three are open source, which fits the open-source theme.

Optional: **DevRelay MCP** (offered on the MLH submission page) lets an agent submit the project to MLH. Only use it if you want to; filling the form by hand is fine.

## Secrets — three different things
| Secret | Lives in | Never in |
|---|---|---|
| DO **model access key** | `backend/.env` locally; App Platform encrypted env var | Git, chat, frontend |
| DO **API token** (for MCP) | Your shell environment only | Git, `.mcp.json` literal value |
| GitHub auth | `gh auth login` | Anywhere in the repo |

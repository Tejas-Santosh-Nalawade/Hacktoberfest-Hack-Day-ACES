---
name: recap-submit
description: Finish and submit Recap Buddy — README, screenshots/GIF, demo video, the PRD acceptance tests on the live URL, and the MLH project submission to the Best Open-Source AI Project category. Use in the final hour, after deploy.
---

# Recap Submit

**Goal:** everything judges need is public, linked and working.

**Read first:** PRD §17 (acceptance tests), §18 (demo script), §19 (MLH checklist).

## Steps
1. **Acceptance tests** — run all 11 from PRD §17 on the live URL; fix only blockers (feature freeze).
2. **README.md** sections:
   - Problem
   - Solution
   - Live demo + video
   - Screenshots/GIF
   - How it works (architecture diagram from PRD §8)
   - Open-source AI used (Gemma 4 31B, gpt-oss-120b, DO Serverless Inference)
   - Agent Skill (link to `skills/recap-review/SKILL.md`)
   - Run locally
   - Deploy on DigitalOcean
   - License (MIT)
3. **Media** — record a GIF of the flow with Claude in Chrome; record the ~90 s demo video following PRD §18.
4. **MLH submission** — use the description and "How we use it" text from PRD §19.
   - Technologies list and AI checkboxes: Gemma, plus OpenAI only if the gpt-oss fallback is kept.
   - Links: repo, live URL, video, SKILL.md.
   - Prize category: **Best Open-Source AI Project**.
   - Add your teammate, then submit. Confirm with the user before submitting.
   - Ask the organisers before entering Best Use of Gemma 4, since that category is defined around the Gemini API.
5. Tick the AI coding tools actually used (Claude Code).

## Done when
- [ ] Repo, live URL, video and SKILL.md links all open logged-out
- [ ] Submission shows as submitted with the prize category entered

## Tools
`devrelay-mlh-submissions` (create project, invite teammate, submit, enter prize category) · `engineering:documentation` (README) · Claude in Chrome (`gif_creator`) · optional `devrelay-publishing` (DEV post after the event).

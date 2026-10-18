---
name: recap-agent-skill
description: Create the prize deliverable skills/recap-review/ — an Agent Skill Open Standard SKILL.md plus references/schema.md and references/rubric.md that package Recap Buddy's grading rubric. Use when building or validating the agent skill for the DigitalOcean Best Open-Source AI Project prize.
---

# Recap Agent Skill (prize deliverable)

**Goal:** a standards-compliant, reusable `recap-review` skill that mirrors the backend prompts.

**Read first:** PRD §4, §12, §14 Phase 4 · https://agentskills.io/

## Files
`skills/recap-review/SKILL.md` · `skills/recap-review/references/schema.md` · `skills/recap-review/references/rubric.md`

## Steps
1. `SKILL.md` frontmatter:
   ```yaml
   ---
   name: recap-review
   description: Review a learner's spoken or written explanation of a topic using the Feynman technique; use when someone explains a concept and wants to know what was correct, partially correct, wrong or missed. Judges concepts only, never grammar.
   license: MIT
   ---
   ```
2. Body — numbered instructions:
   1. Identify the topic and whether reference notes exist.
   2. Ignore grammar, filler words and transcription errors.
   3. Split the explanation into claims.
   4. Classify each claim as correct, partial or wrong (see rubric).
   5. List ≤5 key missed concepts.
   6. Score.
   7. Output JSON per `references/schema.md`.
   8. Never invent mistakes.
3. `schema.md` — the review JSON shape from PRD §11 with one full example (Photosynthesis).
4. `rubric.md` — definitions of correct / partial / wrong / missed with one example each; scoring = 60% accuracy + 40% coverage; grounded vs. ungrounded behaviour.
5. Add a README section: "Agent Skill — the backend prompts implement this same skill."

## Done when
- [ ] Folder name == `name` (lowercase-hyphenated)
- [ ] Frontmatter parses as YAML; `description` says what *and* when
- [ ] Rubric matches `backend/prompts.py` (no drift)

## Tools
`devrelay-knowledge` (DEV/Hacktoberfest challenge rules if needed).

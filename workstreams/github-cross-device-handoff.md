# Workstream: GitHub Cross-Device Handoff

Last updated: 2026-06-05

## Objective

Make Mandy's Bike Finder easy to back up, synchronize, and continue across Windows PC and MacBook Air using GitHub as the source of truth.

## Scope

- Document project identity, current status, agent/workstream status, setup, and next actions.
- Add root-level handoff files that do not depend on Codex chat history.
- Add agent-specific documentation for the currently implemented guided assistant.
- Improve `.gitignore` for Windows/Mac/Next.js/Python/iOS artifacts.
- Do not destructively move files.

## Project And Workstream Identity

- Project: Mandy's Bike Finder.
- Workstream: GitHub cross-device handoff.
- Main purpose: make the project self-contained and resumable from GitHub.
- Agent-related: Yes. The project contains the Mandy Bike Coach guided assistant.

## Main Files And Folders

- `app/`: production Next.js app.
- `app/app/api/*`: server-side API routes.
- `app/lib/*`: shared analysis, assistant, email, CRM, and provider logic.
- `docs/`: PRD, architecture, current status, product, and workstream notes.
- `agents/bike-coach/`: agent-specific documentation for Mandy Bike Coach.
- `workstreams/`: root-level handoff workstream documents.
- `src/` and `web/`: legacy prototypes retained for history.

## Files Changed Or Created

- `.gitignore`
- `PROJECT_STATUS.md`
- `CODEX_HANDOFF.md`
- `workstreams/github-cross-device-handoff.md`
- `agents/bike-coach/README.md`
- `agents/bike-coach/AGENT_SPEC.md`
- `agents/bike-coach/TASKS.md`
- `README.md`
- `docs/current-status.md`

## Key Decisions

- Keep active development on GitHub `main`.
- Keep Vercel deployment root as `app/`.
- Keep root-level handoff docs rather than moving existing docs.
- Treat Mandy Bike Coach as a workflow-specific assistant, not a generic chatbot.
- Keep Salesforce/CRM fully hidden from user-facing UI.

## Current Status

- Repository is already initialized.
- Remote is configured as `https://github.com/Yangc0910/mandys-bike-finder.git`.
- `main` is the active branch.
- Production app is reachable at `https://www.mandysbikefinder.com/`.
- Handoff docs are being added for cross-device continuation.

## Next Steps

1. Commit and push this handoff documentation.
2. On Mac, clone the GitHub repository.
3. Run setup from `app/`: `npm install`, `npm run lint`, `npm run build`.
4. Copy environment variables manually into local `.env.local` only if local provider testing is needed.
5. Continue feature work from `main` unless a larger risky branch is needed.

## Open Questions

- Whether to keep root `workstreams/` permanently or consolidate with `docs/workstreams/` later.
- Whether to add a durable database before expanding Bike Scout.
- Whether to add automated browser smoke tests before broader public sharing.

## Relationship To Other Workstreams

- `docs/workstreams/frontend-ux.md`: visual/user-flow improvements.
- `docs/workstreams/ai-scoring-engine.md`: scoring and AI behavior.
- `docs/workstreams/infra-deployment.md`: Vercel, env vars, production readiness.
- `docs/workstreams/product-strategy.md`: product positioning and roadmap.

## Agent Notes

- Agent name: Mandy Bike Coach.
- Purpose: guided, context-aware assistance inside the bike-check workflow.
- Inputs: child profile, listing details, analysis result, seller message, missing inputs, user question/intent.
- Outputs: concise parent-friendly guidance, suggested next action, prompt chips.
- Tools used: server-side OpenAI when enabled; local fallback guidance otherwise.
- Storage/data model: no durable chat history; current browser component state only.
- API endpoint: `POST /api/assistant`.
- Testing: lint/build plus manual endpoint test with representative context.
- Failure modes: missing LLM config, rate limit reached, provider error; all should fall back to local guidance.
- Manual approval: required before adding generic chat, durable chat storage, or user-facing CRM/provider language.


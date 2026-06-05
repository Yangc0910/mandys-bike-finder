# Codex Handoff

Last updated: 2026-06-05

## What This Project Is

Mandy's Bike Finder is a Next.js + TypeScript web MVP for parents evaluating used kids' bike listings. It helps with bike fit, price/value, safety/risk, seller questions, seller-message drafting, and transactional email reports.

## Where To Start Reading

1. `README.md` for setup, architecture, environment variables, and deployment notes.
2. `PROJECT_STATUS.md` for the current truth snapshot.
3. `docs/PRD.md` for product requirements and scope boundaries.
4. `docs/architecture/overview.md` for system boundaries.
5. `workstreams/github-cross-device-handoff.md` for this handoff/migration workstream.
6. `agents/bike-coach/README.md` for the guided assistant workstream.

## Current Workstream Status

Current workstream: `github-cross-device-handoff`

Goal: make the repo self-contained enough that work can continue from either Windows or Mac without relying on Codex thread history.

Status: documentation and ignore rules are being updated. Code is already on GitHub `main`.

## Important Files

- `app/app/page.tsx`: main user-facing app page and Bike Coach UI.
- `app/app/api/assistant/route.ts`: server route for Mandy Bike Coach.
- `app/lib/assistant.ts`: assistant intents, local fallback responses, and prompt suggestions.
- `app/lib/server/providers.ts`: OpenAI provider helpers, including assistant response generation.
- `app/lib/server/config.ts`: feature flags, provider config, and limits.
- `app/lib/email.ts`: Resend transactional email service.
- `app/lib/crm.ts` and `app/lib/crm/salesforce.ts`: optional consent-gated CRM sync.
- `.env.example` and `app/.env.example`: non-secret environment variable templates.

## How To Continue From Here

On a new machine:

```bash
git clone https://github.com/Yangc0910/mandys-bike-finder.git
cd mandys-bike-finder/app
npm install
npm run lint
npm run build
npm run dev
```

Then copy `app/.env.example` to `app/.env.local` only if local provider testing is needed. Never commit `.env.local`.

## What Not To Change Without Confirmation

- Do not remove or bypass server-side feature flags and usage limits.
- Do not expose API keys or provider credentials to frontend code.
- Do not automate Facebook Marketplace scraping or login-gated pages.
- Do not make Bike Scout look payment-live before Stripe/payment and backend scheduling exist.
- Do not make Salesforce/CRM a user-facing concept.
- Do not force-push or rewrite GitHub history.

## Suggested Next Codex Prompts

- "Review the homepage UX and suggest one focused improvement that makes first-time bike checking clearer."
- "Add a lightweight smoke test plan for screenshot extraction, analysis, report email, and Bike Coach."
- "Prepare Mac setup verification after cloning this repository."
- "Audit the docs for stale statements against the current codebase and production behavior."


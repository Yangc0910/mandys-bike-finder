# Mandy's Bike Finder Project Status

Last updated: 2026-06-05

## Project

Mandy's Bike Finder is a parent-friendly AI used-kids-bike buying assistant. The primary product question is:

> Is this used kids' bike worth buying for my child?

The production path is the Next.js app in `app/`, deployed from GitHub `main` to Vercel.

## Completed Work

- Quick bike-check homepage focused on one listing at a time.
- Screenshot, pasted-text, link, and manual listing input paths.
- Server-side AI extraction and analysis routes with feature flags and usage limits.
- Local/mock fallback behavior when providers are disabled or unavailable.
- Child fit guidance, bike type/size recommendation, deal scoring, risk notes, seller questions, and seller message drafting.
- Resend transactional report email support through `/api/reports/email`.
- Optional Salesforce CRM lead sync through Web-to-Lead or REST mode, only after explicit future-alert/product-update consent.
- Mandy Bike Coach guided assistant through `/api/assistant`, with local fallback guidance and separate assistant limits.
- Bike Scout waitlist/prototype positioning as secondary and not payment-live.
- App Store MVP shell and Capacitor/iOS preparation files.

## In Progress

- UI polish for the main bike-check workflow and Bike Coach launcher.
- Cross-device GitHub handoff documentation for Windows/Mac continuation.
- App Store MVP handoff and TestFlight readiness documentation.

## Known Issues

- `docs/current-status.md` contains historical notes and should be treated as secondary to this file plus `CODEX_HANDOFF.md`.
- No durable database exists yet for saved reports, waitlist entries, usage counters, or Bike Scout profiles.
- Rate limits are server-memory/runtime scoped unless backed by a durable store later.
- PDF attachment export is planned but not implemented.
- Bike Scout monitoring, payments, accounts, and scheduled alerts are not live.
- Vercel CLI is not installed in the current Windows environment; deployment status is usually verified through production URL checks.

## Important Decisions

- GitHub `main` is the source of truth for active development.
- Vercel deploys the Next.js app from `app/`.
- Resend is transactional email only.
- Salesforce/CRM is optional, server-side, and consent-gated.
- The user-facing UI must not mention Salesforce, CRM, Resend, API keys, or backend implementation details.
- Facebook Marketplace remains user-assisted only; do not automate login-gated scraping or bypass anti-bot systems.
- Bike Scout remains waitlist/prototype until real backend, scheduling, and payment exist.

## Next Recommended Tasks

1. Continue visual polish on the core homepage workflow and Bike Coach launcher.
2. Add a small end-to-end smoke test for listing input -> analysis -> report email validation path.
3. Decide whether to add durable storage first for waitlist/report history or to keep MVP storage minimal.
4. Add Vercel CLI or document a Vercel-dashboard verification checklist for deployments.
5. On Mac, clone the repo, install dependencies in `app/`, and verify `npm run lint` plus `npm run build`.

## Risks And Blockers

- Secrets must stay in Vercel/local environment variables and must not be committed.
- Mac continuation requires Node/npm and, for iOS work, Xcode/Capacitor tooling.
- CRM and email flows depend on production environment variables.
- AI behavior depends on OpenAI provider availability and configured limits.


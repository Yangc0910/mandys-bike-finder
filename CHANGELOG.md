# Changelog

## Unreleased

- Migrated the production-path MVP into a new Next.js + TypeScript + Tailwind app under `/app`.
- Moved the controlled beta API surface into Next.js App Router API routes.
- Documented `/app` as the Vercel production deployment root and marked `web/` as a legacy prototype.
- Added Phase 1.5 controlled real API beta plan.
- Added server-side provider architecture for LLM, trusted retailer search, email report, and backend logging.
- Added feature-flagged fallbacks so the app remains functional without API keys.
- Added in-memory daily limits and search caching.
- Added testing notes for no-key, live-key, limit, fallback, and sample listing scenarios.
- Expanded the PRD source of truth with the full Phase 1.5 environment-variable, model, API-key safety, server-side-only, no-initial-LLM-call, and durable limit/cache requirements.
- Added GitHub Actions workflow `.github/workflows/app-build.yml` to verify the `/app` Next.js build (and lint when configured) on push and pull request.

## v0.4

- Added action, reporting, and retention requirements.
- Added style/gender preference to child profile.
- Added dimension-level qualitative assessments for fit, price, condition, brand, color/kid appeal, and risk.
- Confirmed that internal scores may exist but user-facing output should remain red/yellow/green.
- Added Negotiation Boost.
- Added Email Report.
- Added backend metadata logging requirements with privacy-preserving buckets.

## v0.3

- Added color/style and kid appeal as key decision factors.
- Prioritized listing link and screenshot upload over manual entry.
- Made manual entry the fallback.
- Replaced numeric user-facing score with qualitative red/yellow/green meter.
- Added API cost-control requirements.
- Shifted deal logic toward parent-centered decision support.

## v0.2

- Shifted platform direction from iOS to Web MVP.
- Adopted the Mandy's Bike Finder product name direction.
- Added the personal Mandy story.
- Elevated price reference checking.
- Added web-friendly listing input flows.
- Chose trusted retailer references over marketplace price references.
- Identified need for replaceable search provider abstraction and fallback modes.

## v0.1

- Explored initial iOS app concept.
- Framed the project as a portfolio product and product-development learning exercise.
- Considered several broad product directions.
- Selected used kids bike advisor as the first specific direction.
- Identified initial features: child-to-bike size advisor, listing analyzer, screenshot upload, seller questions, and message generation.

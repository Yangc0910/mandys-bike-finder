# Roadmap

Current PRD: `docs/PRD.md` v0.4

## Phase 0: Documentation and Repo Setup

- Establish repository structure.
- Define PRD as source of truth.
- Record PRD history.
- Record product decisions.
- Add README, changelog, user flows, scoring logic, and API cost-control docs.

## Phase 1: Front-End MVP With Mock/Local Rules

- Build a clean web MVP.
- Add child profile form.
- Add link, screenshot, and manual listing input flows.
- Add listing confirmation/editing step.
- Add local rule-based fit recommendation.
- Add local/mock price reference estimate.
- Add red/yellow/green result page.
- Add dimension-level assessments.
- Add seller questions.
- Add Negotiation Boost UI and local message generation.
- Add Email Report UI placeholder and local report preview.
- Add service interfaces for future search, OCR, email, and backend metadata logging.

No real external APIs in Phase 1.

## Phase 1.5: Controlled Real API Beta

- Use real API integrations where practical for LLM parsing/reasoning, trusted web search price reference, email report delivery, and backend metadata logging.
- Keep every integration behind a provider abstraction and feature flag.
- Add cost controls from the beginning, including per-session or per-IP daily limits and global daily limits.
- Add fallback modes so the app remains functional if APIs fail, feature flags are off, API keys are missing, or limits are reached.
- Cache repeated trusted-retailer search queries.
- Run all external API calls server-side only.
- Never expose API keys to frontend code.
- Show clear UI status when live checks are unavailable and fallback estimates are used.

## Phase 2: Screenshot Upload and Extraction

- Add real screenshot extraction/OCR behind an interface.
- Keep confirmation/editing step mandatory.
- Improve listing text parsing.
- Track extraction confidence.

## Phase 3: Live Price Reference Search

- Add replaceable search provider.
- Restrict sources to trusted retailers and official brand sites.
- Add caching.
- Enforce per-session and daily API limits.
- Keep fallback local price ranges.

## Phase 4: Email Report Backend

- Implement email report sending.
- Store backend metadata with privacy-preserving buckets.
- Add backend rate limits and abuse protection.
- Keep user accounts out of MVP unless absolutely needed.

## Phase 5: Polish, Shareable Reports, Analytics

- Improve responsive UI.
- Add shareable report views if privacy model supports it.
- Add analytics dashboards based on metadata.
- Tune local analysis logic from real usage.

## Future

- PWA.
- iOS app.
- Affiliate links.
- Saved listings.
- User accounts.
- Family sharing.
- Marketplace watchlist.
- More advanced live price tracking.

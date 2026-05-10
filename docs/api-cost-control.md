# API Cost Control

Current PRD: `docs/PRD.md` v0.4

## Principle

Mandy's Bike Finder should work without unlimited external API calls. Search, OCR, LLM, email, and backend services may cost money, so cost control is a product requirement from the start.

## Search Provider Abstraction

Live price reference search should be implemented behind a provider interface. The app should not hard-code one provider into product logic.

Provider responsibilities:

- Accept a normalized listing query.
- Search trusted retailer sources where possible.
- Return estimated new price range, sources, confidence, and timestamp.
- Fail gracefully when unavailable.

Phase 1 uses a mock/local provider by default. Phase 1.5 may use controlled real API providers when feature flags and environment variables are configured.

## Environment Variables

Feature flags:

- `ENABLE_LIVE_SEARCH`.
- `ENABLE_LLM_ANALYSIS`.
- `ENABLE_EMAIL_REPORT`.
- `ENABLE_BACKEND_LOGGING`.

Usage limits:

- `DAILY_SEARCH_LIMIT`.
- `DAILY_LLM_LIMIT`.
- `DAILY_EMAIL_LIMIT`.
- `SEARCH_CACHE_TTL_HOURS`.

Provider credentials should be added only as server-side environment variables. API keys must never be placed in frontend code or committed to the repository.

Suggested provider variables for later implementation:

- `OPENAI_API_KEY` or another server-side LLM provider key.
- `SEARCH_API_KEY` and `SEARCH_PROVIDER`.
- `EMAIL_API_KEY`, `EMAIL_PROVIDER`, and sender configuration.
- `DATABASE_URL` or Supabase-equivalent backend variables.

## Session Limit

The app should enforce per-session or per-IP daily limits for expensive actions. For example:

- Maximum live price checks per session.
- Maximum extraction attempts per session.
- Maximum message-generation calls per session if an LLM is later used.

Phase 1 should represent this with local counters and disabled UI states where useful. Phase 1.5 should enforce these checks server-side before making provider calls.

## Global Daily Limit

Backend services should enforce global daily limits using environment variables.

Example variables:

- `DAILY_SEARCH_LIMIT`.
- `DAILY_LLM_LIMIT`.
- `DAILY_EMAIL_LIMIT`.

If the daily limit is reached, the app should switch to fallback mode and explain the limitation.

## Required Controls

Every real API integration must include:

- Per-session or per-IP daily limit.
- Global daily API usage limit.
- Search result caching where search is used.
- Graceful fallback mode.
- Admin kill switches through feature flags.
- Server-side API calls only.
- No API keys exposed to the frontend.
- API failure logging that does not break the user experience.

## Caching

Repeated search queries should be cached by normalized query key.

Cache key inputs may include:

- Brand.
- Model.
- Wheel size.
- Bike type.
- Trusted source category.

Cached output should include:

- Estimated new price range.
- Confidence.
- Provider name.
- Created timestamp.

## Fallback Mode

If live search is unavailable, the app should still work using:

- Built-in brand/size estimated ranges.
- User-provided reference price.
- Lower confidence output.

Fallback mode should never block the full analysis.

## User-Facing Messages

Graceful messages should be plain and useful:

- "Live price lookup is unavailable right now, so this estimate uses built-in reference ranges."
- "This price estimate has lower confidence because no live retailer search was run."
- "Daily live lookup limit reached. You can still analyze the listing with local guidance."

## Phase 1 Implementation

Phase 1 can remain fully local/mock. Phase 1.5 may add controlled real API integrations if feature flags, server-side routes, usage limits, caching, and fallbacks are in place. The app must remain functional without API keys.

The implementation should define service interfaces for:

- Search provider.
- LLM provider for extraction, reasoning, negotiation messages, and report summaries.
- Email report service.
- Metadata logging service.

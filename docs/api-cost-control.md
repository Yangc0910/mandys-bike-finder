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

Phase 1 uses a mock/local provider only.

## Session Limit

The front end should enforce a per-session limit for expensive actions. For example:

- Maximum live price checks per session.
- Maximum extraction attempts per session.
- Maximum message-generation calls per session if an LLM is later used.

Phase 1 should represent this with local counters and disabled UI states where useful.

## Global Daily Limit

Backend services should enforce global daily limits using environment variables.

Example variables:

- `DAILY_SEARCH_LIMIT`.
- `DAILY_LLM_LIMIT`.

If the daily limit is reached, the app should switch to fallback mode and explain the limitation.

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

Phase 1 must not implement real search, real OCR, real email sending, or real database writes. It should define service interfaces or placeholders for future:

- Search provider.
- Extraction provider.
- Email report service.
- Metadata logging service.

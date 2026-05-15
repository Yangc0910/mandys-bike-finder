# API Cost Control

Current PRD: `docs/PRD.md` v0.5

## Principle

Mandy's Bike Finder should work without unlimited external API calls. Search, OCR, LLM, email, and backend services may cost money, so cost control is a product requirement from the start.

MVP model policy:

- Use the cheapest suitable model for each task during MVP rollout.
- Keep high-cost model upgrades behind explicit product review.

## Search Provider Abstraction

Live price reference search should be implemented behind a provider interface. The app should not hard-code one provider into product logic.

Provider responsibilities:

- Accept a normalized listing query.
- Search trusted retailer sources where possible.
- Return estimated new price range, sources, confidence, and timestamp.
- Fail gracefully when unavailable.

Future Bike Scout connector responsibilities:

- Query only supported public listings or official APIs.
- Accept normalized Bike Scout search params.
- Return normalized listing records.
- Enforce server-side caps on source count, listing count, and run frequency.
- Never expose provider keys to the browser.

Phase 1 uses a mock/local provider by default. Phase 1.5 may use controlled real API providers when feature flags and environment variables are configured.

## Environment Variables

Feature flags:

- `ENABLE_LIVE_SEARCH`.
- `ENABLE_LLM_ANALYSIS`.
- `ENABLE_EMAIL_REPORT`.
- `ENABLE_BACKEND_LOGGING`.
- `ENABLE_CRM_SYNC`.
- `CRM_PROVIDER`.

Usage limits:

- `DAILY_SEARCH_LIMIT`.
- `DAILY_LLM_LIMIT`.
- `DAILY_EMAIL_LIMIT`.
- `SEARCH_CACHE_TTL_HOURS`.

Provider credentials should be added only as server-side environment variables. API keys must never be placed in frontend code or committed to the repository.

Suggested provider variables for later implementation:

- `OPENAI_API_KEY` or another server-side LLM provider key.
- `SEARCH_API_KEY` and `SEARCH_PROVIDER`.
- `RESEND_API_KEY`, `REPORT_EMAIL_FROM`, `REPORT_EMAIL_REPLY_TO`, and optional `APP_BASE_URL`.
- Optional Salesforce CRM variables: `SALESFORCE_CLIENT_ID`, `SALESFORCE_CLIENT_SECRET`, `SALESFORCE_USERNAME`, `SALESFORCE_PASSWORD`, `SALESFORCE_SECURITY_TOKEN`, `SALESFORCE_LOGIN_URL`, and `SALESFORCE_API_VERSION`.
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

Bike Scout-specific future controls:

- Cap number of saved search profiles per user.
- Cap search frequency.
- Cap number of sources per run.
- Cap number of listings analyzed per run.
- Cap optional LLM usage per search/profile if enrichment is later added.

Current email endpoint controls:

- `/api/reports/email` is explicit user-triggered sending only.
- `/api/reports/email` is capped at 5 sends per IP/day and 3 sends per session.
- `/api/reports/email` returns a clear configuration error if Resend environment variables are missing or invalid.
- Salesforce CRM sync, when enabled, only runs after explicit marketing/update consent and never blocks transactional report email delivery.

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
- Explicit user-triggered calls for costly screenshot AI extraction (no auto-call on page load or file upload).
- Controlled link extraction attempts with per-session/per-IP limits, timeout, and short-lived URL caching.
- Bike Scout scheduled-search caps before any production rollout.
- Usage count logging/telemetry for LLM/email endpoint calls so limits can be tuned safely.

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

If Bike Scout automation is unavailable later, the product should still fall back to:

- the current one-listing-at-a-time analyzer
- user-assisted screenshots, pasted text, and manual entry

Fallback mode should never block the full analysis.

Current waitlist fallback:

- Bike Scout waitlist capture remains local-browser storage in MVP.
- No email-backed or database-backed waitlist pipeline is assumed unless implemented later.

## User-Facing Messages

Graceful messages should be plain and useful:

- "Live price lookup is unavailable right now, so this estimate uses built-in reference ranges."
- "This price estimate has lower confidence because no live retailer search was run."
- "Daily live lookup limit reached. You can still analyze the listing with local guidance."
- "AI screenshot extraction is currently disabled. Please enter the listing details manually."
- "Daily AI extraction limit reached. You can use AI extraction up to 10 times per day. Please enter the listing details manually or try again tomorrow."
- "AI extraction could not read enough listing details. Please enter the details manually."

## Controlled Screenshot AI Extraction

Phase 1.5 supports controlled screenshot extraction through a server-side LLM route:

- Frontend uploads must not auto-call LLM on file select.
- User must click a dedicated extraction button.
- Supported image types: `jpg`, `jpeg`, `png`, `webp`.
- Max screenshot size: 5 MB with friendly rejection message.
- Image should be resized/compressed before provider call where possible to reduce token/cost.
- Extraction consumes LLM limits (`DAILY_LLM_LIMIT`, `PER_SESSION_LLM_LIMIT`).
- Default LLM extraction limits for controlled testing:
  - `DAILY_LLM_LIMIT=10` (per IP/day baseline).
  - `PER_SESSION_LLM_LIMIT=10` baseline to avoid session blocking before daily limit in normal testing.
- If disabled, limited, or failed, the flow must fall back to manual entry without breaking the page.

## Controlled Craigslist Link Extraction

- Server-side only extraction route (no frontend page scraping).
- Craigslist URLs only (`craigslist.org` domains).
- Fetch only the exact user-provided listing URL.
- Use short timeout to prevent long-running requests.
- Apply per-session/per-IP usage limits.
- Cache recent extraction results briefly to avoid repeated fetch costs.
- If extraction fails, return friendly fallback guidance and keep manual/screenshot flows available.

## Phase 1 Implementation

Phase 1 can remain fully local/mock. Phase 1.5 may add controlled real API integrations if feature flags, server-side routes, usage limits, caching, and fallbacks are in place. The app must remain functional without API keys.

The implementation should define service interfaces for:

- Search provider.
- LLM provider for extraction, reasoning, negotiation messages, and report summaries.
- Email report service.
- Metadata logging service.
- Bike Scout marketplace search connectors.

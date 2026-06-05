# Architecture Overview

Current PRD: `docs/PRD.md` v0.6

## Current Direction

Mandy's Bike Finder is a web-first MVP deployed from `/app` (Next.js App Router). The app is designed so local/mock fallback behavior remains available even when external providers are disabled.

## System Boundaries (Current)

### Frontend UI (`/app/app/page.tsx`)

- Hero + product mode tabs (`Free Bike Check`, `Bike Scout Waitlist`).
- Child profile + listing capture flow.
- Result presentation (fit/value/safety meters + recommendations).
- Explicit user-triggered actions only for costly operations:
  - AI extraction
  - report email sending
- Bike Scout waitlist and profile prototype state with localStorage helpers.

### Server-side API routes (`/app/app/api/*`)

- `/api/status`: provider mode and feature-flag status.
- `/api/extract`, `/api/extract-link`: extraction entry points with guarded behavior.
- `/api/analyze`, `/api/message`, `/api/report`: analysis and report helpers.
- `/api/reports/email`: transactional report email sending with validation + rate limits.
- `/api/assistant`: Mandy Bike Coach guided-assistant route with assistant-specific limits and local fallback guidance.

### AI / LLM analysis layer (`/app/lib/server/providers.ts`, `/app/lib/server/config.ts`)

- Feature-flag controlled (`ENABLE_LLM_ANALYSIS`).
- Server-side only provider key usage.
- Daily/session usage limits enforced server-side.
- Local fallback remains available when disabled or limited.

### Guided assistant (`/app/lib/assistant.ts`, `/app/app/api/assistant/route.ts`)

- Product name: Mandy Bike Coach.
- Scope: current used kids-bike check only.
- Inputs: child profile, listing, analysis result, seller message, missing inputs, and selected intent/user question.
- Outputs: concise parent-friendly guidance, suggested prompts, and suggested next action.
- Uses OpenAI only server-side when LLM analysis is enabled and within `GUIDED_ASSISTANT_DAILY_LIMIT` / `GUIDED_ASSISTANT_PER_SESSION_LIMIT`.
- Falls back to static local guidance when disabled, limited, or unavailable.
- Does not store durable chat history.
- Must not expose CRM, Salesforce, Resend, API keys, or backend details in user-facing answers.

### App Store MVP screenshot OCR boundary

- Screenshot OCR/extraction is a core App Store MVP capability.
- Screenshot file selection in the app creates a local preview only.
- The screenshot is sent to `/api/extract` only after the user taps `Extract details with AI`.
- `/api/extract` validates mime type and size before calling the provider.
- The OpenAI/provider key remains server-side in Vercel environment variables.
- Extracted listing fields are written back into editable review fields before evaluation.
- If AI is disabled, missing credentials, limited, or fails, the user can still use manual entry and local fallback analysis.

### Report generation (`/app/lib/server/report.ts`)

- Builds parent-friendly report content from child profile + listing + analysis output.
- Reused for on-page report preview and transactional email payload creation.

### PDF generation

- Not in current production implementation.
- Current report delivery format is HTML/plain text email (when enabled).
- PDF attachment/export remains a roadmap item.

### Transactional email (`/app/lib/email.ts`)

- Provider: Resend.
- Uses `RESEND_API_KEY`, `REPORT_EMAIL_FROM`, and optional `REPORT_EMAIL_REPLY_TO`.
- Returns clear configuration errors when env vars are missing/invalid.
- Keeps API keys server-side only.

### Bike Scout waitlist and storage

- Waitlist and Bike Scout setup data are browser-local prototype storage today (`localStorage`).
- No durable backend waitlist database yet.
- No production cron-based listing monitoring yet.

### Optional CRM sync (`/app/lib/crm.ts`)

- CRM sync is optional, feature-flagged, and server-side only.
- Current provider: Salesforce Lead creation through `/app/lib/crm/salesforce.ts`.
- Salesforce supports two server-side modes: `SALESFORCE_AUTH_MODE=web_to_lead` as the recommended MVP path and `SALESFORCE_AUTH_MODE=rest` as the optional Connected App / REST API path.
- `syncLeadToCrm(lead)` no-ops unless `ENABLE_CRM_SYNC=true` and marketing consent is explicit.
- Transactional Resend email flow and marketing consent stay separate.
- Salesforce sync failure does not block report-email delivery.
- MVP uses standard Lead fields and places app/report metadata in `Description`.
- REST mode can return a Lead ID; Web-to-Lead mode does not.
- Duplicate/upsert handling and custom Salesforce field mapping are future improvements.
- CRM must not be treated as app auth.

## Future Service Boundaries

Future phases should add services behind interfaces:

- Listing extraction / OCR provider.
- Trusted-retailer search provider.
- Email report sender.
- Backend metadata logger.
- Marketplace search connectors for Bike Scout.

## Bike Scout Foundation

The Next.js app now includes a Bike Scout foundation with:

- Typed `BikeScoutProfile` saved-search model.
- Typed `MarketplaceConnector` interface.
- Typed `NormalizedListing` interface.
- Browser-local prototype storage for saved Bike Scout profiles.
- A scoring bridge that maps normalized Bike Scout listings into the current fit/value/safety analysis logic.

This foundation is intentionally honest:

- It does not run production cron jobs.
- It does not store data in a shared database yet.
- It does not send alerts yet.
- It does not enable payment yet.
- It does not automate Facebook Marketplace or other login-gated sources.

## Legacy Prototype

The existing `src/listing_monitor/` Python package is a legacy local listing monitor prototype. It is not the current product architecture because the current PRD is web-first and does not depend on automatic Facebook or Craigslist scraping.

## Architectural Principles

- PRD first.
- Web MVP first.
- External APIs are optional/feature-flagged and must fail gracefully.
- Avoid fake precision in user-facing recommendations.
- Keep costly services behind limitable interfaces.
- Minimize child personal data storage.
- Keep future search connectors server-side and public-web/API only.
- Production deployment source of truth: GitHub `main` branch + Vercel root directory `app`.

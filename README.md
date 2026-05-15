# Mandy's Bike Finder

Mandy's Bike Finder is a web-first product project for helping parents decide whether a used kids bike listing is worth contacting the seller about.

The project is inspired by helping Mandy find the right used bike. It is also a learning project for practicing the full software product development process: product story, PRD, version history, decisions, user flows, implementation phases, testing, and release discipline.

## Product One-Liner

Mandy's Bike Finder helps parents decide whether a used kids bike is the right size, the right style, and a good enough deal to contact the seller.

Planned paid direction:

- Single paid product only: `Mandy Bike Scout`
- Positioning: around `$2.99/week`
- No Plus / Pro / Premium tier split
- Waitlist-first before live payment

## Problem

Parents browsing Facebook Marketplace, Craigslist, OfferUp, local parent groups, or similar marketplaces often need quick help answering:

- Does this bike fit my child?
- Is the asking price reasonable?
- Is the brand reliable or entry-level?
- Is the color/style something my child will actually like?
- What should I ask the seller?
- What concise message should I send?
- Can I share or save this recommendation?

## Current MVP Scope

The current product direction is a Web MVP, not iOS first.

Phase 1 includes:

- Child profile form.
- Child-profile-only local bike recommendation panel.
- Listing input by screenshot, link, or manual fallback.
- Listing field confirmation.
- Local/mock bike fit and deal analysis.
- Red/yellow/green overall result.
- Dimension-level assessments for fit, price, condition, brand, color/kid appeal, and risk.
- Negotiation Boost UI and local message generation.
- Email Report UI with Resend-backed delivery when configured, plus local report preview fallback.
- Service interfaces for future search, OCR, email, and backend metadata logging.

Phase 1.5 adds a controlled real API beta architecture. Real integrations can be enabled only through server-side feature flags and environment variables. The app must still work without API keys through mock/local fallbacks.

Phase 1.5 supports provider interfaces for:

- LLM parsing/reasoning/message/report generation.
- Trusted-retailer search price reference.
- Email report sending.
- Backend metadata/API usage logging.

Bike Scout foundation now adds:

- A local-only saved Bike Scout profile prototype in the Next.js app.
- A local-only Bike Scout waitlist prototype in the Next.js app.
- Typed Bike Scout saved-search models.
- Typed marketplace connector interfaces for future server-side monitoring.
- Honest source classification separating future automated candidates from user-assisted-only marketplaces.

## Current Implemented Behavior (As of 2026-05-10)

Implemented now:

- Warm, parent-friendly hero with bike illustration and concise intro.
- Homepage now uses two product modes:
  - `Free Bike Check` (default)
  - `Bike Scout Waitlist`
- Bike Scout's full waitlist content is no longer duplicated in the default analyzer view.
- Lightweight "How it works" onboarding cards plus expectation-setting callout.
- Child-profile-only recommendation requires:
  - height
  - age
  - riding experience
- Optional child personalization:
  - weight
  - style preference
  - color preference
- Child recommendation outputs both:
  - bike type/category
  - wheel size
- Listing input and extraction paths:
  - screenshot upload + controlled AI screenshot extraction
  - pasted text + controlled AI text extraction
  - manual listing entry
  - marketplace link as reference metadata
  - controlled Craigslist single-link extraction (server-side only)
  - Link-mode action is always visible when a URL is present:
    - Craigslist: analyze listing link via controlled server-side extraction
    - Facebook Marketplace: guide user to paste listing text or upload screenshot; URL is preserved as listing reference
    - Other links: preserve URL as reference and use pasted text/manual details for analysis

Current listing fields used by the app:

- listingLink
- title
- askingPrice
- brand
- model
- wheelSize
- bikeType
- colorStyle
- platform
- location
- condition
- description

Not implemented now:

- Automatic Facebook Marketplace scraping.
- Automated Facebook Marketplace monitoring for Bike Scout.
- Generic multi-marketplace crawling.
- Live retailer search provider in production mode.
- Durable backend storage provider.
- Stripe/payment flow.
- User login/auth unless added later on purpose.
- Automated feed-level ranking rules such as "just listed" filtering, stale listing filtering, distance ranking, or location-based ranking.

The MVP still excludes automatic Facebook/Craigslist scraping, user accounts, payments, and iOS app work.

Bike Scout honesty rules:

- Facebook Marketplace remains user-assisted only.
- OfferUp should remain user-assisted only unless a reliable public integration path exists later.
- Do not scrape login-gated pages.
- Do not bypass anti-bot systems.
- Do not imply alerts/payment are active unless the backend really exists.
- Bike Scout waitlist is currently local-only and does not submit to a real backend yet.
- Future payment path should use Stripe Checkout only after waitlist validation.

## UI Assets

Current image assets are under `app/public/images` and referenced with `/images/<filename>`:

- Hero: `mandy-bike-hero.jpg`
- Bike category illustrations:
  - `Balance bike.png`
  - `Training-wheel bike.png`
  - `Kids pedal bike.png`
  - `Kids mountain bike.png`
  - `Cruiser comfort bike.png`
  - `Youth hybrid bike.png`

Recommendation panel illustration mapping is keyword-based (`balance`, `training`, `pedal`, `mountain`, `cruiser`/`comfort`, `hybrid`) with placeholder fallback when unmatched.

## User Flow (Current)

1. Parent lands on homepage and starts in `Free Bike Check` mode by default.
2. Parent moves through a guided four-step flow: Rider, Listing, Review, Result.
3. Parent enters child profile first (height, age, riding experience required).
4. Returning parents can reuse the last saved rider profile and recommended bike type/wheel size from browser storage.
5. Parent adds listing via screenshot, link, pasted text, or manual details.
6. Successful extraction moves directly into Review so the parent can confirm fields on the same workflow page.
7. App returns fit/value/safety guidance and recommendation.
8. Parent can use seller questions/message drafting and email report actions in parallel.
9. Parent can switch to `Bike Scout Waitlist` tab to join early-access waitlist (local prototype storage today).

## Local Web App

The production-path MVP now lives in `/app` as a Next.js + TypeScript + Tailwind app.

Start the Next.js MVP:

```powershell
cd app
npm install
npm run dev
```

Then open:

- `http://localhost:3000/`

Current verification note:

- Run checks from `/app` when Node.js/npm is available:
  - `npm install`
  - `npm run lint`
  - `npm run build`
- There is not currently a dedicated `test` or `typecheck` script under `/app`.
- GitHub Actions workflow `.github/workflows/app-build.yml` is used to verify the `/app` build on `push` and `pull_request`.
- Active development branch is `main` and production auto-deploy should track `main`.

The default configuration uses mock/local fallbacks. To test the controlled LLM integration, copy `.env.example` to `.env.local` inside `/app`, set `ENABLE_LLM_ANALYSIS=true`, and provide server-side provider credentials. Search and backend logging currently remain provider-interface placeholders with fallback behavior. Email report sending can use Resend when `ENABLE_EMAIL_REPORT=true` and the Resend environment variables are configured. Optional CRM sync can use Salesforce only after explicit marketing/update consent. Never put API keys in frontend code.

### Environment Variables (Current)

Required for real report email sending:

- `RESEND_API_KEY`
- `REPORT_EMAIL_FROM`

Optional/recommended:

- `REPORT_EMAIL_REPLY_TO`
- `APP_BASE_URL`

Core feature flags and controls:

- `ENABLE_LIVE_SEARCH`
- `ENABLE_LLM_ANALYSIS`
- `ENABLE_EMAIL_REPORT`
- `ENABLE_BACKEND_LOGGING`
- `ENABLE_CRM_SYNC`
- `CRM_PROVIDER`
- `SALESFORCE_AUTH_MODE`
- `DAILY_LLM_LIMIT`
- `PER_SESSION_LLM_LIMIT`

If required email variables are missing or invalid, `/api/reports/email` returns a clear configuration error instead of crashing.

Optional Salesforce CRM sync variables:

- `SALESFORCE_AUTH_MODE`
- `SALESFORCE_CLIENT_ID`
- `SALESFORCE_CLIENT_SECRET`
- `SALESFORCE_USERNAME`
- `SALESFORCE_PASSWORD`
- `SALESFORCE_SECURITY_TOKEN`
- `SALESFORCE_LOGIN_URL`
- `SALESFORCE_API_VERSION`
- `SALESFORCE_WEB_TO_LEAD_OID`
- `SALESFORCE_WEB_TO_LEAD_URL`

CRM sync is feature-flagged and consent-gated. The app and transactional report email flow continue to work when Salesforce is disabled, missing, or temporarily failing.

The older `web/` folder is legacy prototype only. New production work should happen in `/app`.

## Vercel Deployment

The first public MVP can be deployed on the free Vercel-provided domain, for example:

- `mandys-bike-finder.vercel.app`

Current live deployment:

- `https://mandys-bike-finder.vercel.app/`
- `https://www.mandysbikefinder.com/`
- `/api/status` returns `200 OK`
- Safe fallback mode is active:
  - `liveSearch=false`
  - `llmAnalysis=false`
  - `emailReport=false`
  - `backendLogging=false`
  - providers are `mock/fallback`
  - `DAILY_LLM_LIMIT` and `PER_SESSION_LLM_LIMIT` are configured server-side
- DNS + Vercel binding is working.
- Latest UX fixes are visible on the custom domain.

Custom domain status:

- `mandysbikefinder.com` has been registered.
- Custom domain is now live:
  - `https://www.mandysbikefinder.com/`
- Deployment was completed in this order:
1. Finish Next.js migration under `/app`.
2. Verify local build.
3. Deploy first to a Vercel free domain.
4. Test the MVP flow.
5. Then connect `mandysbikefinder.com`.
- API cost-control safeguards must be verified before any public deployment.

### 1. Connect GitHub to Vercel

1. Go to Vercel and sign in.
2. Choose **Add New Project**.
3. Import the GitHub repository: `Yangc0910/mandys-bike-finder`.
4. Allow Vercel access to the repository if prompted.
5. Keep automatic deployments enabled so pushes to `main` create new deployments.

### 2. Set the Root Directory

If the production Next.js app lives inside `/app`, set Vercel's **Root Directory** to:

```text
app
```

Vercel should then detect Next.js automatically. If it does not, use:

```text
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

The current production-path app lives in `/app`. The older `web/` folder is a legacy prototype and should not be selected as the Vercel root.

### 3. Configure Environment Variables

In Vercel, open the project and go to **Settings -> Environment Variables**.

For the first deployment, use safe fallback mode with real API features disabled:

```text
ENABLE_LLM_ANALYSIS=false
ENABLE_LIVE_SEARCH=false
ENABLE_EMAIL_REPORT=false
ENABLE_BACKEND_LOGGING=false
ENABLE_CRM_SYNC=false
CRM_PROVIDER=salesforce
SALESFORCE_AUTH_MODE=web_to_lead
OPENAI_MODEL=gpt-5.4-mini
DAILY_LLM_LIMIT
PER_SESSION_LLM_LIMIT
```

Recommended values for first deployment:

```text
DAILY_LLM_LIMIT=10
PER_SESSION_LLM_LIMIT=10
```

Important: API keys must be added only in Vercel Environment Variables. Never commit API keys, OAuth secrets, `.env`, `config.yaml`, credentials, database URLs, or tokens to GitHub.

#### Resend Email Setup

Mandy Bike Finder uses Resend for real transactional email when email sending is enabled.
The current production sending domain is verified in Resend through GoDaddy DNS.

Preferred production sender:

```text
Mandy Bike Finder <noreply@updates.mandysbikefinder.com>
```

Alternative sender if the subdomain is not configured yet:

```text
Mandy Bike Finder <hello@mandysbikefinder.com>
```

Setup steps:

1. Create a Resend account.
2. Add and verify the sending domain, preferably `updates.mandysbikefinder.com`.
3. Add the SPF/DKIM DNS records provided by Resend.
4. Create a Resend API key.
5. Add `RESEND_API_KEY`, `REPORT_EMAIL_FROM`, `REPORT_EMAIL_REPLY_TO`, and `APP_BASE_URL` to Vercel Project Settings -> Environment Variables.
6. Restart the local dev server after changing local environment variables.
7. Redeploy after environment variables are added in Vercel.

Example Vercel values:

```text
ENABLE_EMAIL_REPORT=true
RESEND_API_KEY=<set in Vercel only>
REPORT_EMAIL_FROM=Mandy Bike Finder <noreply@updates.mandysbikefinder.com>
REPORT_EMAIL_REPLY_TO=hello@mandysbikefinder.com
APP_BASE_URL=https://www.mandysbikefinder.com
```

Do not commit Resend API keys, `.env` files, or other secrets. If these variables are missing or malformed, `/api/reports/email` returns a clear configuration error instead of crashing.

Current email limitations:

- Report emails are HTML/plain-text transactional emails. Uploaded listing screenshots are sent as email attachments when available.
- Bike Scout waitlist remains local-only in this step.

#### Salesforce CRM Setup (Optional)

Salesforce is not required for the core app. It is only used for opted-in lead/update capture when a parent explicitly checks:

```text
Send me future bike deal alerts and product updates.
```

Resend remains responsible for transactional report delivery. Salesforce must not be used as the app's auth system, and marketing/update consent must stay separate from sending a requested report.

Two Salesforce modes are supported:

- `SALESFORCE_AUTH_MODE=web_to_lead`: recommended MVP mode. It submits a server-side Web-to-Lead form post and is simpler for Free/Starter-style setup when Connected App setup is not convenient.
- `SALESFORCE_AUTH_MODE=rest`: optional advanced mode. It uses a Salesforce Connected App and REST API, which is better for Developer Edition or orgs where Connected Apps are available.

Web-to-Lead setup steps:

1. In Salesforce, enable or open Web-to-Lead setup.
2. Generate a Web-to-Lead form and copy the org ID (`oid`).
3. Add these Vercel environment variables:

```text
ENABLE_CRM_SYNC=true
CRM_PROVIDER=salesforce
SALESFORCE_AUTH_MODE=web_to_lead
SALESFORCE_WEB_TO_LEAD_OID=<set in Vercel only>
SALESFORCE_WEB_TO_LEAD_URL=https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8
```

Web-to-Lead mode sends standard Lead fields from the server side only: `oid`, `first_name`, `last_name`, `email`, `company`, `lead_source`, and `description`. Bike/report metadata is included in `description`.

REST API advanced setup:

1. In Salesforce, create or reuse a Connected App that allows OAuth access for server-side integration.
2. Obtain the connected app `Client ID` and `Client Secret`.
3. Create or choose a Salesforce user for demo-level lead creation.
4. Generate that user's security token if the org requires password+token authentication.
5. Add these Vercel environment variables:

```text
ENABLE_CRM_SYNC=true
CRM_PROVIDER=salesforce
SALESFORCE_AUTH_MODE=rest
SALESFORCE_CLIENT_ID=<set in Vercel only>
SALESFORCE_CLIENT_SECRET=<set in Vercel only>
SALESFORCE_USERNAME=<set in Vercel only>
SALESFORCE_PASSWORD=<set in Vercel only>
SALESFORCE_SECURITY_TOKEN=<set in Vercel only>
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_API_VERSION=60.0
```

Safe testing:

1. Keep `ENABLE_CRM_SYNC=false` and confirm report email still works without CRM.
2. Enable CRM only in a preview/local environment first.
3. Send a report without checking the updates box; Salesforce should not receive a lead.
4. Send a report with the updates box checked; Salesforce should create a Lead.

Current CRM limitations:

- MVP creates a Salesforce Lead using standard fields (`FirstName`, `LastName`, `Company`, `Email`, `LeadSource`, `Description`).
- App/report metadata is stored in `Description` instead of custom Salesforce fields.
- Duplicate handling/upsert is not implemented yet.
- Web-to-Lead does not return a Salesforce Lead ID to the app.
- Salesforce sync failure does not block transactional report email delivery.

### 4. Confirm Deployment Works

After Vercel deploys:

1. Open the Vercel preview or free-domain URL, such as `https://mandys-bike-finder.vercel.app`.
2. Confirm the home page loads.
3. Enter a child profile and sample bike listing.
4. Confirm the app returns a red/yellow/green result.
5. Confirm fallback behavior is active with all real API feature flags set to `false`.
6. Confirm no API keys appear in browser source or client-side network payloads.
7. Confirm `/api/status` reports fallback/mock provider modes.

### 5. Add a Custom Domain Later

When ready:

1. Open the Vercel project.
2. Go to **Settings -> Domains**.
3. Add the custom domain.
4. Follow Vercel's DNS instructions at the domain registrar.
5. Wait for DNS and SSL certificate provisioning to complete.

Reminder: keep the free-domain deployment healthy and validated even after custom-domain cutover.

Reminder: API cost-control safeguards must be verified before any public deployment.

Reminder: do not enable real APIs yet for the first public fallback-mode rollout.

## Source of Truth

The current complete PRD is:

- [docs/PRD.md](docs/PRD.md)

All future implementation should align with that PRD. If code conflicts with the PRD, update the code or record the discrepancy in:

- [docs/product-decisions.md](docs/product-decisions.md)

## PRD Version History

Historical PRDs are stored under:

- [docs/prd-history/PRD-v0.1.md](docs/prd-history/PRD-v0.1.md)
- [docs/prd-history/PRD-v0.2.md](docs/prd-history/PRD-v0.2.md)
- [docs/prd-history/PRD-v0.3.md](docs/prd-history/PRD-v0.3.md)
- [docs/prd-history/PRD-v0.4.md](docs/prd-history/PRD-v0.4.md)

The changelog is:

- [CHANGELOG.md](CHANGELOG.md)

## Repository Structure

```text
.
|-- docs/
|   |-- PRD.md                         Current source-of-truth PRD
|   |-- prd-history/                   Historical PRD versions
|   |-- user-flows.md                  MVP user flows
|   |-- scoring-logic.md               Analysis and qualitative meter rules
|   |-- api-cost-control.md            API limit, caching, and fallback design
|   |-- roadmap.md                     Product implementation roadmap
|   |-- product-decisions.md           Key product decisions and discrepancies
|   |-- architecture/                  Architecture notes
|   |-- operations/                    Local setup and runbook notes
|   `-- prompts/                       Earlier build prompt records
|-- prompts/
|   `-- product-discussion-log.md      Product discussion summary
|-- app/                               Next.js + TypeScript + Tailwind production-path MVP
|   |-- app/                           App Router pages and API routes
|   |-- lib/                           Shared analysis logic and server providers
|   |-- package.json                   Next.js app scripts
|   `-- tailwind.config.ts
|-- web/
|   |-- index.html                     Legacy static prototype entry point
|   |-- styles.css                     UI styling
|   |-- src/                           Front-end UI logic and local fallback analysis
|   `-- server/                        Server-side API routes, providers, limits, cache
|-- src/
|   `-- listing_monitor/               Legacy Python listing monitor prototype
|-- tests/                             Existing Python prototype tests
|-- CHANGELOG.md
|-- pyproject.toml
`-- README.md
```

## Product Plan

1. Phase 0: documentation and repo setup.
2. Phase 1: front-end MVP with mock/local rules.
3. Phase 1.5: controlled real API beta with feature flags, limits, caching, and fallbacks.
4. Phase 2: screenshot upload and extraction.
5. Phase 3: live trusted-retailer price reference search hardening.
6. Phase 4: email report backend hardening.
7. Phase 5: polish, shareable reports, and analytics.
8. Future: PWA/iOS, affiliate, saved listings, user accounts.

Bike Scout-specific future items:

- Real database-backed saved searches.
- Scheduled search jobs.
- Email alerts.
- Official eBay API integration.
- Safe server-side public-source connectors.
- Payment integration after product validation.

See [docs/roadmap.md](docs/roadmap.md) for details.

## Current Limitations

- Bike Scout waitlist is local-browser storage only (no durable backend waitlist database yet).
- Report email is HTML/plain-text delivery (no PDF attachment flow yet).
- Live multi-source marketplace monitoring is not live yet.
- No user auth/account system in the current MVP.
- No Stripe payment flow yet.

## CRM and Email Strategy

- Resend is used for transactional email (for example, sending a requested bike report to the user).
- Transactional report sending is separate from marketing consent or waitlist growth workflows.
- Salesforce CRM sync is an optional, feature-flagged integration for explicitly opted-in Bike Scout/product-update leads.
- CRM/marketing platforms beyond Salesforce (HubSpot, Mailchimp, Brevo) remain future integrations.
- HubSpot should not be used as the app's authentication system.
- Future auth options can include Clerk, Supabase Auth, Firebase Auth, or Auth.js once account features are prioritized.

## Legacy Prototype Note

The repository contains an older Python `listing_monitor` prototype and the earlier `web/` static prototype. They are not the production deployment path. The current production path is the Vercel-hosted Next.js app under `/app`. Legacy code can remain as experimental history unless future work intentionally adapts parts of it into PRD-aligned service logic.

## Development Direction

Before adding implementation, read:

- [docs/PRD.md](docs/PRD.md)
- [docs/user-flows.md](docs/user-flows.md)
- [docs/scoring-logic.md](docs/scoring-logic.md)
- [docs/api-cost-control.md](docs/api-cost-control.md)
- [docs/product-decisions.md](docs/product-decisions.md)

Then implement only the next roadmap phase.

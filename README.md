# Mandy's Bike Finder

Mandy's Bike Finder is a web-first product project for helping parents decide whether a used kids bike listing is worth contacting the seller about.

The project is inspired by helping Mandy find the right used bike. It is also a learning project for practicing the full software product development process: product story, PRD, version history, decisions, user flows, implementation phases, testing, and release discipline.

## Product One-Liner

Mandy's Bike Finder helps parents decide whether a used kids bike is the right size, the right style, and a good enough deal to contact the seller.

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
- Listing input by link, screenshot, or manual fallback.
- Listing field confirmation.
- Local/mock bike fit and deal analysis.
- Red/yellow/green overall result.
- Dimension-level assessments for fit, price, condition, brand, color/kid appeal, and risk.
- Negotiation Boost UI and local message generation.
- Email Report UI placeholder and local report preview.
- Service interfaces for future search, OCR, email, and backend metadata logging.

Phase 1.5 adds a controlled real API beta architecture. Real integrations can be enabled only through server-side feature flags and environment variables. The app must still work without API keys through mock/local fallbacks.

Phase 1.5 supports provider interfaces for:

- LLM parsing/reasoning/message/report generation.
- Trusted-retailer search price reference.
- Email report sending.
- Backend metadata/API usage logging.

The MVP still excludes automatic Facebook/Craigslist scraping, user accounts, payments, and iOS app work.

## Local Web App

Start the web MVP:

```powershell
npm start
```

Then open:

- `http://127.0.0.1:5173/`

The default configuration uses mock/local fallbacks. To test controlled live integrations, copy `.env.example` to `.env`, set feature flags such as `ENABLE_LIVE_SEARCH=true`, and provide server-side provider credentials. Never put API keys in frontend code.

## Vercel Deployment

The first public MVP can be deployed on the free Vercel-provided domain, for example:

- `mandys-bike-finder.vercel.app`

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

The current prototype also contains `web/`, but the Vercel production app should use the future `/app` Next.js directory when that implementation is added.

### 3. Configure Environment Variables

In Vercel, open the project and go to **Settings -> Environment Variables**. Configure only the variables needed for the current beta:

```text
ENABLE_LIVE_SEARCH
ENABLE_LLM_ANALYSIS
ENABLE_EMAIL_REPORT
ENABLE_BACKEND_LOGGING
DAILY_SEARCH_LIMIT
DAILY_LLM_LIMIT
DAILY_EMAIL_LIMIT
SEARCH_CACHE_TTL_HOURS
OPENAI_API_KEY
OPENAI_MODEL
SEARCH_API_KEY
SEARCH_API_URL
EMAIL_API_KEY
EMAIL_API_URL
EMAIL_FROM
DATABASE_URL
```

Use safe defaults first, such as feature flags set to `false`, then enable one integration at a time.

Important: API keys must be added only in Vercel Environment Variables. Never commit API keys, OAuth secrets, `.env`, `config.yaml`, credentials, database URLs, or tokens to GitHub.

### 4. Confirm Deployment Works

After Vercel deploys:

1. Open the Vercel-provided URL, such as `https://mandys-bike-finder.vercel.app`.
2. Confirm the home page loads.
3. Enter a child profile and sample bike listing.
4. Confirm the app returns a red/yellow/green result.
5. Confirm fallback messaging appears when live APIs are disabled.
6. If a feature flag is enabled, confirm the related server-side API works without exposing keys in browser source or client-side network payloads.

### 5. Add a Custom Domain Later

When ready:

1. Open the Vercel project.
2. Go to **Settings -> Domains**.
3. Add the custom domain.
4. Follow Vercel's DNS instructions at the domain registrar.
5. Wait for DNS and SSL certificate provisioning to complete.

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
|-- web/
|   |-- index.html                     Phase 1 web MVP entry point
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

See [docs/roadmap.md](docs/roadmap.md) for details.

## Legacy Prototype Note

The repository contains an older Python `listing_monitor` prototype. It is not the current product direction. The current PRD is web-first and explicitly avoids automatic Facebook/Craigslist scraping. The legacy code can be treated as experimental history unless future work intentionally adapts parts of it into PRD-aligned service logic.

## Development Direction

Before adding implementation, read:

- [docs/PRD.md](docs/PRD.md)
- [docs/user-flows.md](docs/user-flows.md)
- [docs/scoring-logic.md](docs/scoring-logic.md)
- [docs/api-cost-control.md](docs/api-cost-control.md)
- [docs/product-decisions.md](docs/product-decisions.md)

Then implement only the next roadmap phase.

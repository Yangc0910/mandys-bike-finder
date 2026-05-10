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
- Child-profile-only local bike recommendation panel.
- Listing input by screenshot, link, or manual fallback.
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

## Current Implemented Behavior (As of 2026-05-10)

Implemented now:

- Warm, parent-friendly hero with bike illustration and concise intro.
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
- Generic multi-marketplace crawling.
- Live retailer search provider in production mode.
- Real email provider and durable backend storage provider.
- Automated feed-level ranking rules such as "just listed" filtering, stale listing filtering, distance ranking, or location-based ranking.

The MVP still excludes automatic Facebook/Craigslist scraping, user accounts, payments, and iOS app work.

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

- `npm` is not available in the current Codex environment.
- `npm install`, `npm run dev`, and `npm run build` could not be verified here.
- Build verification must be done later in an environment with Node.js/npm, such as a local machine, GitHub Actions, or Vercel.
- GitHub Actions workflow `.github/workflows/app-build.yml` is used to verify the `/app` build on `push` and `pull_request`.

The default configuration uses mock/local fallbacks. To test the controlled LLM integration, copy `.env.example` to `.env.local` inside `/app`, set `ENABLE_LLM_ANALYSIS=true`, and provide server-side provider credentials. Search, email, and backend logging currently remain provider-interface placeholders with fallback behavior. Never put API keys in frontend code.

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

See [docs/roadmap.md](docs/roadmap.md) for details.

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

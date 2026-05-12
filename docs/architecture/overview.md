# Architecture Overview

Current PRD: `docs/PRD.md` v0.5

## Current Direction

Mandy's Bike Finder is now a web-first MVP. The initial implementation should be a front-end web app with local/mock analysis logic and service interfaces for future external capabilities.

## Phase 1 Architecture

```text
User input
  -> child profile form
  -> listing link / screenshot / manual input
  -> listing field confirmation
  -> local analysis engine
  -> red/yellow/green result
  -> negotiation message generator
  -> email report preview
```

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
- No real external APIs in Phase 1.
- Avoid fake precision in user-facing recommendations.
- Keep costly services behind limitable interfaces.
- Minimize child personal data storage.
- Keep future search connectors server-side and public-web/API only.

# Architecture Overview

Current PRD: `docs/PRD.md` v0.4

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

## Legacy Prototype

The existing `src/listing_monitor/` Python package is a legacy local listing monitor prototype. It is not the current product architecture because the current PRD is web-first and does not depend on automatic Facebook or Craigslist scraping.

## Architectural Principles

- PRD first.
- Web MVP first.
- No real external APIs in Phase 1.
- Avoid fake precision in user-facing recommendations.
- Keep costly services behind limitable interfaces.
- Minimize child personal data storage.

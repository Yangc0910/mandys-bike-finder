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

Phase 1 should include:

- Child profile form.
- Listing input by link, screenshot, or manual fallback.
- Listing field confirmation.
- Local/mock bike fit and deal analysis.
- Red/yellow/green overall result.
- Dimension-level assessments for fit, price, condition, brand, color/kid appeal, and risk.
- Negotiation Boost UI and local message generation.
- Email Report UI placeholder and local report preview.
- Service interfaces for future search, OCR, email, and backend metadata logging.

Phase 1 should not include real external APIs, real OCR, real email sending, real database, user accounts, payments, or iOS app work.

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
|   `-- src/                           Local/mock front-end logic and interfaces
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
3. Phase 2: screenshot upload and extraction.
4. Phase 3: live trusted-retailer price reference search.
5. Phase 4: email report backend.
6. Phase 5: polish, shareable reports, and analytics.
7. Future: PWA/iOS, affiliate, saved listings, user accounts.

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

# 0001 - Repository as Product System of Record

Date: 2026-05-10  
Status: Accepted

## Context

Mandy's Bike Finder is expected to evolve beyond a code prototype. The project needs to preserve product requirements, PRD version history, decisions, build prompts, and future app code in one professional GitHub repository.

## Decision

The repository will store product and engineering knowledge alongside code:

- `docs/prd/` for current and historical PRDs.
- `docs/decisions/` for decision records.
- `docs/prompts/` for AI build prompts and implementation notes.
- `docs/product/` for roadmap and release notes.
- `docs/architecture/` and `docs/operations/` for engineering and runbook material.
- `src/` and `tests/` for current and future application code.

## Consequences

Product context will travel with the code, making future work easier to review and continue. Documentation changes should be treated as first-class repository changes, not side notes.

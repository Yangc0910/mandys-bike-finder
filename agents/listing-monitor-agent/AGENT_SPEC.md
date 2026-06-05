# Agent Spec: Listing Monitor Agent

Last updated: 2026-06-05

## Agent Objective

Monitor configured listing/search pages conservatively, extract visible listing candidates, score them locally, and send a summary email of the best new matches.

## User Stories

- As a personal user, I want to open a manual-login browser profile and keep that login state between runs.
- As a personal user, I want to score new listing matches without contacting sellers automatically.
- As a personal user, I want a Gmail summary of the best new listings after a run.
- As a cautious operator, I want the tool to stop when it sees login/protection pages rather than trying to bypass them.

## Inputs

- `config.yaml` derived from `config.example.yaml`
- `.env`
- configured source URLs and selectors
- browser persistent profile directory
- optional Gmail credentials and OAuth tokens

## Outputs

- scored `Listing` objects
- local SQLite records of seen listings
- Gmail summary email
- CLI console output

## Internal Workflow

1. Load environment variables and YAML config.
2. Create or open SQLite storage.
3. Open a persistent Playwright browser context.
4. Navigate to each configured source with conservative pacing.
5. Detect login/protection/CAPTCHA states and skip protected pages.
6. Extract visible listing candidates.
7. Filter candidates against configured include/exclude rules.
8. Score new matching listings locally.
9. Select top matches.
10. Persist seen listings unless `--dry-run`.
11. Send a Gmail summary if configured.

## Data Files Used

- `config.yaml`
- `.env`
- `data/listings.sqlite3`
- `.browser-profile/`
- `credentials/`

## Tools Used

- Playwright
- SQLite
- Gmail API
- YAML config
- Python CLI entrypoint `listing-monitor`

## CLI Commands

- `listing-monitor login`
- `listing-monitor run`
- `listing-monitor run --dry-run`
- `listing-monitor init-db`
- `listing-monitor show-seen --limit 20`

## Safety And Approval Boundaries

- Manual login only. The tool does not automate login.
- No CAPTCHA or protection bypassing.
- No seller messaging or purchase automation.
- Conservative pacing is required.
- The operator is expected to review email summaries and source choices manually.

## External Integrations

- Gmail API
- Playwright browser automation

## Error Handling

- Timeout while loading a source: skip and continue.
- Login/protection page detected: skip and continue.
- Extraction failures: continue to next source or listing.
- Email disabled or unavailable: run still completes without messaging sellers.

## Testing Approach

- Python tests in `tests/`
- Dry-run CLI execution
- Manual login/profile verification
- Manual source extraction checks

## Failure Modes

- Login expires and the browser profile is no longer authenticated.
- Site selectors drift and extraction quality drops.
- Gmail credentials or OAuth tokens are missing/expired.
- SQLite path is unavailable or unwritable.
- Source pages move behind login/protection walls and produce zero usable candidates.

## Manual Approval Steps

- Human performs login in the browser profile.
- Human reviews configured sources and filters.
- Human reviews summary emails and any follow-up decisions.

## Future Improvements

- Clearer source-specific extractor docs
- Better structured test fixtures for extraction
- More explicit config validation
- Safer credential setup documentation for cross-device continuation

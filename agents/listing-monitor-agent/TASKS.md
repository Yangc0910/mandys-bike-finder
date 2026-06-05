# Listing Monitor Agent Tasks

Last updated: 2026-06-05

## Completed Tasks

- Created Python package structure under `src/listing_monitor/`.
- Added CLI entrypoint `listing-monitor`.
- Added persistent-browser manual-login flow.
- Added SQLite storage for seen listings.
- Added visible-listing extraction flow.
- Added local filtering and scoring.
- Added top-listing selection.
- Added Gmail summary sending.
- Added local runbook and config example.
- Added conservative handling for login/protection/CAPTCHA-like pages.

## Pending Tasks

- Add source-by-source extractor documentation and maintenance notes.
- Add more robust config validation and startup diagnostics.
- Add more structured tests for extractors and scoring edge cases.
- Add Mac/Linux-specific setup notes alongside the current Windows-heavy runbook.
- Decide whether this subsystem remains in the main repo long-term or moves to a dedicated archived repo later.

## Nice-To-Have Tasks

- Better summary formatting and richer plain-text output.
- Fixture-based regression tests for known listing layouts.
- Cleaner separation between browser, extraction, and notification layers.
- Optional non-Gmail notification adapters.

## Testing Tasks

- Run `listing-monitor run --dry-run` against a safe personal test config.
- Verify browser profile login persistence.
- Verify SQLite writes and `show-seen`.
- Verify Gmail summary send with a test mailbox.
- Verify protected/login page detection still fails safely.

## Deployment Tasks

- None for public deployment.
- This subsystem is personal/local tooling, not a hosted production service.
- If reused later, document environment setup, secrets handling, and scheduling strategy explicitly before broader use.

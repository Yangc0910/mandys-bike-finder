# Architecture Overview

## Current System

Mandy's Bike Finder currently exists as a local Python prototype built around a simple pipeline:

```text
Configured sources
    -> visible browser collection
    -> listing extraction
    -> filtering
    -> scoring
    -> selection
    -> SQLite deduplication
    -> Gmail summary
```

## Main Components

- `src/listing_monitor/browser.py`: visible browser setup.
- `src/listing_monitor/config.py`: YAML configuration loading and validation.
- `src/listing_monitor/extractors.py`: listing extraction from visible page content.
- `src/listing_monitor/filters.py`: broad eligibility filtering.
- `src/listing_monitor/scoring.py`: configurable opportunity scoring.
- `src/listing_monitor/selection.py`: final top-N selection.
- `src/listing_monitor/db.py`: local seen-listing storage.
- `src/listing_monitor/gmail_sender.py`: Gmail summary delivery.
- `src/listing_monitor/monitor.py`: end-to-end orchestration.

## Architectural Principles

- Keep collection transparent and visible.
- Keep ranking explainable.
- Keep sensitive state local and out of version control.
- Prefer configuration for personal preferences before adding code.
- Add app UI only after the core listing and scoring model is stable.

## Future Direction

Future app code can remain in `src/` while the product model matures. If the project grows into a UI app, add the UI as a clearly named package or app folder and preserve this documentation structure as the shared product context.

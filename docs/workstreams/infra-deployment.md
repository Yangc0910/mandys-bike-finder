# Infra And Deployment Workstream

## App Store MVP Scope

Status: Planning  
Last updated: 2026-05-25

Executable PRD slice: `docs/product/app-store-mvp-prd.md`

### Infra Principles

- App Store MVP should keep provider credentials out of the client and future iOS bundle.
- Server-side API boundaries remain the path for OpenAI, email, CRM, search, and future storage.
- The app must remain usable through local fallback behavior when protected providers are disabled.
- App Store MVP mode should hide risky or deferred features without removing existing web functionality.

### Feature Flag Planning

Planning-only flags for a future implementation task:

- `NEXT_PUBLIC_APP_STORE_MVP_MODE`
- `ENABLE_EMAIL_REPORT`
- `ENABLE_PDF_EXPORT`
- `ENABLE_BIKE_SCOUT`
- `ENABLE_MARKETPLACE_AUTOMATION`
- `ENABLE_LLM_ANALYSIS`

Expected App Store MVP defaults:

- Email report hidden.
- PDF export hidden.
- Bike Scout hidden.
- Marketplace automation disabled.
- LLM optional and explicit-action only.

### Local Storage Planning

- Child profile: localStorage is acceptable for v1.
- Saved evaluations: localStorage is acceptable for at least 10 recent text-based result snapshots.
- IndexedDB should be considered only if the app stores image blobs, thumbnails, or larger history records.
- Settings must provide local clear controls before TestFlight/App Store submission.

### Capacitor Readiness Dependencies

- Hosted backend endpoints remain available for protected provider calls.
- No provider keys are bundled into the app.
- App Store MVP mode is verified before wrapping.
- Review notes must explain optional AI processing, local fallback behavior, and no marketplace scraping.

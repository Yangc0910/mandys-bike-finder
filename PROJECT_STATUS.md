# Project Status

Last updated: 2026-06-10

## Project

Mandy's Bike Finder

Primary product question:

> Is this used kids' bike worth buying for my child?

Primary production path:

- Next.js app in `app/`
- deployed from GitHub `main`
- hosted on Vercel

## Current Workstreams

Primary active product workstream:

- `post-launch-updates`
- Purpose: deliver controlled version 1.1 and 1.2 improvements from the stable App Store v1.0 production baseline
- Current version 1.1 theme: GUI polish, mobile interaction, loading/launch quality, and App Store screenshot presentation
- Workstream: `docs/workstreams/post-launch-updates.md`

Repository continuation workstream:

- `github-cross-device-handoff`
- Purpose: make the repository self-contained and resumable from GitHub across Windows and Mac

## Agent Inventory

Workflow-specific guided assistant:

- `Mandy Bike Coach`
- Docs: `agents/bike-coach/`
- Role: explain the current bike-check flow, missing inputs, verdict, fit/value/risk, and seller next steps

Historical personal automation subsystem:

- `listing-monitor-agent`
- Docs: `agents/listing-monitor-agent/`
- Role: headed-browser personal listing monitor with SQLite + Gmail summaries

## Completed Work

- Active product path migrated into `app/` as a Next.js + TypeScript + Tailwind app.
- Vercel-hosted App Store MVP deployment is live at `https://app.mandysbikefinder.com/`.
- Public web MVP remains separate at `https://www.mandysbikefinder.com/`.
- App Store MVP mode exists behind `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`.
- Four-tab App Store MVP shell is implemented: `Profile`, `Evaluate`, `History`, `Settings`.
- Profile local save is implemented with device-local storage.
- Evaluate supports manual entry, pasted text, screenshot preview, user-triggered screenshot OCR, and local fallback analysis.
- OCR runs through `/api/extract` with server-side OpenAI and explicit user action only.
- History local save, favorite, detail, and delete flows are implemented.
- Settings local data controls and privacy/AI disclosures are implemented.
- Public `/privacy` and `/offline` routes are implemented.
- Close-to-final App Review polish is in place:
  - `Version: 1.0` in Settings
  - privacy/support email on `/privacy`
  - OCR review messaging after extraction
  - App Review and TestFlight checklists updated
- Mandy Bike Coach guided assistant is implemented and documented.
- Capacitor dependencies, hosted-app config, and generated iOS project files are already in the repo.
- Capacitor sync and Xcode simulator builds now pass on macOS.
- Simulator QA has passed on iPhone 17 Pro, with a cold-launch check on iPhone 17e.
- Profile persistence, local evaluation, History, and Settings data-clearing flows pass in the simulator.
- A production-style iOS app icon is installed and verified on the simulator home screen.
- Physical-device build, signing, installation, launch, and user-led core-flow QA pass on iPhone 17 Pro Max.
- iOS version `1.0` build `2` was archived and uploaded successfully to App Store Connect on June 6, 2026.
- Listing title parsing and seller-message punctuation polish passed targeted, production-build, browser, simulator, and archive validation.
- iOS version `1.0` build `3` was archived and uploaded successfully to App Store Connect on June 6, 2026.
- App Store Connect processing and export-compliance confirmation completed for build `1.0 (3)`.
- Build `1.0 (3)` is active in the `Internal Testing` TestFlight group.
- App Store version `1.0` passed App Review and is live.
- Production version `1.0` is preserved by tag `v1.0.0-app-store-release`.
- Version 1.1 planning begins from branch `release/v1.1-ui-polish`.
- Root-level GitHub handoff documentation has been added for cross-device continuation.

## In Progress

- Defining the version 1.1 UX polish PRD and visual system.
- Splitting post-launch work into small, reviewable tasks.
- Planning improved loading/launch states and App Store screenshot assets.

## Known Issues

- Version 1.1 visual and interaction requirements are planned but not yet implemented.
- App Store screenshots should be upgraded for the version 1.1 presentation.
- No durable database exists yet for saved reports, waitlist entries, usage counters, or Bike Scout profiles.
- Rate limits are runtime scoped unless backed by durable storage later.
- `docs/current-status.md` contains historical notes and should be treated as secondary to this file plus `CODEX_HANDOFF.md`.

## Important Design Decisions

- GitHub, not Codex conversation state, is the long-term source of truth.
- The active product surface is the Next.js app in `app/`, not the legacy `web/` prototype.
- The App Store MVP uses a hosted-app strategy through Vercel, not a bundled offline-first native architecture.
- Provider secrets remain server-side only.
- AI actions must be explicit. Initial load and screenshot selection do not trigger AI.
- The public `www` web MVP and the App Store MVP deployment remain separated.
- Mandy Bike Coach is workflow-specific help, not a general chatbot.
- Facebook Marketplace remains user-assisted only; do not automate login-gated scraping or bypass anti-bot systems.
- The historical Python listing monitor remains in-repo for reference, but it is not the current product direction.

## Main Files And Folders

- `app/`: active Next.js product and Capacitor/iOS wrapper
- `docs/`: product, architecture, roadmap, workstream, and release documentation
- `workstreams/`: root-level handoff workstream summaries
- `agents/`: agent-specific docs
- `src/listing_monitor/`: legacy personal listing monitor agent-style CLI
- `web/`: historical static/web prototype
- `tests/`: historical Python tests for the listing monitor subsystem

## Recommended Next Tasks

1. Define the version 1.1 screen-level UX polish PRD.
2. Define the version 1.1 app visual system.
3. Implement and verify app shell/navigation polish as the first production UI task.
4. Prepare the App Store screenshot storyboard and reproducible fictional sample data.

## Risks And Blockers

- UI work must not destabilize the live version 1.0 baseline.
- Hosted app updates can affect the App Store shell without a new binary, so preview and regression checks are required before production deployment.
- The repository contains multiple historical tracks; contributors must start from the handoff docs to avoid editing the wrong subsystem.
- Vercel production behavior depends on environment variables that are not stored in Git.
- CRM and email flows depend on production environment variables and should remain server-side only.

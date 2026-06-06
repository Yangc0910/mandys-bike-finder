# Project Status

Last updated: 2026-06-06

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

- `app-store-mvp-ios-review-handoff`
- Purpose: keep the App Store MVP close to final, GitHub-backed, and ready to continue on Mac/Xcode/TestFlight
- Agent-related: indirectly; this workstream touches agent-adjacent features but is not creating a new standalone agent

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
- Root-level GitHub handoff documentation has been added for cross-device continuation.

## In Progress

- Preparing the repository for durable GitHub-backed, cross-device continuation.
- Tightening project-level status/handoff documentation.
- Making current and legacy workstreams easier to understand without Codex thread history.
- Waiting for App Store Connect to finish processing iOS version `1.0` build `2`.
- Preparing internal TestFlight installation and final App Store assets.

## Known Issues

- TestFlight build `1.0 (2)` still needs an internal install after Apple processing completes.
- App Store screenshots are still required.
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

1. Wait for App Store Connect to finish processing build `1.0 (2)`.
2. Add the build to an internal TestFlight group and install it from TestFlight.
3. Complete a short internal TestFlight pass for launch, screenshot selection, OCR, persistence, History, and offline recovery.
4. Capture App Store screenshots from the hosted App Store MVP.
5. Confirm `support@mandysbikefinder.com` is a live monitored mailbox.

## Risks And Blockers

- Internal TestFlight installation and verification are not complete.
- App Store Connect metadata, screenshots, and assets still need final manual completion.
- The repository contains multiple historical tracks; contributors must start from the handoff docs to avoid editing the wrong subsystem.
- Vercel production behavior depends on environment variables that are not stored in Git.
- CRM and email flows depend on production environment variables and should remain server-side only.

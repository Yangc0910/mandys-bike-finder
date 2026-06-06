# Codex Handoff

Last updated: 2026-06-06

## What This Project Is

Mandy's Bike Finder is a product repository with one active product track and two agent-style subsystems documented for continuity.

Active product track:

- `app/`: live Next.js App Store MVP and future Capacitor/TestFlight path

Agent-style subsystems:

- `agents/bike-coach/` with implementation in `app/`: workflow-specific guided assistant inside the bike-check flow
- `src/listing_monitor/` documented under `agents/listing-monitor-agent/`: historical personal listing monitor CLI using Playwright, SQLite, YAML config, and Gmail

The active product workstream is the App Store MVP / iOS review handoff. Do not assume the Python listing monitor or historical `web/` prototype is the current product surface.

## Where To Start Reading

Start in this order:

1. [PROJECT_STATUS.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/PROJECT_STATUS.md)
2. [workstreams/app-store-mvp-ios-review-handoff.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/workstreams/app-store-mvp-ios-review-handoff.md)
3. [workstreams/github-cross-device-handoff.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/workstreams/github-cross-device-handoff.md)
4. [README.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/README.md)
5. [docs/product/app-store-final-review-checklist.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/docs/product/app-store-final-review-checklist.md)
6. [docs/product/xcode-testflight-preparation.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/docs/product/xcode-testflight-preparation.md)

For code entry points:

- Product UI/API: [app/app/page.tsx](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/app/app/page.tsx), [app/app/api](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/app/app/api)
- Bike Coach assistant internals: [app/lib/assistant.ts](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/app/lib/assistant.ts), [app/app/api/assistant/route.ts](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/app/app/api/assistant/route.ts)
- Server-side providers/config: [app/lib/server](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/app/lib/server)
- iOS wrapper: [app/capacitor.config.ts](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/app/capacitor.config.ts), [app/ios](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/app/ios)
- Historical listing monitor: [src/listing_monitor](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/src/listing_monitor)

## Current Workstream Status

Primary current workstream:

- `app-store-mvp-ios-review-handoff`

Status:

- Close-to-final for App Review preparation on the web/Vercel side
- Ready to continue on a Mac for Xcode, iOS simulator, signing, and TestFlight steps

Cross-device continuity workstream:

- `github-cross-device-handoff`
- Root-level status, handoff, agent, and workstream docs are now in place

What is already true:

- App Store MVP hosted URL is live
- OCR works through server-side AI when enabled in Vercel
- privacy/support copy is in place
- local history/settings controls are in place
- Capacitor iOS project has already been generated
- Mandy Bike Coach is implemented and separately documented

What is now validated on macOS:

- Capacitor sync and Capacitor Doctor
- Xcode simulator build and launch
- iPhone 17 Pro simulator flow checks
- iPhone 17e cold-launch check
- Profile persistence, local evaluation, History, and Settings data controls
- Production-style app icon installation and simulator home-screen rendering
- Apple Development signing and provisioning
- Physical iPhone 17 Pro Max build, install, launch, and user-led core-flow QA
- Release archive for iOS version `1.0` build `2`
- Successful App Store Connect upload of build `1.0 (2)` on June 6, 2026

What is not done yet:

- App Store Connect processing confirmation
- internal TestFlight installation and QA
- App Store screenshot and metadata finalization

## Important Files

- [README.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/README.md)
- [PROJECT_STATUS.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/PROJECT_STATUS.md)
- [docs/roadmap.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/docs/roadmap.md)
- [docs/product/app-store-final-review-checklist.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/docs/product/app-store-final-review-checklist.md)
- [docs/product/capacitor-readiness-checklist.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/docs/product/capacitor-readiness-checklist.md)
- [docs/product/xcode-testflight-preparation.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/docs/product/xcode-testflight-preparation.md)
- [agents/bike-coach/README.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/agents/bike-coach/README.md)
- [agents/listing-monitor-agent/README.md](/C:/Users/yangc/.codex/worktrees/f4de/Mandy's Bike Finder Project/agents/listing-monitor-agent/README.md)

## How To Continue From Here

If continuing on Windows:

- Keep product/docs/Vercel work centered in `app/` and `docs/`.
- Avoid making the legacy `web/` folder the source of new product changes.
- Treat `src/listing_monitor/` as historical unless explicitly reviving that subsystem.

If continuing on Mac:

1. Pull the latest GitHub `main`.
2. Confirm build `1.0 (2)` has finished processing in App Store Connect.
3. Add it to an internal TestFlight group.
4. Install from TestFlight and run the short internal QA checklist.
5. Continue App Store screenshot and metadata preparation.

If continuing the legacy listing monitor:

1. Read `agents/listing-monitor-agent/AGENT_SPEC.md`.
2. Follow `docs/operations/local-runbook.md`.
3. Keep secrets in local `.env` and `config.yaml`, never in Git.

## What Not To Change Without Confirmation

- Do not point the iOS shell at `www.mandysbikefinder.com`.
- Do not expose provider keys through `NEXT_PUBLIC_*` variables.
- Do not re-enable hidden App Store-risky features in App Store MVP mode:
  - email report
  - PDF export
  - Bike Scout waitlist
  - payment/subscription
  - account/login
  - automated marketplace scraping
- Do not turn Mandy Bike Coach into a generic chatbot without product review.
- Do not treat `src/listing_monitor/` as the primary product without explicit confirmation.
- Do not remove the public web MVP unless that product decision is explicit.
- Do not force-push or rewrite GitHub history casually.

## Suggested Next Codex Prompts

For Mac/Xcode continuation:

- `Open the iOS wrapper on this Mac, validate signing, and prepare the first TestFlight build.`
- `Run a simulator QA pass for the hosted App Store MVP on iPhone sizes and report blockers.`
- `Prepare App Store screenshots and final App Review notes from the current hosted app.`

For product/repo hygiene:

- `Review the docs for stale statements that still describe the old web MVP as the current product.`
- `Prepare a release candidate checklist for Mandy's Bike Finder App Store MVP.`

For the agent subsystems:

- `Audit Mandy Bike Coach against the current homepage UI and confirm the docs match the shipped behavior.`
- `Review the historical listing monitor docs for any remaining Windows-only assumptions before Mac setup.`

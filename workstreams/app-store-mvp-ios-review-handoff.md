# Workstream: App Store MVP iOS Review Handoff

Last updated: 2026-06-06

## Objective

Prepare Mandy's Bike Finder so the App Store MVP can be resumed and completed reliably from either Windows or Mac, with GitHub as the source of truth and the iOS/TestFlight path ready for macOS continuation.

## Scope

In scope:

- App Store MVP product surface in `app/`
- Hosted Vercel app flow for `app.mandysbikefinder.com`
- App Store readiness docs
- Capacitor/iOS wrapper handoff and TestFlight preparation
- GitHub backup/synchronization documentation

Out of scope:

- Reworking the legacy `web/` prototype into the active surface
- Expanding the historical Python listing monitor
- New Bike Scout backend/payment/account work

## Main Purpose Of This Workstream

This workstream turns the current App Store MVP into a handoff-safe state: understandable without Codex thread history, reproducible across machines, and ready to continue on a Mac where Xcode is available.

## Agent-Related

No for the primary workstream.

Notes:

- The active workstream is product/iOS handoff work.
- The repository also contains a historical agent-style subsystem in `src/listing_monitor/`, documented separately under `agents/listing-monitor-agent/`.

## Main Files And Folders Involved

- `app/`
- `app/app/page.tsx`
- `app/app/privacy/page.tsx`
- `app/lib/server/`
- `app/capacitor.config.ts`
- `app/ios/`
- `docs/product/`
- `docs/workstreams/`
- `docs/roadmap.md`

## Files Created Or Updated In This Handoff Pass

- `README.md`
- `PROJECT_STATUS.md`
- `CODEX_HANDOFF.md`
- `.gitignore`
- `workstreams/app-store-mvp-ios-review-handoff.md`
- `agents/listing-monitor-agent/README.md`
- `agents/listing-monitor-agent/AGENT_SPEC.md`
- `agents/listing-monitor-agent/TASKS.md`

## Key Decisions

- GitHub is the durable project/system-of-record layer across devices.
- The active product path is `app/`, not `web/`.
- The App Store MVP should remain isolated from the public web MVP.
- The current workstream should be documented separately from the historical listing-monitor agent subsystem.
- No destructive file moves are needed right now. Documentation layers are enough.

## Current Implementation Status

- Hosted App Store MVP is live and functionally close to App Review readiness.
- OCR works server-side when enabled in Vercel.
- Capacitor dependencies/config and generated iOS project exist.
- Simulator and physical-device QA have passed.
- Version `1.0` build `3` has been archived and uploaded to App Store Connect.
- Final continuation work depends on Apple processing, internal TestFlight QA, screenshots, and App Store metadata.

## Next Steps

1. Confirm build `1.0 (3)` has finished processing in App Store Connect.
2. Add build `1.0 (3)` to the internal TestFlight group.
3. Install it from TestFlight and complete the short internal QA checklist.
4. Capture final App Store screenshots and complete the remaining metadata.
5. Verify the support email flow before App Review submission.

## Open Questions

- Will HEIC screenshot selection work cleanly in the iOS WebView path, or should v1 explicitly steer users toward PNG/JPG screenshots?
- Should the historical `web/` and `src/listing_monitor/` tracks eventually move into clearer `legacy/` or `experimental/` directories, or is documentation enough for now?
- Will App Store submission use the current bundle ID `com.mandysbikefinder.app`, or should it be renamed before App Store Connect setup?

## Connections To Other Workstreams

- Depends on `docs/workstreams/frontend-ux.md` for mobile/product surface decisions.
- Depends on `docs/workstreams/infra-deployment.md` for hosted deployment boundaries.
- Depends on `docs/product/capacitor-readiness-checklist.md` and `docs/product/xcode-testflight-preparation.md` for iOS continuation.
- Adjacent to the historical listing-monitor agent work, but not blocked by it.

# Mobile App Shell Audit

Status: Initial implementation checklist  
Last updated: 2026-05-24

## Goal

Prepare Mandy's Bike Finder to feel credible as an App Store app before adding a Capacitor iOS wrapper.

This audit is intentionally scoped to mobile-first app shell readiness. It does not implement Capacitor, native plugins, payments, user accounts, or background monitoring.

## Current Strengths

- The production app already lives in `/app` as a Next.js App Router application.
- The core Free Bike Check flow is progressive: Rider, Listing, Review, Result.
- Expensive AI work is user-triggered, not automatic on page load.
- Manual entry remains available when screenshot, link, or provider extraction fails.
- The current flow already matches mobile parent behavior: screenshot, pasted link/text, and quick seller-message/report actions.
- Server-side API routes keep OpenAI, email, CRM, and future search credentials out of frontend code.

## Mobile App-Like UX Requirements

Before wrapping with Capacitor, verify the following on iPhone-sized screens:

- First screen clearly starts the usable tool, not a marketing-only page.
- Primary actions fit without horizontal scroll at 320px width.
- Step navigation remains readable and tappable.
- Touch targets are at least roughly 44px high for buttons, tabs, and key controls.
- Form fields do not jump behind the keyboard during normal entry.
- Screenshot upload is easy to find and does not auto-trigger AI extraction.
- Screenshot preview preserves aspect ratio and can be dismissed reliably.
- Review fields remain editable after extraction.
- Result view prioritizes the verdict, fit/value/safety dimensions, seller message, and email report.
- Offline/unavailable state is clear without blocking local guidance.

## Safe-Area And Shell Checks

Implemented foundation:

- `viewportFit: "cover"` is configured in Next metadata.
- The app shell uses safe-area-aware padding.
- Offline state is shown as an app-level banner.
- A standalone PWA manifest is available at `/manifest.webmanifest`.
- A simple `/offline` page explains which features require a server connection.

Still to verify manually:

- Top content does not collide with iOS status bar in standalone display mode.
- Sticky offline banner does not cover step navigation.
- Bottom content and buttons are not hidden behind the iOS home indicator.
- Modal screenshot preview remains usable in portrait orientation.

## Known Mobile Risks

- The homepage still has a visually rich hero before the tool; on iOS this must not make the app feel like a website wrapper.
- The three-tab listing input control may feel dense on very narrow screens.
- The Review step has many fields; keyboard ergonomics should be tested on a real iPhone.
- The result/report area may be long on mobile and should be checked for action discoverability.
- Uploaded screenshots can be large, so mobile memory/performance should be watched during extraction prep.

## Recommended Follow-Up Tasks

1. `[UX] iPhone Flow QA`
   Run the full Rider -> Listing -> Review -> Result flow at 320px, 375px, and 430px widths and record any overflow, cramped controls, or awkward scroll jumps.

2. `[UX] Mobile Result Actions Polish`
   Make the result, seller message, and email report actions easy to scan on a small screen after analysis.

3. `[Build] Capacitor Feasibility Spike`
   After mobile UX and privacy docs are accepted, create a branch-only proof of concept that wraps the hosted app/backend path without changing production behavior.

## App Store MVP Scope

The App Store MVP should reorganize the current web flow into a smaller mobile app:

- `Profile`: child profile, local save, and bike fit matching.
- `Evaluate`: screenshot, pasted link/text, manual fields, review, and recommendation.
- `History`: saved local evaluations and shortlist/favorites.
- `Settings`: privacy, local data controls, AI disclosure, and about/disclaimer.

UX priority for v1:

- The first screen should feel useful immediately.
- History should replace email report as the main save/share-adjacent value.
- Email report, PDF export, Bike Scout, payments, accounts, and push notifications should be hidden or deferred.
- AI should be presented as optional assistance, not the default engine.
- Marketplace links should be treated as user-provided context, not automated scraping.

# Capacitor iOS Wrapper Readiness Checklist

Status: iOS platform generated; hosted OCR live; Xcode validation pending
Last updated: 2026-05-30

## Purpose

This checklist decides whether Mandy's Bike Finder App Store MVP is ready to enter the Capacitor / TestFlight phase. It does not add Capacitor, native dependencies, iOS project files, or API changes.

## Current Readiness Assessment

| Area | Current status | Notes |
| --- | --- | --- |
| App Store MVP mode | Ready | Enabled with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`. `https://app.mandysbikefinder.com/` currently shows the four-tab App Store MVP surface. Default web MVP remains available on `www`. |
| Environment flag clarity | Ready | README now includes local and Vercel Preview instructions for the flag. |
| App shell | Mostly ready | Four tabs exist: `Profile`, `Evaluate`, `History`, `Settings`. Bottom nav and safe-area-aware spacing are implemented. |
| Mobile friendliness | Ready for next QA pass | 390px smoke checks have passed in prior QA. Continue checking real iPhone sizes before TestFlight. |
| PWA metadata | Basic foundation ready | `app/app/layout.tsx` includes manifest, theme color, Apple standalone metadata, viewport fit, and app icons. |
| Manifest | Basic foundation ready | `app/public/manifest.webmanifest` exists with standalone display, portrait orientation, theme/background colors, categories, and icon reference. |
| Icons | Needs production assets | Current icon path uses `/icon.svg`. App Store / iOS will need production icon sizes and possibly splash assets. |
| Privacy page | Close-to-final draft ready | Public route `/privacy` exists and uses `support@mandysbikefinder.com` as the support/privacy contact. Confirm the mailbox works before submission. |
| Settings data controls | Ready | App Store MVP Settings can clear child profile, history, and all App Store MVP local data. |
| Initial load AI behavior | Ready by current QA | Initial load has been verified to use `/api/status` only; no OpenAI/LLM call observed. |
| Server-side API boundary | Ready conceptually | OpenAI/Resend/provider keys remain server-side. App Store MVP uses local fallback analysis and no client provider keys. |
| Default web MVP | Ready | `https://www.mandysbikefinder.com/` still shows the default web MVP and not the App Store tab shell. |
| App Store metadata | Draft ready | `docs/product/app-store-listing-metadata.md` exists. |
| App Review notes | Draft ready | Metadata and privacy docs include no-account, no-payment, no-scraping, optional-AI notes. |
| Capacitor dependencies/config | Added | `@capacitor/core`, `@capacitor/ios`, and `@capacitor/cli` are installed under `app/`; `app/capacitor.config.ts` points the shell at `https://app.mandysbikefinder.com`. |
| iOS platform files | Generated | `app/ios/` exists. `cap add ios` and `cap sync` completed successfully. |
| iOS screenshot permissions | Ready for Xcode validation | `Info.plist` includes camera and photo library usage descriptions for screenshot selection/capture. |
| Screenshot OCR | Live on hosted app | `https://app.mandysbikefinder.com/api/extract` returns OpenAI extraction results when AI env vars are enabled. OCR remains user-triggered only. |
| Xcode validation | Pending on macOS | `cap doctor` fails on Windows because Xcode is not installed. This is expected and must be completed on macOS. |

Readiness summary:

> The hosted URL blocker is cleared, OCR is live on the app project, Capacitor dependencies/config are in place, and native iOS project files have been generated. The next implementation step is macOS/Xcode validation and TestFlight preparation.

## Hosted Web Build Strategy Validation

The first Capacitor MVP should use a hosted Vercel app strategy:

```text
iOS Capacitor shell
-> hosted Vercel App Store MVP web app
-> hosted Vercel API routes for server-side functions
```

Validation findings:

- Current client-side API calls use relative `/api/...` paths, which work naturally when the iOS shell loads the hosted Vercel origin.
- No new public API base URL variable is required for the first hosted strategy.
- `NEXT_PUBLIC_APP_STORE_MVP_MODE=true` must be enabled in the hosted deployment loaded by the iOS shell.
- OpenAI, Resend, Salesforce, search, and other provider secrets must remain server-side only.
- Do not bundle Next.js API routes into the iOS app.
- Do not add Capacitor until the exact TestFlight hosted URL is chosen.

The detailed validation lives in `docs/product/capacitor-web-build-strategy.md`.
Hosted URL QA and Vercel setup instructions live in `docs/product/hosted-app-store-mvp-url-qa.md`.
Xcode/TestFlight preparation details live in `docs/product/xcode-testflight-preparation.md`.

## Capacitor Architecture Recommendation

Recommended architecture:

```text
iOS Capacitor shell
-> loads the App Store MVP web experience
-> calls hosted Vercel API routes for protected server-side functions
```

Key guardrails:

- Next.js API routes should not be treated as a local iOS backend. They must remain hosted server routes.
- OpenAI, Resend, report generation, provider status, future logging, and any protected provider work must continue to run on Vercel/server-side infrastructure.
- The iOS app needs a clear API base URL strategy before Capacitor is added.
- The first App Store MVP should avoid complex native plugins. Use Capacitor primarily as a wrapper unless a native capability is absolutely required.
- Provider keys must never be bundled into the iOS app.

Suggested API base URL approach:

- For initial TestFlight: point the wrapper to `https://app.mandysbikefinder.com/` once configured, or a stable Vercel Preview/staging URL with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`.
- For production App Store: point to `https://app.mandysbikefinder.com/` with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`.
- Keep `https://www.mandysbikefinder.com/` as the public web MVP unless the product intentionally changes that surface later.
- Avoid hard-coding secrets or provider keys in any client-side Capacitor config.

## Hosted WebView vs Bundled Web Build

### Option 1: Hosted Vercel App Inside Capacitor

Description:

- The Capacitor shell loads the hosted Vercel app URL.
- API routes stay naturally available on the same hosted origin.
- App Store MVP mode is controlled by deployment environment variables.

Pros:

- Best Next.js compatibility for the current codebase.
- Simplest API routing because Vercel API routes stay hosted.
- Faster content and bug-fix updates through Vercel deploys.
- Keeps OpenAI/Resend/provider work safely server-side.
- Lower implementation complexity for first TestFlight.

Cons:

- Higher App Review thin-wrapper risk if the app feels like a plain website.
- Requires network for the full experience, though local browser/device data can still persist.
- Must make the app-like shell, privacy controls, and native-feeling first screen obvious in review.

Review risk mitigation:

- Launch directly into the four-tab App Store MVP shell.
- Hide web-only surfaces: email report, PDF, Bike Scout, waitlist, payment, account/login, push, marketplace automation.
- Use Review Notes to explain the local utility, no account, no payment, no scraping, optional AI, and Settings data controls.

### Option 2: Bundled Static Web Assets If Feasible

Description:

- Build static assets and bundle them into the iOS app.
- Remote API calls use an explicit hosted API base URL.

Pros:

- Better offline shell availability.
- Can feel less like a hosted website if carefully packaged.
- App startup is less dependent on remote document loading.

Cons:

- Current Next.js app includes API routes and server-side behavior that cannot be bundled as an iOS backend.
- Requires validating static export compatibility, routing behavior, asset paths, and API base URL handling.
- More complexity before TestFlight.
- Updates require App Store/TestFlight builds unless remote configuration is added.

Review risk mitigation:

- Still must avoid thin-wrapper feel through app-like UX, local state, and clear value.
- Still must call hosted Vercel APIs for protected work.

### Recommendation For Near-Term MVP

Use the hosted Vercel app strategy first for a Capacitor feasibility spike and early TestFlight preparation.

Reasoning:

- The current product is a Next.js/Vercel app with API routes and server-side provider boundaries.
- Hosted Vercel preserves the safest OpenAI/Resend/API-key model.
- It is the fastest path to validate App Store review risks, iOS shell behavior, safe areas, and TestFlight operations.
- Bundled static assets can be revisited later if offline-first behavior becomes a real requirement.

Important caveat:

> Hosted WebView does not remove App Review 4.2 minimum-functionality risk. The App Store MVP must continue to look and behave like a focused app: four tabs, local saved state, Settings data controls, privacy disclosure, and no marketing-first homepage.

## Pre-Capacitor Blockers

Must be addressed before adding Capacitor dependencies:

- Decide hosted URL/API base URL strategy for TestFlight and production. Preferred final URL: `https://app.mandysbikefinder.com/`.
- Do not use `https://www.mandysbikefinder.com/` for the iOS shell while it remains the public web MVP.
- Confirm `NEXT_PUBLIC_APP_STORE_MVP_MODE=true` deployment target for iOS preview.
- Create production App Store icon set and splash/launch asset checklist.
- Confirm `support@mandysbikefinder.com` receives support/privacy mail.
- Decide final App Store review notes based on exact shipped AI behavior.
- Confirm App Store screenshots plan and capture real mobile app-shell screens.
- Confirm no provider keys or secrets appear in client bundle.
- Confirm App Store MVP Settings data controls are visible and working.
- Confirm local data keys remain scoped to `mbf.appStore.*`.
- Confirm no automatic AI calls on load/upload/paste.
- Confirm no automatic marketplace scraping or login-gated page automation.
- Run mobile QA on at least one small iPhone-sized viewport and one larger iPhone-sized viewport.
- Decide bundle ID placeholder and app display name.
- Decide whether TestFlight should target Vercel Preview, staging, or production.

Non-blocking but recommended before TestFlight:

- Split App Store MVP components out of the large `page.tsx` file to reduce future maintenance risk.
- Keep Settings version aligned with the App Store Connect version/build before submission.
- Confirm final support/privacy contact email is live.

## Capacitor Implementation Plan

These tasks should be completed later. This checklist does not execute them.

### 1. `[Infra] Add Capacitor Dependencies And Config`

Scope:

- Add Capacitor packages.
- Initialize Capacitor config.
- Choose hosted app URL strategy or validate static web directory strategy.

Acceptance criteria:

- No provider keys are added to client config.
- Existing web MVP still builds.
- App Store MVP mode remains controlled intentionally.

Risks:

- Pulling native project complexity into the repo too early.
- Misconfiguring hosted URL or asset path.

Status:

- Complete. `app/capacitor.config.ts` uses `https://app.mandysbikefinder.com` as the hosted URL.
- Native iOS project files have been generated in `app/ios/`.

### 2. `[Infra] Configure iOS App Identity And Bundle ID Placeholder`

Scope:

- Add placeholder bundle ID.
- Set app name/display name.
- Document Apple Developer/App Store Connect values needed.

Acceptance criteria:

- Bundle ID decision is documented.
- No production secrets are added.

Risks:

- Mismatch between local Xcode config and App Store Connect record.

### 3. `[Build] Validate Web Build Strategy For Capacitor`

Scope:

- Decide hosted WebView vs static bundle for the first TestFlight.
- Confirm API base URL behavior.
- Confirm routing for `/`, `/privacy`, and `/offline`.

Acceptance criteria:

- iOS shell can open the App Store MVP surface.
- `/privacy` remains reachable.
- API calls still go to Vercel/server-side routes.

Risks:

- Static export incompatibility with current Next.js API routes.
- Hosted strategy increases review scrutiny if app-like UX is weak.

### 4. `[Build] Generate Icons/Splash Assets Checklist`

Scope:

- Define required iOS icon sizes.
- Define launch/splash asset approach.
- Confirm current `/icon.svg` is not enough for final App Store submission.

Acceptance criteria:

- Asset list is complete before Xcode archive.
- No placeholder icons are shipped accidentally.

Risks:

- App Store submission rejection or poor presentation due to incomplete assets.

### 5. `[Build] Xcode/TestFlight Preparation Notes`

Scope:

- Document Xcode version, signing team, bundle ID, provisioning, archive, and upload steps.
- Document TestFlight tester instructions and known App Store MVP flows.

Acceptance criteria:

- A reviewer/tester can install and run through Profile -> Evaluate -> History -> Settings.

Risks:

- Signing/provisioning friction.
- TestFlight build pointing to wrong hosted environment.

### 6. `[Build] App Store Review Smoke Test`

Scope:

- Run the exact App Review path.
- Confirm no account, payment, scraping, automatic AI, or broken privacy link.
- Confirm Settings data controls.

Acceptance criteria:

- Review notes match shipped behavior.
- Initial load does not trigger OpenAI/LLM.
- `/privacy` is reachable.

Risks:

- Review notes drift from product behavior.
- App Store MVP mode accidentally not enabled in the submitted build.

## Verification Guidance

Docs-only task status:

- No code was changed for this checklist.
- No lint/build run is required for this document-only planning update.

When the Capacitor spike begins, run:

```powershell
cd app
npm.cmd run lint
npm.cmd run build
```

And manually verify:

- App Store MVP mode: `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`
- Default web mode: `NEXT_PUBLIC_APP_STORE_MVP_MODE=false` or unset
- `/privacy`
- `/offline`
- Initial network behavior: `/api/status` only before explicit user actions

## Decision

Capacitor dependencies and hosted config are now added. Native iOS project generation remains separate.

Recommended next step:

> `[Build] Xcode And TestFlight Preparation Pass`

## Hosted Deployment Status

Inspection date: 2026-05-26

Current Vercel state:

- `origin/main` is at `9729d72`.
- `https://app.mandysbikefinder.com/` loads successfully and shows the App Store MVP tab shell by default.
- The isolated app-project URL `https://mandys-bike-finder-app.vercel.app/` also loads successfully.
- `www.mandysbikefinder.com` loads the default web MVP, which should remain unchanged.
- The connected Vercel MCP timed out during metadata inspection, so deployment commit/state should be confirmed in the Vercel dashboard before final TestFlight configuration.

Capacitor readiness decision:

- Hosted URL QA passed for `https://app.mandysbikefinder.com/`.
- Public `www` regression passed.
- Capacitor iOS platform files were generated with `cap add ios`.
- `cap sync` completed successfully.
- Keep provider secrets out of Capacitor config and continue using hosted Vercel API routes for protected work.
- Complete Xcode validation on macOS before TestFlight.

Remaining non-blocking pre-TestFlight items:

- Confirm deployment commit/state in the Vercel dashboard because MCP metadata inspection timed out.
- Test screenshot file picker behavior inside the actual iOS WebView after Capacitor exists.
- Replace Settings version placeholder with native app/build version metadata.
- Configure Apple signing team, bundle ID, icons, launch screen, and app display metadata in Xcode.
- Follow `docs/product/xcode-testflight-preparation.md` on macOS.

Direct setup capability check:

- Current connected Vercel tools can inspect the existing project but do not expose safe write operations for creating the separate app project, adding the `app` domain, or setting env vars.
- Local Vercel CLI and `VERCEL_TOKEN` are not available in this workspace.
- Manual Vercel setup remains required before Capacitor.
- A re-check after reconnecting the Vercel app still found no safe write path for creating `mandys-bike-finder-app`.

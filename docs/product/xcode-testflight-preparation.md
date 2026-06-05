# Xcode And TestFlight Preparation

Status: Close-to-final web/App Store MVP ready for macOS/Xcode validation  
Last updated: 2026-05-30

## Purpose

This checklist continues the Capacitor iOS wrapper work after `app/ios/` has been generated. It does not change API behavior, provider keys, App Store MVP web behavior, or the public `www` web MVP.

## Current iOS Project State

Generated files:

- Native project directory: `app/ios/`
- Capacitor config: `app/capacitor.config.ts`
- Synced native config: `app/ios/App/App/capacitor.config.json`

Current native settings:

| Setting | Current value |
| --- | --- |
| App ID / bundle identifier | `com.mandysbikefinder.app` |
| App name | `Mandy's Bike Finder` |
| Hosted URL | `https://app.mandysbikefinder.com` |
| Cleartext traffic | `false` |
| iOS deployment target | `15.0` |
| Marketing version | `1.0` |
| Build number | `1` |
| App icon asset catalog | `AppIcon` |
| Launch screen | `LaunchScreen` storyboard with generated `Splash` asset |

Validation already completed on Windows:

- `npm.cmd run cap:add:ios`: passed.
- `npm.cmd run cap:sync`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed.
- `NEXT_PUBLIC_APP_STORE_MVP_MODE=true npm.cmd run build`: passed.
- `npm.cmd run cap:doctor`: reaches expected Windows blocker: Xcode is not installed.

GitHub handoff status:

- Capacitor iOS baseline was pushed to `origin/main` at commit `3cacd08`.
- Post-push hosted sanity check confirmed `https://app.mandysbikefinder.com/` still opens App Store MVP mode.
- Post-push `www` regression check confirmed `https://www.mandysbikefinder.com/` still opens the default web MVP.

## Security And Privacy Static Check

Current native project check:

- No OpenAI, Resend, Salesforce, or provider secret values were found in `app/capacitor.config.ts` or `app/ios/`.
- The iOS wrapper uses the hosted HTTPS URL and keeps provider work on Vercel API routes.
- `Info.plist` includes camera and photo library usage descriptions for screenshot selection/capture through the iOS WebView file picker.
- No microphone, tracking, background-mode, account, payment, or push capabilities are currently present.
- Screenshot upload remains the web file picker flow; no extra native image-processing plugin is included.

## macOS Setup Steps

On a macOS machine with Xcode installed:

```bash
cd app
npm install
npm run cap:doctor
npm run cap:sync
npm run cap:open:ios
```

Expected result:

- `cap:doctor` should pass or only report fixable local Xcode/toolchain setup items.
- `cap:open:ios` should open the `App` project in Xcode.

## Xcode Configuration Checklist

In Xcode:

- Confirm the project opens without missing package/plugin errors.
- Set the Apple Developer Team under Signing & Capabilities.
- Confirm bundle identifier: `com.mandysbikefinder.app`.
- Confirm display name: `Mandy's Bike Finder`.
- Confirm version/build:
  - Version: `1.0`
  - Build: `1`
- Confirm iOS deployment target is acceptable for first TestFlight. Current target is `15.0`.
- Confirm App Transport Security allows the HTTPS hosted URL without adding broad exceptions.
- Confirm no unnecessary native capabilities are enabled.
- Confirm camera/photo permission prompts, if shown by the iOS file picker path, match the `Info.plist` explanations.
- Confirm no tracking, microphone, background mode, account, payment, or push permission prompts appear.

## App Assets Checklist

Before TestFlight:

- Replace generated placeholder app icon with production App Store icon assets.
- Confirm icon has no transparency and satisfies Apple icon requirements.
- Replace or polish generated splash/launch asset if it looks generic.
- Confirm launch screen does not imply offline/native functionality the hosted app does not provide.
- Capture five App Store screenshots from the App Store MVP surface: Profile, Evaluate with AI extraction, Result, History, Settings/privacy.

## Simulator QA Checklist

Run the app in at least one small and one large iPhone simulator:

- App launches directly into `https://app.mandysbikefinder.com/`.
- `Profile`, `Evaluate`, `History`, and `Settings` tabs are visible.
- No public web MVP hero/long page appears.
- Safe area and bottom navigation do not overlap the home indicator.
- Profile local save and reload persistence work.
- Evaluate manual entry generates a local fallback result.
- Save to History works.
- History reload persistence works.
- Settings clear profile, clear history, and clear all local data work.
- `/privacy` and `/offline` are reachable.
- Screenshot/file picker flow works in iOS WebView.
- AI screenshot extraction returns editable listing fields after the user taps `Extract details with AI`.
- AI extraction failure or rate-limit states still leave manual entry and local analysis available.
- Initial load does not trigger OpenAI/LLM.
- Screenshot selection does not trigger AI.
- Pasting link/text does not scrape marketplace pages.
- No email/PDF/Bike Scout/waitlist/payment/account/push/marketplace automation surfaces are visible.

## TestFlight Archive Checklist

Before uploading:

- Confirm App Store Connect app record exists for the bundle ID.
- Confirm Apple Developer account/team is selected in Xcode.
- Confirm signing is valid on a physical device or simulator as appropriate.
- Archive with `Any iOS Device` target selected.
- Validate archive in Xcode Organizer.
- Upload to App Store Connect.
- Add App Review/TestFlight notes:
  - No account required.
  - No payment/subscription.
  - No automatic marketplace scraping.
  - AI only runs after explicit user action if enabled.
  - Local fallback works without AI.
  - Profile and History are stored locally.
  - Settings contains local data controls.
  - Hosted Vercel API routes keep provider keys server-side.
  - Screenshot OCR is user-triggered; selecting a screenshot alone only creates a local preview.

## Known Follow-Ups

- Finalize production app icon and splash assets.
- Confirm `support@mandysbikefinder.com` is receiving mail before App Store submission.
- Capture App Store screenshots from the four-tab app shell.
- Confirm Vercel app project deployment commit/state in dashboard before the first external TestFlight.

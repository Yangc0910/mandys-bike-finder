# Xcode And TestFlight Preparation

Status: Version 1.1 build 4 uploaded to App Store Connect; Apple processing pending
Last updated: 2026-06-11

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
| Marketing version | `1.1` |
| Build number | `4` |
| Apple Developer Team | `H23DM6J89F` |
| App icon asset catalog | `AppIcon` |
| Launch screen | `LaunchScreen` storyboard with generated `Splash` asset |

Validation now completed on macOS:

- `npm install`: passed.
- `npx cap sync ios`: passed.
- `npm run cap:doctor`: passed.
- Xcode Debug simulator build: passed.
- Generic iPhone Release build with code signing disabled: passed.
- iPhone 17 Pro install and launch: passed.
- iPhone 17e cold-launch check: passed after hosted content loaded.
- Profile save/reload persistence: passed.
- Manual local evaluation and History save/detail: passed.
- Settings clear-history and clear-all controls: passed.
- Production-style 1024x1024 RGB app icon with no alpha: installed and verified.
- Physical iPhone 17 Pro Max signing, installation, launch, and core-flow QA: passed.
- Branded launch screen matching the app icon: installed and verified in build `2`.
- Release archive for version `1.0` build `2`: passed.
- Listing-title parsing and seller-message punctuation regression checks: passed.
- Release archive for version `1.0` build `3`: passed.
- App Store Connect upload for build `1.0 (3)`: succeeded on June 6, 2026.
- Export-compliance confirmation: completed.
- Internal TestFlight group assignment: active, status `Testing`.
- Version `1.1` build `4` unsigned release archive: passed on June 11, 2026.
- Version `1.1` build `4` automatically signed release archive: passed on June 11, 2026.
- App Store Connect distribution export and signature verification: passed.
- App Store Connect upload for build `1.1 (4)`: succeeded on June 11, 2026; Apple reported that the package entered processing.
- The uploaded archive points to `https://app.mandysbikefinder.com`. Do not treat TestFlight installation as v1.1 feature verification until the accepted v1.1 web release is deployed to that hosted URL, or a new build is archived against an approved staging URL.

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
- Confirm the stored Apple Developer Team remains `H23DM6J89F`.
- Confirm bundle identifier: `com.mandysbikefinder.app`.
- Confirm display name: `Mandy's Bike Finder`.
- Confirm version/build:
  - Version: `1.1`
  - Build: `4`
- Confirm iOS deployment target is acceptable for first TestFlight. Current target is `15.0`.
- Confirm App Transport Security allows the HTTPS hosted URL without adding broad exceptions.
- Confirm no unnecessary native capabilities are enabled.
- Confirm camera/photo permission prompts, if shown by the iOS file picker path, match the `Info.plist` explanations.
- Confirm no tracking, microphone, background mode, account, payment, or push permission prompts appear.

## App Assets Checklist

Before TestFlight:

- Production-style App Store icon is installed.
- Icon is 1024x1024 RGB with no transparency and renders correctly on the simulator home screen.
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

June 6 simulator result:

- Core local flows passed on iPhone 17 Pro.
- Cold launch passed on iPhone 17e.
- File-picker and HEIC behavior remain assigned to physical-device QA.

## Physical iPhone QA Checklist

Preparation:

- Connect the iPhone by cable for the first run.
- Unlock the iPhone and tap Trust if prompted.
- In iOS Settings, enable Developer Mode if Xcode requests it, then restart the iPhone.
- In Xcode, open `app/ios/App/App.xcodeproj`.
- Select the `App` scheme and the connected iPhone.
- Under `App` target > Signing & Capabilities, enable automatic signing and select the Apple Developer Team.
- Confirm the bundle identifier remains `com.mandysbikefinder.app`.

Test pass:

- Build and launch on the connected iPhone.
- Confirm the app opens the four-tab App Store MVP, not the public web MVP.
- Save a rider profile, force-quit the app, reopen it, and confirm persistence.
- Select a PNG or JPG screenshot from Photos; confirm selection alone does not start AI.
- Tap the explicit AI extraction action; confirm editable listing fields appear.
- Repeat with an HEIC image and record whether preview and extraction both work.
- Complete a manual evaluation and save it to History.
- Force-quit and reopen; confirm Profile and History remain saved.
- Test favorite, detail, delete, clear-history, and clear-all controls.
- Turn on Airplane Mode, reopen the app, and confirm the offline state is understandable.
- Restore connectivity and confirm the app recovers without reinstalling.
- Confirm no unexpected camera, microphone, tracking, notification, or location prompts appear.
- Capture screenshots of any failed screen plus the full Xcode error and device console message.

## TestFlight Archive Checklist

Before uploading:

- Confirm App Store Connect app record exists for the bundle ID.
- Confirm Apple Developer account/team is selected in Xcode.
- Confirm signing is valid on a physical device or simulator as appropriate.
- Increment the build number before every later upload attempt; App Store Connect does not accept a reused build number.
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
- Keep build `1.1 (4)` in internal testing only until its hosted URL serves the accepted v1.1 release candidate.

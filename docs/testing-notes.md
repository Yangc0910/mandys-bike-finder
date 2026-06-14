# Testing Notes

# Version 1.2 TestFlight Candidate Preparation

Prepared on 2026-06-13:

- Advanced the native iOS target to marketing version `1.2`, build `5`.
- Confirmed the generated Capacitor configuration still points to `https://app.mandysbikefinder.com`.
- `npm run cap:doctor` passed with the existing Capacitor 8.3.4 iOS project.
- `npm run cap:sync` passed without producing unexpected tracked-file changes.
- Generic iOS Release archive with signing disabled passed.
- Automatically signed generic iOS Release archive passed using the existing development identity.
- Added a reusable App Store Connect export configuration and bilingual v1.2 submission copy.
- Xcode's stale Apple Account session was removed and the same Apple Account was signed in again.
- App Store Connect export used the existing store profile and Apple Distribution identity successfully.
- Build `1.2 (5)` uploaded successfully on June 14, 2026, and Apple reported that the package entered processing.
- App Store Connect completed the upload at 12:12 AM EDT, but the build stayed unavailable in TestFlight because export compliance was missing.
- Completed the compliance answer on June 14 and confirmed `1.2 (5)` changed to Testing in the existing `Internal Testing` group with one tester.
- Added `ITSAppUsesNonExemptEncryption = false` to the native Info.plist to prevent future builds from stopping at the same compliance gate.

Production release and hosted acceptance completed on June 14, 2026:

- Pull request `#2` merged into `main` at commit `eb551c7`.
- App deployment `dpl_GNuw7geVAacs8HjFNaaEzvYpNgne` reached `READY` and received the `app.mandysbikefinder.com` alias.
- Public-site deployment `dpl_Bnoz2LECcHTAssjKmHXmAF3xZxhd` reached `READY`; `www.mandysbikefinder.com` continued returning `200`.
- Production `/`, `/privacy`, `/offline`, and `/api/status` returned `200`; `/api/status` reported `ok: true`.
- Settings displayed App Store MVP version `1.2`.
- In the live Simplified Chinese UI, two new evaluations with different titles, prices, and wheel sizes were saved. History displayed both new records plus the existing record, for three records total.
- After switching from Chinese to English and back to Chinese, a reload preserved the Chinese selection and all three History records.
- Browser console inspection found no errors.
- Vercel runtime inspection found no `error` or `fatal` entries for either production deployment during the release window.

The paired iPhone 17 Pro Max remains available for acceptance testing. Build `1.2 (5)` is enabled for the internal tester, but the upgrade from `1.1 (4)` must remain pending until TestFlight finishes syncing it to the device. Install it without deleting the app, then verify the existing Profile and History, exact-repeat deduplication, destructive controls, and force-quit persistence.

## Version 1.2 Simplified Chinese App Store Screenshots

Captured and exported on June 14, 2026:

- Used the iOS 26.5 iPhone 17 Pro Max simulator at the Apple-accepted `1320 x 2868` portrait size.
- Set the simulator to Simplified Chinese, Light appearance, `9:41`, full Wi-Fi/cellular signal, and a charged battery.
- Captured six native fixture states: Profile, Profile edit, Evaluate, Result, History, and Settings/privacy.
- The fixture used only repository-owned fictional data and made page plus `/api/status` requests; no extraction, analysis, message, report, email, or marketplace request occurred.
- Added a reusable `npm run export:app-store-screenshots:zh-Hans` command while preserving the existing English export behavior.
- Generated six final Simplified Chinese marketing PNG files at `1320 x 2868`, RGB, with no alpha channel.
- Visually checked headline wrapping, supporting copy, native capture placement, active tabs, fixture content, and data-control messaging across all six frames.
- Restored the generated Capacitor configuration to `https://app.mandysbikefinder.com`, cleared the status-bar override, and shut down the simulator after capture.

Local artifact paths:

- `artifacts/app-store/v1.2/zh-Hans/source/`
- `artifacts/app-store/v1.2/zh-Hans/final/`

## Version 1.1 Mobile Regression Pass

Validated locally on 2026-06-11:

- `npm run lint`, `npm run build`, `npm run build:screenshots`, and `npm run cap:doctor`: passed.
- `npm run test:copy`: all three listing-copy tests passed.
- Fresh Profile setup, version 1.0 local-data hydration, edit, recommendation, and Evaluate handoff passed at `320 x 700` without horizontal overflow.
- Manual listing entry produced the expected local Fit, Deal, Risk, next-step, and seller-message result without calling extraction or analysis APIs.
- Saving the same evaluation twice retained one History record; favorite state, expanded saved detail, and all saved snapshots persisted after reload.
- Settings reported the correct local Profile and History counts. Destructive controls still open confirmation before changing local data.
- `/privacy` and `/offline` returned `200`; the focused mobile checks found no horizontal overflow and retained usable recovery/navigation controls.
- `www.mandysbikefinder.com`, `app.mandysbikefinder.com`, `/privacy`, and `/offline` all returned `200` on 2026-06-11.
- Initial and local-flow server activity contained only page and `/api/status` requests. A controlled explicit `/api/extract` screenshot request returned the expected disabled-provider manual-entry fallback.
- No OpenAI, Resend, or provider credential was found in client-facing source; sensitive provider configuration remains server-side.
- The Settings version label was corrected from `1.0` to `1.1` and the full build matrix passed afterward.
- Representative small and large iPhone shell/layout checks are covered by this pass and the focused `320 x 700` and `430 x 932` v1.1 checks recorded below.

Release-candidate checks still required outside this local pass:

- Complete clear/delete confirmation actions on a physical iPhone or release-candidate simulator.
- Verify the TestFlight build and final marketing screenshot exports before creating the v1.1 release tag.

## Version 1.1 Protected Preview Verification

Validated on 2026-06-11 against Vercel preview deployment `dpl_42ZWzq3BrpNKDQZ642cjaSqhnDLS` for commit `3cd1707`:

- Vercel reported the deployment `READY`, with target `null`, for branch `release/v1.1-ui-polish`; it was not promoted to production.
- The preview requires Vercel access protection: the deployment URL returned `401` without an authorized preview session.
- The authorized preview opened directly into App Store MVP mode and rendered all four tabs.
- At `320 x 700`, the page had no horizontal overflow and all four bottom navigation targets measured 56 pixels high.
- At `430 x 932`, the Profile page had no horizontal overflow.
- Settings displayed `Mode: App Store MVP` and `Version: 1.1`.
- `/privacy`, `/offline`, and `/api/status` loaded successfully. The API status response reported `ok: true`.
- Adding `?screenshotFrame=4` did not activate deterministic screenshot data, confirming fixture mode is disabled in the ordinary preview environment.
- The browser console contained no warnings or errors during the focused pass.
- Vercel runtime logs showed successful page, privacy, offline, and status requests only; no AI or extraction request occurred during preview verification.
- `app.mandysbikefinder.com` and `www.mandysbikefinder.com` continued returning `200`, confirming the preview did not alter production domains.
- No unresolved Vercel toolbar feedback was present for the release branch.

The remaining release-candidate gate is hosted v1.1 deployment followed by physical-device TestFlight acceptance and App Store metadata upload.

## Version 1.1 iOS Simulator Build And Preview Access

Validated on 2026-06-11 with Xcode 26.5 and an iOS 26.5 iPhone 17 Pro simulator:

- The Capacitor iOS project resolved its Swift Package dependencies and completed a Debug simulator build successfully.
- The app installed and launched with the release-candidate preview URL temporarily supplied through `CAPACITOR_SERVER_URL`.
- Vercel Authentication redirected the protected preview session to Vercel login in Safari instead of keeping the release candidate inside the Capacitor WebView.
- The app log reported interrupted provisional WebView navigation after that redirect.
- The temporary preview URL was removed immediately afterward; `cap:sync` restored `https://app.mandysbikefinder.com` in the generated iOS configuration and the Git worktree remained clean.

Follow-up simulator validation used a local App Store-mode staging server without changing production:

- Cold launch and warm launch both loaded the v1.1 Profile screen inside the Capacitor WebView with correct safe-area spacing and bottom navigation.
- Stopping the staging server exposed a release-blocking blank white screen during disconnected cold launch.
- Added Capacitor `server.errorPath` support and a bundled, dependency-free `native-offline.html` fallback.
- The disconnected cold launch then displayed branded offline guidance, accurate AI/network disclosure, and a 48-pixel-plus retry action instead of a blank screen.
- Restarting the staging server and relaunching the app restored the v1.1 Profile screen.
- `npm run lint`, `npm run build`, the iOS simulator build, `npm run cap:sync`, and `npm run cap:doctor` passed after the fix.
- The generated native configuration was restored to `https://app.mandysbikefinder.com`, and the simulator was shut down after testing.

A stable Capacitor-accessible staging URL is still required for TestFlight verification. Destructive-action completion remains a physical-device or interactive simulator acceptance item.

## Version 1.1 App Store Source Capture

Validated on 2026-06-11 with the iOS 26.5 iPhone 17 Pro Max simulator:

- Captured all six approved native source frames at exactly `1320 x 2868` pixels.
- Controlled the status bar at `9:41`, charged battery, and full Wi-Fi/cellular signal.
- Frame 3 shows the repository-owned fictional listing graphic, `NO REAL SELLER DATA`, and the optional AI disclosure.
- Frame 4 shows `Worth contacting` with current Fit, Deal/value, Risk, and next-step guidance.
- Frame 5 shows three saved decisions and exactly one shortlist star.
- Frame 6 shows one child Profile, three saved evaluations, privacy access, and local-data controls.
- The screenshot fixture populates state locally and does not call extraction, analysis, message, report, email, or marketplace APIs.
- `npm run lint` and `npm run build:screenshots` passed before final capture.
- The generated Capacitor configuration was restored to `https://app.mandysbikefinder.com`; the status-bar override was cleared and the simulator was shut down.
- Source images are stored locally under `artifacts/app-store/v1.1/source/` and intentionally excluded from Git.

Final marketing-frame composition and visual QA were completed on 2026-06-11:

- `npm run export:app-store-screenshots` generated six reproducible PNG exports from the native source captures.
- All six files report `1320 x 2868` and RGB color.
- Headline wrapping, supporting copy, source-image scale, margins, active tabs, and visible fixture content were inspected frame by frame.
- Apple's official screenshot specification was rechecked on 2026-06-11 and continues to list `1320 x 2868` as an accepted 6.9-inch iPhone portrait size.

Hosted v1.1 deployment, physical-device TestFlight verification, screenshot upload to App Store Connect, and account-holder approval remain pending.

## Version 1.1 Archive And Upload

Validated on 2026-06-11 with Xcode 26.5:

- Advanced the native target to marketing version `1.1`, build `4`.
- Stored Apple Developer Team `H23DM6J89F` with automatic signing for reproducible archives.
- Generic iOS Release archive with signing disabled passed.
- Automatically signed generic iOS Release archive passed.
- App Store Connect export produced a 12 MB IPA signed by `Apple Distribution: Cheng Yang (H23DM6J89F)`.
- Package inspection confirmed bundle ID `com.mandysbikefinder.app`, version `1.1`, and build `4`.
- Strict code-sign verification passed.
- Xcode uploaded the package successfully; App Store Connect accepted it and reported that it entered processing.
- The archive intentionally uses the production hosted URL. Because the v1.1 branch is not yet merged/deployed, TestFlight installation alone cannot verify the v1.1 web UI until that URL serves the accepted release candidate.

At the time of upload, device installation, destructive-action completion, screenshot upload, and account-holder approval remained pending.

Apple processing completed on 2026-06-11:

- TestFlight emailed the internal tester that Mandy's Bike Finder `1.1 (4)` is available to test.
- The paired iPhone 17 Pro Max is visible to Xcode/devicectl and ready for installation.
- Device installation is intentionally deferred as a v1.1 acceptance result because build `1.1 (4)` loads `https://app.mandysbikefinder.com`, which still serves the production v1.0 web release until the v1.1 branch is accepted and deployed.

## Version 1.1 Destructive Data Controls

Validated locally on 2026-06-11 against the v1.1 App Store-mode release candidate using real browser localStorage:

- Saved a real child Profile through the UI and confirmed the saved recommendation rendered.
- Deleted one expanded History snapshot; the count changed from three to two and the remaining records stayed available.
- Cleared only the child Profile; two History records remained, and the `no child profile / 2 saved evaluations` state persisted after reload.
- Cleared only History; the Profile-absent, zero-History state persisted after reload.
- Invoking Clear All with no stored data showed the non-destructive empty-state notice.
- Re-seeded one Profile and two History records, then cleared all local data; both counts reached zero and remained zero after reload.
- Profile removal's custom confirmation supports both paths: `Keep profile` preserved the Profile, while `Remove` returned to first-time setup.
- Server activity during this pass contained page and `/api/status` requests only; no extraction, analysis, message, report, email, or marketplace request occurred.

The remaining destructive-action gate is confirmation on the actual TestFlight build after the production hosted URL serves v1.1.

## Version 1.1 Production Promotion And TestFlight Launch

Validated on 2026-06-11:

- Promoted Vercel deployment `dpl_2cK1bLUgB5pkkd11PG3JYzNNCkrD` for commit `2d44b4c` to production.
- Production deployment `dpl_rAk55mSN6H6yyzpVTtoBvh1uDxF3` reached `READY` and received aliases including `app.mandysbikefinder.com`.
- Production `/`, `/privacy`, `/offline`, and `/api/status` returned `200`.
- Settings on the production host reports `Mode: App Store MVP` and `Version: 1.1`.
- Existing browser Profile data survived the deployment and rendered correctly in the redesigned v1.1 Profile screen.
- `www.mandysbikefinder.com` continued returning `200`.
- The paired physical iPhone 17 Pro Max reports installed bundle `com.mandysbikefinder.app`, version `1.1`, build `4`.
- The TestFlight build launched successfully and remained running.
- Production runtime logs recorded the device launch requests to `/` and `/api/status`, both `200`; no extraction, analysis, message, report, or email request appeared.

Interactive TestFlight touch-flow confirmation and App Store Connect screenshot/metadata upload remain.

## Version 1.1 App Shell And Navigation

Validated on 2026-06-10:

- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run build`: passed with Next.js production compilation and type checking.
- App Store mode browser check at `320 x 700`: no horizontal overflow; all four bottom tabs remain readable; each tab target is 56 pixels high; content bottom padding clears the fixed navigation.
- App Store mode browser check at `430 x 932`: no horizontal overflow; tab targets remain evenly sized; page header and grouped content preserve intended spacing.
- Tab interaction: selecting `Evaluate` updates `aria-current`, screen heading, and scroll position without triggering an AI action.
- Browser console: no warnings or errors during the focused shell/navigation pass.
- Temporary responsive viewport override was reset after testing.

## Version 1.1 Profile Polish

Validated on 2026-06-10:

- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run build`: passed with Next.js production compilation and type checking.
- Existing version 1.0 local Profile data hydrated into the redesigned saved-profile state.
- First-time Profile state explains the three required inputs, fit recommendation, local storage, and no-account behavior.
- Clearing a Profile requires confirmation, states that History remains available, and returns to first-time guidance.
- Empty Height and Age each produce a clear required-field alert.
- Saving height `122 cm`, age `7`, beginner experience, and nickname `Mandy` preserved the existing recommendation output: `18 inch`, `Standard kids bike`.
- Recommendation copy formatting was corrected to `an 18-inch standard kids bike` without changing recommendation semantics.
- Edit then Cancel restored the saved Profile rather than overwriting it.
- `Evaluate a bike for Mandy` switched to the Evaluate tab, updated active navigation, and reset scroll position.
- App Store mode browser check at `320 x 700`: no horizontal overflow; recommendation CTA remained `254 x 48` pixels; content cleared the bottom navigation.
- Browser console: no warnings or errors during the focused Profile pass.
- Temporary responsive viewport override was reset after testing.

## Version 1.1 Evaluate Input And Review Polish

Validated on 2026-06-10:

- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run build`: passed with Next.js production compilation and type checking.
- App Store mode browser check at `320 x 700`: no horizontal overflow; progress labels `Add listing`, `Review`, and `Result` remained readable.
- The previous fixed Evaluate mode bar was removed; the App Store bottom navigation is the only app-owned fixed navigation element.
- Screenshot is still the default method and the optional AI extraction button is disabled until a screenshot exists.
- Initial load, input-method switching, and Manual/local analysis produced no `/api/extract` request; only the existing `/api/status` request appeared in the local server log.
- Screenshot copy states that selection remains local preview until the explicit AI extraction action.
- Text/link copy states that the URL is reference-only and marketplace pages are not automatically scraped.
- Manual Review exposed title, price, wheel size, brand, model, bike type, color/style, source, location, condition summary, and description fields.
- Manual sample values `TREK`, `$120`, and `20` enabled local analysis and produced a result without AI.
- Switching from Manual to Screenshot and back preserved the existing Review field values.
- Editing a Review field after analysis removed the stale result and returned progress to the Review stage.
- Browser console: no warnings or errors during the focused Evaluate pass.
- Long text entry through the in-app browser automation was limited by the browser's unavailable virtual clipboard; short keyboard-driven input and all relevant state transitions were still verified.
- Temporary responsive viewport override was reset after testing.

## Version 1.1 Result Card And Seller Message Polish

Validated on 2026-06-10:

- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run build`: passed with Next.js production compilation and type checking.
- Manual sample values `TREK`, `$120`, and `20` produced `Ask more before deciding` using the existing local analysis.
- The result leads with the overall recommendation and rationale, followed by comparable Fit, Deal, and Risk blocks with text and icons in addition to color.
- `What to do next` displayed three practical steps derived from the existing result and seller questions.
- The seller message remained selectable and exposed a 44-pixel-high Copy action. When the browser's virtual clipboard was unavailable, the UI showed manual-selection guidance instead of failing silently.
- `Save to History` preserved the existing local snapshot behavior. The saved detail retained the listing, price, child profile, recommendation, Fit/Deal/Risk statuses, and seller message without re-analysis.
- The existing result disclaimer remains visible below the save action.
- App Store mode browser check at `320 x 700`: no horizontal overflow; status cards remained readable; the result content cleared the bottom navigation.
- Browser console: no warnings or errors during the focused Result pass.
- Temporary responsive viewport override was reset after testing.

## Version 1.1 History Polish

Validated on 2026-06-10:

- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run build`: passed with Next.js production compilation and type checking.
- The existing saved `TREK` record rendered without migration and retained its recommendation, `$120` price, `20 inch` wheel size, child snapshot, source, Fit/Deal/Risk statuses, and seller message.
- Saved-decision cards prioritize the recommendation and listing title, then price, wheel size, child, saved date, and source.
- Shortlist state uses a star icon, text guidance, an accessible pressed state, and a 44-pixel touch target.
- Toggling shortlist persisted after a full page reload. The test change was reverted afterward to preserve the existing local record.
- Details remain collapsed initially and open as an explicitly labeled saved snapshot without calling analysis or marketplace APIs.
- Delete is visually separated inside the expanded detail, explains its scope, and retains the existing confirmation step.
- App Store mode browser check at `320 x 700`: no horizontal overflow; detail and delete controls remained `254 x 44` pixels; content cleared the bottom navigation.
- Browser console: no warnings or errors during the focused History pass.
- Local server activity showed only page and `/api/status` requests; opening History and details did not call extraction or analysis APIs.
- Temporary responsive viewport override was reset after testing.

## Version 1.1 Loading, Launch, And Offline Polish

Validated on 2026-06-10:

- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run build`: passed with Next.js production compilation and type checking.
- Added a dependency-free Next.js loading state using the production mark, app name, parent-facing tagline, and a subtle CSS-only progress treatment.
- Reduced-motion mode disables the loading animation while preserving a visible progress state.
- Updated the web launch SVG and all three iOS `Splash.imageset` PNGs to the same light canvas, blue mark, and product message.
- The generated iOS splash assets remain `2732 x 2732`, RGB, and retain the existing asset catalog filenames and storyboard reference.
- `/offline` clearly distinguishes saved Profile/History/local guidance from AI screenshot extraction and server actions that require a connection.
- The recovery control updates from `Try again` to `Connection restored - try again` when connectivity returns.
- App Store mode includes concise offline and connection-restored status notices without blocking local tab access.
- Browser check at `320 x 700`: `/offline` had no horizontal overflow; retry measured `254 x 48` pixels and the saved-data route measured `254 x 44` pixels.
- Returning from `/offline` reopened the saved local Profile successfully.
- Browser console: no warnings or errors during the focused offline/recovery pass.
- Local server activity showed only page and `/api/status` requests; no AI or extraction request was added to launch.
- Temporary responsive viewport override was reset after testing.
- Native splash composition was visually inspected from the generated PNG; cold and warm launch timing still requires the release-candidate simulator/device QA pass.

## Version 1.1 Screenshot Fixture And Capture Preparation

Validated on 2026-06-11:

- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run build`: passed with Next.js production compilation and type checking.
- `npm run build:screenshots`: passed with App Store and screenshot fixture flags enabled.
- `npm run test:copy`: all three listing-copy tests passed.
- `npm run cap:doctor`: passed with the existing iOS Capacitor project reported healthy.
- Screenshot fixture mode requires the separate `NEXT_PUBLIC_APP_STORE_SCREENSHOT_FIXTURE_MODE=true` build flag and a valid `screenshotFrame` query value.
- Without that flag, screenshot query parameters do not activate fixture data.
- Frames 1 through 6 rendered the intended Profile, Profile edit, Evaluate review, Result, History, and Settings states.
- Fixture Profile rendered Mandy, age 7, 122 cm, Beginner, an `18 inch` recommendation, and `Standard kids bike`.
- Fixture Result was generated through the current local analysis: `Worth contacting`, `Good size match`, `Looks reasonable`, and `Lower price confidence`.
- Fixture History rendered three deterministic fictional records with recommendations green/yellow/green and exactly one shortlisted record.
- Fixture Settings reported one child Profile and three saved evaluations.
- The fictional listing preview is a repository-owned `900 x 1200` RGB PNG with no marketplace branding or real seller data.
- Fixture mode did not write to or clear localStorage and made no AI/extraction request during focused browser verification.
- Browser console: no warnings or errors during the six-frame pass.
- Capture instructions document protected preview deployment, Capacitor URL override, simulator status bar, exact frame URLs, positioning, source capture, and `1320 x 2868` export verification.

Current PRD: `docs/PRD.md` v0.4  
Current implementation approach: Phase 1.5 controlled real API beta

## Test Without API Keys

1. Leave all feature flags in `.env` unset or set to `false`.
2. Start the Next.js app:

```powershell
cd app
npm install
npm run dev
```

3. Open `http://localhost:3000/`.
4. Analyze a sample listing.
5. Confirm the status pill says providers are mock/fallback.
6. Confirm the app still shows:
   - Overall red/yellow/green meter.
   - Fit, price, condition, brand, kid appeal, and risk assessments.
   - Seller questions.
   - Negotiation Boost message.
   - Email report preview or simulated send.
7. Confirm initial listing fields are empty on first page load (no prefilled sample data).
8. Confirm initial result area is gated:
   - Overall/result cards are hidden before first Analyze.
   - Seller questions, Negotiation Boost, and Email report sections are hidden before first Analyze.
   - Empty state is shown with guidance to add child and listing details.
9. Confirm Analyze button gating:
   - Analyze is disabled when child height is missing.
   - Analyze is disabled when no listing detail is provided.
   - Disabled-state helper reason is shown near the button.
10. Confirm stale-result behavior:
   - Run one analysis.
   - Change key child or listing fields.
   - Confirm prior result is replaced by an "update and re-run analysis" style state until Analyze is clicked again.
11. Confirm listing source label appears and changes appropriately:
   - Source: pasted text AI extraction.
   - Source: screenshot.
   - Source: manual entry.
   - Source: link.
   - Source: link + manual edits.
   - Source: link + pasted text AI extraction.
   - Source: Craigslist link extraction.
   - Source: Craigslist link extraction + manual edits.
   - After screenshot upload and manual edits, source can show `screenshot + manual edits`.
12. In link mode, platform-specific helper copy:
   - Facebook Marketplace URL:
     - `Facebook Marketplace links usually cannot be read directly. Please upload a screenshot or paste the listing text for AI-assisted extraction.`
   - Other marketplace URL:
     - `This link will be saved as a reference. For analysis, please paste listing text, upload a screenshot, or enter key details manually.`
   - Confirm a Link-mode action button is visible when a URL is present for both Craigslist and Facebook Marketplace.
   - For Facebook links with no pasted text, confirm the button stays visible but disabled with clear helper text.
   - For Facebook links with pasted text, confirm the button runs text extraction and keeps URL as listing reference.
   - After switching from Screenshot/Manual back to Link mode, confirm source label resets to `link` (no stale `screenshot` source).
13. Craigslist link-only case:
   - Paste a Craigslist URL, for example:
     - `https://boston.craigslist.org/bmw/bik/d/wayland-trek-mt220-girls-mountain-bike/7919424984.html`
   - Confirm `platform` is recognized as `Craigslist` from URL only.
   - Confirm title/price/brand/wheel size/description remain empty unless user provides pasted text, screenshot extraction, or manual entry.
   - Confirm Analyze remains disabled for link-only input.
   - Confirm source label shows `link`; after manual field edits, source changes to `link + manual edits`.
14. Controlled Craigslist link extraction:
   - Paste the test URL:
     - `https://boston.craigslist.org/bmw/bik/d/wayland-trek-mt220-girls-mountain-bike/7919424984.html`
   - Click `Analyze listing link`.
   - Confirm extracted fields populate when available (title/price/description/location/platform/listingLink).
   - Confirm source label becomes `Craigslist link extraction`.
   - Edit any field and confirm source becomes `Craigslist link extraction + manual edits`.
   - If extraction fails, confirm message:
     - `We could not read this Craigslist listing automatically. Please paste the listing text or upload a screenshot.`
   - Confirm Craigslist auto-extraction attempts only in Link mode (not while Screenshot/Manual tabs are active).
15. Marketplace-aware link detection and guidance:
   - Test URLs:
     - `https://boston.craigslist.org/gbs/bik/d/example/123456.html`
     - `https://www.facebook.com/marketplace/item/177201768044349/`
     - `https://www.ebay.com/itm/1234567890`
     - `https://offerup.com/item/detail/123456`
     - `https://www.pinkbike.com/buysell/123456/`
     - `https://www.bicyclebluebook.com/marketplace/buy-now/123456/`
     - `https://buycycle.com/en-us/bike/example-12345`
     - `https://www.theproscloset.com/products/example-bike`
     - `https://www.bikeexchange.com/en-US/products/example`
     - `https://example.com/random-listing`
   - Confirm each link shows a `Detected:` marketplace label.
   - Confirm extraction mode behavior:
     - Craigslist: direct-supported button (`Analyze listing link`).
     - Best-effort platforms (eBay/Pinkbike/Bicycle Blue Book/Buycycle/The Pro's Closet/BikeExchange): `Try link analysis` + fallback guidance.
     - Fallback-only platforms (Facebook/OfferUp/unknown): direct analysis is not implied; pasted text/screenshot guidance is shown.
   - Confirm fallback-only links still keep a visible action path:
     - If pasted text is empty: button is disabled and helper copy explains next step.
     - If pasted text is present: `Analyze pasted listing text` is enabled.
   - Confirm Link mode source and marketplace indicator stay accurate after tab switching.
16. Screenshot upload behavior:
   - Uploading a screenshot clears previously loaded sample listing values.
   - Source switches to `screenshot` immediately.
   - The preview box renders the uploaded image (not just file name), keeps aspect ratio, and prevents overflow.
   - The file name is shown as secondary metadata under the preview.
   - In screenshot mode, the UI shows:
     - "Screenshot uploaded. You can extract listing details with AI or enter them manually."
   - Uploading a screenshot does not trigger automatic OpenAI extraction.
   - Clicking `Extract listing details from screenshot` is required to trigger server-side AI extraction.
   - If `ENABLE_LLM_ANALYSIS=false` or `OPENAI_API_KEY` is missing, confirm fallback message:
     - "AI screenshot extraction is currently disabled. Please enter the listing details manually."
   - If limits are reached, confirm fallback message:
     - "Daily AI extraction limit reached. You can use AI extraction up to 10 times per day. Please enter the listing details manually or try again tomorrow."
   - After successful extraction, listing source becomes `screenshot AI extraction`.
   - After manual edits post extraction, source becomes `screenshot AI extraction + manual edits`.
   - Confirm listing fields stay empty until manual edits or real extraction.
17. Listing input tab order:
   - Confirm tab order is `Screenshot`, `Link`, `Manual`.
   - Confirm `Screenshot` is selected by default on initial page load.
   - Confirm source label stays aligned with tab context when switching modes (`screenshot`, `link`, `manual`).
18. Screenshot AI extraction price parsing:
   - Upload a screenshot containing:
     - Title: `Fuji Blaster Girls 21 Speed Mountain Bike`
     - Visible price: `$35`
   - Run `Extract listing details from screenshot`.
   - Expected extraction:
     - Asking price = `35`
     - Brand = `Fuji`
     - Model = `Blaster`
     - Bike type = `Mountain Bike`
   - Confirm asking price input is populated and remains editable.

Expected behavior: the app remains fully functional without API keys.

## Test With API Keys

1. Copy `.env.example` to `.env`.
2. Set the relevant feature flags:

```text
ENABLE_LLM_ANALYSIS=true
ENABLE_LIVE_SEARCH=true
ENABLE_EMAIL_REPORT=true
ENABLE_BACKEND_LOGGING=true
```

3. Add only server-side API credentials in `/app/.env.local` or Vercel Environment Variables.
4. Restart the server.
5. Use the same sample listings.
6. Confirm the status pill and API responses indicate live LLM mode if configured. Search, email, and backend logging should still report fallback/mock until those real providers are intentionally implemented.

Expected behavior: live providers run only server-side. No API keys appear in browser source or network payloads.

For screenshot AI extraction:

- Click screenshot extraction button once and verify `/api/extract` request is made only on click.
- Confirm no extraction request is made on page load or file selection.

## Test Production Build

From `/app`:

```powershell
npm run build
```

Expected behavior: the Next.js app builds successfully. If dependencies are not installed, run `npm install` first. If build fails, fix TypeScript, lint, or App Router errors before deploying to Vercel.

## Test API Limits

Set low limits:

```text
DAILY_SEARCH_LIMIT=1
DAILY_LLM_LIMIT=1
DAILY_EMAIL_LIMIT=1
```

Then:

1. Run one analysis.
2. Run a second analysis or message generation.
3. Preview/send a second report.

Expected behavior: the second call falls back gracefully and explains that the daily limit was reached.

## Test Unit and Preference UX

1. Height unit selector:
   - Switch between `cm` and `ft-in`.
   - In `ft-in`, enter feet and inches and confirm analysis still runs.
2. Weight unit selector:
   - Switch between `lb` and `kg`.
   - Leave weight blank and confirm analysis still runs.
3. Color preference multi-select:
   - Select multiple colors and confirm they remain selected.
   - Select `No preference / all colors are fine` and confirm it overrides/clears other selections.

## Test Child-Profile-Only Recommendation

1. Button gating:
   - Without height or age, confirm `Recommend bike type and size` is disabled.
   - Confirm helper message: `Enter height, age, and riding experience to get a bike recommendation.`
2. Case: 145 cm, age 9, comfortable rider:
   - Click recommend button.
   - Confirm wheel recommendation emphasizes `24 inch` with `26 inch` as cautious growth option.
   - Confirm category and checklist sections render.
3. Case: beginner young child (for example 100 cm):
   - Confirm recommendation leans toward balance bike or training-wheel bike with small wheel range.
4. Case: confident 150 cm child:
   - Confirm recommendation allows `26 inch` consideration after safe test ride.
5. Change child profile after recommendation:
   - Confirm prompt appears: `Child profile changed. Re-run recommendation.`
6. Recommendation output contract:
   - Confirm recommendation includes both bike type and wheel size.
   - Confirm explanation references height, age, and riding experience.
7. Optional personalization behavior:
   - Confirm optional notes appear only when optional fields (weight/style/color) are provided.
8. Recommendation illustration mapping:
   - 145 cm, comfortable rider: generate recommendation and confirm a matching bike illustration renders (not the fallback placeholder).
   - Cruiser/comfort category variants (for example `Kids cruiser bike`, `Cruiser bike`, `24 inch Kids cruiser bike`) should all map to the cruiser comfort image.
   - Mountain category should map to the kids mountain bike image.
   - If recommendation text has no recognized category keywords, fallback placeholder should appear.
9. Bike-type weighting behavior:
   - Case 1: 145 cm, age 9, Advanced, Girl-style:
     - Expected primary recommendation is `Kids mountain bike` or `Hybrid / neighborhood bike` (not `Kids cruiser bike`).
     - Wheel size should generally be `24 inch`.
   - Case 2: 145 cm, age 9, Comfortable, strong comfort/cruiser style signal:
     - `Kids cruiser bike` can be recommended with explicit note about weight and lower versatility.
   - Case 3: 125 cm, age 6, Beginner:
     - Expected recommendation is `Standard kids bike` or `Training wheels bike` depending on confidence and fit.
     - Wheel guidance should generally stay around 18/20 inch range.
   - Case 4: 135 cm, age 8, Comfortable, no style preference:
     - Expected recommendation leans toward `Hybrid / neighborhood bike` or `Kids mountain bike`.
     - Wheel guidance should generally be around 20 inch (24 inch only if fit/age context supports).

## Manual Verification on Live Deployment

Manual run-through is verified on:

- `https://mandys-bike-finder.vercel.app/`

Confirmed on deployed MVP:

- Height unit selector works for `cm` / `ft-in`.
- Weight unit selector works for `lb` / `kg`.
- Color preference is multi-select with `No preference / all colors are fine`.
- Listing fields no longer show confusing prefilled data on initial load.
- Listing source labeling is clearer.
- Result cards emphasize `Fit`, `Price`, `Condition`, `Brand`, `Kid Appeal`, and `Risk`.
- Dimension cards use full-card qualitative styling (green/yellow/red tint + stronger accent) instead of small GREEN/YELLOW/RED pill badges.
- Dimension title is the most prominent label, with short status line and secondary reasoning beneath.
- `/api/status` remains `200 OK` with safe fallback mode and real APIs disabled.
- Landing/header visual polish: one simplified hero, clearer parent-facing headline, three value chips, improved spacing/typography, and technical provider status moved to a subtle `Beta status` section.
- Main flow layout: `Child profile` and `Listing input` now appear side-by-side at the top on desktop (stacked on mobile), with `Confirm listing fields` staying in the listing flow and results rendered below only after clicking `Analyze bike`.
- Bike size recommendation visibility: after analysis, a dedicated `Recommended bike size` section clearly shows best size now, growth option, caution, and reasoning.
- Hero visual polish: premium card-style hero with soft warm gradients, smoother left-to-right text/image blending, refined headline typography, polished brand eyebrow label, and cleaner value chips with subtle icon markers.

## Test Fallback Behavior

Use one of these methods:

- Disable a feature flag.
- Remove the provider API key.
- Use an invalid provider URL.
- Set daily limit to `0`.

Expected behavior:

- Analysis does not crash.
- User sees local/fallback estimate messaging.
- API failures are logged server-side.
- Red/yellow/green output still appears.

## Sample Listing Cases

### Case 1: Mandy, 145 cm, Comfortable Rider, Huffy 24 Inch Pink/Purple Bike, $70

Child:

- Height: 145 cm.
- Experience: comfortable.
- Color preference: pink/purple.

Listing:

- Brand: Huffy.
- Wheel size: 24 inch.
- Color/style: pink/purple.
- Asking price: $70.
- Condition: good condition.

Expected: likely yellow or green depending on condition detail. Fit should explain 24 inch is safer/easier now around 145 cm.

### Case 2: Mandy, 145 cm, 26 Inch Bike

Child:

- Height: 145 cm.
- Experience: comfortable.

Listing:

- Wheel size: 26 inch.

Expected: yellow fit. Explain growth-room nuance and need for safe test ride.

### Case 3: Huffy 24 Inch Used Bike Priced at $150

Expected: price should likely be yellow or red because the used price may be high for an entry-level brand unless condition is excellent.

### Case 4: High-Quality Brand Like Woom or Trek

Expected: brand assessment should be green. Price may still be yellow or red if asking price is too close to estimated new range.

### Case 5: Unclear Condition Listing

Listing text:

"Kids bike, used, pick up only."

Expected: condition and risk should be yellow because brakes, tires, chain, rust, gears, and wheel size may need confirmation.

## Fit Parsing Regression Checks

- `24` vs recommendation `24/26 inch` should match (green fit).
- `26` vs recommendation `24/26 inch` should match (green fit).
- `20` vs recommendation `24/26 inch` should not match (mismatch or caution depending on context).
- Listing wheel size `24 in.` should display cleanly as `24 inch` (not `24 in. inch`).
- Missing or undetectable wheel size should show:
  - `Wheel size not detected`
  - `We couldn't confidently detect the bike wheel size from this listing.`

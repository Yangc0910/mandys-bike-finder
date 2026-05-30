# App Store Final Review Checklist

Status: Close-to-final product checklist
Last updated: 2026-05-30

## Purpose

This checklist captures what should be true before Mandy's Bike Finder is submitted to App Review. It assumes the first iOS build uses the hosted App Store MVP at `https://app.mandysbikefinder.com/`.

## Must Be Complete Before Submission

- App launches directly into the four-tab App Store MVP surface: `Profile`, `Evaluate`, `History`, `Settings`.
- `www.mandysbikefinder.com` remains the public web MVP and is not used by the iOS shell.
- Screenshot OCR is working on `app.mandysbikefinder.com` and only starts after the user taps `Extract details with AI`.
- Extracted screenshot fields are shown in editable listing fields before local analysis.
- Manual entry and local fallback analysis still work if AI is disabled, rate-limited, or unavailable.
- Profile local save, edit, clear, and reload persistence work.
- Evaluate can produce a result from manual details without AI.
- History save, reload persistence, favorite, detail, and delete work.
- Settings can clear child profile, history, and all App Store MVP local data.
- `/privacy` is reachable and does not contain TODO placeholders.
- `support@mandysbikefinder.com` is a working support/privacy contact before submission.
- Settings About shows a real version value, not a placeholder.
- App Store Review Notes explain no account, no payment, no subscription, no marketplace scraping, optional user-triggered AI, local fallback, local Profile/History, and server-side provider keys.

## App Review Risk Checks

- No email report, PDF export, Bike Scout, waitlist, payment, account/login, push notification, or automated marketplace search surface appears in App Store MVP mode.
- No automatic OpenAI/LLM call occurs on initial load.
- Selecting a screenshot does not trigger AI or server processing by itself.
- Pasting a link or text does not scrape marketplace pages.
- Saved History does not re-fetch marketplace pages or re-run AI.
- No `NEXT_PUBLIC_OPENAI_*`, `NEXT_PUBLIC_RESEND_*`, or `NEXT_PUBLIC_*_SECRET` variables are used.
- No provider secrets are included in the iOS project or client bundle.
- Camera/photo permission text matches the screenshot selection behavior.

## TestFlight QA

- Run on at least one small iPhone simulator and one larger iPhone simulator.
- Run on a physical iPhone before App Store submission if possible.
- Confirm iOS WebView file picker can select screenshots from Photos and Files.
- Confirm HEIC behavior. If HEIC fails, make the user-facing fallback clear and rely on PNG/JPG screenshots for v1.
- Confirm bottom navigation does not overlap the home indicator.
- Confirm offline/connectivity messaging does not block primary actions.
- Confirm OCR cost limits show a graceful fallback state.

## App Store Assets

- Production app icon installed in Xcode asset catalog.
- Launch screen/splash asset looks intentional and does not imply offline native functionality.
- App Store screenshots captured from the real App Store MVP surface:
  - Profile
  - Evaluate with explicit AI screenshot extraction
  - Result
  - History
  - Settings/privacy controls
- App description and subtitle do not imply automatic marketplace scraping, guaranteed safety, guaranteed pricing, or paid automation.

## Remaining Manual Confirmations

- Apple Developer Team and signing are configured in Xcode.
- Bundle ID matches App Store Connect.
- App Store privacy labels match shipped behavior.
- Support URL and Privacy Policy URL are entered in App Store Connect.
- `support@mandysbikefinder.com` is monitored.

# Capacitor Web Build Strategy Validation

Status: iOS platform generated
Last updated: 2026-05-26

## Decision

Use a hosted Vercel app for the first Capacitor iOS MVP.

Recommended architecture:

```text
iOS Capacitor shell
-> hosted Vercel App Store MVP web app
-> hosted Vercel API routes for server-side functions
```

This is the lowest-risk near-term strategy for the current Next.js/Vercel codebase because the app already depends on hosted API routes for provider status, extraction, analysis, report helpers, email, and protected server-side integrations.

Do not bundle Next.js API routes into the iOS app. The iOS shell should not contain OpenAI, Resend, Salesforce, search, or other provider secrets.

Current Capacitor config:

- Config file: `app/capacitor.config.ts`
- App ID placeholder: `com.mandysbikefinder.app`
- App name: `Mandy's Bike Finder`
- Hosted URL: `https://app.mandysbikefinder.com`
- `webDir`: `public`, retained only as the Capacitor-required web directory while the first MVP uses hosted content.
- Local verification used Node 24; Capacitor CLI currently requires Node 22+.
- Native iOS project files now exist in `app/ios/`.
- `cap sync` completed successfully.
- `cap doctor` is blocked on Windows by missing Xcode; finish Xcode validation on macOS.

## Environment Strategy

Use separate hosted URLs by stage:

| Stage | Recommended URL target | App Store MVP mode |
| --- | --- | --- |
| Development | Local Next.js dev server, such as `http://localhost:3000` | Set `NEXT_PUBLIC_APP_STORE_MVP_MODE=true` only for App Store MVP preview. |
| Preview / TestFlight | Stable Vercel Preview/staging deployment, or `https://app.mandysbikefinder.com/` once configured | Set `NEXT_PUBLIC_APP_STORE_MVP_MODE=true` for the build loaded by the iOS shell. |
| Production App Store | `https://app.mandysbikefinder.com/` | Keep `NEXT_PUBLIC_APP_STORE_MVP_MODE=true` for the iOS-facing deployment. |
| Public web MVP | `https://www.mandysbikefinder.com/` | Keep default web MVP mode unless intentionally changed later. |

Because `NEXT_PUBLIC_APP_STORE_MVP_MODE` is compiled into the client bundle, changing it requires a rebuild/redeploy. For App Store submission, the hosted URL loaded by the Capacitor shell should open directly into the four-tab App Store MVP surface.

Recommendation:

- Use `https://app.mandysbikefinder.com/` as the first Capacitor/TestFlight hosted URL.
- Keep `www.mandysbikefinder.com` as the existing public web MVP surface.
- Prefer a dedicated branch, Vercel environment, or app-specific domain/subdomain for the App Store MVP before public App Store submission.
- A separate Vercel project is optional. It may reduce deployment mix-ups, but it adds environment-management overhead. A dedicated branch/environment is enough for the first validation pass if env values are carefully separated.

Detailed hosted URL QA and Vercel setup instructions live in `docs/product/hosted-app-store-mvp-url-qa.md`.
Xcode/TestFlight preparation details live in `docs/product/xcode-testflight-preparation.md`.

## API Routing Strategy

Current client-side API calls use relative paths:

- `/api/status`
- `/api/extract`
- `/api/extract-link`
- `/api/analyze`
- `/api/message`
- `/api/report`
- `/api/reports/email`

This works well when the Capacitor shell loads the hosted Vercel app because relative paths resolve to the same hosted origin.

Findings:

- No client-side API base URL abstraction is required for the hosted Vercel strategy.
- No new `NEXT_PUBLIC_APP_BASE_URL` is required for the first hosted strategy.
- Avoid introducing public env vars for provider credentials. `NEXT_PUBLIC_*` values are visible in the client bundle.
- OpenAI calls are implemented in server-side provider code and use server-side config.
- Resend email behavior is implemented through server-side code and should remain hidden from the App Store MVP surface.
- Salesforce and CRM settings are server-side and should not be exposed to the iOS shell.

Future note:

- If the project later uses bundled static assets inside Capacitor, add an explicit API base URL strategy at that time. That should be a public origin only, never a provider secret.

## Hosted Strategy Validation

The hosted Vercel strategy is acceptable for the first Capacitor MVP if the submitted iOS shell loads a stable App Store MVP deployment and the MVP surface remains app-like.

Validation rationale:

- The current Next.js app is already deployed and operated as a Vercel-hosted app.
- Hosted API routes preserve the safest server-side OpenAI/Resend boundary.
- Relative API paths work naturally under a hosted same-origin deployment.
- The App Store MVP mode already avoids account, payment, subscription, push, automated marketplace scraping, email report, PDF export, Bike Scout, and waitlist surfaces.
- Profile and History local storage create app-specific utility beyond a static web page.
- Settings data controls and privacy disclosure support App Review readiness.

## App Review Risk Notes

Hosted web content inside Capacitor has a real App Review Guideline 4.2 risk if it looks like a thin website wrapper.

Current risk reducers:

- Four-tab app shell: `Profile`, `Evaluate`, `History`, `Settings`.
- Local child profile and saved evaluation history.
- Settings data controls.
- Public privacy route.
- No account or payment requirement.
- No marketplace scraping claim.
- Explicit AI action framing.

Recommended App Review Notes addition:

> Mandy's Bike Finder is a focused mobile decision-support app for parents evaluating used kids bike listings. The first App Store MVP does not require an account, does not include payment or subscriptions, and does not automatically scrape marketplace pages. Profile and History are stored locally on device. AI features, if enabled, only run after a clear user action; local fallback analysis works without AI. Provider keys and protected server-side functions remain on hosted Vercel API routes, not in the iOS app bundle. Data controls and privacy information are available in Settings.

First TestFlight build should demonstrate:

1. `Profile`: create and save a child profile locally.
2. `Evaluate`: enter listing details manually or from user-provided text/screenshot reference.
3. `Result`: show fit, deal/value, risk, recommendation, and seller message.
4. `History`: save, favorite, view, and delete an evaluation.
5. `Settings`: view privacy/AI disclosure and clear local data.
6. `/privacy`: public privacy page is reachable.

Continue hiding web-only surfaces in App Store MVP mode:

- Email report
- PDF export
- Bike Scout / automatic deal search
- Waitlist
- Payment/subscription
- Account/login
- Push notifications
- Marketplace automation or scraping

## Hosted Capacitor Preflight QA Checklist

Before adding Capacitor dependencies, verify:

- App Store MVP hosted URL is stable and accessible.
- Hosted URL opens directly into App Store MVP mode.
- Initial load allows only `/api/status`; no OpenAI/LLM request occurs before explicit user action.
- Profile localStorage works in browser preview and is expected to work in iOS WebView.
- History localStorage works in browser preview and is expected to work in iOS WebView.
- Settings clear profile/history/all App Store MVP local data controls work.
- Screenshot upload/preview flow is tested specifically in iOS WebView once Capacitor exists.
- `/privacy` is reachable from Settings and directly by URL.
- `/offline` and offline banner do not imply full offline analysis if the hosted page cannot load.
- No automatic marketplace scraping is exposed.
- No account, payment, subscription, or push surface is exposed.
- No email report, PDF export, Bike Scout, waitlist, or marketplace automation surface is exposed.
- No secrets appear in client code or client-visible env vars.
- Default web MVP remains available when `NEXT_PUBLIC_APP_STORE_MVP_MODE` is false or unset.

## Remaining Checks Before TestFlight

Required after `[Infra] Add Capacitor Dependencies And Config` and before TestFlight:

- Avoid pointing the iOS shell at `https://www.mandysbikefinder.com/` while that domain remains the public web MVP.
- Confirm no client-visible secrets in the deployed bundle after any Capacitor config changes.
- Finalize App Store Review Notes wording for hosted API architecture.
- Confirm production app icon and launch/splash asset plan.
- Finalize `/privacy` contact placeholder before submission.
- Test screenshot upload/preview behavior in the actual iOS WebView.

Recommended but not blocking for the first wrapper spike:

- Decide whether to use a dedicated App Store MVP branch, Vercel environment, or subdomain.
- Add a real app/build version value for Settings once Capacitor metadata exists.
- Split large App Store MVP UI code into smaller components before deeper native work.

## Proceed / Wait Decision

Proceed to Capacitor now that the hosted URL and environment target are chosen.

The hosted Vercel strategy is acceptable for the first Capacitor MVP. Configure the iOS shell to load `https://app.mandysbikefinder.com/`.

Recommended next task:

> `[Build] Xcode And TestFlight Preparation Pass`

## Hosted URL QA Result

Inspection date: 2026-05-26

Result:

- `https://app.mandysbikefinder.com/` is live over HTTPS and opens directly into the App Store MVP shell.
- `https://www.mandysbikefinder.com/` currently loads the default web MVP surface.
- `/privacy`, `/offline`, and `/api/status` are reachable from the app domain.
- Profile local save, local fallback evaluation, Save to History, and Settings local data controls passed hosted URL smoke checks.
- Client-bundle scan found no OpenAI/Resend provider secret exposure.
- Capacitor iOS platform files have been generated and synced.

Decision:

- Keep `www.mandysbikefinder.com` unchanged for the public web MVP.
- Use `https://app.mandysbikefinder.com/` for the Capacitor iOS shell.
- Capacitor dependencies and hosted config have been added under `app/`.
- Proceed to Xcode signing/build validation on macOS.

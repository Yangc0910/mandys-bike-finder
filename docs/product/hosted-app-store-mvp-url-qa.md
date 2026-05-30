# Hosted App Store MVP URL QA

Status: Final hosted App Store MVP URL live
Last updated: 2026-05-26

## Decision

Do not point the first Capacitor/TestFlight build at the public web MVP domain.

Recommended hosted URL strategy:

| Use case | Recommended URL | Mode |
| --- | --- | --- |
| Local development | `http://localhost:3000` | Run with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true` when previewing the App Store MVP. |
| TestFlight / staging | Stable Vercel Preview or staging deployment first; `app.mandysbikefinder.com` once configured | Must be built with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`. |
| Production App Store | `https://app.mandysbikefinder.com` | Must be built with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`. |
| Public web MVP | `https://www.mandysbikefinder.com` | Keep as default web MVP mode unless intentionally changed later. |

The future Capacitor iOS shell should load the App Store-facing URL, not `www.mandysbikefinder.com`.

## Current Deployment Assumptions

Current public web URLs documented in the repo:

- `https://www.mandysbikefinder.com/`
- `https://mandys-bike-finder.vercel.app/`

Current App Store MVP mode:

- Enabled by `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`.
- Disabled by `NEXT_PUBLIC_APP_STORE_MVP_MODE=false` or leaving it unset.
- Because this is a `NEXT_PUBLIC_` variable, it is compiled into the client bundle and requires a rebuild/redeploy after changes.

Production recommendation:

- Keep `www.mandysbikefinder.com` in default web MVP mode.
- Use a separate app-facing deployment target for App Store MVP mode.
- Prefer `app.mandysbikefinder.com` for production App Store once DNS and Vercel domain settings are ready.

## URL Options

### Option 1: Use `www.mandysbikefinder.com`

Recommendation: Do not use for the first iOS wrapper.

Risks:

- Switching `www` into App Store MVP mode could hide or change the current public web MVP.
- It mixes web MVP users and App Store review traffic.
- It makes rollback and App Review debugging noisier.
- It increases the chance that the Capacitor shell accidentally points at the wrong product surface.

### Option 2: Use a Stable Vercel Preview / Staging Deployment

Recommendation: Good for first TestFlight if `app.mandysbikefinder.com` is not ready.

Benefits:

- Fastest path to TestFlight validation.
- Keeps the public web MVP untouched.
- Allows a dedicated deployment with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`.
- Useful for testing Capacitor shell behavior before final DNS work.

Limitations:

- Preview URLs can be awkward or unstable if the deployment is replaced.
- Review Notes and tester instructions must clearly identify the environment.
- Before App Store submission, switch the iOS shell to the production app-facing URL.

### Option 3: Use `app.mandysbikefinder.com`

Recommendation: Best final App Store-facing URL.

Benefits:

- Clear separation between public web MVP and App Store MVP.
- Lower operational risk than reusing `www`.
- Easier App Review and TestFlight instructions.
- Cleaner long-term path for app-specific metadata, privacy, support, and API behavior.

Consideration:

- Requires Vercel domain configuration and DNS setup.

## Vercel Setup Instructions

Do not make these changes from code. Configure them in Vercel when ready.

### Project Strategy

Recommended first setup:

1. Use the same Vercel project if the repo, root directory, API routes, and provider environment variables are already correct.
2. Add a separate domain/subdomain for the App Store MVP, ideally `app.mandysbikefinder.com`.
3. Use a dedicated branch or staging deployment for TestFlight until the app subdomain is ready.

Separate Vercel project:

- Not required for the first TestFlight.
- Consider it later if App Store MVP needs isolated env vars, release cadence, analytics, or stricter deployment protection.

### Environment Variables

For the App Store MVP deployment target:

1. Set `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`.
2. Keep provider secrets server-side only. Do not create `NEXT_PUBLIC_` OpenAI, Resend, Salesforce, search, or API key variables.
3. Preserve existing server-side feature flags, cost limits, and fallback behavior.
4. Redeploy after changing `NEXT_PUBLIC_APP_STORE_MVP_MODE`, because it is compiled into the client bundle.

For the public web MVP deployment target:

1. Leave `NEXT_PUBLIC_APP_STORE_MVP_MODE` unset or set it to `false`.
2. Confirm the long web MVP flow remains visible.

### Domain / DNS Setup For `app.mandysbikefinder.com`

High-level steps:

1. In Vercel, add `app.mandysbikefinder.com` to the project that will serve the App Store MVP.
2. Follow Vercel's DNS instructions for the subdomain.
3. Typically this means adding a DNS `CNAME` record for `app` pointing to Vercel's provided target.
4. Wait for DNS and certificate provisioning.
5. Redeploy with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`.
6. Open `https://app.mandysbikefinder.com/` and verify the four-tab App Store MVP shell appears immediately.

## Hosted URL QA Checklist

Run this checklist against the exact URL the Capacitor shell will load:

- URL loads successfully on a mobile viewport.
- App Store MVP mode is active by default.
- Four tabs are visible: `Profile`, `Evaluate`, `History`, `Settings`.
- No marketing hero or default web MVP long page appears.
- Initial load only calls `/api/status`.
- No OpenAI/LLM call occurs on initial load.
- Profile localStorage save, reload, edit, and clear work.
- Evaluate local fallback result works from user-provided listing details.
- History localStorage save, favorite, detail, reload, and delete work.
- Settings clear profile, clear history, and clear all App Store MVP local data work.
- `/privacy` page is reachable.
- Email report, PDF export, Bike Scout, waitlist, payment, account/login, push, and marketplace automation are not visible.
- No marketplace scraping or login-gated marketplace automation is exposed.
- API requests use same-origin relative paths such as `/api/status`.
- No client-side secrets appear in the client bundle or public env vars.
- Default web MVP still works on `www.mandysbikefinder.com`.

## TestFlight / App Review Implications

For the first TestFlight:

- If `app.mandysbikefinder.com` is ready, configure the iOS shell to load `https://app.mandysbikefinder.com/`.
- If not, configure the iOS shell to load a stable Vercel Preview/staging URL built with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`.

For App Store submission:

- Prefer switching the shell to `https://app.mandysbikefinder.com/` before submitting for review.
- If a preview URL is used for TestFlight, document that it is temporary and replace it before final App Store submission.

App Review Notes should explain:

- The app loads a hosted Vercel App Store MVP surface.
- Protected server-side work remains on Vercel API routes.
- No provider secrets are bundled in the iOS app.
- No account, payment, subscription, or marketplace scraping is included in the first version.
- AI only runs after a clear user action if enabled; local fallback works without AI.
- Profile and History are stored locally, and Settings contains local data controls.

## Decision Before Adding Capacitor

Before `[Infra] Add Capacitor Dependencies And Config`, choose one exact URL:

1. Preferred: `https://app.mandysbikefinder.com/`
2. Acceptable for first TestFlight only: a stable Vercel Preview/staging URL with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`

Do not use `https://www.mandysbikefinder.com/` for the iOS shell unless the product intentionally retires or replaces the public web MVP surface.

Recommended next task:

> `[Build] Configure App Store MVP Hosted Deployment In Vercel`

## Vercel Inspection Results

Inspection date: 2026-05-25

Read-only Vercel state found through the connected Vercel tools:

- Team: `mandys-bike-finder's projects`
- Team ID: `team_3UkGf5gETr3QzaBsVhPSE8py`
- Existing project: `mandys-bike-finder`
- Existing project ID: `prj_RR9FixvomHrsRSOZkom2bXWpCA7m`
- Framework: Next.js
- Production branch observed from deployment metadata: `main`
- Latest production deployment target: `production`
- Latest production deployment state: `READY`
- Current production aliases include:
  - `www.mandysbikefinder.com`
  - `mandysbikefinder.com`
  - `mandys-bike-finder-mandys-bike-finder-s-projects.vercel.app`
  - `mandys-bike-finder-git-main-mandys-bike-finder-s-projects.vercel.app`

Public web MVP status:

- `https://www.mandysbikefinder.com/` loads successfully.
- The response shows the default web MVP hero/long-page surface, not the App Store MVP tab shell.
- This confirms `www` should not be changed to App Store MVP mode.

App subdomain status:

- `https://app.mandysbikefinder.com/` is not currently reachable.
- DNS lookup for `app.mandysbikefinder.com` did not resolve during inspection.
- The existing Vercel project domain list did not include `app.mandysbikefinder.com`.

Tooling limitation:

- The connected Vercel MCP exposed project, deployment, and fetch inspection tools, but did not expose safe write tools for creating a separate project, adding domains, or setting environment variables.
- Local Vercel CLI was not available in this workspace.
- No Vercel configuration was changed.

## Recommended Vercel Configuration

Preferred setup:

```text
Project A: mandys-bike-finder
Purpose: public web MVP
Domains: www.mandysbikefinder.com, mandysbikefinder.com
NEXT_PUBLIC_APP_STORE_MVP_MODE: unset or false

Project B: mandys-bike-finder-app
Purpose: App Store MVP / TestFlight / future Capacitor
Domain: app.mandysbikefinder.com
NEXT_PUBLIC_APP_STORE_MVP_MODE: true
```

Use a separate Vercel project if possible because it cleanly prevents `NEXT_PUBLIC_APP_STORE_MVP_MODE=true` from affecting `www.mandysbikefinder.com`.

If a separate project is not practical, use the same project only if Vercel can guarantee separate build/environment behavior for `app.mandysbikefinder.com` without changing the existing `www` production deployment. Do not set `NEXT_PUBLIC_APP_STORE_MVP_MODE=true` on the current production environment while `www` uses that production deployment.

## Manual Vercel Setup Steps

Create the App Store MVP project:

1. In Vercel, create a new project named `mandys-bike-finder-app` or `Mandy Bike Finder App`.
2. Import the same GitHub repo: `Yangc0910/mandys-bike-finder`.
3. Match the existing app project settings:
   - Framework preset: Next.js
   - Root directory: `app`
   - Build/install/output settings: copy from the existing `mandys-bike-finder` project.
   - Node version: match the existing project if possible.
4. Add `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`.
5. Copy only server-side env vars needed for runtime/build, names only:
   - `OPENAI_API_KEY` if AI server routes should be enabled.
   - `OPENAI_MODEL` if used.
   - `ENABLE_LLM_ANALYSIS`, `DAILY_LLM_LIMIT`, `PER_SESSION_LLM_LIMIT` if preserving current AI cost controls.
   - `RESEND_API_KEY`, `REPORT_EMAIL_FROM`, `REPORT_EMAIL_REPLY_TO` only if server routes need to remain configured, even though email is hidden in App Store MVP mode.
   - `APP_BASE_URL` if existing server routes require it; for the app project, consider `https://app.mandysbikefinder.com`.
   - Salesforce/CRM env vars only if those server routes must remain configured.
6. Do not create any `NEXT_PUBLIC_OPENAI_*`, `NEXT_PUBLIC_RESEND_*`, `NEXT_PUBLIC_SALESFORCE_*`, or `NEXT_PUBLIC_*_SECRET` variables.
7. Deploy the new project.

Add the App Store MVP domain:

1. In the new Vercel project, add `app.mandysbikefinder.com`.
2. In GoDaddy DNS, add the DNS record Vercel requests.
3. Expected record if Vercel asks for the standard Vercel subdomain setup:
   - Type: `CNAME`
   - Name/Host: `app`
   - Value/Target: `cname.vercel-dns.com`
   - TTL: default or 1 hour
4. Return to Vercel and wait for domain verification and certificate provisioning.
5. Redeploy after env var changes so `NEXT_PUBLIC_APP_STORE_MVP_MODE=true` is compiled into the client bundle.
6. Open `https://app.mandysbikefinder.com/` and run the hosted URL QA checklist above.

DNS note:

- Do not claim DNS is complete until Vercel marks `app.mandysbikefinder.com` as verified.
- During this inspection, `app.mandysbikefinder.com` did not resolve.

## Final Hosted URL Live QA Result

Inspection date: 2026-05-26

Final URL decision:

- Use `https://app.mandysbikefinder.com/` as the formal hosted URL for Capacitor iOS shell and TestFlight planning.
- Keep `https://www.mandysbikefinder.com/` as the public web MVP.

Domain and deployment checks:

- Public DNS resolvers resolve `app.mandysbikefinder.com` to Vercel via `cname.vercel-dns.com`.
- HTTPS to `https://app.mandysbikefinder.com/` returns `200`.
- TLS verification passed during curl validation.
- The page opens directly into the App Store MVP four-tab shell.
- `https://www.mandysbikefinder.com/` still returns `200` and remains the default web MVP surface.

Routes checked:

| URL | Result |
| --- | --- |
| `https://app.mandysbikefinder.com/` | `200`; App Store MVP mode active; `Profile`, `Evaluate`, `History`, and `Settings` visible; default web MVP marketing/long page not shown. |
| `https://app.mandysbikefinder.com/privacy` | `200`; privacy page reachable. |
| `https://app.mandysbikefinder.com/offline` | `200`; offline page reachable. |
| `https://app.mandysbikefinder.com/api/status` | `200`; status endpoint reachable on same origin. |
| `https://www.mandysbikefinder.com/` | `200`; default public web MVP remains active and does not show the App Store tab shell. |

Functional smoke:

- Profile local save and reload persistence passed in headless browser smoke.
- Evaluate manual entry with a saved child profile generated a local fallback result and exposed `Save to History`.
- Save to History wrote the result to `mbf.appStore.savedEvaluations`.
- Settings privacy/AI/marketplace disclosure was visible.
- Settings `Clear child profile`, `Clear history`, and `Clear all local data` cleared the scoped App Store MVP localStorage keys.

Security/API checks:

- No OpenAI/LLM request was intentionally triggered.
- `/api/status` is same-origin under `app.mandysbikefinder.com`.
- App Store MVP UI did not show email report, PDF export, Bike Scout, waitlist, payment, account/login, push, or marketplace automation surfaces.
- Client-bundle scan found no `api.openai.com`, `OPENAI_API_KEY`, `NEXT_PUBLIC_OPENAI`, `RESEND_API_KEY`, `NEXT_PUBLIC_RESEND`, or likely OpenAI/Resend secret value patterns.
- User-provided link/text/screenshot behavior remains framed as local reference/preview; no automatic marketplace scraping was observed or exposed.

AI OCR note:

- The App Store MVP now treats screenshot OCR/extraction as a core capability.
- `Extract details with AI` may call `/api/extract` only after the user taps the button.
- Vercel must set `ENABLE_LLM_ANALYSIS=true`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `DAILY_LLM_LIMIT`, and `PER_SESSION_LLM_LIMIT` in the `mandys-bike-finder-app` project for live OCR.
- Do not add any `NEXT_PUBLIC_OPENAI_*` variables.

Decision:

- Hosted URL blocker is cleared for `[Infra] Add Capacitor Dependencies And Config`.
- Continue using `https://app.mandysbikefinder.com/` for iOS wrapper configuration unless a later deployment strategy intentionally changes it.
- Capacitor hosted config has been added in `app/capacitor.config.ts`.
- Native iOS platform files have been generated in `app/ios/`; Xcode validation remains a macOS follow-up.

## Previous App Project Preview QA Result

Inspection date: 2026-05-26

Code state:

- `origin/main` is at `9729d72`.
- The connected Vercel MCP timed out during deployment metadata inspection, so the deployment commit could not be confirmed from Vercel metadata in this workspace.
- The live app-project response shows the App Store MVP four-tab surface, which indicates the deployed build includes the App Store MVP mode work rather than the older default-only web MVP.

URLs tested:

| URL | Result |
| --- | --- |
| `https://mandys-bike-finder-app.vercel.app/` | `200`; App Store MVP mode is active; `Profile`, `Evaluate`, `History`, and `Settings` are visible; default web marketing/long page is not shown. |
| `https://mandys-bike-finder-app.vercel.app/privacy` | `200`; privacy page reachable. |
| `https://mandys-bike-finder-app.vercel.app/offline` | `200`; offline page reachable. |
| `https://app.mandysbikefinder.com/` | DNS did not resolve; custom app domain is not live yet. |
| `https://www.mandysbikefinder.com/` | `200`; default public web MVP remains active and does not show the App Store tab shell. |

API and security checks:

- `https://mandys-bike-finder-app.vercel.app/api/status` returns `200`.
- App-project `/api/status` reports `emailReportEnabled=false`, `resendConfigured=false`, and `appBaseUrlConfigured=false`, which is acceptable for the local-first App Store MVP preview but should be reviewed before enabling optional server features.
- Static client-bundle scan found no `api.openai.com`, `OPENAI_API_KEY`, `NEXT_PUBLIC_OPENAI`, `RESEND_API_KEY`, `NEXT_PUBLIC_RESEND`, or likely OpenAI/Resend secret value patterns.
- The app-project client bundle does include inert default-web code strings such as Bike Scout/platform automation notes, but those surfaces were not visible in the App Store MVP UI.

Functional smoke status:

- Headless browser DOM check confirmed the App Store MVP shell renders as the first surface.
- Full interactive localStorage QA should be repeated manually or with browser automation against the final URL before Capacitor, especially Profile save/reload, Evaluate local result, Save to History, favorite/delete, and Settings clear controls.

## Current Hosted URL Decision Status

Final intended iOS URL:

- `https://app.mandysbikefinder.com/`

Current status:

- Decision made and live.
- The final app domain is live at `https://app.mandysbikefinder.com/`.
- The isolated app project preview is live at `https://mandys-bike-finder-app.vercel.app/`.
- The hosted URL blocker is cleared for the next Capacitor setup task.

## Direct Setup Capability Check

Inspection date: 2026-05-25

Attempted direct setup capability check:

- Vercel MCP project/deployment/domain inspection: available.
- Vercel MCP create project: not available in the current exposed tool set.
- Vercel MCP add domain: not available in the current exposed tool set.
- Vercel MCP set environment variable: not available in the current exposed tool set.
- Vercel MCP trigger deployment: available only for deploying the current project, not for safely creating an isolated App Store MVP project.
- Local Vercel CLI: not installed in this workspace.
- Local `.vercel/project.json`: absent.
- `VERCEL_TOKEN`: absent.
- `VERCEL_TEAM_ID` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`: absent.

Direct setup decision:

- Do not modify the existing `mandys-bike-finder` project.
- Do not set `NEXT_PUBLIC_APP_STORE_MVP_MODE=true` on the existing project because it serves `www.mandysbikefinder.com`.
- Manual Vercel setup is required unless a safe write-capable Vercel token/CLI/session is provided later.
- Re-check after reconnecting the Vercel app produced the same result: read access is available, but safe project/env/domain write capabilities are still not exposed in the current tool set.

Exact manual next step:

1. Create a separate Vercel project named `mandys-bike-finder-app`.
2. Import `Yangc0910/mandys-bike-finder`.
3. Use root directory `app` and Next.js framework settings matching `mandys-bike-finder`.
4. Set `NEXT_PUBLIC_APP_STORE_MVP_MODE=true` only in the new app project.
5. Add `app.mandysbikefinder.com` to the new app project.
6. Add the GoDaddy DNS record requested by Vercel, likely `CNAME app -> cname.vercel-dns.com`.
7. Redeploy and run the hosted URL QA checklist.

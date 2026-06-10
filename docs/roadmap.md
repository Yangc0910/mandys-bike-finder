# Roadmap

Current PRD: `docs/PRD.md` v0.6

## Post-Launch Version 1.1 Workstream

Mandy's Bike Finder version 1.0 is live on the App Store and is now the stable production baseline.

- Production tag: `v1.0.0-app-store-release`
- Production branch: `main`
- Version 1.1 integration branch: `release/v1.1-ui-polish`
- Detailed workstream: `docs/workstreams/post-launch-updates.md`
- Release plan: `docs/releases/v1.1.0-plan.md`
- UX polish PRD: `docs/prd/versions/v1.1.md`
- Post-launch roadmap: `docs/product/post-launch-roadmap.md`

Version 1.1 goals:

- Polish the GUI and mobile interaction.
- Improve first-time guidance and visual hierarchy.
- Clarify Profile, Evaluate, Result, History, and Settings.
- Improve loading, launch, offline, and error states.
- Upgrade App Store screenshots without overpromising features.

Version control policy:

- Keep `main` deployable and representative of production.
- Treat the v1.0 release tag as immutable.
- Build v1.1 through small, reviewable tasks on the release branch.
- Verify preview and mobile regression behavior before merging to `main`.
- Create the v1.1 production tag only after deployment and App Store release verification.
- Do not force-push shared production history or release tags.

Task sequence:

1. `[Build] Tag v1.0.0 App Store Release And Create v1.1 Branch`
2. `[Product] Define Version 1.1 UX Polish PRD`
3. `[Design] Define App Visual System v1.1`
4. `[UX] Polish App Shell And Navigation`
5. `[UX] Polish Profile Screen`
6. `[UX] Polish Evaluate Input And Review Flow`
7. `[UX] Polish Result Card And Seller Message`
8. `[UX] Polish History Screen`
9. `[Infra] Improve Loading And Offline States`
10. `[Design] Prepare App Store Screenshot Storyboard`
11. `[Build] Generate Screenshot Test Data And Capture Checklist`
12. `[QA] v1.1 Mobile Regression Pass`

Release readiness requires preserved local Profile/History/Settings behavior, local Evaluate fallback, explicit AI actions, no initial LLM call, server-side-only provider keys, working `/privacy` and `/offline`, unaffected public `www`, verified hosted app changes, mobile regression completion, and finalized release/screenshot assets.

## Phase 0: Documentation and Repo Setup

- Establish repository structure.
- Define PRD as source of truth.
- Record PRD history.
- Record product decisions.
- Add README, changelog, user flows, scoring logic, and API cost-control docs.

## Phase 1: Front-End MVP With Mock/Local Rules

- Build a clean web MVP.
- Add child profile form.
- Add link, screenshot, and manual listing input flows.
- Add listing confirmation/editing step.
- Add local rule-based fit recommendation.
- Add local/mock price reference estimate.
- Add red/yellow/green result page.
- Add dimension-level assessments.
- Add seller questions.
- Add Negotiation Boost UI and local message generation.
- Add Email Report UI placeholder and local report preview.
- Add service interfaces for future search, OCR, email, and backend metadata logging.

No real external APIs in Phase 1.

## Phase 1.5: Controlled Real API Beta

- Production deployment path is now a Vercel-hosted Next.js app under `/app`.
- Migrate the working `web/` prototype into `/app` using Next.js, TypeScript, Tailwind CSS, and App Router API routes.
- Use real API integrations where practical for LLM parsing/reasoning, trusted web search price reference, email report delivery, and backend metadata logging.
- Keep every integration behind a provider abstraction and feature flag.
- Add cost controls from the beginning, including per-session or per-IP daily limits and global daily limits.
- Add fallback modes so the app remains functional if APIs fail, feature flags are off, API keys are missing, or limits are reached.
- Cache repeated trusted-retailer search queries.
- Run all external API calls server-side only.
- Never expose API keys to frontend code.
- Show clear UI status when live checks are unavailable and fallback estimates are used.
- Prepare Vercel deployment using the free Vercel-provided domain, such as `mandys-bike-finder.vercel.app`.
- Configure Vercel's root directory as `app`.
- Configure feature flags, API limits, and provider credentials only through Vercel Environment Variables.
- Confirm deployment by opening the Vercel URL, running a sample listing analysis, and verifying fallback behavior when APIs are disabled.
- `mandysbikefinder.com` is registered, but custom-domain deployment should happen later in this order:
1. Finish Next.js migration under `/app`.
2. Verify local build.
3. Deploy first to a Vercel free domain.
4. Test the MVP flow.
5. Then connect `mandysbikefinder.com`.
- Verify API cost-control safeguards before any public deployment.
- Never commit API keys, `.env`, OAuth secrets, database URLs, credentials, or tokens to GitHub.
- Keep the old `web/` folder as a legacy prototype until the `/app` deployment path is fully verified.

## Phase 2: Screenshot Upload and Extraction

- Add real screenshot extraction/OCR behind an interface.
- Keep confirmation/editing step mandatory.
- Improve listing text parsing.
- Track extraction confidence.

## Phase 3: Live Price Reference Search

- Add replaceable search provider.
- Restrict sources to trusted retailers and official brand sites.
- Add caching.
- Enforce per-session and daily API limits.
- Keep fallback local price ranges.

## Phase 4: Email Report Backend

- Implement email report sending.
- Store backend metadata with privacy-preserving buckets.
- Add backend rate limits and abuse protection.
- Keep user accounts out of MVP unless absolutely needed.

## Phase 5: Polish, Shareable Reports, Analytics

- Improve responsive UI.
- Add shareable report views if privacy model supports it.
- Add analytics dashboards based on metadata.
- Tune local analysis logic from real usage.

## Future

- PWA.
- iOS app.
- Affiliate links.
- Saved listings.
- User accounts.
- Family sharing.
- Marketplace watchlist.
- More advanced live price tracking.

## App Store Launch Path

Recommended path for the existing product:

1. Current Next.js web app.
2. Mobile-first app-like UX polish.
3. PWA-ready foundation.
4. Capacitor iOS wrapper that loads the app experience while using server-side APIs for protected work.
5. Xcode build/signing.
6. TestFlight beta.
7. App Store submission after native-quality polish and privacy review.

Capacitor is the preferred future path for this codebase because the production MVP already lives in a Next.js app and most value is in the existing guided bike-check workflow, analysis rules, screenshots, reports, and server-side provider boundaries. React Native or Expo should be reconsidered only if the product needs deep native UI, heavy offline workflows, native background execution, or a rewritten mobile interaction model.

Before iOS wrapping, the app should add or verify:

- Mobile-first layout quality across small iPhone screens.
- PWA basics: manifest, app icons, theme color, safe-area handling, and graceful offline/unavailable states.
- App-like navigation and state restoration, not a thin browser frame.
- A durable backend path for any production waitlist, saved searches, usage limits, and API logging.
- A privacy policy that covers child profile inputs, listing screenshots, listing links, email reports, AI analysis, CRM sync, retention, deletion requests, and third-party processors.
- A lightweight public privacy draft now exists at `/privacy`; final contact details and legal/product review are still required before App Store submission.
- Explicit user-triggered AI actions only; no LLM calls on initial app load.
- OpenAI and other provider keys kept server-side only.
- Preserved fallback/mock behavior when APIs are disabled, limited, or unavailable.

App Store review risks to resolve before submission:

- Rejection risk if the app appears to be only a repackaged website with minimal native/app-like value.
- Privacy risk if screenshots or child-related profile data are collected without clear disclosure and retention rules.
- Compliance risk if marketplace extraction implies scraping login-gated pages, bypassing anti-bot systems, or automating unsupported sources.
- Payment risk if future paid digital features are sold outside Apple's rules; evaluate Apple in-app purchase requirements before charging for Bike Scout inside iOS.

Small implementation tasks should be tracked separately from this planning note.

Hosted App Store MVP URL decision:

- Keep `https://www.mandysbikefinder.com/` as the public web MVP surface.
- Use a separate App Store-facing hosted URL for Capacitor/TestFlight.
- Preferred production App Store URL: `https://app.mandysbikefinder.com/` with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`.
- Current isolated app-project preview URL: `https://mandys-bike-finder-app.vercel.app/`.
- Acceptable first TestFlight fallback: a stable Vercel Preview/staging or isolated `.vercel.app` URL built with `NEXT_PUBLIC_APP_STORE_MVP_MODE=true`.
- Configure Capacitor to load `https://app.mandysbikefinder.com/`.
- Detailed checklist: `docs/product/hosted-app-store-mvp-url-qa.md`.
- Live QA on 2026-05-26 confirmed `https://mandys-bike-finder-app.vercel.app/` loads the App Store MVP tab shell by default and `https://www.mandysbikefinder.com/` remains the default web MVP.
- Final hosted URL QA on 2026-05-26 confirmed `https://app.mandysbikefinder.com/` is live over HTTPS, opens App Store MVP mode by default, and keeps `www` unaffected.
- OCR live QA on 2026-05-30 confirmed `https://app.mandysbikefinder.com/api/extract` returns real OpenAI screenshot extraction results when server-side AI env vars are enabled. Follow-up tuning added explicit `location` / `listingLink` extraction and `asking 90` price parsing.
- Close-to-final App Review polish on 2026-05-30 finalized privacy/support copy, Settings version display, OCR extraction review UX, and added `docs/product/app-store-final-review-checklist.md`.
- Hosted URL blocker is cleared.
- `[Infra] Add Capacitor Dependencies And Config` is complete with hosted URL `https://app.mandysbikefinder.com`.
- `[Infra] Generate Capacitor iOS Project And Validate Xcode Open` generated `app/ios/`, completed `cap sync`, and added iOS camera/photo-library usage descriptions; Xcode validation remains pending on macOS.
- Xcode/TestFlight preparation checklist: `docs/product/xcode-testflight-preparation.md`.
- Next implementation task: `[Build] Xcode And TestFlight Preparation Pass`.

Initial App Store readiness tasks:

- `[UX] Mobile App Shell Audit`: documented in `docs/product/mobile-app-shell-audit.md`.
- `[Infra] PWA Foundation`: started with app manifest, iOS metadata, safe-area shell styles, and offline/unavailable messaging.
- `[Product] App Store Privacy And Review Brief`: documented in `docs/product/app-store-privacy-review-brief.md`.

## App Store MVP Scope

The first App Store MVP should be smaller and more app-like than the full web MVP.

MVP positioning:

> Mandy's Bike Finder App Store MVP is a mobile decision tool that helps parents quickly evaluate whether a used kids' bike listing fits their child, is fairly priced, and is worth contacting the seller.

Recommended navigation:

1. `Profile`
2. `Evaluate`
3. `History`
4. `Settings`

This structure is preferred over a generic `Home` tab because it makes the app open around durable utility: child fit, listing evaluation, saved decisions, and privacy/data controls.

Included in the first App Store MVP:

- Child profile inputs and local child profile save.
- Local bike fit matching.
- Screenshot, pasted link/text, and manual listing input.
- Mandatory listing review/edit step.
- Local fallback analysis.
- Optional explicit AI extraction/analysis behind existing feature flags and server-side limits.
- Red/yellow/green result recommendation.
- Local saved history / saved evaluations.
- Favorite or shortlist marker.
- Settings/About/Privacy surface.

Simplified for the first App Store MVP:

- Listing links are reference metadata plus pasted-text/screenshot guidance, not broad automated extraction.
- Seller negotiation message is local-first and compact.
- AI is labeled as optional assistance and must be triggered by a user action.
- Facebook, OfferUp, and Craigslist behavior stays user-assisted; do not claim automated monitoring.

Hidden, removed from the App Store MVP surface, or deferred:

- Email report entry point.
- PDF export.
- Bike Scout waitlist and paid positioning.
- Automatic deal search.
- Marketplace scraping.
- Payment/subscription.
- User account/login.
- Push notifications.

Review risk reduction:

- Avoid a thin website wrapper by using app-like bottom navigation and local saved history.
- Keep Profile, Evaluate, and History useful without accounts, payments, or email.
- Keep OpenAI and provider keys server-side only.
- Keep `ENABLE_LLM_ANALYSIS`, daily/session limits, and fallback/mock behavior.
- Do not call an LLM on initial page load.
- Do not scrape login-gated marketplaces or bypass anti-bot systems.

Detailed scope lives in:

- `docs/workstreams/product-strategy.md`
- `docs/workstreams/frontend-ux.md`

Executable PRD slice:

- `docs/product/app-store-mvp-prd.md`

Screen-level wireframe and frontend plan:

- `docs/product/app-store-tab-shell-wireframe.md`

Implementation sequence:

1. `[UX] Implement App Store Tab Shell Skeleton`
2. `[UX] Implement Profile Tab Local Save`
3. `[UX] Implement Evaluate Tab Flow`
4. `[UX] Implement Result Card And Save To History`
5. `[UX] Implement History Tab Local Storage`
6. `[Infra] Implement Settings Data Controls`
7. `[AI Engine] Explicit AI Action Copy Pass`
8. `[Build] Mobile QA And Regression Pass`

Recommended first implementation task:

- `[UX] Implement App Store Tab Shell Skeleton`

Why first:

- The App Store MVP is a smaller app surface than the web MVP.
- Implementing the four-tab shell first prevents accidental one-page-web-app behavior.
- It clarifies which existing web features are visible, hidden, or deferred before feature flags or local persistence are implemented.

Risks and dependencies:

- App Store review risk stays high if the app still feels like a website wrapper instead of a four-tab mobile tool.
- History/local saved evaluations are now core to v1 because email report and PDF export are deferred.
- Settings data controls must exist before serious TestFlight/App Store review because child profile, screenshots, AI processing, and saved history need visible disclosure and clearing paths.
- AI actions must remain explicit and server-side; no LLM call may happen on initial app load.
- Marketplace links must stay user-provided context; no scraping, automatic monitoring, or login-gated automation should be exposed.

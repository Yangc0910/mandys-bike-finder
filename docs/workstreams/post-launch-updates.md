# Workstream: Post-Launch Updates

Status: Active planning

Current release target: Version 1.1

Production baseline: `v1.0.0-app-store-release`

Integration branch: `release/v1.1-ui-polish`

Detailed release PRD: `docs/prd/versions/v1.1.md`

Visual system: `docs/product/app-visual-system-v1.1.md`

Screenshot storyboard: `docs/product/app-store-screenshot-storyboard-v1.1.md`

## Purpose

Mandy's Bike Finder post-launch software update workstream focuses on controlled iteration after the App Store v1.0 launch. Version 1.0 remains the stable production baseline. Work should improve the shipped product in small, testable increments without reopening MVP scope or destabilizing the hosted app.

## Version 1.1 Theme

Version 1.1 focuses on:

- GUI polish.
- Better mobile interaction.
- Clearer user guidance.
- A more professional app feel.
- Improved loading, splash, and launch experience.
- Improved App Store screenshots and marketing presentation.

## Version 1.1 Product Goals

1. Make the app feel more polished and trustworthy.
2. Improve first-time user guidance.
3. Improve visual hierarchy on mobile.
4. Make Evaluate easier to understand.
5. Make result cards more actionable and visually polished.
6. Make History feel like a useful saved-decisions area.
7. Improve Settings and Privacy as a trust surface.
8. Improve loading, splash, and launch experience.
9. Prepare App Store screenshots that look closer to high-quality consumer apps.

## Non-Goals

Version 1.1 does not include:

- Account system.
- Subscription or payment.
- Marketplace scraping.
- Bike Scout automation.
- Major AI backend changes.
- New paid features.
- Large architecture rewrite.
- Risky API changes.
- Broad Capacitor restructuring.

## Stability Requirements

Every v1.1 task must preserve:

- Profile local save, edit, and clear behavior.
- Evaluate local fallback.
- History local storage and saved result snapshots.
- Settings local data controls.
- `/privacy`.
- `/offline`.
- No OpenAI or LLM call on initial load.
- Server-side-only OpenAI, Resend, and provider keys.
- `www.mandysbikefinder.com` unaffected.
- `app.mandysbikefinder.com` unaffected except for intended, verified app UI changes.
- No marketplace scraping or login-gated automation.
- Explicit user action before AI extraction.

## GUI And UX Plan

### Overall Design System

- Typography: define a small mobile type scale with clear page title, section title, body, helper, label, and status styles. Keep body text readable and avoid excessive uppercase microcopy.
- Spacing: use a consistent 4/8-point rhythm, predictable card padding, and deliberate separation between setup, action, and result content.
- Card hierarchy: distinguish primary decision cards, supporting detail cards, and utility rows through border, elevation, tint, and spacing rather than many unrelated styles.
- Buttons: define primary, secondary, quiet, destructive, and icon-button treatments with consistent height, pressed, disabled, and loading states.
- Color: retain the existing blue brand base, refine neutrals, and use success/warning/danger colors for meaning. Do not rely on color alone.
- Icons: use one lightweight, consistent icon family or existing inline SVGs. Icons should clarify navigation and actions, not decorate every label.
- Empty states: pair concise explanation with one clear next action and, where useful, a small branded visual.
- Loading states: reserve layout space, show a specific action label, prevent duplicate submissions, and avoid indefinite generic spinners.
- Error states: explain what failed, what data was preserved, whether local fallback is available, and what the user can do next.

### Navigation And App Shell

- Add consistent tab icons and stronger active-tab treatment while preserving text labels.
- Verify bottom navigation touch targets and safe-area padding on small and large iPhones.
- Use a compact, consistent page header with optional contextual action.
- Reduce visual jumps when switching tabs or entering review/result states.
- Consider simple CSS opacity/translate transitions only when they respect reduced-motion preferences and do not add dependencies.
- Keep the shell fast and usable in the hosted Capacitor strategy.

### Profile

- Replace first-time setup density with a short value explanation: the profile powers fit guidance and stays on the device.
- Group required fit inputs separately from optional preferences.
- Show a concise saved-profile summary with a clear edit action.
- Reframe the wheel-size recommendation as the primary outcome, with "best now," growth option, and fit caution in a polished card.
- Keep a direct "Evaluate a bike" next step after profile save.

### Evaluate

- Present Screenshot, Listing text/link, and Manual as clear input choices with short "best for" guidance.
- Make screenshot upload a purposeful drop/select area with preview, replace, remove, and privacy/AI explanation.
- Separate "Add listing," "Review details," and "See recommendation" into visible flow stages.
- Keep extracted fields editable and highlight uncertain or missing fields without implying AI certainty.
- Explain that AI extraction is optional and user-triggered; explain that fit/deal guidance can still use local analysis.
- Use one dominant primary action at a time and keep disabled-state guidance close to it.

### Result

- Lead with a plain-language recommendation and one-sentence rationale.
- Present fit, deal, and risk as three comparable, accessible score/status blocks.
- Add a clear "What to do next" section with inspect, ask, offer, or skip guidance.
- Present the seller message in a clean copy-ready card with an explicit copy action.
- Make "Save to History" visible but secondary to understanding the recommendation.
- Avoid fake precision and avoid claims that imply safety certification.

### History

- Treat History as saved decisions, not a technical event log.
- Improve cards with recommendation, listing title, price, wheel size, child, saved date, and favorite state in a predictable hierarchy.
- Add a polished empty state that returns the user to Evaluate.
- Make favorites visually findable without hiding non-favorites.
- Keep detail, favorite, and delete actions clear and difficult to trigger accidentally.

### Settings And Privacy

- Group settings into Privacy and AI, Local Data, Support, and About.
- State clearly what remains on the device and what may be sent only after a user-triggered AI action.
- Show local data counts before destructive actions.
- Keep destructive controls visually separated and confirm clear-all behavior.
- Use plain-language AI disclosure and avoid technical provider marketing.

## Loading And Launch Plan

### Web App Loading

- Use Mandy's Bike Finder branding, the production icon/mark, and a short tagline such as "Confident used-bike decisions for parents."
- Keep the visual lightweight: static brand composition plus an optional subtle CSS-only fade or progress treatment.
- Do not load fonts, animation libraries, AI, or provider status calls solely for the loading screen.
- Transition into the app promptly and avoid showing loading after the interactive shell is ready.

### Native iOS And Capacitor

- Web app owns route/content loading states, offline messaging, and recovery after the hosted page begins loading.
- Native iOS owns the immediate cold-start launch screen in `LaunchScreen.storyboard` and the splash assets under `Assets.xcassets`.
- Keep native launch visuals visually aligned with the web loading state to avoid a jarring handoff.
- Do not add a complex native navigation layer or bundled-app rewrite in v1.1.
- Test cold launch, warm launch, slow network, no network, and hosted-app recovery before release.

### Offline And Failure States

- Preserve `/offline`.
- Improve the in-app offline banner so it explains that saved Profile, History, and local guidance may remain available.
- State explicitly that screenshot AI extraction and other server features require a connection.
- Provide retry/reload actions only where they can actually recover.
- Never imply that AI is working offline.

## App Store Screenshot Workstream

Goal: make App Store screenshots polished, trustworthy, and consumer-app-quality without promising unshipped behavior.

Use real app captures as the source of truth, then place them in restrained marketing frames with headline text, consistent background color, and safe margins. Do not fabricate controls, scores, or features. Capture from the iOS simulator for final assets because it best represents the submitted app shell; browser captures are suitable for storyboard drafts only.

### Proposed Sequence

| # | Screen | Headline | Subheadline | Visual focus | Sample state | Capture source | Additional design |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Saved Profile / recommendation | Find the right bike size | Build a child profile and get practical fit guidance. | Brand, child summary, wheel-size recommendation | "Mandy", age 7, 122 cm, comfortable rider, 20-inch recommendation | Simulator | Marketing frame and subtle brand background |
| 2 | Profile setup | Guidance built for your child | Height, age, and riding confidence shape every recommendation. | Required fields and simple onboarding | Same child profile before save; no private real data | Simulator | Small callout labels only if they match real UI |
| 3 | Evaluate screenshot input | Check a used-bike listing | Add a screenshot, review the details, then decide. | Screenshot upload, preview, and review progression | Fictional 20-inch Trek kids bike, $110 | Simulator | Marketing frame; no marketplace logo emphasis |
| 4 | Result | See fit, deal, and risk clearly | Get a practical recommendation and know what to do next. | Overall verdict plus fit/deal/risk and next action | "Worth contacting" with balanced, believable statuses | Simulator | Strongest hero frame; may crop to emphasize result |
| 5 | History | Save the bikes worth considering | Keep your decisions organized on this device. | Two or three saved cards and favorite state | Fictional varied bikes and prices | Simulator | Marketing frame with consistent sequence styling |
| 6 | Settings / Privacy | Your data stays in your control | Local saves, clear controls, and optional user-triggered AI. | Local data summary, privacy link, AI disclosure | One profile and two saved evaluations | Simulator | Optional; use only if it strengthens the listing |

### Screenshot Data Rules

- Use fictional sample child and listing data.
- Do not use a real seller's name, photo, address, message, or listing URL.
- Do not show marketplace scraping, automatic monitoring, paid features, accounts, or cloud sync.
- Keep recommendations realistic and avoid universal safety claims.
- Ensure the same sample state is reproducible for recapture.

### Sizes And Production Method

- Prepare the primary portrait set for Apple's current 6.9-inch iPhone class.
- Accepted portrait sizes currently include `1260 x 2736`, `1290 x 2796`, and `1320 x 2868` pixels.
- Prefer a simulator/device capture that natively produces an accepted size; do not stretch a smaller raster capture.
- Export final marketing frames as PNG or high-quality JPEG with one to ten screenshots.
- Recheck Apple's official screenshot specification immediately before upload because accepted devices and dimensions can change.
- If iPad distribution remains enabled, prepare a separate iPad composition instead of scaling the iPhone marketing frames.

Official reference: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications

## Codex-Sized Task Sequence

### 1. [Build] Tag v1.0.0 App Store Release And Create v1.1 Branch

- Scope: preserve the v1.0 production commit, establish the v1.1 integration branch, and document release policy.
- Files likely touched: `docs/releases/*`, `docs/product/post-launch-roadmap.md`, `docs/roadmap.md`, `README.md`.
- Acceptance criteria: immutable v1.0 tag exists; v1.1 branch starts at the same commit; remote alignment is recorded; no production code changes.
- Risks: tagging the wrong commit or implying a tag is remote before it is pushed.
- Type: Docs and Git operations only.

### 2. [Product] Define Version 1.1 UX Polish PRD

- Status: Complete on 2026-06-10.
- Scope: convert this plan into screen-level requirements, priorities, and measurable acceptance criteria.
- Files likely touched: `docs/prd/versions/v1.1.md`, `docs/prd/history.md`, `docs/releases/v1.1.0-plan.md`.
- Acceptance criteria: every scoped screen has user problem, behavior, non-goals, edge states, and release criteria.
- Risks: scope creep into accounts, backend changes, or new product features.
- Type: Docs only.

### 3. [Design] Define App Visual System v1.1

- Status: Complete on 2026-06-10.
- Scope: specify type, spacing, color, card, button, icon, and state tokens using the existing brand direction.
- Files likely touched: `docs/product/app-visual-system-v1.1.md`, later `app/app/globals.css`, `app/tailwind.config.ts`.
- Acceptance criteria: token table and component examples cover normal, pressed, disabled, loading, error, and empty states.
- Risks: visual churn, inaccessible contrast, or styles that conflict with existing Tailwind usage.
- Type: Docs first; implementation in a separate focused change.

### 4. [UX] Polish App Shell And Navigation

- Status: Complete on 2026-06-10.
- Scope: improve header consistency, tab icons/states, touch targets, safe areas, and lightweight transitions.
- Files likely touched: `app/app/page.tsx`, `app/app/globals.css`.
- Acceptance criteria: all four tabs remain reachable; active state is unambiguous; no content is hidden behind safe areas; reduced motion is respected.
- Risks: mobile viewport regressions or state resets during tab changes.
- Type: Implementation.

### 5. [UX] Polish Profile Screen

- Status: Complete on 2026-06-10.
- Scope: improve first-time guidance, input grouping, saved profile summary, and wheel-size recommendation hierarchy.
- Files likely touched: `app/app/page.tsx`, `app/app/globals.css`.
- Acceptance criteria: required fields are obvious; local-save messaging is clear; existing profile persistence remains compatible; Evaluate is the obvious next step.
- Risks: breaking existing localStorage data or changing recommendation logic unintentionally.
- Type: Implementation.

### 6. [UX] Polish Evaluate Input And Review Flow

- Status: Complete on 2026-06-10.
- Scope: clarify input-method selection, screenshot upload, review/edit stage, optional AI explanation, and primary CTA.
- Files likely touched: `app/app/page.tsx`, `app/app/globals.css`; API routes only if a UI defect requires no behavior change.
- Acceptance criteria: screenshot selection never starts AI; review remains editable; manual/local fallback remains available; one primary action is clear at each stage.
- Risks: accidental API behavior changes, duplicate requests, or misleading AI copy.
- Type: Implementation.

### 7. [UX] Polish Result Card And Seller Message

- Status: Complete on 2026-06-10.
- Scope: improve recommendation hierarchy, fit/deal/risk layout, next-step guidance, seller message, copy action, and save CTA.
- Files likely touched: `app/app/page.tsx`, `app/app/globals.css`, focused tests for display/helper logic if extracted.
- Acceptance criteria: recommendation is understandable at a glance; statuses are not color-only; message is easy to copy; save behavior is unchanged.
- Risks: overstated confidence, safety implications, or changed analysis semantics.
- Type: Implementation.

### 8. [UX] Polish History Screen

- Status: Complete on 2026-06-10.
- Scope: improve saved-decision cards, empty state, favorite visibility, details, and destructive actions.
- Files likely touched: `app/app/page.tsx`, `app/app/globals.css`.
- Acceptance criteria: existing saved records still render; favorite/delete still work; empty state links to Evaluate; no live re-analysis occurs.
- Risks: local data compatibility or accidental record deletion.
- Type: Implementation.

### 9. [Infra] Improve Loading And Offline States

- Status: Complete on 2026-06-10.
- Scope: align native launch and web loading visuals, improve offline banner/page, and define recovery behavior.
- Files likely touched: `app/public/launch-screen.svg`, `app/app/offline/page.tsx`, `app/app/globals.css`, `app/ios/App/App/Base.lproj/LaunchScreen.storyboard`, splash assets if approved.
- Acceptance criteria: cold/warm/slow/offline launches are coherent; no heavy dependency; no initial LLM call; offline copy is accurate.
- Risks: blank hosted-app launch, stale splash assets, or implying server features work offline.
- Type: Implementation with native asset review.

### 10. [Design] Prepare App Store Screenshot Storyboard

- Status: Complete on 2026-06-11.
- Scope: finalize sequence, copy, composition, sample state, and visual frame template.
- Files likely touched: `docs/product/app-store-screenshot-storyboard-v1.1.md`, design source assets.
- Acceptance criteria: six frames tell one coherent story, use only shipped features, and have approved headline/subheadline copy.
- Risks: overpromising, tiny UI, inconsistent sample data, or marketplace branding concerns.
- Type: Docs/design only.

### 11. [Build] Generate Screenshot Test Data And Capture Checklist

- Status: Complete on 2026-06-11.
- Scope: define reproducible fictional profile, listings, results, History records, device setup, and capture steps.
- Files likely touched: `docs/product/app-store-screenshot-capture-checklist-v1.1.md`; optional development-only fixture isolated from production.
- Acceptance criteria: another contributor can recreate every screenshot without real personal data; status bar and device state are controlled.
- Risks: fixture code leaking into production or non-deterministic recommendation output.
- Type: Docs first; optional development-only implementation.

### 12. [QA] v1.1 Mobile Regression Pass

- Status: Local and protected-preview passes complete on 2026-06-11; simulator build passes, but native flow verification awaits a Capacitor-accessible staging URL before TestFlight.
- Scope: validate core flows, accessibility basics, launch/offline states, storage compatibility, APIs, and deployment isolation.
- Files likely touched: `docs/testing-notes.md`, `docs/releases/v1.1.0-plan.md`, issue records.
- Acceptance criteria: Profile, Evaluate fallback/AI trigger, History, Settings, `/privacy`, `/offline`, small/large iPhone, no-initial-LLM, and both domains pass.
- Risks: hosted environment differences, missed device-specific layout defects, or incomplete rollback evidence.
- Type: QA and docs.

## Immediate Next Task

Provide a stable release-candidate staging URL that does not require interactive Vercel authentication inside Capacitor. Then rerun cold/warm launch, slow/no-network recovery, destructive-action confirmations, the core flow, and TestFlight on an iPhone-class simulator or physical device.

# App Store Tab Shell Wireframe

Status: Frontend UX implementation plan  
Last updated: 2026-05-25

## Goal

Reorganize Mandy's Bike Finder from a long web-style MVP page into a focused four-tab App Store MVP shell:

1. `Profile`
2. `Evaluate`
3. `History`
4. `Settings`

This document is planning only. It does not implement code, add dependencies, change API behavior, or remove existing web functionality.

## 1. Four-Tab Wireframe

### Profile Tab

Purpose:

- Own the child profile and bike fit recommendation.
- Make the app useful before the user has a listing.

Top header:

- Title: `Profile`
- Subtitle: `Save your rider details for faster bike checks.`
- Small status text when saved: `Saved on this device`

Empty state:

- Card title: `Add your rider`
- Copy: `Height, age, and riding experience help Mandy estimate the right bike size.`
- CTA: `Create profile`
- Secondary note: `Stored locally. No account needed.`

Form field order:

1. Height
   - Unit control: `cm` / `ft-in`
   - Required
2. Age
   - Required
3. Riding experience
   - Required
   - Options: beginner, comfortable, confident, advanced
4. Weight
   - Optional
   - Unit control: `lb` / `kg`
5. Style preference
   - Optional
6. Color preference
   - Optional multi-select

Validation messages:

- Missing height: `Enter height to estimate bike size.`
- Missing age: `Enter age so the recommendation can sanity-check the size.`
- Missing riding experience: `Choose riding experience to adjust fit confidence.`
- Invalid height/age: `Check this value before saving.`

Save/edit state:

- Empty profile: show form and `Save profile`.
- Saved profile: show summary card first with `Edit profile`.
- Editing saved profile: show `Save changes` and `Cancel`.
- Any changes after saved state should show `Unsaved changes`.

Active profile summary card:

- Rider height and age.
- Riding experience.
- Recommended wheel size.
- Recommended bike type.
- Growth note.
- Two compact lists: `Look for` and `Avoid`.

Next action CTA:

- Primary: `Evaluate a bike`
- Behavior: switches to `Evaluate` tab and carries active profile context.

Backend / LLM:

- No backend API required.
- No LLM trigger.

### Evaluate Tab

Purpose:

- Let the user evaluate one listing against the active child profile.

Top header:

- Title: `Evaluate`
- Subtitle: `Check one used-bike listing before messaging the seller.`
- Profile reminder chip: `Using: 20 inch / comfortable rider` or `Add profile first`

Input method cards:

1. `Upload screenshot`
   - Copy: `Best when a marketplace page is hard to read.`
   - Controls: file input, preview, remove screenshot.
   - AI action: `Extract details with AI`
   - AI note: `Only sends the screenshot after you tap this button.`

2. `Paste listing link/text`
   - Controls: listing link input, pasted text textarea.
   - Copy: `Links are saved as references. Paste text when pages cannot be read directly.`
   - AI action for pasted text: `Extract from pasted text`
   - Facebook/OfferUp note: `Use screenshots or pasted text; Mandy does not automatically read login-gated pages.`

3. `Manual entry`
   - Copy: `Fast fallback when extraction is unavailable.`
   - Opens listing fields directly.

Listing review/edit step:

- Always shown before analysis once any listing input exists.
- Fields:
  - Title
  - Asking price
  - Brand
  - Model
  - Wheel size
  - Bike type
  - Color/style
  - Platform/source
  - Location
  - Condition/description
  - Listing link
- Helper copy: `AI can miss details. Please adjust anything that looks wrong.`

Explicit Analyze / Evaluate button:

- Primary label: `Evaluate this bike`
- Disabled until child profile has required fields and listing has either wheel size, title, pasted text, screenshot+manual fields, or key details.
- Disabled text: `Add rider and listing details first.`

AI action wording:

- Screenshot: `Extract details with AI`
- Pasted text: `Extract from pasted text`
- Optional analysis assist if retained later: `Use AI help for explanation`
- Required note near AI buttons: `AI is optional. Manual entry and local guidance still work.`

Local fallback wording:

- `Using local guidance because AI is off, unavailable, or limited.`
- `You can still evaluate the bike from confirmed details.`
- `Daily AI limit reached. Manual entry and local analysis are still available.`

Result card structure:

- Header:
  - Overall recommendation: `Worth contacting`, `Ask more first`, or `Probably skip`
  - Red/yellow/green visual signal
  - Short reasoning
- Fit score:
  - Fit label and reason
  - Recommended wheel size summary
- Deal/value score:
  - Price label and reason
  - Local fallback confidence when applicable
- Risk flags:
  - Condition/risk highlights
  - Missing details
  - Seller questions
- Seller message:
  - Local-first message draft
  - Optional controls: goal, tone, pickup timing, offer
- Primary CTA:
  - `Save to History`
- Secondary:
  - `Edit details`
  - `Start another evaluation`

Error / rate limit / AI disabled states:

- AI disabled: non-blocking notice plus manual path.
- Rate-limited: clear daily/session limit message plus fallback.
- Extraction failed: fields remain editable; no workflow dead end.
- Offline: local draft remains visible, but extraction/link/email-like actions are unavailable.

Backend / LLM:

- `/api/status` may be used for provider status.
- AI extraction routes only run after explicit user action.
- OpenAI API key remains server-side only.
- No LLM call on initial load.

### History Tab

Purpose:

- Replace first-version email report value by keeping saved evaluations on-device.

Top header:

- Title: `History`
- Subtitle: `Saved bike checks on this device.`
- Optional count: `3 saved`

Empty state:

- Card title: `No saved bike checks yet`
- Copy: `Evaluate a listing and save the result here for later.`
- CTA: `Evaluate a bike`

Saved evaluation card layout:

- Left/top:
  - Optional screenshot thumbnail if available without storing large blobs.
  - If no thumbnail: colored recommendation indicator.
- Main:
  - Bike title or fallback `Untitled bike`
  - Price
  - Platform/source
  - Overall recommendation
  - Fit/deal/risk compact summary
  - Date saved
- Actions:
  - Favorite/shortlist toggle
  - Delete
  - Tap card for detail

Fields shown on card:

- Bike title.
- Price.
- Platform/source.
- Overall recommendation.
- Fit summary.
- Deal/value summary.
- Risk summary.
- Date.
- Screenshot thumbnail if available and intentionally stored.

Favorite / shortlist behavior:

- Toggle is local-only.
- Favorited cards should show first or have a filter in a later version.
- First version can show a star/shortlist badge without a separate filter.

Delete behavior:

- Delete one saved evaluation from card or detail view.
- Confirm before deletion.
- Clear all history lives in Settings, with optional link from History.

Tap-to-view detail behavior:

- Opens a detail state/screen within History.
- Shows full result snapshot, listing details, seller questions, seller message, and disclaimer.
- Does not re-fetch marketplace pages.
- Does not re-run AI.

Clear history entry point:

- History may include a small link: `Manage saved data in Settings`.
- Full `Clear history` control belongs in Settings to keep destructive actions centralized.

Backend / LLM:

- No backend API required.
- No LLM trigger.

### Settings Tab

Purpose:

- Reduce App Store review risk by making privacy, AI disclosure, and data controls obvious.

Top header:

- Title: `Settings`
- Subtitle: `Privacy, local data, and app information.`

Privacy summary:

- `Your child profile and saved bike checks are stored on this device in the App Store MVP.`
- `Mandy does not require an account for the first version.`
- `Marketplace links are user-provided references; Mandy does not automatically scrape login-gated pages.`

AI disclosure:

- `AI is optional and only runs after you tap an AI action.`
- `Screenshots or pasted listing text may be sent for processing only after explicit action.`
- `OpenAI/provider keys stay on the server.`
- `Local fallback analysis remains available when AI is disabled or limited.`

Local data controls:

- `Clear child profile`
- `Clear history`
- `Clear all local data`
- Destructive controls should require confirmation.

App version/about:

- App name: `Mandy's Bike Finder`
- Version placeholder.
- Build/channel placeholder if useful later.

Feedback placeholder:

- `Feedback coming later`
- Do not collect contact information in v1 unless separately disclosed and feature-flagged.

Disclaimer:

- `Mandy's Bike Finder provides practical guidance, not a safety guarantee. Always inspect fit, brakes, tires, rust, and ride comfort before buying.`

Backend / LLM:

- `/api/status` can be shown as provider status if desired.
- No LLM trigger.

## 2. App Shell Layout

Bottom tab navigation:

- Fixed bottom navigation on mobile.
- Four labels: `Profile`, `Evaluate`, `History`, `Settings`.
- Use familiar icons in implementation if available; do not add an icon library solely for this task.
- Active tab has strong contrast and text label.
- Minimum target height should respect roughly 44px tap targets.
- Add bottom safe-area padding.

Mobile header behavior:

- Each tab has a compact header with title and one-line purpose.
- Avoid a marketing hero in App Store MVP mode.
- Header should scroll with content unless a specific sticky header proves necessary.

Safe area handling:

- Reuse current `app-safe-shell` and `app-safe-top` foundation.
- Bottom tab nav should add `padding-bottom: env(safe-area-inset-bottom)` in implementation.
- Sticky CTAs must not overlap the iOS home indicator.

Sticky primary CTA rules:

- Use sticky bottom CTA only inside long forms where the next action might be lost.
- Profile: `Save profile` or `Evaluate a bike` may be sticky on small screens.
- Evaluate: `Evaluate this bike` may be sticky after review fields are present.
- Result: `Save to History` should be visible near the result and may be sticky if the result is long.
- Settings: avoid sticky destructive actions.

Loading and offline states:

- Preserve existing offline banner behavior.
- AI extraction loading should be scoped to the action button and relevant card.
- Local history/profile loading should be immediate and not require skeleton complexity in v1.
- API/provider status should not block local flows.

Desktop behavior:

- For App Store MVP mode, desktop can also show the tab shell to keep one implementation model.
- Existing public web MVP can keep the current long-page layout unless an App Store MVP feature flag is enabled.
- Do not remove current web layout while building the app shell.

App Store MVP mode behavior:

- Hide web hero, Bike Scout, waitlist, email report, PDF/export, payment, account, push, and marketplace automation surfaces.
- Show tab shell as the primary UI.
- Keep local fallback analysis and explicit AI actions.

## 3. State Model

### Minimal State

`activeTab`

- Values: `profile`, `evaluate`, `history`, `settings`.
- Storage: in-memory; optional localStorage later for last-opened tab.

`activeChildProfile`

- Shape: current `ChildProfile` plus height/weight unit UI state if needed.
- Storage: localStorage for v1.
- Future: backend only if accounts/cloud sync are introduced.

`currentEvaluationDraft`

- Shape:
  - child profile snapshot
  - listing fields
  - input mode
  - pasted text
  - screenshot metadata/preview URL
  - source state
- Storage: in-memory for v1; optional localStorage draft later.
- Future: localStorage draft recovery if users abandon mid-flow.

`evaluationResult`

- Shape:
  - `AnalysisResult`
  - `PriceReference`
  - seller message
  - created timestamp
  - provider/fallback status
- Storage: in-memory until saved.
- Future: included in saved evaluation history.

`savedEvaluations`

- Shape:
  - id
  - createdAt
  - child profile snapshot
  - listing snapshot
  - analysis result
  - seller message
  - source metadata
  - optional screenshot thumbnail metadata
  - favorite/shortlist boolean
- Storage: localStorage for first 10+ text-based records.
- Future: IndexedDB if storing thumbnails/blobs; backend if accounts/cloud sync are added.

`favorite/shortlist flag`

- Shape: boolean on saved evaluation.
- Storage: same as saved evaluations.

`settings / feature flags`

- Shape:
  - App Store MVP mode
  - provider status
  - email/pdf/Bike Scout/automation visibility flags
  - AI enabled status
- Storage: flags from env/provider status; local UI preferences in localStorage only if needed.

### Storage Recommendation

- Use localStorage first for active child profile and at least 10 saved text-based evaluations.
- Do not store large screenshot blobs in v1.
- Use IndexedDB only if screenshot thumbnails or image blobs become a first-version requirement.
- Backend storage is post-launch and should wait for account/deletion design.

## 4. Existing Code Reuse

Reusable now:

- Child profile state and field logic from `app/app/page.tsx`.
- `recommendFromChildProfile`, `buildChildBikeRecommendation`, and saved rider profile helpers.
- Height and weight unit conversion helpers.
- `colorPreferenceOptions` and `ColorPreferenceChip`.
- Listing state, `updateListingField`, `handleInputModeChange`, pasted text extraction, screenshot file handling, and link metadata behavior.
- `detectMarketplace` from `app/lib/marketplace.ts`.
- `analyzeBike`, `localPriceReference`, and `generateSellerMessage` from `app/lib/analysis.ts`.
- `localExtract`, `apiPost`, `providerStatusText`, and fallback status patterns.
- Result display ideas from `OverallRecommendationMeter`, `CompactDimensionCard`, `DimensionCard`, and `InfoLine`.
- Existing offline banner state and safe-area styles.
- Existing assets under `app/public/images`.
- Existing Tailwind utility patterns and card/button styles.

Should be extracted into components before or during implementation:

- `AppTabShell`
- `BottomTabNav`
- `AppScreenHeader`
- `ProfileScreen`
- `EvaluateScreen`
- `InputMethodCard`
- `ListingReviewForm`
- `EvaluationResultCard`
- `HistoryScreen`
- `SavedEvaluationCard`
- `SavedEvaluationDetail`
- `SettingsScreen`
- `DataControlButton`
- Shared `Field`, `InfoLine`, `MeterBadge`, and `Notice` components.

Implementation caution:

- Do not move server provider logic into client components.
- Do not add AI calls to mount effects.
- Avoid changing API route behavior while reorganizing screens.
- Preserve existing web flow until App Store MVP mode gating is defined.

## 5. Screen-Level Implementation Plan

### 1. `[UX] Implement App Store Tab Shell Skeleton`

Scope:

- Add app-shell skeleton behind future App Store MVP mode.
- Create Profile/Evaluate/History/Settings screen placeholders.
- Add bottom tab navigation and per-screen headers.

Files likely touched:

- `app/app/page.tsx`
- Potential future components under `app/components/*`
- `app/app/globals.css` for bottom safe-area nav styles

Acceptance criteria:

- Four tabs are visible in App Store MVP mode.
- Switching tabs does not reload the page.
- Current web MVP remains available outside App Store MVP mode.
- No new API calls are introduced.
- No LLM call occurs on initial load.

Risks:

- Accidentally duplicating too much existing page markup.
- Creating a shell that still feels like a web landing page.
- Bottom nav overlapping content on iOS safe area.

### 2. `[UX] Implement Profile Tab Local Save`

Scope:

- Move/create profile form in Profile tab.
- Save one active child profile locally.
- Show summary card and bike fit recommendation.
- Add `Evaluate a bike` CTA.

Files likely touched:

- `app/app/page.tsx`
- Future `ProfileScreen` component
- Existing child profile helper code

Acceptance criteria:

- Required fields are height, age, riding experience.
- Optional fields do not block save.
- Saved profile loads after refresh.
- User can edit and save changes.
- Bike fit matching works locally without backend API.

Risks:

- Losing existing height/weight unit behavior.
- Overwriting saved rider profile format without migration plan.
- Making Profile depend on listing/evaluation state.

### 3. `[UX] Implement Evaluate Tab Flow`

Scope:

- Create input method cards for screenshot, link/text, and manual.
- Preserve screenshot preview and explicit AI extraction.
- Preserve listing review/edit step.
- Add evaluate action.

Files likely touched:

- `app/app/page.tsx`
- Future `EvaluateScreen`, `InputMethodCard`, `ListingReviewForm`
- Existing API helper usage

Acceptance criteria:

- Screenshot upload does not trigger AI automatically.
- AI extraction requires explicit user tap.
- Link mode explains user-provided context and no login-gated scraping.
- Manual entry always remains available.
- Evaluation can run with local fallback.

Risks:

- Current Craigslist auto-extract effect conflicts with explicit-action requirement for App Store MVP mode.
- Link extraction copy could imply unsupported automation.
- Review fields may become too dense on mobile.

### 4. `[UX] Implement Result Card And Save To History`

Scope:

- Build mobile-first result card.
- Include overall recommendation, fit, deal/value, risk, seller message.
- Add `Save to History`.

Files likely touched:

- `app/app/page.tsx`
- Future `EvaluationResultCard`
- Future saved evaluation helpers

Acceptance criteria:

- Result is readable on small screens.
- Seller message is local-first by default.
- Save action creates a saved evaluation snapshot.
- Saved snapshot does not require marketplace re-fetching.

Risks:

- Result may become too long and bury save action.
- Saving too much data may exceed reasonable localStorage use.
- Screenshot image persistence must be avoided unless explicitly designed.

### 5. `[UX] Implement History Tab Local Storage`

Scope:

- Add local saved evaluations list.
- Add saved evaluation card, favorite/shortlist, delete, detail view.
- Support at least 10 recent evaluations.

Files likely touched:

- `app/app/page.tsx`
- Future `HistoryScreen`, `SavedEvaluationCard`, `SavedEvaluationDetail`
- Future local storage helper module

Acceptance criteria:

- Empty state links to Evaluate.
- At least 10 saved evaluations can be stored locally.
- User can favorite/unfavorite.
- User can delete one evaluation.
- Detail view shows full saved snapshot without re-running AI.

Risks:

- LocalStorage payload size if storing screenshots.
- Detail view accidentally re-analyzing or re-fetching.
- Destructive delete action lacking confirmation.

### 6. `[Infra] Implement Settings Data Controls`

Scope:

- Add Settings screen with privacy/AI disclosure.
- Add clear profile, clear history, clear all local data.
- Add about/version/disclaimer.

Files likely touched:

- `app/app/page.tsx`
- Future `SettingsScreen`
- Future local storage helper module

Acceptance criteria:

- Clear child profile works after confirmation.
- Clear history works after confirmation.
- Clear all local data works after confirmation.
- Settings explains optional AI, local storage, no account, and no marketplace scraping.

Risks:

- Destructive actions without clear confirmation.
- Clearing profile accidentally leaving stale evaluation draft state.
- Privacy copy drifting from App Store privacy brief.

### 7. `[AI Engine] Explicit AI Action Copy Pass`

Scope:

- Audit AI button labels, warnings, notices, and fallback messages.
- Ensure App Store MVP wording never implies automatic scraping or AI on load.

Files likely touched:

- `app/app/page.tsx`
- Future Evaluate components
- Possibly docs/testing notes

Acceptance criteria:

- Every AI-triggering button states the user action clearly.
- Screenshot selection has no AI side effect.
- Rate-limit and disabled states preserve manual/local fallback.
- Initial-load behavior remains `/api/status` only, no LLM.

Risks:

- Ambiguous copy causing App Review or user trust issues.
- Missing one AI path during refactor.

### 8. `[Build] Mobile QA And Regression Pass`

Scope:

- Verify mobile layout and critical flows after implementation.
- Check no initial LLM calls.
- Check current web MVP still works outside App Store MVP mode.

Files likely touched:

- Docs/testing notes only unless bugs are found.

Acceptance criteria:

- 320px, 375px, and 430px widths have no horizontal overflow.
- Bottom nav respects safe area.
- Profile, Evaluate, History, Settings flows work.
- Email/PDF/Bike Scout/payment/account/push are hidden in App Store MVP mode.
- `npm run lint` and `npm run build` pass.

Risks:

- Mobile keyboard behavior not fully covered without real iPhone testing.
- App Store wrapper may reveal safe-area issues not visible in browser.

## 6. Next Implementation Prompt

Recommended first task:

```text
[UX] Implement App Store Tab Shell Skeleton

Create the first App Store MVP tab shell behind a clearly isolated App Store MVP mode path or flag plan. Do not remove the existing web MVP flow. Add a four-tab mobile app shell with Profile, Evaluate, History, and Settings placeholder screens, bottom navigation, compact screen headers, and safe-area-aware spacing. Reuse existing styles and avoid adding dependencies. Do not change API behavior. Do not trigger any OpenAI/LLM call on initial load; the only acceptable initial status call is the existing /api/status behavior. Keep email report, PDF export, Bike Scout, waitlist, payment, account/login, push, and marketplace automation out of the App Store MVP surface. Verify lint/build and run a mobile viewport smoke check after implementation.
```

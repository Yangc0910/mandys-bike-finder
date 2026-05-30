# App Store MVP PRD Slice

Status: Implementation-ready planning slice
Last updated: 2026-05-30

## 1. Product Positioning

Mandy's Bike Finder App Store MVP is a mobile decision tool that helps parents quickly evaluate whether a used kids' bike listing fits their child, is fairly priced, and is worth contacting the seller.

AI-assisted screenshot OCR/extraction is a core product capability for the App Store MVP because many marketplace listings are easiest to capture as screenshots. This capability must remain explicit, user-triggered, server-side, and editable.

The App Store MVP is intentionally smaller than the current web MVP. It should feel like a focused mobile app, not a complete repackaging of every web feature.

## 2. Target User

Primary user:

- A parent or caregiver shopping for a used kids' bike.

Typical situation:

- The user sees a used kids' bike on Facebook Marketplace, Craigslist, OfferUp, a local parent group, or another marketplace.
- The user wants a quick decision: does this fit my child, is the price reasonable, and should I contact the seller?
- The user may have a screenshot, a listing link, pasted listing text, or only a few manual details.

## 3. Core User Journey

1. User opens the app.
2. User creates, confirms, or edits a child profile.
3. User opens `Evaluate`.
4. User uploads a screenshot, pastes a listing link/text, or manually enters listing details.
5. If using a screenshot, user explicitly taps `Extract details with AI` before the screenshot is sent for OCR/extraction.
6. User reviews and edits extracted or manually entered listing fields before analysis.
7. User explicitly taps `Analyze` / `Evaluate`.
8. App returns fit, deal/value, risk, and an overall recommendation.
9. User saves the evaluation to `History`.
10. User later opens `History` to review, favorite/shortlist, or delete saved evaluations.
11. User opens `Settings` to clear local data or review privacy/AI disclosures.

## 4. MVP Screens

### Profile

Purpose:

- Let the user define the child profile used for bike fit matching.

Fields:

- Height: required.
- Age: required.
- Riding experience: required.
- Weight: optional.
- Style preference: optional.
- Color preference: optional.

Validation:

- Height, age, and riding experience are required before bike matching.
- Invalid or missing required inputs should show clear inline guidance.
- Optional fields should never block matching.

Local save behavior:

- Save one active child profile locally on the device/browser.
- No account is required.
- Saved profile should be reusable from `Evaluate`.

Empty state:

- If no profile exists, show a short prompt to add height, age, and riding experience.
- Explain that the profile is stored locally for faster future checks.

Edit behavior:

- User can edit the active profile at any time.
- If a profile changes, future evaluations use the updated profile.
- Existing saved evaluations should keep the profile snapshot used at the time of evaluation.

### Evaluate

Purpose:

- Let the user evaluate one used-bike listing against the active child profile.

Input methods:

- Screenshot upload.
- Explicit AI screenshot OCR/extraction.
- Listing link as reference metadata.
- Pasted listing text.
- Manual listing fields.

Listing review/edit step:

- User must see and edit listing fields before analysis.
- Review fields should include title, asking price, brand, model, wheel size, bike type, color/style, platform, location, condition, description, and listing link when available.
- The app should not imply extracted data is perfect.

Explicit AI trigger requirement:

- Screenshot or text AI extraction must require a clear user action.
- Uploading or selecting a screenshot must not automatically trigger AI.
- Initial app load must not trigger any OpenAI or LLM call.
- Any AI button must explain that listing content or screenshot data may be sent for processing when the user taps it.
- Screenshot OCR/extraction is allowed in the App Store MVP only through the server-side `/api/extract` route after the user taps `Extract details with AI`.
- Extracted fields must be editable before evaluation because OCR/AI may miss or misread details.

Fallback behavior:

- Local/manual analysis must remain available when AI is disabled, unavailable, missing API keys, rate-limited, or failed.
- Fallback messages should be clear and non-blocking.
- Manual entry must always remain available.

Result display requirements:

- Show an overall recommendation using red/yellow/green language.
- Show fit, deal/value, condition/risk, and practical seller follow-up guidance.
- Use practical wording and avoid fake precision.
- Include a short seller message draft, local-first.
- Provide a clear action to save the evaluation to `History`.

### History

Purpose:

- Replace much of the first-version value of email reports by keeping useful evaluations in the app.

Saved evaluation card fields:

- Saved date/time.
- Overall recommendation.
- Child profile summary.
- Listing title or description summary.
- Asking price.
- Wheel size when known.
- Platform/source when known.
- Favorite/shortlist state.

Favorite / shortlist behavior:

- User can mark or unmark an evaluation as favorite/shortlisted.
- Favoriting is local-only in the MVP.
- Favorited items should be visually easy to find.

Delete behavior:

- User can delete one saved evaluation.
- User can clear all history from `Settings`.
- Deleting history should not delete the active child profile unless the user chooses clear all local data.

Empty state:

- If no saved evaluations exist, explain that saved bike checks will appear here.
- Include a path back to `Evaluate`.

Local storage behavior:

- Store at least 10 recent evaluations locally.
- Each saved evaluation should store a result snapshot, not depend on live marketplace pages.
- Do not store large screenshot image blobs in first implementation unless explicitly decided later.
- Use localStorage first unless history payloads become too large or image blobs/thumbnails are retained; use IndexedDB only if larger structured local storage becomes necessary.

### Settings

Purpose:

- Provide privacy, data control, AI disclosure, and app information.

Privacy and AI disclosure:

- Explain that child profile and saved evaluations can be stored locally.
- Explain that AI is optional, user-triggered, and may be disabled.
- Explain that screenshots/text are sent for AI processing only after explicit user action.
- Link to or summarize the privacy policy.

Data controls:

- Clear child profile.
- Clear history.
- Clear all local data.

App version/about:

- Show app name and version placeholder.
- Include guidance disclaimer: recommendations are practical guidance, not a safety guarantee.
- Remind users to inspect fit, brakes, tires, rust, and real-world ride comfort.

Feedback placeholder:

- A non-blocking feedback placeholder may be shown if it does not require login, email, or external service setup in v1.
- If feedback collects contact info, it must be disclosed and should be feature-flagged.

## 5. Feature Inclusion Table

| Feature | App Store MVP treatment |
| --- | --- |
| Child profile inputs | Included |
| Child profile local save | Included |
| Bike fit matching | Included |
| Screenshot upload | Included |
| AI screenshot OCR / extraction | Included as a core capability, only after explicit user action |
| Listing link/text input | Included, simplified as user-provided context |
| Manual listing input | Included |
| Local fallback analysis | Included |
| Optional AI analysis | Included only by explicit user action and existing server-side controls |
| Result score / recommendation | Included as qualitative red/yellow/green guidance |
| Seller negotiation message | Simplified, local-first |
| Saved history / saved evaluations | Included |
| Favorite / shortlist | Included as local-only marker |
| Settings / Privacy / About / data control | Included |
| Email report | Hidden behind feature flag or omitted from App Store MVP surface |
| PDF export | Deferred post-launch |
| Bike Scout / automatic deal search | Hidden/deferred |
| Marketplace scraping | Excluded |
| Waitlist | Hidden/deferred |
| Payment / subscription | Excluded from first version |
| Account / login | Excluded from first version |
| Push notification | Deferred post-launch |

Feature flag planning:

- `NEXT_PUBLIC_APP_STORE_MVP_MODE`: planning-only flag for app-surface gating.
- `ENABLE_EMAIL_REPORT`: should hide email report in App Store MVP mode.
- `ENABLE_PDF_EXPORT`: should hide PDF export in App Store MVP mode.
- `ENABLE_BIKE_SCOUT`: should hide Bike Scout in App Store MVP mode.
- `ENABLE_MARKETPLACE_AUTOMATION`: should stay disabled for v1.
- `ENABLE_LLM_ANALYSIS`: existing AI enablement flag; explicit user action still required.

Do not implement new flags as part of this PRD task.

## 6. Acceptance Criteria

### Global

- Initial app load must not trigger OpenAI or LLM calls.
- OpenAI API key must remain server-side only.
- App must remain usable when AI is disabled, rate-limited, or unavailable.
- Existing daily/session/per-IP limits and fallback/mock behavior must be preserved.
- App Store MVP mode must not expose email report or PDF export entry points.
- App Store MVP mode must not expose Bike Scout, waitlist, payment, account/login, push notification, automatic deal search, or marketplace scraping.
- No automatic marketplace scraping or login-gated page automation is exposed.
- The app must be usable without an account.

### Profile

- User can create a child profile with height, age, and riding experience.
- Optional weight, style preference, and color preference do not block profile save.
- User can save the profile locally without an account.
- User can edit the profile later.
- User can generate or view bike fit matching from the profile without a backend API call.
- Empty state explains what profile fields are needed.

### Evaluate

- User can start an evaluation from screenshot, listing link/text, or manual listing input.
- User can review and edit listing fields before analysis.
- User must explicitly tap an AI extraction/analyze action before any screenshot/text is sent for AI processing.
- Screenshot selection alone does not trigger AI.
- Screenshot AI extraction sends the selected screenshot only to the server-side API and returns editable listing fields.
- If AI is disabled or rate-limited, user can still manually enter details and run local fallback analysis.
- Result shows overall recommendation plus fit, deal/value, and risk guidance.
- Result includes a simplified seller message draft.
- User can save an evaluation to `History`.

### History

- App can save at least 10 recent evaluations locally.
- Saved cards show date/time, overall recommendation, child summary, listing summary, price, wheel size when available, and source/platform when available.
- User can favorite or un-favorite a saved evaluation.
- User can delete a saved evaluation.
- Empty state explains that saved evaluations will appear here and links back to evaluation.
- Saved evaluation remains readable without re-fetching marketplace data.

### Settings

- User can clear child profile.
- User can clear history.
- User can clear all local data.
- Settings includes privacy and AI disclosure.
- Settings includes app/about and safety disclaimer.
- Data-control actions should require clear confirmation before destructive local deletion.

## 7. Non-Goals

The first App Store MVP does not include:

- User account.
- Cloud sync.
- Subscription or payment.
- Automated marketplace scraping.
- Automated saved searches.
- Push notification.
- Native camera integration beyond already available web upload behavior.
- Full PDF export workflow.
- Full email report workflow.
- Bike Scout paid or automated deal-search experience.
- Facebook Marketplace, OfferUp, or login-gated automation.

## 8. Implementation Slicing

Recommended development order:

1. `[UX] App Store Tab Shell Wireframe`
   Define Profile, Evaluate, History, and Settings screen layouts and state transitions before code changes.

2. `[Infra] App Store MVP Feature Flag Plan`
   Document flag names, defaults, and UI surfaces to hide in App Store MVP mode without changing API behavior.

3. `[UX] Implement Profile Local Save`
   Create the Profile tab behavior, local profile persistence, edit state, validation, and fit summary.

4. `[UX] Implement Evaluate App Flow`
   Reorganize screenshot/link/text/manual input, review, analysis, result, and save-to-history flow for the app shell.

5. `[UX] Implement Local History`
   Add saved evaluations, favorite/shortlist, delete, empty state, and at least 10-item local history behavior.

6. `[AI Engine] Explicit AI Action Copy Pass`
   Audit labels, notices, and fallback messages for all AI-triggering actions.

7. `[Infra] Settings Data Controls`
   Add local clear profile, clear history, clear all data, privacy disclosure, and about/disclaimer controls.

8. `[Build] Capacitor Readiness Checklist`
   Confirm hosted API boundaries, App Store metadata needs, TestFlight notes, and iOS wrapper prerequisites.

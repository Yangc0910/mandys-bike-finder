# Product Strategy Workstream

## App Store MVP Scope

Status: Planning  
Last updated: 2026-05-25

Executable PRD slice: `docs/product/app-store-mvp-prd.md`

### MVP Positioning

Mandy's Bike Finder App Store MVP is a mobile decision tool that helps parents quickly evaluate whether a used kids' bike listing fits their child, is fairly priced, and is worth contacting the seller.

This positioning makes the App Store MVP smaller than the full web MVP. The first App Store version should prioritize a clear mobile utility over breadth: child fit profile, listing evaluation, local saved history, and privacy-first settings.

### Recommended Navigation Structure

Recommended structure: Option A with four bottom tabs.

1. Profile
2. Evaluate
3. History
4. Settings

Why this is preferred:

- It feels like an app instead of a single long webpage.
- It gives child profile and bike matching a first-class home.
- It makes saved evaluations the replacement for email report value in v1.
- It gives privacy, AI disclosure, and data controls an obvious place, reducing App Review risk.
- It avoids a vague Home tab that could make the app feel like a marketing wrapper.

Option B is less focused because Home can become a landing page rather than a tool. Option C is simpler, but omitting Settings/Privacy makes privacy controls and App Review explanations harder to surface.

### Navigation Detail

| Tab | User does here | Local save | Backend API | LLM trigger | App Review risk |
| --- | --- | --- | --- | --- | --- |
| Profile | Enters child height, age, riding experience, optional weight/style/color; sees bike type and wheel-size match | Yes, local child profile | No for local fit matching | No | Low, if child data use is disclosed and minimized |
| Evaluate | Uploads screenshot, pastes link/text, or manually enters listing; reviews fields; generates evaluation | Yes, draft and result can be saved | Optional for AI extraction/analysis when enabled | Only explicit button click | Medium, due screenshot/AI disclosure and marketplace handling |
| History | Reviews saved evaluations, favorites/shortlist, and previous seller-message drafts | Yes, local saved evaluations | No in v1 | No | Low, if delete/clear controls exist |
| Settings | Privacy summary, data controls, AI/fallback status, about/disclaimer | Yes for preferences only | `/api/status` only if status shown | No | Low, helps reduce privacy and thin-wrapper risk |

### Included Features

- Child profile inputs.
- Child profile local save.
- Bike fit matching.
- Screenshot upload with preview.
- Listing link as reference metadata.
- Pasted listing text.
- Manual listing input.
- Local fallback analysis.
- Explicit AI extraction/analysis only when enabled.
- Result recommendation with red/yellow/green dimensions.
- Saved history / saved evaluations.
- Favorite / shortlist marker for saved evaluations.
- Basic seller message draft, preferably local-first.
- Settings / About / Privacy surface.
- Clear onboarding focused on the tool, not marketing.

### Simplified Features

- Listing link input should be treated as a reference plus optional pasted-text helper, not as broad marketplace automation.
- AI / LLM analysis should be a clearly labeled assistive action, not the default path.
- Seller negotiation message should be short and local-first unless the user explicitly requests AI help.
- Facebook / OfferUp / Craigslist behavior should be simplified to user-provided links, screenshots, and pasted text. Craigslist direct extraction can remain a hidden/flagged capability after review.
- Result score should remain qualitative, not a precise numeric score.

### Deferred Features

- Email report in the App Store MVP UI.
- PDF export.
- Bike Scout waitlist.
- Automatic deal search.
- Marketplace scraping.
- Payment / subscription.
- User account / login.
- Push notifications.
- Durable cloud sync.
- Daily deal alerts.

### Hidden Or Feature-Flagged Features

The App Store MVP may keep these in code but hidden or disabled for the app surface:

- Email report: hide behind `ENABLE_EMAIL_REPORT=false` or App Store MVP mode.
- PDF export: hide until there is a clear share/export design.
- Bike Scout: hide behind `ENABLE_BIKE_SCOUT=false`.
- Marketplace automation: hide behind `ENABLE_MARKETPLACE_AUTOMATION=false`; should remain disabled for v1.
- LLM analysis: keep behind `ENABLE_LLM_ANALYSIS` and user-triggered actions.

Potential planning-only flag names:

- `NEXT_PUBLIC_APP_STORE_MVP_MODE`
- `ENABLE_EMAIL_REPORT`
- `ENABLE_PDF_EXPORT`
- `ENABLE_BIKE_SCOUT`
- `ENABLE_MARKETPLACE_AUTOMATION`

Do not implement these flags until a dedicated implementation task.

### First App Store MVP Includes

- Four-tab app shell: Profile, Evaluate, History, Settings.
- Local child profile and bike match.
- Listing evaluation from screenshot, pasted link/text, or manual input.
- Mandatory review/edit step before evaluation.
- Local fallback analysis always available.
- Optional explicit AI extraction when configured.
- Saved local history with delete/clear controls.
- Favorite/shortlist marker for saved evaluations.
- Privacy/about/settings screen.
- Offline/unavailable messaging from the existing PWA foundation.

### First App Store MVP Excludes

- Email report entry point.
- PDF export.
- Bike Scout waitlist and paid positioning.
- Scheduled marketplace searches.
- Automatic Facebook or OfferUp scraping.
- Payment/subscription.
- Account/login.
- Push notifications.
- Any LLM call on initial page load.

### Post-Launch Roadmap

1. Share/export saved evaluation as local device share sheet or PDF, after privacy review.
2. Optional email report if users ask for cross-device sharing.
3. Durable cloud sync after account and deletion flows are designed.
4. Bike Scout waitlist or paid experiment after the free app proves retention.
5. Push notifications only after real saved searches and compliant source integrations exist.

### App Store Review Risk Reduction

- Avoid a marketing Home tab in v1.
- Make Profile, Evaluate, and History functional without requiring an account.
- Hide email report, Bike Scout, and payments until their privacy and review surfaces are ready.
- Keep marketplace links user-provided and avoid claims of automatic monitoring.
- Keep AI optional, explained, user-triggered, and server-side.
- Add visible delete/clear controls for local history and profile data.

### Next Implementation Tasks

1. `[Product] App Store MVP PRD Slice`
   Convert this scope into an implementation-ready PRD slice with acceptance criteria.

2. `[UX] App Store Tab Shell Wireframe`
   Reorganize the current one-page web flow into Profile, Evaluate, History, and Settings screen specs.

3. `[Infra] App Store MVP Feature Flag Plan`
   Document exact flag names, default values, and which UI surfaces they hide without changing API behavior.

4. `[AI Engine] Explicit AI Action Copy Pass`
   Audit every AI-triggering action for button labels, fallback copy, and no-initial-load behavior.

5. `[Build] Capacitor Readiness Checklist`
   Define the pre-Capacitor checklist for hosted API endpoints, iOS safe areas, icons, screenshots, and TestFlight review notes.

### PRD Acceptance Summary

The App Store MVP is accepted only when:

- The app can be used without an account.
- Profile, Evaluate, History, and Settings are clear first-class surfaces.
- Local history can save at least 10 evaluations.
- Email report, PDF export, Bike Scout, waitlist, payment, account/login, push notification, automatic deal search, and marketplace scraping are not visible in App Store MVP mode.
- AI calls are explicit user actions only, never initial-load behavior.
- OpenAI and provider keys remain server-side only.

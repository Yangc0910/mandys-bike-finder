# Frontend UX Workstream

## App Store MVP Scope

Status: Planning  
Last updated: 2026-05-25

Executable PRD slice: `docs/product/app-store-mvp-prd.md`

Screen-level wireframe: `docs/product/app-store-tab-shell-wireframe.md`

### UX Principle

The App Store MVP should open directly into a useful mobile tool. It should feel like a small, focused app with persistent local state, not a mobile webpage with a long landing page.

### Recommended Navigation

Use four bottom tabs:

1. Profile
2. Evaluate
3. History
4. Settings

Profile and Evaluate are the core workflow. History replaces much of the first-version value that email reports would otherwise provide. Settings gives privacy, AI disclosure, and local data controls a predictable place.

### Screen Scope

#### Profile

- Save one active rider profile locally.
- Inputs: height, age, riding experience, optional weight/style/color.
- Output: recommended bike type, wheel size, growth caution, what to look for/avoid.
- No backend API required.
- No LLM required.

#### Evaluate

- Inputs: screenshot, listing link as reference, pasted listing text, manual listing fields.
- Review step stays mandatory before evaluation.
- Local fallback analysis is the default guarantee.
- AI extraction is optional and must require an explicit button tap.
- OpenAI key stays server-side only.

#### History

- Shows saved evaluations from this device.
- Supports favorite/shortlist and delete/clear.
- Stores enough context to replace email report for v1:
  - child profile summary
  - listing summary
  - result recommendation
  - seller questions/message draft
  - created date
- Use localStorage for the first implementation unless saved objects become too large or screenshot thumbnails are retained. Use IndexedDB only if the app stores image blobs or larger history records.

#### Settings

- Privacy summary and data controls.
- Local data controls: clear profile, clear history, clear all local data.
- AI status and explanation: AI is optional, user-triggered, and may be disabled.
- About/disclaimer: guidance only, inspect the bike in person.

### Feature Classification

| Feature | App Store MVP category | UX treatment |
| --- | --- | --- |
| Child profile inputs | Must retain | First-class Profile tab |
| Child profile local save | Must retain | Save one active local profile |
| Bike fit matching | Must retain | Immediate local result |
| Screenshot upload | Must retain | Evaluate input option |
| Listing link input | Simplify | Reference URL plus pasted text guidance |
| Manual listing input | Must retain | Always available fallback |
| AI / LLM analysis | Simplify | Explicit optional action only |
| Local fallback analysis | Must retain | Always available |
| Result recommendation | Must retain | Mobile-first result card |
| Seller negotiation message | Simplify | Local-first compact draft |
| Saved history / evaluations | Must retain | History tab |
| Favorite / shortlist | Must retain | Simple local marker |
| PDF export | Defer | Consider share/export after v1 |
| Email report | Hide/defer | Remove App Store MVP entry point |
| Waitlist | Hide/defer | Not in first app surface |
| Bike Scout / automatic deal search | Defer | Not in first app surface |
| Facebook / OfferUp / Craigslist behavior | Simplify | User-provided reference only, no scraping claims |
| Marketplace scraping | Exclude | No entry point or claims |
| Privacy policy | Must retain | Settings + public URL |
| Onboarding | Simplify | Short app-first intro |
| Settings / About | Must retain | Fourth tab |
| Payment / subscription | Exclude | Avoid IAP risk in v1 |
| User account / login | Exclude | Avoid account/deletion/login review burden |
| Push notification | Defer | Only after real saved searches |

### App-Like Polish Requirements

- Bottom tabs have stable labels and icons in implementation.
- The first visible screen is functional, not marketing-only.
- Main actions are thumb-friendly.
- History gives the user a reason to reopen the app.
- Local delete controls are easy to find.
- Offline state explains what still works locally.
- AI buttons explain what data will be sent before the request.

### Implementation Notes

- Reuse existing analysis, child profile, marketplace detection, and provider boundary code.
- Reorganize UI into app screens before adding Capacitor.
- Keep the current web MVP behavior available unless a dedicated flag hides it for App Store mode.
- Do not remove existing web functionality as part of App Store MVP planning.

### Next UX Slice

First implementation task:

- `[UX] App Store Tab Shell Wireframe`

Acceptance focus:

- Bottom navigation is Profile, Evaluate, History, Settings.
- Profile can stand alone as the child fit module.
- Evaluate contains the smallest complete listing workflow.
- History is useful enough to replace first-version email reports.
- Settings exposes privacy, AI disclosure, and local data controls.

### App Shell Implementation Plan

Recommended task sequence:

1. `[UX] Implement App Store Tab Shell Skeleton`
2. `[UX] Implement Profile Tab Local Save`
3. `[UX] Implement Evaluate Tab Flow`
4. `[UX] Implement Result Card And Save To History`
5. `[UX] Implement History Tab Local Storage`
6. `[Infra] Implement Settings Data Controls`
7. `[AI Engine] Explicit AI Action Copy Pass`
8. `[Build] Mobile QA And Regression Pass`

Primary UX risk:

- The App Store MVP should not preserve the current long-page feel. It should present four stable app screens, local state, and clear bottom navigation before Capacitor work begins.

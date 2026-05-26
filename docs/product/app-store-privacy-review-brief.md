# App Store Privacy And Review Brief

Status: Pre-Capacitor planning brief  
Last updated: 2026-05-24

## Goal

Prepare Mandy's Bike Finder for a future App Store submission by documenting privacy disclosures, data handling, App Review risks, and technical guardrails before adding an iOS wrapper.

## Recommended Launch Path

1. Current Next.js web app.
2. Mobile-first app-like UX.
3. PWA-ready foundation.
4. Capacitor iOS wrapper using hosted server APIs.
5. Xcode signing and archive.
6. TestFlight beta.
7. App Store submission after privacy and review readiness checks.

## Data Collected Or Processed

Current and planned data categories:

- Child profile inputs: height, age, riding experience, optional weight, style preference, and color preference.
- Listing inputs: screenshot, listing link, pasted text, title, price, brand, model, wheel size, bike type, color/style, platform, location, condition, and description.
- Analysis output: fit, price, condition, brand, kid appeal, risk, seller questions, and generated seller/report text.
- Email report data: recipient email, optional recipient name, optional note, report content, and optional screenshot attachment.
- Local prototype data: saved rider profile, Bike Scout draft profile, and local waitlist data in browser storage.
- Optional CRM data: only explicitly consented product-update or Bike Scout lead information.
- Operational data: rate-limit keys, provider status, and privacy-preserving usage logs when backend logging is later implemented.

## Privacy Policy Requirements

The public privacy policy should explain:

- What data users provide and why it is needed.
- That child profile information is used to estimate bike fit and should be minimized.
- Whether listing screenshots are sent to an AI provider for extraction.
- That AI extraction is optional and user-triggered.
- That listing details may be processed by server-side providers when enabled.
- That OpenAI, Resend, Salesforce, Vercel, and future storage/search providers may process data as service providers.
- That transactional report email is separate from marketing consent.
- That CRM sync occurs only after explicit opt-in for future updates or Bike Scout interest.
- Data retention periods for screenshots, reports, logs, and waitlist/profile data.
- How users can request deletion or correction.
- That the product provides guidance only and does not guarantee bike safety, seller reliability, or marketplace availability.

Current draft status:

- A lightweight public privacy draft is available at `/privacy`.
- App Store MVP Settings links to the public privacy draft.
- Before App Store submission, replace TODO contact placeholders with a final privacy/support contact and review the policy against the exact shipped iOS behavior.

## App Store Privacy Label Planning

Likely App Store Connect disclosures to evaluate before submission:

- Contact Info: email address if report sending, waitlist, or CRM sync is enabled.
- User Content: uploaded screenshots, pasted listing text, and user-entered listing details.
- Identifiers: only if durable accounts, device IDs, or analytics identifiers are added later.
- Usage Data: only if analytics or backend event logging is enabled.
- Diagnostics: only if crash/error tooling is added.
- Sensitive Info: avoid collecting unnecessary child details; treat child profile inputs carefully even if not formally categorized as sensitive by the label.

Do not declare "data not collected" unless all server, email, CRM, AI, analytics, and logging behavior has been reviewed.

## Screenshot And AI Handling Rules

- No LLM call on initial app load.
- No LLM call on screenshot file selection.
- Screenshot extraction requires a dedicated user action.
- Supported screenshot formats remain jpg, jpeg, png, and webp.
- Screenshot size limits must remain enforced before provider calls.
- OpenAI API keys and all provider credentials remain server-side only.
- If AI is disabled, limited, or unavailable, manual entry must remain available.
- Do not retain screenshots longer than needed unless a user explicitly sends/saves a report and retention is disclosed.
- If screenshots are attached to report emails, disclose that email providers process the attachment.

## App Review Risks

- Thin wrapper risk: the app may be rejected if it appears to be only a website in a shell without app-like value.
- Privacy risk: screenshots and child profile fields require clear disclosure, consent boundaries, and retention rules.
- Scraping/compliance risk: the app must not claim or imply automated Facebook Marketplace or OfferUp scraping.
- Payment risk: future Bike Scout paid digital features inside iOS may require Apple In-App Purchase.
- Login risk: if third-party/social login is later added, Sign in with Apple may be required.
- Accuracy risk: recommendation copy should stay framed as practical guidance, not a safety guarantee.

## Technical Guardrails

- Keep OpenAI, Resend, CRM, search, and database credentials out of the iOS bundle.
- Use hosted server APIs for protected provider work.
- Preserve feature flags and kill switches.
- Preserve per-session/per-IP and global limits for LLM, search, email, and future scheduled Bike Scout work.
- Preserve mock/local fallback behavior for disabled, limited, or failed providers.
- Do not introduce automatic LLM, search, or scraping calls on app launch.
- Do not scrape login-gated pages or bypass anti-bot systems.

## Required Pre-Submission Checklist

- Apple Developer Program enrollment is complete.
- Bundle ID and App Store Connect app record are created.
- Privacy policy URL is public.
- App Store privacy answers match actual app behavior.
- Review notes explain AI extraction, fallback modes, and test data.
- App screenshots show the actual app workflow, not only marketing screens.
- TestFlight build is tested on at least one small iPhone and one larger iPhone.
- If payments are present, App Review payment rules have been reviewed and implemented correctly.
- If accounts are present, account deletion and Sign in with Apple requirements have been reviewed.

## Open Product Decisions

- Whether the first App Store version should be free-only or include Bike Scout waitlist.
- Whether screenshots should ever be retained beyond immediate extraction/report email.
- Whether report email attachments should remain enabled in the iOS version.
- Whether future Bike Scout payments will use Apple In-App Purchase, Stripe only outside iOS, or a separate compliant entitlement model.

## App Store MVP Scope

The low-risk first App Store MVP should not expose the full web MVP surface. It should focus on local utility and clear privacy boundaries.

MVP positioning:

> Mandy's Bike Finder App Store MVP is a mobile decision tool that helps parents quickly evaluate whether a used kids' bike listing fits their child, is fairly priced, and is worth contacting the seller.

Recommended navigation:

- `Profile`: local child profile and bike fit matching.
- `Evaluate`: screenshot, link/text, or manual listing evaluation.
- `History`: saved local evaluations and shortlist.
- `Settings`: privacy, data controls, AI disclosure, about/disclaimer.

First-version privacy posture:

- Local child profile and saved evaluations should work without an account.
- Email report should be hidden or deferred for the App Store MVP to reduce contact-info and attachment-processing surface.
- PDF export should be deferred unless implemented as a clearly local share/export flow.
- Bike Scout, payment, push notifications, and marketplace automation should not appear in the first App Store surface.
- Screenshots should be processed only after explicit user action, and retention should be minimized.
- LLM use must remain optional, feature-flagged, server-side, rate-limited, and never triggered on initial load.

First-version review strategy:

- Make the app's core value visible through Profile, Evaluate, and History rather than a marketing Home screen.
- Provide local delete/clear controls for profile and history data.
- State that marketplace links are user-provided references and that the app does not automatically scrape Facebook, OfferUp, or login-gated sources.
- Avoid payments and third-party login in v1 to avoid IAP, account deletion, and Sign in with Apple review complexity.

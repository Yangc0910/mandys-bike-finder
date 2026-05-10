# Changelog

## Unreleased

- Migrated the production-path MVP into a new Next.js + TypeScript + Tailwind app under `/app`.
- Moved the controlled beta API surface into Next.js App Router API routes.
- Documented `/app` as the Vercel production deployment root and marked `web/` as a legacy prototype.
- Added Phase 1.5 controlled real API beta plan.
- Added server-side provider architecture for LLM, trusted retailer search, email report, and backend logging.
- Added feature-flagged fallbacks so the app remains functional without API keys.
- Added in-memory daily limits and search caching.
- Added testing notes for no-key, live-key, limit, fallback, and sample listing scenarios.
- Expanded the PRD source of truth with the full Phase 1.5 environment-variable, model, API-key safety, server-side-only, no-initial-LLM-call, and durable limit/cache requirements.
- Added GitHub Actions workflow `.github/workflows/app-build.yml` to verify the `/app` Next.js build (and lint when configured) on push and pull request.
- First Vercel deployment is live at `https://mandys-bike-finder.vercel.app/`.
- Verified `/api/status` returns `200 OK`.
- Confirmed deployment is running in safe fallback mode with `liveSearch=false`, `llmAnalysis=false`, `emailReport=false`, `backendLogging=false`, providers `mock/fallback`, `DAILY_LLM_LIMIT=30`, and `PER_SESSION_LLM_LIMIT=3`.
- Recorded rollout guardrails: do not connect `mandysbikefinder.com` yet and do not enable real APIs yet.
- Improved MVP UX: added height unit selector (`cm` / `ft-in`) with internal cm normalization, weight unit selector (`lb` / `kg`) with optional kg normalization, multi-select kid color preferences with no-preference override, empty initial listing fields, optional sample listing loader, listing source labels, link-only readability note, and cleaner dimension card titles including `Kid Appeal`.
- Updated `docs/PRD.md` to match implemented UX behavior: height/weight unit selectors with normalization, multi-select color preferences, empty initial listing fields, listing source labels, link-only readability note, and `Kid Appeal` dimension naming.
- Recorded that the deployed MVP flow is now manually verified at `https://mandys-bike-finder.vercel.app/`, including working height (`cm` / `ft-in`) and weight (`lb` / `kg`) unit selectors, multi-select color preference with `No preference / all colors are fine`, no confusing prefilled listing data, clearer listing source labels, and cleaner result-card emphasis on `Fit`, `Price`, `Condition`, `Brand`, `Kid Appeal`, and `Risk` while remaining in safe fallback mode with real APIs disabled.
- Recorded that custom domain `https://www.mandysbikefinder.com/` is now live, DNS + Vercel binding is working, the deployed site returns `200 OK`, latest UX fixes are visible on the custom domain, and the site remains in safe fallback mode with real APIs disabled.
- Reconfirmed rollout guardrail: API cost-control safeguards must still be verified before enabling real APIs or broad public sharing.
- Fixed listing-input UX bug in screenshot mode: uploading a screenshot now clears sample listing values, immediately marks source as `screenshot`, shows an OCR-disabled guidance message, and keeps confirmation fields empty until manual edits or real extraction.
- Improved screenshot upload UX: the screenshot panel now renders a real image preview with aspect-ratio-safe fit, keeps the file name as secondary text, and hides `Load sample listing` after screenshot upload to prevent conflicting source state.
- Clarified screenshot analysis behavior: screenshot mode now explicitly states OCR is not implemented yet and directs users to pasted text for AI-assisted extraction; screenshot images are not sent to OpenAI in this step.
- Refined result assessment card UI: removed small meter pill badges and switched to full-card qualitative styling (green/yellow/red tint with stronger accents), larger dimension titles, and clearer hierarchy for status line and reasoning text.
- Added controlled AI-assisted screenshot extraction: screenshot preview remains client-side, extraction is user-triggered via button, calls stay server-side behind `ENABLE_LLM_ANALYSIS` + `OPENAI_API_KEY`, LLM usage limits are enforced, large/unsupported files are rejected with friendly messages, extracted fields populate confirm form with editable `screenshot AI extraction` source tracking, and failures fall back to manual entry messaging.
- Polished landing/header UI for a cleaner parent-facing MVP: merged duplicate top sections into one concise hero, reduced visual dominance of the hero image, improved typography and spacing, added three value chips, and moved technical provider details into a subtle `Beta status` disclosure.
- Improved main flow layout and recommendation visibility: top inputs are now balanced side-by-side (`Child profile` + `Listing input`) with confirmation fields kept in listing flow, results render below the inputs after analyze, and a dedicated `Recommended bike size` section clearly shows best size now, growth option, caution, and reasoning.
- Added analysis gating and empty-state behavior: result sections are hidden until minimum child/listing inputs are provided and Analyze is run, Analyze button now shows disabled reasons when inputs are insufficient, and stale results are replaced with a clear re-run prompt after key input changes.
- Polished hero visual design: upgraded to a premium rounded container with soft gradient background, smoother text-to-image blend, refined branded headline typography, polished eyebrow label, and cleaner value chips while preserving existing functionality.
- Simplified listing input and clarified link-only behavior: removed sample listing action from production UI, treated marketplace links (including Craigslist) as reference metadata, added clear message that some links cannot be read directly, refined source labels for link/manual/text/screenshot flows, and tightened analyze gating so link-only input cannot trigger evaluation.
- Added child-profile-only bike recommendation panel: new `Recommend bike type and size` action under Child Profile with local rule-based category/size guidance, growth option, style recommendation, look-for/avoid checklists, future illustration placeholder, and re-run prompt when child profile changes.
- Added controlled Craigslist link extraction: new server-side Craigslist-only extraction route with timeout, per-session/per-IP limiting, and short-lived caching; link-mode UI can now trigger extraction to populate listing fields and source labels while preserving fallback manual/screenshot flows when extraction fails.
- Refined child profile recommendation UX and logic: cleaned two-column child-profile layout, marked required vs optional fields, required height+age+riding experience for recommendation gating, and updated local recommendation rules to combine height, age, and riding experience with optional personalization notes from weight/style/color.
- Documentation alignment pass: updated README/PRD/current-status/testing notes to clearly separate implemented features vs planned items, reflect current source labels and Craigslist extraction behavior, and document required vs optional child-profile recommendation inputs.
- Fixed wheel-size fit matching and formatting: normalized wheel-size parsing now supports single, multi-size, and range formats (e.g., `24`, `24 in.`, `24/26`, `24-26`), resolves false mismatch cases like `24` vs `24/26`, and standardizes display labels to clean `24 inch` style.
- Prioritized screenshot input in listing flow: reordered listing tabs to `Screenshot`, `Link`, `Manual` and set `Screenshot` as the default selected tab to match the most reliable input path.

## v0.4

- Added action, reporting, and retention requirements.
- Added style/gender preference to child profile.
- Added dimension-level qualitative assessments for fit, price, condition, brand, color/kid appeal, and risk.
- Confirmed that internal scores may exist but user-facing output should remain red/yellow/green.
- Added Negotiation Boost.
- Added Email Report.
- Added backend metadata logging requirements with privacy-preserving buckets.

## v0.3

- Added color/style and kid appeal as key decision factors.
- Prioritized listing link and screenshot upload over manual entry.
- Made manual entry the fallback.
- Replaced numeric user-facing score with qualitative red/yellow/green meter.
- Added API cost-control requirements.
- Shifted deal logic toward parent-centered decision support.

## v0.2

- Shifted platform direction from iOS to Web MVP.
- Adopted the Mandy's Bike Finder product name direction.
- Added the personal Mandy story.
- Elevated price reference checking.
- Added web-friendly listing input flows.
- Chose trusted retailer references over marketplace price references.
- Identified need for replaceable search provider abstraction and fallback modes.

## v0.1

- Explored initial iOS app concept.
- Framed the project as a portfolio product and product-development learning exercise.
- Considered several broad product directions.
- Selected used kids bike advisor as the first specific direction.
- Identified initial features: child-to-bike size advisor, listing analyzer, screenshot upload, seller questions, and message generation.

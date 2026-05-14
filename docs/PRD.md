# Mandy Bike Finder PRD

Version: v0.6 (Current MVP alignment)  
Status: Current MVP source of truth  
Last updated: 2026-05-13

## 1. Product Overview

Mandy Bike Finder helps parents evaluate used kids-bike listings and decide whether a bike is a good fit for their child based on child profile, bike size, bike type, listing details, price, and condition.

The MVP is a practical used-bike decision assistant, not only a generic bike-size calculator.

## 1A. Paid Product Direction

Single paid product only:

- `Mandy Bike Scout`

Positioning:

- Planned paid feature around `$2.99/week` (or generally `$2-3/week` in product copy).
- No Plus / Pro / Premium tier split.
- The value is saved time, listing monitoring, filtering weak matches, and surfacing practical fit/value/safety guidance quickly.
- Before Stripe/payment launch, Bike Scout uses a waitlist-first validation approach.

## 2. Target User

Primary user:

- Parent or caregiver shopping for a used bike for a child.

Typical use case:

- Parent finds a Craigslist or Facebook Marketplace listing.
- Parent wants to know whether the bike is the right size, type, and value.
- Parent may have only a screenshot, a link, or pasted/manual listing text.

## 3. MVP Goals

- Recommend a suitable bike type and wheel size from child profile.
- Extract listing information from screenshot, link, pasted text, or manual entry.
- Let user confirm/edit important listing fields before analysis.
- Evaluate listing quality with practical red/yellow/green guidance.
- Provide parent-friendly "what to look for" and "what to avoid" guidance.
- Support explicit transactional report email sending when server email configuration is enabled.
- Keep AI usage controlled, explicit, and server-side.

## 4. Non-Goals For Current MVP

Not currently implemented:

- Fully automated scraping across all marketplaces.
- Guaranteed Facebook Marketplace page scraping.
- User accounts and persistence.
- Production Bike Scout payments.
- Live Bike Scout payment collection.
- Production Bike Scout scheduled listing alerts.
- Real-time market-wide price comparison engine.
- In-app seller messaging, checkout, or transaction handling.
- PDF report attachment generation.
- Login-gated marketplace automation.
- Anti-bot bypass or scraping workarounds.

## 5. Core User Flow

1. User enters child profile.
2. App recommends bike type and wheel size.
3. User inputs listing via Screenshot, Link, or Manual mode.
4. App extracts or accepts listing details.
5. User confirms/edits listing fields.
6. App evaluates listing quality and fit.
7. App shows recommendation, reasoning, and practical checks.

Current report email flow:

1. Parent completes a bike check and sees recommendation output.
2. Parent enters an email and clicks `Send report to my email`.
3. Server validates request data and enforces report-email rate limits.
4. Server sends transactional email through Resend when configured.
5. Parent gets success/failure feedback in the UI.

Planned Bike Scout flow after backend work:

1. Parent saves a child fit profile and search preferences.
2. Server-side scheduled job queries supported public sources only.
3. Listings are normalized into a shared schema.
4. Existing fit/value/safety scoring is reused.
5. Top matches above threshold are highlighted.
6. Future email alerts are sent.

Current waitlist-first MVP flow:

1. Parent sees Bike Scout as a planned paid feature.
2. Parent joins a waitlist instead of paying now.
3. Waitlist details are stored locally in the browser for this prototype.
4. Parent can optionally preview the future Bike Scout setup flow.

Current PDF status:

- Report content is generated and can be emailed as HTML/plain text.
- PDF attachment export is planned and not yet implemented in production flow.

Current homepage information architecture:

1. Hero introduces the product with two CTAs.
2. The homepage uses two product modes:
   - `Free Bike Check`
   - `Bike Scout Waitlist`
3. `Free Bike Check` is the default primary workflow.
4. `Free Bike Check` uses a progressive four-step tool flow:
   - Rider
   - Listing
   - Review
   - Result
5. `Bike Scout Waitlist` contains the full Bike Scout explanation and waitlist form.

## 6. Child Profile Requirements

Required for child-profile recommendation:

- Height
- Age
- Riding experience

Optional:

- Weight
- Style preference
- Color preference

Rules:

- Recommendation button is disabled until required fields are present.
- Weight/style/color personalize the output but are not required.
- Required fields are labeled `Required`; optional fields are labeled `Optional`.

## 7. Bike Size Recommendation Logic

Core principles:

- Height is the primary wheel-size driver.
- Age is used as a reasonableness adjustment.
- Riding experience affects confidence and growth-size caution.
- Final recommendation includes bike type and wheel size.

Current wheel-size guidance from code (`buildChildBikeRecommendation` in `app/app/page.tsx`):

- `<95 cm` -> 12 inch baseline
- `95-104 cm` -> 14 inch baseline
- `105-114 cm` -> 16 inch baseline
- `115-124 cm` -> 18 inch baseline
- `125-144 cm` -> 20 inch baseline
- `145-154 cm` -> 24 inch baseline
- `>=155 cm` -> 26 inch baseline

Age reasonableness adjustments:

- `<=4` years: cap to at most 14 inch
- `<=6` years: cap to at most 18 inch

Supported wheel sizes:

- 12, 14, 16, 18, 20, 24, 26 inch

## 8. Bike Type Recommendation Logic

Supported categories:

- Balance bike
- Training wheels bike
- Standard kids bike
- Kids cruiser bike
- Kids mountain bike
- Hybrid / neighborhood bike

Implemented approach:

- Weighted category scoring (not a single style rule).
- Higher-weight factors:
  - fit signal from wheel-size band
  - age reasonableness
  - riding experience
- Lower-weight factor:
  - style preference personalization

Current behavior:

- Older/taller + comfortable/confident/advanced riders tend to prefer:
  - Kids mountain bike, or
  - Hybrid / neighborhood bike
- Cruiser is intentionally narrowed:
  - used for stronger comfort/style signal and relaxed riding context
  - receives practicality penalties for progression-oriented riders
- Style preference does not override fit/safety/experience weighting.

Category intent summary:

- Mountain: versatile mixed surfaces (parks, gravel, light trails, neighborhood).
- Hybrid/neighborhood: broad all-around paved/neighborhood use.
- Cruiser: relaxed flat casual riding; comfort/style-first; less versatile.
- Standard kids bike: safe default for younger/smaller beginner/comfortable riders.
- Training wheels: early confidence stage for younger/smaller beginners.
- Balance bike: very young/small pre-pedal stage.

## 9. Listing Input Modes

### Screenshot Mode

- User uploads screenshot file.
- Preview preserves aspect ratio (`contain`) and avoids default cropping.
- Preview is shown in a scrollable max-height container.
- User can open larger modal preview.
- AI extraction is explicit via button click only.
- Preview resizing does not change displayed source state.

### Link Mode

- User pastes listing URL.
- Marketplace is detected from URL and shown in UI.
- Detected marketplace list:
  - Craigslist
  - Facebook Marketplace
  - eBay
  - OfferUp
  - Pinkbike BuySell
  - Bicycle Blue Book
  - Buycycle
  - The Pro's Closet
  - BikeExchange
  - Unknown
- URL is always preserved as listing reference.
- Link analysis uses platform-specific extraction mode:
  - `direct_supported`: Craigslist
  - `best_effort`: eBay, Pinkbike BuySell, Bicycle Blue Book, Buycycle, The Pro's Closet, BikeExchange
  - `fallback_only`: Facebook Marketplace, OfferUp, unknown
- For `best_effort` and `fallback_only`, user is guided to pasted listing text or screenshot when direct page read is unreliable.
- If pasted listing text exists in Link mode, text extraction is preferred for fallback-only marketplaces.
- Manual entry remains available in all cases.

### Manual Mode

- User enters listing fields directly.
- Used as fallback when extraction is unavailable/limited/unsupported.

## 10. Listing Fields

Current fields in code:

- listingLink
- title
- askingPrice
- brand
- model
- wheelSize
- bikeType
- colorStyle
- platform
- location
- condition
- description

Additional source context in UI:

- listing source state label (`screenshot`, `link`, `manual`, extraction variants)
- screenshot filename/preview URL in screenshot mode

## 10A. Bike Scout Prototype Data Model

Current local-only typed prototype model:

- `BikeScoutProfile`
  - `id`
  - `name`
  - `childProfile`
    - `height`
    - `heightUnit`
    - `age`
    - `ridingExperience`
    - `weight` optional
    - `weightUnit` optional
    - `stylePreference` optional
    - `colorPreference` optional
  - `searchPreferences`
    - `location`
    - `zipCode`
    - `radiusMiles`
    - `minBudget` optional
    - `maxBudget`
    - `preferredWheelSizes`
    - `preferredBikeTypes`
    - `includedKeywords`
    - `excludedKeywords`
    - `marketplaceSources`
    - `alertFrequency`
  - `enabled`
  - `createdAt`
  - `updatedAt`

Current storage scope:

- Prototype only.
- Stored in browser `localStorage`.
- No shared backend database yet.
- No auth or multi-device sync yet.

Bike Scout waitlist storage:

- Current waitlist entries are stored in browser `localStorage`.
- There is no durable waitlist database yet.
- Report email is sent as simple HTML/plain text; there is no PDF attachment yet.

## 11. AI Extraction Behavior

- AI extraction is user-triggered only.
- No AI call on initial page load.
- API calls are server-side only.
- API keys are server-side only.
- Screenshot extraction can run from screenshot button action.
- Pasted-text extraction is available in link flow.
- Facebook link flow relies on pasted text/screenshot fallback when direct page read is not possible.
- Manual entry always remains available.

## 11A. Bike Scout Marketplace Connector Foundation

The app now includes a separate typed connector foundation for future Bike Scout marketplace automation:

- `MarketplaceConnector`
  - `id`
  - `label`
  - `search(params: BikeSearchParams): Promise<NormalizedListing[]>`
  - `supportsLocationSearch`
  - `supportsRadiusSearch`
  - `supportsDirectUrlExtraction`
  - `notes`

Normalized search result shape:

- `NormalizedListing`
  - `id`
  - `source`
  - `sourceListingId` optional
  - `title`
  - `price`
  - `currency`
  - `location`
  - `distanceMiles` optional
  - `url`
  - `imageUrl` optional
  - `postedAt` optional
  - `description`
  - `brand` optional
  - `model` optional
  - `bikeType` optional
  - `wheelSize` optional
  - `condition` optional
  - `rawData` optional

Current implementation status:

- Interface and source catalog are implemented.
- Automated search execution is not live yet.
- Any future external searching must stay server-side.

## 12. Rate Limits And Cost Controls

Current server-side configuration:

- `DAILY_LLM_LIMIT` default: `10` (per IP/day baseline)
- `PER_SESSION_LLM_LIMIT` default baseline: `10`

Configured in:

- `app/lib/server/config.ts`
- `.env.example`

Limit behavior:

- On limit reached, user gets fallback message and can continue manual entry.
- Usage counting/checking is server-side via in-memory limit maps (prototype scope).

Security principles:

- API keys remain server-side.
- No frontend exposure of provider secrets.
- Avoid unnecessary LLM calls by explicit user action gating.
- Link extraction is public-page best effort only; no login-gated scraping, no anti-bot bypass, no browser automation scraping in MVP.

## 13. Listing Evaluation / Scoring Logic

Implemented in `app/lib/analysis.ts`.

Dimensions:

- Fit
- Price
- Condition
- Brand
- Kid Appeal
- Risk

Overall logic:

- If any dimension is red -> overall red.
- Else if yellow count >= 3 -> overall yellow.
- Else -> overall green.

Per-dimension summary:

- Fit: compares listing wheel size against normalized recommendation (supports single, multi-size, range parsing).
- Price: compares asking price to local/reference range; missing price -> yellow.
- Condition: repair-risk keyword checks; positive condition signals; otherwise confirmation-needed.
- Brand: tiered brand table (entry/mid/high) and unknown handling.
- Kid Appeal: preference/style alignment heuristics.
- Risk: missing key fields + repair signals + low price-confidence penalties.

Not implemented in current scoring:

- distance/location score
- recency/just-listed score
- stale listing filtering
- full market search ranking

Bike Scout reuse direction:

- Saved child profile
- Normalized listing
- current fit score
- wheel size match
- bike type match
- rule-based price/value signal
- condition/safety signal
- overall recommendation

Important accuracy note:

- Current Bike Scout preview uses the existing rule-based scoring engine.
- It does not claim live market-wide price comparison unless a real provider is enabled later.

## 14. Recommendation Output

After analysis, user sees:

- Overall red/yellow/green recommendation
- Dimension cards with reasoning
- Recommended bike size summary card
- Seller follow-up questions
- Negotiation boost output
- Email report preview/send flow (feature-flag/fallback aware)

Current transactional email scope:

- Endpoint: `POST /api/reports/email`
- Provider: Resend
- Delivery format: HTML + plain-text fallback
- Trigger: explicit user action only
- Not a marketing consent or CRM enrollment endpoint

Child-profile recommendation card includes:

- Recommended bike type
- Recommended wheel size
- Growth option
- Bike-style recommendation
- Explanation
- What to look for / what to avoid
- Optional personalization notes

## 15. UI / UX Requirements

- Warm parent-friendly hero with concise intro copy and bike illustration.
- Lightweight "How it works" onboarding cards before the form.
- Bike Scout paid-feature card/section that clearly says planned/early MVP when automation is not live.
- Expectation-setting callout explaining AI/link limitations and real-world safety checks.
- Responsive child-profile and listing-input layout.
- Required/optional labels visible.
- Recommendation button disabled until required child fields exist.
- Listing modes use tabs: Screenshot, Link, Manual.
- Source label should match current mode/flow state.
- Screenshot preview preserves aspect ratio and avoids cropping.
- Facebook limitations are clearly explained in link flow.
- UI supports desktop and mobile usage patterns.
- Free Bike Check should feel like an interactive tool, not one long exposed form.
- The default view should open on the rider step only; listing, review, and result sections reveal as the parent progresses.
- Completed steps can show compact status/summary cues so the parent understands where they are without seeing every field at once.

Bike Scout section requirements:

- Title: `Mandy Bike Scout`
- Badge: `Planned paid feature`
- Pricing copy: `About $2.99/week`
- Honest language that alerts/payment/automation are not live yet
- Waitlist-first CTA: `Join Bike Scout waitlist`
- Waitlist form with required email and optional intent fields
- Local prototype note that no server submission happens yet
- Optional local prototype form for ZIP/location, radius, budget, and source preferences
- Saved local profile summary when prototype storage is used

## 16. Assets

Current assets under `app/public/images`:

- Hero: `mandy-bike-hero.jpg`
- Category illustrations:
  - `Balance bike.png`
  - `Training-wheel bike.png`
  - `Kids pedal bike.png`
  - `Kids mountain bike.png`
  - `Cruiser comfort bike.png`
  - `Youth hybrid bike.png`

Mapping behavior:

- Keyword-based mapping from recommendation category/hint to image path.
- Fallback placeholder shown when no image match exists.

## 17. Known Limitations

- Facebook Marketplace pages may not be directly readable server-side.
- OfferUp and unknown marketplaces are treated as fallback-only in MVP link flow.
- Best-effort link extraction is public-page only and can fail due to dynamic rendering, anti-bot controls, or login requirements.
- AI extraction is helpful but not perfect; user confirmation is required.
- Price logic is currently rule-based with local fallback ranges.
- Recommendations are guidance, not a substitute for test riding.
- Used-bike mechanical condition still needs human inspection.
- Rate-limit/caching storage is in-memory prototype behavior, not durable multi-instance storage.
- Bike Scout local profiles are browser-local only today.
- Bike Scout waitlist signups are browser-local only today.
- Bike Scout does not send alerts, run cron jobs, or collect payment yet.

## 17A. Source Strategy And Compliance

Automated candidates for future Bike Scout work:

- Craigslist: practical public-search candidate
- eBay: prefer official API
- Pinkbike: best-effort planned
- Bicycle Blue Book: best-effort planned
- Buycycle: best-effort planned
- The Pro's Closet: best-effort planned
- BikeExchange: best-effort planned

User-assisted only:

- Facebook Marketplace
- OfferUp unless a reliable public access path exists later

Hard rules:

- Do not automate Facebook Marketplace scraping.
- Do not scrape login-gated pages.
- Do not bypass anti-bot systems.
- Validate URLs and fetch only public `http/https` pages.
- Keep search connectors behind server-side code when real search is added.

## 18. Future Roadmap

Priority 0 — Must fix before broader public rollout:

- Durable rate-limit and cache storage for deployed environments.
- Stronger extraction quality QA for edge-case screenshots.

Priority 1 — MVP usability improvements:

- Better price reference provider integration.
- Improved structured condition checks.
- Mobile UX polish and accessibility improvements.
- Durable waitlist capture backend (replace browser-local prototype storage).
- Optional PDF attachment export for emailed reports.

Priority 2 — Nice-to-have after MVP:

- Saved listings/history.
- User profile persistence.
- Alerting/notifications.
- Broader marketplace integrations.
- Stronger brand/model normalization.
- Bike Scout production backend, payments, and durable search history.

## 18A. Future Bike Scout Scheduled Architecture

Planned server-side flow:

1. Load enabled Bike Scout profiles.
2. Query supported marketplace connectors.
3. Normalize listings.
4. Deduplicate by URL/source ID.
5. Score each listing.
6. Select top matches above threshold.
7. Notify user by email.
8. Store prior results to avoid duplicate alerts.

Possible future infrastructure:

- Vercel Cron
- Supabase scheduled functions
- GitHub Actions
- Render cron
- Supabase / Neon / Firebase / Vercel Postgres
- Resend / SendGrid / Postmark

Not implemented now:

- production cron
- durable database
- real email alerts
- CRM sync pipeline
- Stripe Checkout or another payment flow
- user accounts

Planned payment path:

- Future Stripe Checkout integration after waitlist demand validation.

Future CRM/email strategy:

- Keep report-email delivery transactional-first on Resend.
- Keep marketing consent separate from transactional reporting.
- Add optional CRM sync later (HubSpot, Salesforce, Mailchimp, Brevo).
- Do not use CRM as app authentication; adopt dedicated auth provider when accounts are introduced.

## 19. Version / Changelog

Changelog source:

- `CHANGELOG.md`

Recent updates include:

- child bike-type weighting update (cruiser narrowed, mountain/hybrid favored for older/confident riders)
- screenshot preview behavior improvements (no crop, scroll/modal)
- Facebook link fallback clarity + action visibility
- extraction limits and docs alignment

## 20. Final Consistency Check

This PRD reflects current implemented MVP behavior and explicitly separates non-implemented items into limitations/roadmap sections. It includes a local-only Bike Scout prototype foundation plus a local-only waitlist-first MVP, but does not claim live paid billing, production alerts, Facebook automation, full market search, user accounts, or durable backend infrastructure as currently implemented.

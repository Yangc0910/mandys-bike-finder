# Testing Notes

## Version 1.1 App Shell And Navigation

Validated on 2026-06-10:

- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run build`: passed with Next.js production compilation and type checking.
- App Store mode browser check at `320 x 700`: no horizontal overflow; all four bottom tabs remain readable; each tab target is 56 pixels high; content bottom padding clears the fixed navigation.
- App Store mode browser check at `430 x 932`: no horizontal overflow; tab targets remain evenly sized; page header and grouped content preserve intended spacing.
- Tab interaction: selecting `Evaluate` updates `aria-current`, screen heading, and scroll position without triggering an AI action.
- Browser console: no warnings or errors during the focused shell/navigation pass.
- Temporary responsive viewport override was reset after testing.

Current PRD: `docs/PRD.md` v0.4  
Current implementation approach: Phase 1.5 controlled real API beta

## Test Without API Keys

1. Leave all feature flags in `.env` unset or set to `false`.
2. Start the Next.js app:

```powershell
cd app
npm install
npm run dev
```

3. Open `http://localhost:3000/`.
4. Analyze a sample listing.
5. Confirm the status pill says providers are mock/fallback.
6. Confirm the app still shows:
   - Overall red/yellow/green meter.
   - Fit, price, condition, brand, kid appeal, and risk assessments.
   - Seller questions.
   - Negotiation Boost message.
   - Email report preview or simulated send.
7. Confirm initial listing fields are empty on first page load (no prefilled sample data).
8. Confirm initial result area is gated:
   - Overall/result cards are hidden before first Analyze.
   - Seller questions, Negotiation Boost, and Email report sections are hidden before first Analyze.
   - Empty state is shown with guidance to add child and listing details.
9. Confirm Analyze button gating:
   - Analyze is disabled when child height is missing.
   - Analyze is disabled when no listing detail is provided.
   - Disabled-state helper reason is shown near the button.
10. Confirm stale-result behavior:
   - Run one analysis.
   - Change key child or listing fields.
   - Confirm prior result is replaced by an "update and re-run analysis" style state until Analyze is clicked again.
11. Confirm listing source label appears and changes appropriately:
   - Source: pasted text AI extraction.
   - Source: screenshot.
   - Source: manual entry.
   - Source: link.
   - Source: link + manual edits.
   - Source: link + pasted text AI extraction.
   - Source: Craigslist link extraction.
   - Source: Craigslist link extraction + manual edits.
   - After screenshot upload and manual edits, source can show `screenshot + manual edits`.
12. In link mode, platform-specific helper copy:
   - Facebook Marketplace URL:
     - `Facebook Marketplace links usually cannot be read directly. Please upload a screenshot or paste the listing text for AI-assisted extraction.`
   - Other marketplace URL:
     - `This link will be saved as a reference. For analysis, please paste listing text, upload a screenshot, or enter key details manually.`
   - Confirm a Link-mode action button is visible when a URL is present for both Craigslist and Facebook Marketplace.
   - For Facebook links with no pasted text, confirm the button stays visible but disabled with clear helper text.
   - For Facebook links with pasted text, confirm the button runs text extraction and keeps URL as listing reference.
   - After switching from Screenshot/Manual back to Link mode, confirm source label resets to `link` (no stale `screenshot` source).
13. Craigslist link-only case:
   - Paste a Craigslist URL, for example:
     - `https://boston.craigslist.org/bmw/bik/d/wayland-trek-mt220-girls-mountain-bike/7919424984.html`
   - Confirm `platform` is recognized as `Craigslist` from URL only.
   - Confirm title/price/brand/wheel size/description remain empty unless user provides pasted text, screenshot extraction, or manual entry.
   - Confirm Analyze remains disabled for link-only input.
   - Confirm source label shows `link`; after manual field edits, source changes to `link + manual edits`.
14. Controlled Craigslist link extraction:
   - Paste the test URL:
     - `https://boston.craigslist.org/bmw/bik/d/wayland-trek-mt220-girls-mountain-bike/7919424984.html`
   - Click `Analyze listing link`.
   - Confirm extracted fields populate when available (title/price/description/location/platform/listingLink).
   - Confirm source label becomes `Craigslist link extraction`.
   - Edit any field and confirm source becomes `Craigslist link extraction + manual edits`.
   - If extraction fails, confirm message:
     - `We could not read this Craigslist listing automatically. Please paste the listing text or upload a screenshot.`
   - Confirm Craigslist auto-extraction attempts only in Link mode (not while Screenshot/Manual tabs are active).
15. Marketplace-aware link detection and guidance:
   - Test URLs:
     - `https://boston.craigslist.org/gbs/bik/d/example/123456.html`
     - `https://www.facebook.com/marketplace/item/177201768044349/`
     - `https://www.ebay.com/itm/1234567890`
     - `https://offerup.com/item/detail/123456`
     - `https://www.pinkbike.com/buysell/123456/`
     - `https://www.bicyclebluebook.com/marketplace/buy-now/123456/`
     - `https://buycycle.com/en-us/bike/example-12345`
     - `https://www.theproscloset.com/products/example-bike`
     - `https://www.bikeexchange.com/en-US/products/example`
     - `https://example.com/random-listing`
   - Confirm each link shows a `Detected:` marketplace label.
   - Confirm extraction mode behavior:
     - Craigslist: direct-supported button (`Analyze listing link`).
     - Best-effort platforms (eBay/Pinkbike/Bicycle Blue Book/Buycycle/The Pro's Closet/BikeExchange): `Try link analysis` + fallback guidance.
     - Fallback-only platforms (Facebook/OfferUp/unknown): direct analysis is not implied; pasted text/screenshot guidance is shown.
   - Confirm fallback-only links still keep a visible action path:
     - If pasted text is empty: button is disabled and helper copy explains next step.
     - If pasted text is present: `Analyze pasted listing text` is enabled.
   - Confirm Link mode source and marketplace indicator stay accurate after tab switching.
16. Screenshot upload behavior:
   - Uploading a screenshot clears previously loaded sample listing values.
   - Source switches to `screenshot` immediately.
   - The preview box renders the uploaded image (not just file name), keeps aspect ratio, and prevents overflow.
   - The file name is shown as secondary metadata under the preview.
   - In screenshot mode, the UI shows:
     - "Screenshot uploaded. You can extract listing details with AI or enter them manually."
   - Uploading a screenshot does not trigger automatic OpenAI extraction.
   - Clicking `Extract listing details from screenshot` is required to trigger server-side AI extraction.
   - If `ENABLE_LLM_ANALYSIS=false` or `OPENAI_API_KEY` is missing, confirm fallback message:
     - "AI screenshot extraction is currently disabled. Please enter the listing details manually."
   - If limits are reached, confirm fallback message:
     - "Daily AI extraction limit reached. You can use AI extraction up to 10 times per day. Please enter the listing details manually or try again tomorrow."
   - After successful extraction, listing source becomes `screenshot AI extraction`.
   - After manual edits post extraction, source becomes `screenshot AI extraction + manual edits`.
   - Confirm listing fields stay empty until manual edits or real extraction.
17. Listing input tab order:
   - Confirm tab order is `Screenshot`, `Link`, `Manual`.
   - Confirm `Screenshot` is selected by default on initial page load.
   - Confirm source label stays aligned with tab context when switching modes (`screenshot`, `link`, `manual`).
18. Screenshot AI extraction price parsing:
   - Upload a screenshot containing:
     - Title: `Fuji Blaster Girls 21 Speed Mountain Bike`
     - Visible price: `$35`
   - Run `Extract listing details from screenshot`.
   - Expected extraction:
     - Asking price = `35`
     - Brand = `Fuji`
     - Model = `Blaster`
     - Bike type = `Mountain Bike`
   - Confirm asking price input is populated and remains editable.

Expected behavior: the app remains fully functional without API keys.

## Test With API Keys

1. Copy `.env.example` to `.env`.
2. Set the relevant feature flags:

```text
ENABLE_LLM_ANALYSIS=true
ENABLE_LIVE_SEARCH=true
ENABLE_EMAIL_REPORT=true
ENABLE_BACKEND_LOGGING=true
```

3. Add only server-side API credentials in `/app/.env.local` or Vercel Environment Variables.
4. Restart the server.
5. Use the same sample listings.
6. Confirm the status pill and API responses indicate live LLM mode if configured. Search, email, and backend logging should still report fallback/mock until those real providers are intentionally implemented.

Expected behavior: live providers run only server-side. No API keys appear in browser source or network payloads.

For screenshot AI extraction:

- Click screenshot extraction button once and verify `/api/extract` request is made only on click.
- Confirm no extraction request is made on page load or file selection.

## Test Production Build

From `/app`:

```powershell
npm run build
```

Expected behavior: the Next.js app builds successfully. If dependencies are not installed, run `npm install` first. If build fails, fix TypeScript, lint, or App Router errors before deploying to Vercel.

## Test API Limits

Set low limits:

```text
DAILY_SEARCH_LIMIT=1
DAILY_LLM_LIMIT=1
DAILY_EMAIL_LIMIT=1
```

Then:

1. Run one analysis.
2. Run a second analysis or message generation.
3. Preview/send a second report.

Expected behavior: the second call falls back gracefully and explains that the daily limit was reached.

## Test Unit and Preference UX

1. Height unit selector:
   - Switch between `cm` and `ft-in`.
   - In `ft-in`, enter feet and inches and confirm analysis still runs.
2. Weight unit selector:
   - Switch between `lb` and `kg`.
   - Leave weight blank and confirm analysis still runs.
3. Color preference multi-select:
   - Select multiple colors and confirm they remain selected.
   - Select `No preference / all colors are fine` and confirm it overrides/clears other selections.

## Test Child-Profile-Only Recommendation

1. Button gating:
   - Without height or age, confirm `Recommend bike type and size` is disabled.
   - Confirm helper message: `Enter height, age, and riding experience to get a bike recommendation.`
2. Case: 145 cm, age 9, comfortable rider:
   - Click recommend button.
   - Confirm wheel recommendation emphasizes `24 inch` with `26 inch` as cautious growth option.
   - Confirm category and checklist sections render.
3. Case: beginner young child (for example 100 cm):
   - Confirm recommendation leans toward balance bike or training-wheel bike with small wheel range.
4. Case: confident 150 cm child:
   - Confirm recommendation allows `26 inch` consideration after safe test ride.
5. Change child profile after recommendation:
   - Confirm prompt appears: `Child profile changed. Re-run recommendation.`
6. Recommendation output contract:
   - Confirm recommendation includes both bike type and wheel size.
   - Confirm explanation references height, age, and riding experience.
7. Optional personalization behavior:
   - Confirm optional notes appear only when optional fields (weight/style/color) are provided.
8. Recommendation illustration mapping:
   - 145 cm, comfortable rider: generate recommendation and confirm a matching bike illustration renders (not the fallback placeholder).
   - Cruiser/comfort category variants (for example `Kids cruiser bike`, `Cruiser bike`, `24 inch Kids cruiser bike`) should all map to the cruiser comfort image.
   - Mountain category should map to the kids mountain bike image.
   - If recommendation text has no recognized category keywords, fallback placeholder should appear.
9. Bike-type weighting behavior:
   - Case 1: 145 cm, age 9, Advanced, Girl-style:
     - Expected primary recommendation is `Kids mountain bike` or `Hybrid / neighborhood bike` (not `Kids cruiser bike`).
     - Wheel size should generally be `24 inch`.
   - Case 2: 145 cm, age 9, Comfortable, strong comfort/cruiser style signal:
     - `Kids cruiser bike` can be recommended with explicit note about weight and lower versatility.
   - Case 3: 125 cm, age 6, Beginner:
     - Expected recommendation is `Standard kids bike` or `Training wheels bike` depending on confidence and fit.
     - Wheel guidance should generally stay around 18/20 inch range.
   - Case 4: 135 cm, age 8, Comfortable, no style preference:
     - Expected recommendation leans toward `Hybrid / neighborhood bike` or `Kids mountain bike`.
     - Wheel guidance should generally be around 20 inch (24 inch only if fit/age context supports).

## Manual Verification on Live Deployment

Manual run-through is verified on:

- `https://mandys-bike-finder.vercel.app/`

Confirmed on deployed MVP:

- Height unit selector works for `cm` / `ft-in`.
- Weight unit selector works for `lb` / `kg`.
- Color preference is multi-select with `No preference / all colors are fine`.
- Listing fields no longer show confusing prefilled data on initial load.
- Listing source labeling is clearer.
- Result cards emphasize `Fit`, `Price`, `Condition`, `Brand`, `Kid Appeal`, and `Risk`.
- Dimension cards use full-card qualitative styling (green/yellow/red tint + stronger accent) instead of small GREEN/YELLOW/RED pill badges.
- Dimension title is the most prominent label, with short status line and secondary reasoning beneath.
- `/api/status` remains `200 OK` with safe fallback mode and real APIs disabled.
- Landing/header visual polish: one simplified hero, clearer parent-facing headline, three value chips, improved spacing/typography, and technical provider status moved to a subtle `Beta status` section.
- Main flow layout: `Child profile` and `Listing input` now appear side-by-side at the top on desktop (stacked on mobile), with `Confirm listing fields` staying in the listing flow and results rendered below only after clicking `Analyze bike`.
- Bike size recommendation visibility: after analysis, a dedicated `Recommended bike size` section clearly shows best size now, growth option, caution, and reasoning.
- Hero visual polish: premium card-style hero with soft warm gradients, smoother left-to-right text/image blending, refined headline typography, polished brand eyebrow label, and cleaner value chips with subtle icon markers.

## Test Fallback Behavior

Use one of these methods:

- Disable a feature flag.
- Remove the provider API key.
- Use an invalid provider URL.
- Set daily limit to `0`.

Expected behavior:

- Analysis does not crash.
- User sees local/fallback estimate messaging.
- API failures are logged server-side.
- Red/yellow/green output still appears.

## Sample Listing Cases

### Case 1: Mandy, 145 cm, Comfortable Rider, Huffy 24 Inch Pink/Purple Bike, $70

Child:

- Height: 145 cm.
- Experience: comfortable.
- Color preference: pink/purple.

Listing:

- Brand: Huffy.
- Wheel size: 24 inch.
- Color/style: pink/purple.
- Asking price: $70.
- Condition: good condition.

Expected: likely yellow or green depending on condition detail. Fit should explain 24 inch is safer/easier now around 145 cm.

### Case 2: Mandy, 145 cm, 26 Inch Bike

Child:

- Height: 145 cm.
- Experience: comfortable.

Listing:

- Wheel size: 26 inch.

Expected: yellow fit. Explain growth-room nuance and need for safe test ride.

### Case 3: Huffy 24 Inch Used Bike Priced at $150

Expected: price should likely be yellow or red because the used price may be high for an entry-level brand unless condition is excellent.

### Case 4: High-Quality Brand Like Woom or Trek

Expected: brand assessment should be green. Price may still be yellow or red if asking price is too close to estimated new range.

### Case 5: Unclear Condition Listing

Listing text:

"Kids bike, used, pick up only."

Expected: condition and risk should be yellow because brakes, tires, chain, rust, gears, and wheel size may need confirmation.

## Fit Parsing Regression Checks

- `24` vs recommendation `24/26 inch` should match (green fit).
- `26` vs recommendation `24/26 inch` should match (green fit).
- `20` vs recommendation `24/26 inch` should not match (mismatch or caution depending on context).
- Listing wheel size `24 in.` should display cleanly as `24 inch` (not `24 in. inch`).
- Missing or undetectable wheel size should show:
  - `Wheel size not detected`
  - `We couldn't confidently detect the bike wheel size from this listing.`

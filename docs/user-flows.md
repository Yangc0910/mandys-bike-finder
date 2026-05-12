# User Flows

Current PRD: `docs/PRD.md` v0.5

## Flow 1: Child Profile Recommendation

1. User enters child profile in Step 1.
2. Required for this feature: height, age, riding experience.
3. Optional: weight, style preference, color preference.
4. User clicks `Recommend bike type and size`.
5. App returns local rule-based recommendation with:
   - bike category
   - wheel size
   - growth option
   - explanation and checklists
   - category illustration (if mapped image exists)

## Flow 2: Listing Input (Screenshot First)

1. Step 2 defaults to `Screenshot` tab.
2. User uploads screenshot and sees preview.
3. Source label switches to screenshot mode.
4. AI extraction runs only if user clicks `Extract listing details from screenshot`.
5. Extracted fields populate Step 3 confirmation fields.
6. User can edit all extracted fields.

Fallback behavior:

- If LLM is disabled, key missing, request fails, or limit reached, user keeps manual edit path.

## Flow 3: Listing Input (Link Mode)

1. User switches to `Link` tab and pastes URL.
2. Action button remains visible when URL exists.
3. Platform behavior:
   - Craigslist URL: `Analyze listing link` triggers controlled server-side extraction.
   - Facebook Marketplace URL: URL is stored, user is guided to paste listing text or upload screenshot.
   - Other URL: URL is stored as reference; user is guided to paste text or enter details manually.
4. If pasted listing text is present, link-mode action runs text extraction and preserves URL as source reference.

## Flow 4: Listing Input (Manual Mode)

1. User switches to `Manual` tab.
2. User edits Step 3 fields directly.
3. Source label reflects manual mode/edits.
4. No external API required for this path.

## Flow 5: Confirm Listing Fields + Analyze

1. Step 3 shows editable listing fields.
2. User confirms title, asking price, brand/model, wheel size, bike type, color/style, condition/description, platform, and link metadata.
3. `Analyze bike` remains gated until minimum required inputs are present.
4. After analyze, app shows:
   - recommended bike size card
   - overall red/yellow/green result
   - dimension cards (Fit, Price, Condition, Brand, Kid Appeal, Risk)
   - seller questions
   - negotiation boost
   - email report panel

## Flow 6: Negotiation Boost + Email Report

1. User chooses message goal/tone and generates seller message.
2. User can preview/email report.
3. In fallback mode, email is simulated and report is still generated for review.

## Flow 7: Bike Scout Local Prototype

1. User opens the `Mandy Bike Scout` section.
2. User sees clear paid positioning:
   - planned paid feature
   - about `$2.99/week`
   - no claim that billing or alerts are live
3. User can copy the current rider profile into Bike Scout or manually enter child/search preferences.
4. User saves one local Bike Scout profile in browser storage.
5. App shows a saved local summary plus a preview of how future normalized search results could reuse current scoring logic.

Important constraints:

- This flow is local-only prototype storage today.
- No scheduled search runs.
- No email alerts.
- No Stripe/payment.
- Facebook Marketplace remains user-assisted only.

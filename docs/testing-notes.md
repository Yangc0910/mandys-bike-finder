# Testing Notes

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
   - Fit, price, condition, brand, color/kid appeal, and risk assessments.
   - Seller questions.
   - Negotiation Boost message.
   - Email report preview or simulated send.

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

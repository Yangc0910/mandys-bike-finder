# Scoring Logic

Current PRD: `docs/PRD.md` v0.4

## Principle

The app may use internal scores, but the user-facing product must show qualitative red/yellow/green guidance with short reasoning. Numeric scores should not be shown to users.

## Internal Dimensions

Internal analysis can calculate:

- `fit_score`.
- `price_score`.
- `condition_score`.
- `brand_score`.
- `color_appeal_score`.
- `risk_score`.

Each dimension maps to:

- Green: strong or low concern.
- Yellow: possible but needs confirmation.
- Red: likely mismatch or high concern.

## Red / Yellow / Green Mapping

Suggested internal mapping:

- Green: dimension is favorable or risk is low.
- Yellow: dimension is uncertain, mixed, or needs seller confirmation.
- Red: dimension is unfavorable or missing in a way that materially affects the decision.

Overall meter should be conservative:

- Green if most important dimensions are green and no major red flags exist.
- Yellow if the bike may work but fit, price, condition, or risk needs confirmation.
- Red if fit is poor, repair risk is high, price is unreasonable, or key information is missing.

## Fit Logic

Use child height and riding experience to recommend wheel size.

| Child height | Beginner | Comfortable | Confident |
| --- | --- | --- | --- |
| 115-130 cm | 20 inch | 20 inch | 20/24 inch |
| 130-145 cm | 24 inch | 24 inch | 24 inch |
| 145-155 cm | 24 inch | 24/26 inch | 26 inch |
| 155+ cm | 26 inch | 26 inch | 26/27.5 inch |

Fit assessment:

- Green when listing wheel size matches recommended size or range.
- Yellow when size may work but depends on experience or test ride.
- Red when wheel size is clearly too small or too large.

Fit matching should use normalized numeric wheel-size parsing, not raw string comparison.

Examples:

- `24`, `24 in`, `24 in.`, `24 inch`, `24 inches`, `24-inch` should normalize to `24 inch`.
- `24` should match recommendation `24/26 inch`.
- `26` should match recommendation `24/26 inch`.
- `20` should not match recommendation `24/26 inch`.
- Range recommendations such as `24-26 inch` should match listing sizes within range.

Edge case:

For a child around 145 cm, 24 inch is likely safer and easier now. 26 inch may give more growth room if the child is confident and can test ride safely.

## Price Logic

Use trusted retailer reference ranges when live search is available. Phase 1 uses local estimated ranges.

Trusted sources:

- Walmart.
- Target.
- Amazon.
- Dick's Sporting Goods.
- REI.
- Costco.
- Sam's Club.
- Official bike brand websites.

Avoid marketplace and auction sources for new-price references.

Price assessment:

- Green when used price appears meaningfully below reasonable new range and condition is good.
- Yellow when price is fair but condition or brand needs confirmation.
- Red when price seems too close to new price, too high for entry-level brand, or condition risk is high.

## Condition Logic

Condition signals:

- Green: new, like new, excellent, lightly used, good brakes, good tires, recently serviced.
- Yellow: used, good condition, some wear, condition unclear.
- Red: needs repair, rust, flat tires, broken brakes, missing chain, parts only, unclear safety condition.

Always call out missing safety information:

- Brakes.
- Tires.
- Chain.
- Rust.
- Gears.

## Brand Logic

Brand tiers:

- Entry-level: Huffy, Dynacraft, Hyper, Kent.
- Mid-level: Schwinn, Mongoose, Raleigh, Diamondback.
- Higher-quality: Woom, Trek, Specialized, Giant, Cannondale, Guardian.

Brand assessment:

- Green for higher-quality brands at reasonable used prices.
- Yellow for mid-level or unknown brands.
- Red only when brand and price/condition combine into poor value.

## Color / Kid Appeal Logic

Compare listing color/style to the child's preference.

Possible reasoning:

- Likely appealing.
- Check with child.
- May feel too babyish.
- Neutral and may age well.

Color should not override safety or fit, but it can change whether the bike is worth contacting the seller about.

## Risk Logic

Risk increases when:

- Wheel size is missing.
- Photos or screenshot are unclear.
- Condition details are missing.
- Safety parts are not mentioned.
- Seller mentions repair needs.
- Price reference is unavailable.
- Distance or pickup burden is high.

Risk assessment:

- Green when key information is present and no repair signals appear.
- Yellow when details need seller confirmation.
- Red when missing details or repair signals make the listing risky.

## Example Cases

### Example 1: Strong Candidate

Child: 132 cm, comfortable rider.  
Listing: 24 inch Schwinn kids bike, $70, good condition, blue, working brakes.

Likely result:

- Overall: Green.
- Fit: Green.
- Price: Green or yellow depending on reference range.
- Condition: Green.
- Brand: Yellow/mid-level.
- Color: Green if blue/green preferred.
- Risk: Green or yellow.

### Example 2: Ask More Before Deciding

Child: 145 cm, confident rider.  
Listing: 26 inch Giant, $120, no wheel size in title but photo suggests larger bike, condition unclear.

Likely result:

- Overall: Yellow.
- Fit: Yellow with growth-room nuance.
- Price: Yellow.
- Condition: Yellow.
- Brand: Green.
- Color: Check with child.
- Risk: Yellow due to missing details.

### Example 3: Probably Skip

Child: 120 cm, beginner.  
Listing: 26 inch Huffy, $150, needs brake work.

Likely result:

- Overall: Red.
- Fit: Red.
- Price: Red or yellow.
- Condition: Red.
- Brand: Yellow or red depending on price.
- Color: Secondary.
- Risk: Red.

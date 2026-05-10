# Scoring Logic

Current implementation reference: `app/lib/analysis.ts`

## User-Facing Rule

- The UI shows only qualitative meters: `green`, `yellow`, `red`.
- No numeric score is shown.

## Dimensions (Implemented)

1. Fit
2. Price
3. Condition
4. Brand
5. Kid Appeal
6. Risk

Overall result:

- Any red in dimensions => overall red (`Probably skip`)
- Else if yellow count >= 3 => overall yellow (`Ask more before deciding`)
- Else => overall green (`Worth contacting`)

## Fit (Implemented)

- Uses child height + riding experience via `recommendWheelSize`.
- Compares listing wheel size against recommended size using normalized numeric parsing.
- Supports inputs like `24`, `24 in.`, `24 inch`, `24/26 inch`, `24-26 inch`.

Outcomes:

- Green: listing size matches recommended size/range.
- Yellow: size is near recommendation and may work with test ride.
- Red: likely mismatch.
- Yellow fallback: wheel size not detected.

## Price (Implemented)

- Uses `listing.askingPrice` and local/reference range.
- If asking price missing => yellow (`Price unclear`).
- Ratio-based thresholds against reference high value:
  - <= 0.45 => green (`Looks reasonable`)
  - <= 0.70 => yellow (`Fair if condition checks out`)
  - > 0.70 => red (`Price looks high`)

Note:

- Live retailer search provider is not implemented yet; default is local fallback range.

## Condition (Implemented)

- Text signals are parsed from title/condition/description.
- Red if repair-risk phrases appear (e.g. broken, rust, needs repair).
- Green for positive condition phrases (e.g. like new, excellent).
- Yellow when condition needs confirmation.

## Brand (Implemented)

- Brand tiers are hardcoded:
  - Entry: Huffy, Dynacraft, Hyper, Kent
  - Mid: Schwinn, Mongoose, Raleigh, Diamondback
  - High: Woom, Trek, Specialized, Giant, Cannondale, Guardian

Outcomes:

- Green: high-tier brand
- Yellow: mid-tier, entry-tier, unknown, or unlisted brand

## Kid Appeal (Implemented)

- Uses child color preferences + style preference vs listing text.
- Green for clear preference/style match or no-preference setup.
- Yellow for unclear style match / check-with-child cases.

## Risk (Implemented)

- Penalizes missing key fields:
  - wheel size
  - condition/description
  - brand
  - asking price
- Red when repair-risk signals appear.
- Yellow when 2+ key fields are missing.
- Yellow when price reference confidence is low.
- Green when key details exist and no repair-risk signals are detected.

## Not Implemented (Planned/TODO)

- Distance/location-based scoring.
- Listing recency / just-listed weighting.
- Stale listing filtering.
- Marketplace-wide ranking engine.

# User Flows

Current PRD: `docs/PRD.md` v0.4

## Flow 1: Child Profile Only

Goal: Let a parent understand likely bike size before analyzing a listing.

1. User opens Mandy's Bike Finder.
2. User enters child height in centimeters.
3. User optionally enters age and weight.
4. User selects riding experience: beginner, comfortable, confident, or advanced.
5. User selects style/gender preference.
6. User optionally selects color/style preference.
7. App shows a general bike size recommendation with nuance.
8. App invites user to paste a listing link, upload a screenshot, or enter listing details manually.

Expected output:

- Recommended wheel size range.
- Growth-room note.
- Reminder to confirm fit and test ride before purchase.

## Flow 2: Analyze Listing From Link

Goal: Analyze a bike listing starting from the parent workflow of copying a marketplace URL.

1. User enters child profile.
2. User pastes a Facebook Marketplace, Craigslist, OfferUp, parent group, or other listing link.
3. App attempts lightweight link classification and field prefill where possible.
4. If the app cannot read the listing, it explains that some marketplaces block automated access.
5. App asks the user to upload a screenshot or manually enter details.
6. App shows a listing field confirmation step.
7. User edits title, price, brand, wheel size, color, condition, description, platform, location, and link as needed.
8. User submits for analysis.
9. App shows overall red/yellow/green result and dimension-level assessments.

Expected output:

- Overall meter.
- Fit, price, condition, brand, color/kid appeal, and risk assessments.
- Seller questions.
- Suggested seller message.

## Flow 3: Analyze Listing From Screenshot

Goal: Analyze a listing when the link cannot be accessed or the user has a screenshot.

1. User enters child profile.
2. User uploads a listing screenshot.
3. Phase 1 shows a local placeholder preview and asks the user to confirm fields manually.
4. Later phases attempt OCR/listing extraction from the screenshot.
5. App shows extracted fields in editable form.
6. User corrects missing or incorrect fields.
7. User submits for analysis.
8. App shows result and suggested next actions.

Expected output:

- Extracted or manually confirmed listing fields.
- Same analysis output as link flow.

## Flow 4: Manual Fallback

Goal: Keep the product useful even when link reading and screenshot extraction are unavailable.

1. User enters child profile.
2. User selects manual entry.
3. User fills listing title, asking price, brand, wheel size, bike type, color/style, condition, description, platform, link, and optional location.
4. App validates minimum required fields.
5. User submits for analysis.
6. App shows result with lower confidence for missing fields.

Expected output:

- Result works without any external API.
- Missing data becomes part of the risk assessment.

## Flow 5: Negotiation Boost

Goal: Help the parent write a concise seller message.

1. User reviews the analysis result.
2. User clicks "Need a negotiation boost?"
3. User selects message goal.
4. User selects tone: friendly, concise, very polite, or firm but respectful.
5. If making a lower offer, user enters target offer, pickup timing, and optional reason.
6. App generates a short natural message.
7. User can edit or copy the message.

Expected output:

- A short seller message.
- No automatic seller contact.

## Flow 6: Email Report

Goal: Let a user keep or share the recommendation.

1. User reviews the analysis result.
2. User clicks "Email this report."
3. User enters email address.
4. User optionally enters recipient name and note.
5. Phase 1 shows a report preview and records mock metadata locally in memory only.
6. Later phases send the report through a backend email service.

Expected report content:

- Listing summary and link.
- Asking price.
- Overall meter.
- Dimension assessments.
- Seller questions.
- Suggested message.
- Disclaimer.

# Mandy's Bike Finder PRD

Version: v0.4  
Status: Current source of truth  
Last updated: 2026-05-10  
MVP platform: Web app  
Future platform: Possible PWA or iOS app later

## A. Product Overview

### Product Name

Mandy's Bike Finder

### Product One-Liner

Mandy's Bike Finder helps parents decide whether a used kids bike is the right size, the right style, and a good enough deal to contact the seller.

### Product Story

Mandy's Bike Finder is a personal product-building project inspired by helping Mandy find the right used bike. The project is meant to teach the software product development process while building a useful web tool for parents who shop through local used marketplaces.

### MVP Platform

The MVP is a web app first. It should run in a desktop or mobile browser and should not require App Store setup, mobile app installation, or user accounts.

### Future Platform

A PWA or iOS app may be considered later after the product workflow, analysis model, and retention value are validated.

### Primary Value Proposition

Parents can paste or enter a used kids bike listing, add basic child profile information, and receive a clear red/yellow/green recommendation with practical reasoning, seller questions, and a concise message they can send.

## B. Target Users

- North American parents shopping for used kids bikes.
- Parents using Facebook Marketplace, Craigslist, local parent groups, OfferUp, and similar local marketplaces.
- Parents who are unsure about bike sizing, price, condition, style, and seller communication.
- Non-native English speakers or busy parents who want help writing concise seller messages.

## C. User Problems

Mandy's Bike Finder should solve these specific problems:

- I do not know what bike size fits my child.
- I do not know whether this specific used bike is right for my child.
- I do not know whether the price is a good deal.
- I do not know whether the brand is reliable or entry-level.
- I do not know whether the color/style is something my child will actually like.
- I do not know what questions to ask the seller.
- I want a concise message to contact or negotiate with the seller.
- I want to email myself or my spouse a report for record keeping and decision sharing.

## D. MVP Scope

The MVP must include:

1. Child profile.
2. Listing input.
3. Screenshot upload.
4. Manual fallback.
5. Listing field confirmation.
6. Bike fit recommendation.
7. Overall red/yellow/green deal meter.
8. Dimension-level qualitative assessments.
9. Price reference check.
10. API cost control.
11. Seller questions.
12. Negotiation Boost.
13. Email report.
14. Backend metadata logging.

Phase 1 implementation should provide these features with local/mock analysis logic and service interfaces where real integrations will later live.

## E. Child Profile Requirements

### Fields

- Height.
  - Support centimeters in MVP.
  - Later support feet/inches.
- Age, optional.
- Weight, optional.
- Riding experience.
  - Beginner.
  - Comfortable.
  - Confident.
  - Advanced.
- Style/gender preference.
  - Boy-style.
  - Girl-style.
  - All good / no preference.
- Color/style preference, optional.
  - Pink/purple.
  - Blue/green.
  - Red/orange.
  - Black/white/neutral.
  - Bright colors.
  - Mature/simple style.
  - No strong preference.

### Style Preference Principle

Style/gender preference is not meant to stereotype children. It is used because used bike listings often use words like "girls bike," "boys mountain bike," "Barbie-like bike," or "princess bike," and those terms can affect whether the child likes the bike and whether the bike has long-term appeal.

## F. Listing Input Requirements

### Input Priority

1. Paste listing link.
2. Upload screenshot.
3. Manual entry as fallback.

### Important Constraint

The app should not depend on automatic Facebook Marketplace or Craigslist scraping. Some links may not be readable. If the link cannot be read, the app should guide the user to upload a screenshot or manually enter details.

### Listing Data To Capture

- Listing title.
- Asking price.
- Brand.
- Model if available.
- Wheel size.
- Bike type if available.
- Color/style.
- Condition.
- Description.
- Platform.
- Listing link.
- Location, optional.

## G. Screenshot / Listing Extraction Requirements

From screenshot or pasted text, the app should attempt to identify:

- Title.
- Price.
- Brand/model.
- Wheel size.
- Color/style.
- Condition keywords.
- Description.
- Platform/link if provided.

After extraction, the app must show a confirmation/editing step before analysis. The user must be able to correct extracted fields.

Phase 1 may use mock extraction or local text parsing only. Real OCR and external listing fetches are out of scope until later phases.

## H. Overall Result

The user-facing result should use a qualitative red/yellow/green meter, not a numeric score.

### Green

Label: Worth contacting  
Meaning: This bike appears to be a strong candidate based on fit, style, price, condition, and risk.

### Yellow

Label: Ask more before deciding  
Meaning: This bike could be a good option, but key details should be confirmed before pickup.

### Red

Label: Probably skip  
Meaning: This bike is likely not the best option because of size, price, condition, style mismatch, or missing information.

### Precision Principle

Do not show a precise numeric score to the user. Avoid fake precision.

## I. Dimension-Level Assessments

Under the overall meter, show qualitative red/yellow/green assessments with reasoning for the following dimensions.

### 1. Fit

Assess whether the wheel size and likely frame size fit the child's height and experience. Include growth-room reasoning.

### 2. Price

Assess whether the asking price seems reasonable compared with trusted retailer reference ranges. Use estimated ranges and confidence, not exact price claims.

### 3. Condition

Assess whether the listing suggests new, like new, good, fair, needs repair, or unclear condition. Call out missing safety information such as brakes, tires, chain, rust, and gears.

### 4. Brand

Identify whether the brand is entry-level, mid-level, or higher-quality.

Example entry-level brands:

- Huffy.
- Dynacraft.
- Hyper.
- Kent.

Example mid-level brands:

- Schwinn.
- Mongoose.
- Raleigh.
- Diamondback.

Example higher-quality brands:

- Woom.
- Trek.
- Specialized.
- Giant.
- Cannondale.
- Guardian.

### 5. Color / Kid Appeal

Assess whether the color/style likely matches the child's preference. Include comments such as:

- Likely appealing.
- Check with child.
- May feel too babyish.
- Neutral and may age well.

### 6. Risk

Assess overall uncertainty and pickup risk, including missing information, unclear photos, no wheel size, no condition details, far distance, and repair risk.

## J. Internal Scoring Logic

Internally the app may calculate:

- `fit_score`.
- `price_score`.
- `condition_score`.
- `brand_score`.
- `color_appeal_score`.
- `risk_score`.

User-facing UI should only show:

- Green / Yellow / Red.
- Short label.
- Reasoning.

## K. Bike Size Recommendation Logic

Use rule-based logic for MVP.

Example sizing logic:

| Child height | Beginner | Comfortable | Confident |
| --- | --- | --- | --- |
| 115-130 cm | 20 inch | 20 inch | 20/24 inch |
| 130-145 cm | 24 inch | 24 inch | 24 inch |
| 145-155 cm | 24 inch | 24/26 inch | 26 inch |
| 155+ cm | 26 inch | 26 inch | 26/27.5 inch |

Important edge case:

For a child around 145 cm, 24 inch is likely safer and easier now. 26 inch may provide more growth room if the child is confident and can test ride safely. The app should explain this nuance rather than giving a simplistic answer.

## L. Price Reference Check

The app should estimate whether the asking price is reasonable by searching or referencing trusted sources.

Trusted sources should prioritize:

- Walmart.
- Target.
- Amazon.
- Dick's Sporting Goods.
- REI.
- Costco.
- Sam's Club.
- Official bike brand websites.

Avoid using Facebook Marketplace, Craigslist, or eBay as new-price references.

Price output should include:

- Estimated new price range.
- Confidence level.
- Used/new ratio if possible.
- Reasoning.

Example:

"Similar new bikes from major retailers appear to be around $140-$220. At $70 used, this may be reasonable if the bike is truly in good condition."

## M. Search API / Cost Control

Because search and LLM APIs may cost money, V1 must include cost-control design:

- Per-session daily limit.
- Global daily API limit via environment variables.
- Caching repeated search queries.
- Fallback mode using local estimated price ranges.
- No unlimited API calls.
- Graceful message if live price check is unavailable.

Example environment variables:

- `DAILY_SEARCH_LIMIT`.
- `DAILY_LLM_LIMIT`.

If live search is unavailable, app should still work using:

- Built-in brand/size estimated ranges.
- User-provided reference price.
- Lower confidence output.

## N. Negotiation Boost

Add a button: "Need a negotiation boost?"

It helps generate concise seller follow-up messages.

Message goals:

- Ask if still available.
- Ask key questions.
- Make a lower offer.
- Follow up politely.
- Confirm pickup time.
- Say thank you.
- Walk away politely.

Tone options:

- Friendly.
- Concise.
- Very polite.
- Firm but respectful.

If making a lower offer, ask for:

- Listing price.
- Target offer.
- Pickup timing.
- Optional reason.
  - Can pick up today.
  - Need to confirm condition.
  - Budget limit.
  - Similar price reference.
  - No reason, keep it simple.

Output should be short and natural.

Example:

"Hi, I'm interested in the bike for my daughter. Would you consider $50 if I can pick it up today or tomorrow? Thanks!"

## O. Email Report

Add an "Email this report" feature.

User inputs:

- Email address.
- Optional recipient name.
- Optional note.

Report should include:

- Listing summary.
- Listing link.
- Asking price.
- Overall meter.
- Fit assessment.
- Price assessment.
- Condition assessment.
- Brand assessment.
- Color/kid appeal assessment.
- Risk assessment.
- Seller questions.
- Suggested message.
- Disclaimer.

Phase 1 may show an email report UI placeholder and compose a preview locally. Real email sending is out of scope until Phase 4.

## P. Backend Metadata Logging

When a user emails a report, the backend should store report metadata for analytics and future monetization.

Store:

- Email.
- `created_at`.
- `height_bucket`, not exact child height if possible.
- `age_bucket`, not exact age if possible.
- `bike_wheel_size`.
- Brand.
- Asking price.
- `overall_meter`.
- `fit_meter`.
- `price_meter`.
- `condition_meter`.
- `brand_meter`.
- `color_appeal_meter`.
- `risk_meter`.
- Listing platform.
- Listing link if provided.

Avoid storing unnecessary child personal details.

Phase 1 should define an interface or placeholder for this behavior but should not implement a real database.

## Q. Privacy and Disclaimer

Mandy's Bike Finder should minimize personal data collection and avoid storing unnecessary child personal details. If analytics are added later, store buckets rather than precise child profile values wherever possible.

Required disclaimer:

"Mandy's Bike Finder provides general sizing and shopping guidance. Always confirm the bike's actual fit, brakes, tires, and safety condition before purchase."

## R. Out of Scope for MVP

The following are explicitly out of scope for the MVP:

- iOS App Store app.
- Automatic Facebook scraping.
- Automatic Craigslist scraping.
- User accounts.
- Subscriptions.
- Push notifications.
- Marketplace watchlist.
- Real-time price tracking.
- Affiliate links.
- Multi-category marketplace helper.
- Full marketplace search engine.

## S. Success Criteria

V1 is successful if a user can:

1. Enter child profile.
2. Upload or enter a listing.
3. Confirm listing details.
4. Receive a red/yellow/green overall result.
5. See dimension-level reasoning.
6. Generate a seller message.
7. Email a report to themselves.

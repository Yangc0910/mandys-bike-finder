# Product Decisions

Current PRD: `docs/PRD.md` v0.4

## Web MVP First, Not iOS First

Decision: Build the MVP as a web app first.

Reason: A web app allows faster iteration, easier sharing, simpler screenshot/link/manual input workflows, and avoids App Store overhead during early product learning.

## Mandy Story Retained in Product Name

Decision: Keep "Mandy's Bike Finder" as the product name.

Reason: The personal story makes the product concrete and emotionally grounded while still serving a broader parent audience.

## Red/Yellow/Green Meter Instead of Numeric Score

Decision: Show qualitative results rather than numeric scores.

Reason: Parents need practical decision guidance, and a precise number would imply fake precision. Internal scores may exist, but the UI should stay qualitative.

## Link/Screenshot-First Listing Input

Decision: Prioritize pasted listing link and screenshot upload before manual entry.

Reason: This matches how parents encounter used bike listings in real life.

## Manual Entry as Fallback

Decision: Manual entry must always be available.

Reason: Facebook Marketplace, Craigslist, and local group links may not be readable. The app should remain useful without scraping or external extraction.

## Trusted Retailer Reference, Not Marketplace Price Reference

Decision: New-price references should prioritize trusted retailers and official brand websites, not Facebook Marketplace, Craigslist, or eBay.

Reason: The product is comparing used asking price against a reasonable new price range, not trying to average noisy marketplace listings.

## API Cost Control Required From the Start

Decision: Cost controls are part of V1 requirements.

Reason: Search, OCR, LLM, email, and backend APIs can create runaway cost if not bounded.

## Controlled Real API Beta Before Full Production

Decision: Test real-world product flow earlier by integrating real APIs in a controlled beta mode rather than relying only on mock analysis.

Reason: Controlled real integrations help validate the true user value of the product: checking whether a used kids bike is the right fit, right style, and a good enough deal based on real listing data and trusted price references. Every external integration must be protected by feature flags, server-side API calls, usage limits, caching where relevant, graceful fallback modes, and safe defaults so the app remains useful without API keys.

## Email Report Added for User Value and Retention

Decision: Add an email report flow.

Reason: Parents may want to save the recommendation, share with a spouse or family member, and keep a decision record.

## Legacy Python Listing Monitor Is Not the Current Product Direction

Decision: Keep the existing Python listing monitor prototype as historical/experimental code for now, but do not treat it as the current MVP implementation.

Reason: The current PRD is Web MVP first and explicitly avoids automatic Facebook/Craigslist scraping. The Python monitor can remain in the repo temporarily, but future implementation should align with `docs/PRD.md`. Any reused logic should be adapted into local/mock web analysis or future service interfaces without violating the scraping constraints.

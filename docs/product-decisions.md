# Product Decisions

Current PRD: `docs/PRD.md` v0.5

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

## Vercel-Hosted Next.js App Under /app

Decision: The production deployment path for Mandy's Bike Finder is a Vercel-hosted Next.js app under `/app`.

Reason: Vercel and Next.js provide a clean path for a web MVP with server-side API routes, environment-variable management, and future deployment to a free Vercel-provided domain. The older `web/` prototype remains in the repository as a legacy prototype until the `/app` implementation is verified.

## Custom Domain Registration and Deployment Sequence

Decision: `mandysbikefinder.com` was registered first and is now live on Vercel at `https://www.mandysbikefinder.com/`.

Reason: Deployment followed this order:
1. Finish Next.js migration under `/app`.
2. Verify local build.
3. Deploy first to a Vercel free domain.
4. Test the full MVP flow.
5. Then connect `mandysbikefinder.com`.

Current status notes:
- DNS + Vercel binding is working.
- Deployed site returns `200 OK`.
- Latest UX fixes are visible on the custom domain.
- Site is still running in safe fallback mode with real APIs disabled.

Additional guardrail: API cost-control safeguards must still be verified before enabling real APIs or broad public sharing.

## Email Report Added for User Value and Retention

Decision: Add an email report flow.

Reason: Parents may want to save the recommendation, share with a spouse or family member, and keep a decision record.

## Legacy Python Listing Monitor Is Not the Current Product Direction

Decision: Keep the existing Python listing monitor prototype as historical/experimental code for now, but do not treat it as the current MVP implementation.

Reason: The current PRD is Web MVP first and explicitly avoids automatic Facebook/Craigslist scraping. The Python monitor can remain in the repo temporarily, but future implementation should align with `docs/PRD.md`. Any reused logic should be adapted into local/mock web analysis or future service interfaces without violating the scraping constraints.

## Single Paid Product Only

Decision: If Mandy adds a paid offer, it should be a single paid product called `Mandy Bike Scout`.

Reason: The monetization story should stay simple for parents. The value is time saved, faster filtering, and quicker action on strong used-bike matches, not a confusing Plus/Pro/Premium ladder.

Guardrails:

- Position around `$2.99/week` or generally `$2-3/week`.
- No Plus / Pro / Premium split.
- Do not imply payment is active before Stripe or equivalent is actually implemented.

## Facebook Marketplace Remains User-Assisted Only

Decision: Bike Scout should not automate Facebook Marketplace monitoring or scraping.

Reason: The product should not depend on login-gated scraping, anti-bot bypass, or automation that creates compliance and reliability risk. Facebook links can still be used as user-provided references with screenshot, pasted text, or manual entry.

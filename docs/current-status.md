# Current Status

Last updated: 2026-05-10

## Production Path

The production deployment path is now a Vercel-hosted Next.js app under `/app`.

The `/app` implementation uses:

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- Server-side API routes.
- Local/mock fallback analysis by default.
- Feature flags for future real API providers.

## Implemented In /app

- Landing/intro content.
- Child profile form.
- Listing input by link, screenshot placeholder, or manual fields.
- Listing field confirmation.
- Red/yellow/green result meter.
- Dimension-level assessments for fit, price, condition, brand, color/kid appeal, and risk.
- Negotiation Boost UI.
- Email report UI and simulated send fallback.
- API routes:
  - `/api/status`
  - `/api/extract`
  - `/api/analyze`
  - `/api/message`
  - `/api/report`

## Not Implemented Yet

- Real OCR.
- Real trusted retailer search provider.
- Real email provider.
- Real database or Supabase adapter.
- Durable deployed usage limits/cache.
- Public Vercel deployment verification.

## Legacy Code

The old `web/` folder remains as a legacy static prototype. It should not be used as the production Vercel root.

The older Python `src/listing_monitor/` package remains historical/experimental and is not the current product direction.

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
- Child-profile-only bike recommendation panel (local rule-based).
- Listing input by link, screenshot placeholder, or manual fields.
- Listing field confirmation.
- Red/yellow/green result meter.
- Dimension-level assessments for fit, price, condition, brand, color/kid appeal, and risk.
- Negotiation Boost UI.
- Email report UI and simulated send fallback.
- API routes:
  - `/api/status`
  - `/api/extract`
  - `/api/extract-link`
  - `/api/analyze`
  - `/api/message`
  - `/api/report`

All listed API routes are migrated under `/app/app/api`.

Child recommendation current rules:

- Required inputs: height, age, riding experience.
- Optional personalization: weight, style preference, color preference.
- Output includes both bike type and wheel size.
- Logic uses height as primary size driver, age as reasonableness check, and riding experience to adjust category/confidence.

## Build Verification Status

- `npm` is not available in the current Codex environment.
- `npm install`, `npm run dev`, and `npm run build` could not be verified here.
- Build verification must be completed later in an environment with Node.js/npm, such as a local machine, GitHub Actions, or Vercel.
- GitHub Actions workflow `.github/workflows/app-build.yml` is used to verify the `/app` build on `push` and `pull_request`.

## Vercel Deployment Status (Live)

- First Vercel deployment is live and reachable at:
  - `https://mandys-bike-finder.vercel.app/`
- Vercel deployment target is the Next.js project under `/app`.
- Vercel root directory is `app`.
- Vercel build command is `npm run build`.
- `/api/status` returns `200 OK`.
- Deployment is running in safe fallback mode with real API features disabled:
  - `ENABLE_LLM_ANALYSIS=false`
  - `ENABLE_LIVE_SEARCH=false`
  - `ENABLE_EMAIL_REPORT=false`
  - `ENABLE_BACKEND_LOGGING=false`
  - `OPENAI_MODEL=gpt-5.4-mini`
  - LLM extraction default limit baseline: `DAILY_LLM_LIMIT=10` and `PER_SESSION_LLM_LIMIT=10` (unless overridden in deployment environment variables)
- `/api/status` confirms:
  - `liveSearch=false`
  - `llmAnalysis=false`
  - `emailReport=false`
  - `backendLogging=false`
  - providers are `mock/fallback`
- Vercel preview/free-domain deployment is verified end-to-end before any custom-domain connection.
- Deployed MVP flow is now manually verified at:
  - `https://mandys-bike-finder.vercel.app/`
- Custom domain is now live and reachable at:
  - `https://www.mandysbikefinder.com/`
- Manual verification confirms:
  - Height unit selector works for `cm` / `ft-in`.
  - Weight unit selector works for `lb` / `kg`.
  - Color preference is multi-select with `No preference / all colors are fine`.
  - Listing fields no longer show confusing prefilled data on initial load.
  - Listing source labeling is clearer.
  - Result cards emphasize `Fit`, `Price`, `Condition`, `Brand`, `Kid Appeal`, and `Risk`.
- DNS + Vercel binding is working and deployed site returns `200 OK`.
- Site is still running in safe fallback mode with real APIs disabled.
- API cost-control safeguards must still be verified before enabling real APIs or broad public sharing.

## Not Implemented Yet

- Real OCR.
- Real trusted retailer search provider.
- Real email provider.
- Real database or Supabase adapter.
- Durable deployed usage limits/cache.
- Public Vercel deployment verification.

## Legacy Code

The old `web/` folder remains as a legacy static prototype only. It should not be used as the production Vercel root.

The older Python `src/listing_monitor/` package remains historical/experimental and is not the current product direction.

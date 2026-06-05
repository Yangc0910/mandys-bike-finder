# Mandy Bike Coach Tasks

## Completed

- Added assistant intent model and fallback guidance in `app/lib/assistant.ts`.
- Added `POST /api/assistant`.
- Added OpenAI-backed assistant response helper.
- Added independent assistant usage limits.
- Added desktop contextual panel.
- Added mobile and desktop floating launcher.
- Added larger visual launcher with small bike illustration.
- Confirmed production API works.

## Pending

- Add unit tests for `normalizeBikeCoachIntent` and `localBikeCoachResponse`.
- Add a manual QA script for desktop launcher, mobile bottom sheet, and assistant fallback.
- Review copy after more real parent testing.
- Decide whether to remove or de-emphasize duplicate desktop contextual panel if floating launcher is enough.

## Nice To Have

- Add a "copy answer" affordance for seller message output.
- Add subtle unread/new prompt nudge after analysis completes.
- Add suggested prompts that change more granularly by current step.

## Testing Tasks

- Verify no assistant call fires on initial page load.
- Verify missing-input prompt works before analysis.
- Verify verdict/fit/price prompts work after analysis.
- Verify local fallback works when LLM is disabled.
- Verify rate-limit fallback works.
- Verify out-of-scope questions redirect back to bike-check help.

## Deployment Tasks

- Keep `GUIDED_ASSISTANT_DAILY_LIMIT` and `GUIDED_ASSISTANT_PER_SESSION_LIMIT` configured or let defaults apply.
- Confirm `/api/assistant` is present in production build output.
- Confirm Vercel env vars for OpenAI are server-side only.


# Mandy Bike Coach

Mandy Bike Coach is a workflow-specific guided assistant inside Mandy's Bike Finder.

It helps a parent understand the current bike-check workflow, not chat generally. It can explain missing inputs, fit guidance, price/value signals, risk notes, seller questions, and seller-message drafting.

## Role

- Keep parents oriented during the bike-check flow.
- Translate analysis output into plain-English next steps.
- Reduce confusion when required inputs are missing.
- Help draft practical seller follow-up without replacing the core evaluator.

## User-Facing Entry Points

- Desktop: right-side contextual panel plus floating bottom-right launcher.
- Mobile: floating launcher that opens a bottom sheet.

## Implementation Files

- `app/app/page.tsx`
- `app/app/api/assistant/route.ts`
- `app/lib/assistant.ts`
- `app/lib/server/providers.ts`
- `app/lib/server/config.ts`

## Safety Boundary

The assistant must not mention Salesforce, CRM, Resend, API keys, backend implementation, provider configuration, or unrelated topics in user-facing answers.


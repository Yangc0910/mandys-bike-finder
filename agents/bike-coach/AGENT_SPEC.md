# Mandy Bike Coach Agent Spec

## Objective

Provide concise, context-aware help for parents using Mandy's Bike Finder to evaluate one used kids' bike listing.

## User Stories

- As a parent, I want to know what information is missing so I can get a useful bike check.
- As a parent, I want the verdict explained in plain English.
- As a parent, I want to understand whether a bike likely fits my child.
- As a parent, I want to know if the price seems fair and what offer to consider.
- As a parent, I want seller questions and a message draft.

## Inputs

- Intent:
  - `explain_flow`
  - `explain_required_info`
  - `explain_missing_inputs`
  - `explain_verdict`
  - `explain_fit_guidance`
  - `explain_price_range`
  - `explain_risks`
  - `suggest_seller_questions`
  - `draft_seller_message`
  - `next_step`
- Optional user message.
- Child profile.
- Listing details.
- Analysis result.
- Seller message draft.
- Missing inputs.

## Outputs

- Parent-friendly assistant message.
- Normalized intent.
- Suggested prompt chips.
- Suggested next action.
- Fallback status if local guidance is used.

## Internal Workflow

1. Frontend builds compact context from the current bike-check state.
2. Frontend sends intent/message/context to `POST /api/assistant`.
3. API route normalizes the intent and compacts input context.
4. Server enforces `GUIDED_ASSISTANT_DAILY_LIMIT` and `GUIDED_ASSISTANT_PER_SESSION_LIMIT`.
5. If LLM is enabled and configured, server asks OpenAI through `openAiBikeCoachResponse`.
6. If LLM is unavailable, disabled, limited, or errors, server returns local fallback guidance from `app/lib/assistant.ts`.

## Data Files Used

- No durable data files.
- No persistent chat storage.
- Runtime context is derived from current page state.

## Safety And Approval Boundaries

- Keep assistant scoped to the current used kids' bike check.
- Do not expose secrets, provider details, CRM, Salesforce, Resend, API keys, or backend implementation.
- Do not answer unrelated general chat beyond redirecting back to the bike-check task.
- Do not replace in-person fit/safety inspection.
- Do not claim market-wide price comparison unless implemented.
- Do not add durable chat history without product/privacy review.

## External Integrations

- OpenAI server-side provider when `ENABLE_LLM_ANALYSIS=true` and `OPENAI_API_KEY` is configured.
- No direct Salesforce, Resend, database, or browser automation integration.

## Error Handling

- Missing/disabled LLM: return local guidance.
- Rate limit reached: return local guidance with limited-detail status.
- Provider exception: log safe error and return local guidance.
- Out-of-scope user message: redirect to fit, price, risk, seller questions, or next steps.

## Future Improvements

- Add small automated tests for intent normalization and fallback responses.
- Add UX analytics for which prompt chips are used.
- Add richer but still concise post-result explanations.
- Add persisted conversation only if user accounts/privacy model are introduced.


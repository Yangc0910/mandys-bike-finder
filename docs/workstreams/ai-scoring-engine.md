# AI And Scoring Engine Workstream

## App Store MVP Scope

Status: Planning  
Last updated: 2026-05-25

Executable PRD slice: `docs/product/app-store-mvp-prd.md`

### AI Principles

- Initial app load must not trigger OpenAI or any LLM call.
- Screenshot selection must not trigger AI.
- Screenshot/text AI extraction requires explicit user action.
- OpenAI API keys remain server-side only.
- `ENABLE_LLM_ANALYSIS`, daily/session/per-IP limits, and fallback/mock behavior remain required.
- Local fallback analysis must be sufficient for the first App Store MVP.

### App Store MVP AI Scope

Included:

- Optional explicit screenshot/text extraction when configured.
- Local fallback analysis when AI is disabled, limited, or fails.
- Clear copy explaining that AI can miss details and the user must review fields.

Simplified:

- Seller message is local-first.
- AI should be framed as assistive extraction or refinement, not as the app's only engine.

Excluded:

- Automatic marketplace analysis on page load.
- Automatic screenshot analysis on upload.
- Background AI enrichment.
- Scheduled AI analysis for Bike Scout or saved searches.

### Acceptance Criteria

- No OpenAI/LLM network call occurs on initial app load.
- No OpenAI/LLM network call occurs from screenshot file selection alone.
- User must tap a clear AI action before screenshot/text content is sent for AI processing.
- Rate-limit and fallback messages remain user-friendly and non-blocking.
- Manual entry and local analysis remain available in all AI failure states.

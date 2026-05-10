# Codex Build Prompts

## 2026-05-10 — Controlled Real API Beta

Request summary:

Update the project plan and implementation approach from purely mock/local Phase 1 to a controlled real-world beta flow.

Key requirements:

- Keep `docs/PRD.md` as source of truth.
- Add Phase 1.5 controlled real API beta.
- Use real APIs where practical for LLM parsing/reasoning, trusted retailer search, email reports, and backend metadata logging.
- Require feature flags, limits, caching, fallback modes, safe defaults, and server-side API calls only.
- Never expose API keys to frontend code.
- Keep red/yellow/green qualitative recommendations.

Implementation notes:

- Added server-side provider abstractions for LLM, search, email, and logging.
- Added mock/local fallbacks for missing keys or disabled flags.
- Added in-memory daily limits and TTL search cache.
- Wired the frontend to server-side API routes while preserving local fallback behavior.

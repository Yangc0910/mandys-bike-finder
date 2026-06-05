# Listing Monitor Agent

This directory documents the historical `src/listing_monitor/` subsystem.

Status:

- Historical / experimental
- Not the current Mandy's Bike Finder product surface
- Kept in-repo for reference, backup, and possible future reuse

Primary code:

- `src/listing_monitor/`

Primary docs:

- `agents/listing-monitor-agent/AGENT_SPEC.md`
- `agents/listing-monitor-agent/TASKS.md`
- `docs/operations/local-runbook.md`

What it does:

- Opens headed browser sessions with a persistent profile
- Reads visible listings from configured pages
- Filters and scores them locally
- Stores seen listings in SQLite
- Sends Gmail summary emails

Important boundary:

- This tool is personal-use automation with conservative operating rules.
- It does not bypass login, CAPTCHA, or anti-bot protection.
- It is separate from the live Next.js App Store MVP in `app/`.

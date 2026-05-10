# Mandy's Bike Finder PRD

Version: v0.4  
Status: Current baseline  
Last updated: 2026-05-10  
Owner: Mandy / project owner

## 1. Product Summary

Mandy's Bike Finder helps the user discover promising bike listings from pages they already browse manually. The product monitors configured listing pages in a visible browser session, extracts visible listing information, ranks opportunities using configurable scoring, deduplicates previously seen items, and sends a concise Gmail summary of the best new matches.

The product is personal-use first. It is designed to assist judgment, not replace it. It does not auto-message sellers, auto-purchase items, scrape hidden data, bypass access controls, or perform unattended activity that a user could not see in the browser.

## 2. Problem

Bike deals can disappear quickly, and manually checking multiple listing pages is repetitive. The user needs a reliable way to notice potentially good listings without refreshing marketplaces throughout the day.

The current workflow has three pain points:

- Important listings are easy to miss.
- Listings need to be filtered and ranked by personal preference, price, condition, and quality signals.
- The user needs a simple summary, not a noisy firehose.

## 3. Goals

- Monitor user-configured listing pages through a real, headed browser profile.
- Extract listing title, price, location, link, source, and visible text where available.
- Filter out clearly irrelevant or undesirable items.
- Score new listings from 0 to 100 using configurable rules.
- Prefer high-signal opportunities, including free or low-price listings that do not appear damaged or incomplete.
- Deduplicate previously seen listings with local SQLite storage.
- Send a daily Gmail summary of the top results.
- Keep the system transparent, configurable, and safe for personal use.

## 4. Non-Goals

- Do not build a public marketplace, crawler network, seller outreach bot, or purchasing bot.
- Do not bypass login, CAPTCHA, bot checks, paywalls, or access controls.
- Do not collect hidden/private data that is not rendered visibly to the logged-in user.
- Do not message sellers automatically.
- Do not make buying decisions automatically.
- Do not build the full future app UI in v0.4.

## 5. Target User

The primary user is Mandy, who wants a practical personal assistant for finding worthwhile bike listings. The user is comfortable configuring saved search URLs and reviewing email summaries, but does not want to babysit repetitive listing checks.

## 6. Current v0.4 Scope

v0.4 covers a local Python prototype with:

- Playwright using a persistent headed browser profile.
- YAML configuration for sources, filters, scoring, selection, and Gmail settings.
- Source-specific CSS selectors with a conservative visible-link fallback.
- Local SQLite deduplication.
- Gmail OAuth send-only email summaries.
- Configurable scoring for price, condition, brands, opportunity phrases, and negative signals.
- Result selection that can favor a primary source while still filling from other sources.
- Dry-run and local CLI operations.

## 7. Listing Collection

Configured sources contain a name, URL, optional listing selector, and optional field selectors. When selectors are present, they should be preferred for reliable extraction. When selectors are absent, the system may use a conservative fallback based on visible links and visible rendered text.

Collection must happen in a visible browser using a persistent profile. The user logs in manually. The app should never automate login or attempt to bypass website protections.

## 8. Filtering

Filters provide broad eligibility control:

- Include keywords are optional. If empty, all visible listings from configured sources may be considered.
- Exclude keywords remove obvious mismatches.
- Minimum and maximum prices can be configured.

Filtering should avoid being too aggressive. Ranking should carry most of the preference work so strong listings are not hidden accidentally.

## 9. Scoring

Each new matching listing receives a `deal_score` and `deal_reason`.

Baseline v0.4 scoring:

- Score range: 0 to 100.
- Free listings receive a strong bonus.
- Listings at or below the low-price threshold receive a bonus.
- Positive condition or urgency keywords receive capped bonuses.
- Known desirable brand keywords receive capped bonuses.
- Desired bike type, frame size, and wheel size phrases receive capped bonuses.
- Excluded bike type and pickup-friction phrases receive capped penalties.
- Negative condition keywords receive capped penalties.
- Unknown price receives a mild penalty unless the listing appears free.
- Known price above the absolute maximum receives score 0.
- Free listings with negative keywords are capped to avoid over-prioritizing poor-quality free items.

Scoring is a ranking aid only. The user makes the final decision.

## 10. Selection

The email summary should include the configured top N results. If a primary source is configured, the selection layer should attempt to reserve a configurable minimum ratio for that source, then fill remaining slots from the best available candidates.

## 11. Notifications

The current notification channel is Gmail. Email summaries should be concise, sorted by score, and include enough context for the user to decide whether to open a listing.

The app requests only the Gmail send scope.

## 12. Data Storage

Local SQLite stores seen listing links for deduplication. Sensitive local files such as credentials, OAuth tokens, browser profiles, local config, and SQLite data must not be committed.

## 13. Safety and Compliance

The product must:

- Use only pages the user is allowed to access.
- Run with conservative pacing.
- Keep browser activity visible.
- Respect website terms and acceptable-use policies.
- Avoid hidden/private data extraction.
- Avoid automated seller contact or purchasing.

## 14. Success Metrics

- The user receives a useful summary without manually checking every source.
- The top results contain fewer irrelevant listings over time.
- Previously seen listings are not repeatedly surfaced.
- Configuration changes are understandable without code edits.
- The system remains safe, local, and transparent.

## 15. Future Opportunities

- Bike-specific preference profiles by type, size, brand, condition, distance, and use case.
- Better source adapters for the marketplaces Mandy uses most.
- A lightweight review UI for accepted/rejected listings.
- Feedback-based scoring improvements.
- Saved searches and watchlists.
- Optional richer notifications once the email workflow is stable.

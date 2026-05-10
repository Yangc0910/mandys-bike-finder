# 0002 - Conservative Visible Browser Automation

Date: 2026-05-10  
Status: Accepted

## Context

The product monitors listing pages from marketplaces or sites the user already visits. These sites can have authentication, anti-bot protections, terms of use, and dynamic rendering.

## Decision

Mandy's Bike Finder will use a conservative, visible-browser approach:

- Browser activity is headed and visible.
- The user logs in manually.
- The app only reads rendered content that is visible to the logged-in browser session.
- The app does not bypass CAPTCHA, paywalls, bot checks, or access controls.
- The app does not automate seller messaging or purchasing.
- Delays remain conservative and configurable.

## Consequences

This limits scale and speed by design, but keeps the product aligned with personal-use assistance. Reliability should come from better configuration, source adapters, and ranking, not aggressive collection behavior.

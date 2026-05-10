# Mandy's Bike Finder

Mandy's Bike Finder is a personal-use product for finding promising bike listings from pages the user already has access to in a real, visible browser.

This repository is intentionally more than an app codebase. It stores the product requirements, PRD version history, decisions, build prompts, operating notes, and the future application code.

## Repository Map

```text
.
|-- .github/                  GitHub issue and pull request templates
|-- docs/
|   |-- prd/                  Current PRD, version history, and archived PRD versions
|   |-- decisions/            Product and technical decision records
|   |-- prompts/              Build prompts and AI collaboration log
|   |-- product/              Roadmap, release notes, and product operating notes
|   |-- architecture/         System architecture notes
|   `-- operations/           Local setup, safety, and runbook notes
|-- src/                      Future and current app code
|-- tests/                    Automated tests
|-- config.example.yaml       Safe example configuration
|-- pyproject.toml            Python project metadata
`-- requirements.txt          Runtime dependencies
```

Start here:

- [Current PRD](docs/prd/current.md)
- [PRD version history](docs/prd/history.md)
- [Decision index](docs/decisions/README.md)
- [Build prompt log](docs/prompts/README.md)
- [Product roadmap](docs/product/roadmap.md)
- [Architecture overview](docs/architecture/overview.md)

## Current Implementation Snapshot

The current codebase is a Python listing monitor prototype that can be adapted into the Mandy's Bike Finder app over time.

It uses:

- Python 3.11+
- Playwright with a persistent browser profile in headed mode
- SQLite for local deduplication
- YAML configuration
- Configurable deal scoring
- Gmail API OAuth for daily email summaries

This tool is intentionally conservative. It does not bypass authentication, CAPTCHAs, paywalls, bot checks, or any website protection. It only processes visible content from pages that your logged-in browser can already display.

## Current Prototype Code

```text
src/listing_monitor/
|-- browser.py
|-- config.py
|-- db.py
|-- email_templates.py
|-- extractors.py
|-- filters.py
|-- gmail_sender.py
|-- models.py
|-- monitor.py
|-- scoring.py
`-- selection.py
```

## Windows Setup

Open PowerShell in this folder.

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -e .
python -m playwright install chromium
Copy-Item config.example.yaml config.yaml
Copy-Item .env.example .env
```

If PowerShell blocks virtualenv activation, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Gmail OAuth Setup

1. Go to Google Cloud Console.
2. Create or select a project.
3. Enable the Gmail API.
4. Configure an OAuth consent screen for personal use.
5. Create OAuth Client ID credentials for a Desktop app.
6. Download the JSON file.
7. Save it as `credentials/client_secret.json`, or update `.env` with its path.

On first email send, a browser consent window opens. After approval, the token is saved locally at `credentials/gmail_token.json`.

The app requests only the Gmail send scope.

## Configure Sources

Copy `config.example.yaml` to `config.yaml`, then edit:

- `sources`: pages you already visit manually
- `filters.include_keywords`
- `filters.exclude_keywords`
- `filters.min_price`
- `filters.max_price`
- `deal_scoring.absolute_max_price`
- `deal_scoring.top_n`
- `deal_scoring.low_price_threshold`
- `deal_scoring.positive_keywords`
- `deal_scoring.negative_keywords`
- `deal_scoring.brand_keywords`
- `deal_scoring.desired_bike_types`
- `deal_scoring.excluded_bike_types`
- `deal_scoring.preferred_frame_sizes`
- `deal_scoring.preferred_wheel_sizes`
- `deal_scoring.pickup_constraint_keywords`
- `selection.primary_source`
- `selection.top_n`
- `selection.min_primary_ratio`
- `preference_examples.liked_item_urls`
- `gmail.sender`
- `gmail.recipient`

For best results, configure CSS selectors per site:

```yaml
sources:
  - name: "My saved search"
    url: "https://example.com/search"
    listing_selector: ".listing-card"
    fields:
      title: ".title"
      price: ".price"
      location: ".location"
      link: "a"
```

If selectors are omitted, the tool falls back to a simple visible-link heuristic. The heuristic only reads rendered, visible text and visible links from the current page.

## Preference Examples

`preference_examples.liked_item_urls` is a place to store item URLs that represent listings you personally like. These URLs are not fetched, opened, scored, or used by the current runtime. They are only saved in config as examples for possible future scoring refinement.

## Result Selection

`selection` controls which scored listings make the final email. Scoring itself is unchanged; selection only chooses from already-scored candidates.

```yaml
selection:
  primary_source: "FB Recommended"
  top_n: 10
  min_primary_ratio: 0.5
```

With `top_n: 10` and `min_primary_ratio: 0.5`, the email tries to include at least five items from `FB Recommended`, then fills the remaining slots from other sources by score. If the primary source has fewer than five usable items, other sources fill the remaining space.

## Deal Scoring

Each new matching listing receives a local `deal_score` and `deal_reason`. Gmail summaries are sorted by score from highest to lowest, and only the configured top N results are sent.

Use filters for broad eligibility only. Leave `filters.include_keywords` empty to allow all visible listings from your configured source pages, then let `deal_scoring` rank them. This keeps free listings prioritized without hiding strong non-free deals under `absolute_max_price`.

The scorer is designed to avoid over-prioritizing free but low-quality listings. Free gets a strong bonus, while repair, parts-only, missing-parts, disassembly, and similar phrases apply strong penalties. If a listing is both free and negative, the score is capped.

Bike-specific preferences can be configured without code changes. Desired bike types, frame sizes, and wheel sizes add capped bonuses; excluded bike types and pickup-friction phrases apply capped penalties. These signals are intentionally keyword-based for now because marketplace titles and snippets are inconsistent.

Example:

```yaml
deal_scoring:
  enabled: true
  absolute_max_price: 100
  top_n: 10
  low_price_threshold: 100
  free_score: 50
  low_price_score: 25
  positive_keyword_score: 15
  brand_keyword_score: 20
  negative_keyword_penalty: 40
  unknown_price_penalty: 10
  max_positive_keyword_score: 30
  max_brand_keyword_score: 40
  max_negative_penalty: 80
  free_with_negative_cap: 35
  bike_type_score: 20
  size_keyword_score: 15
  excluded_bike_type_penalty: 40
  pickup_constraint_penalty: 20
  max_bike_type_score: 40
  max_size_keyword_score: 30
  max_excluded_bike_type_penalty: 80
  max_pickup_constraint_penalty: 40
  positive_keywords:
    - "like new"
    - "barely used"
    - "new in box"
    - "excellent condition"
    - "moving sale"
    - "must go"
    - "pickup today"
    - "priced to sell"
    - "lightly used"
  negative_keywords:
    - "broken"
    - "needs repair"
    - "need repair"
    - "belt needs repair"
    - "parts only"
    - "for parts"
    - "not working"
    - "damaged"
    - "missing parts"
    - "pickup only if removed"
    - "must disassemble"
    - "no delivery"
    - "scrap"
    - "wanted"
  brand_keywords:
    - "nordictrack"
    - "bowflex"
    - "peloton"
    - "horizon"
    - "sole"
    - "life fitness"
    - "precor"
    - "gorilla"
    - "lifetime"
    - "rubbermaid"
    - "craftsman"
    - "dewalt"
    - "milwaukee"
    - "makita"
  desired_bike_types:
    - "commuter bike"
    - "road bike"
    - "hybrid bike"
  excluded_bike_types:
    - "kids bike"
    - "bmx"
    - "stationary bike"
  preferred_frame_sizes:
    - "medium frame"
    - "54cm"
  preferred_wheel_sizes:
    - "700c"
    - "27.5"
  pickup_constraint_keywords:
    - "pickup only"
    - "must disassemble"
    - "no delivery"
```

Scoring model:

- Base score starts at `0`
- Free listing: `+50`
- Price at or below `low_price_threshold`: `+25`
- Positive opportunity keyword: `+15` each, capped at `+30`
- Brand keyword: `+20` each, capped at `+40`
- Desired bike type: `+20` each, capped at `+40`
- Preferred frame or wheel size: `+15` each, capped at `+30`
- Excluded bike type: `-40` each, capped at `-80`
- Pickup constraint: `-20` each, capped at `-40`
- Negative keyword: `-40` each, capped at `-80`
- Unknown price: `-10`, unless the listing appears to be free
- Known price above `absolute_max_price`: score `0` with reason `above absolute max price`
- Free listing with any negative keyword is capped at `35`
- Final score is clamped from `0` to `100`
- Email subject/body uses `Top 10 listing opportunities` when `top_n` is `10`

Deal reasons are shown in the email as readable phrases such as `free listing`, `positive keyword: like new`, `brand keyword: nordictrack`, `negative keyword: needs repair`, and `unknown price penalty`.

Scoring is only a ranking aid for your email summary. The tool does not auto-message, auto-purchase, or take action on listings.

## First Login

Run:

```powershell
listing-monitor login
```

A visible Chromium browser opens using the persistent profile from `config.yaml`. Log in manually to the websites you want to monitor. Close the browser when finished.

The tool does not automate login.

## Run Once

```powershell
listing-monitor run
```

The browser opens visibly, visits each configured URL at a conservative pace, extracts visible listing data, filters results, stores seen links in SQLite, and emails new matches.

Useful options:

```powershell
listing-monitor run --config config.yaml
listing-monitor run --dry-run
listing-monitor init-db
listing-monitor show-seen --limit 20
```

## Daily Schedule on Windows

Use Windows Task Scheduler:

1. Open Task Scheduler.
2. Create Basic Task.
3. Trigger: Daily.
4. Action: Start a program.
5. Program/script:

```text
<path-to-mandys-bike-finder>\.venv\Scripts\listing-monitor.exe
```

6. Add arguments:

```text
run --config "<path-to-mandys-bike-finder>\config.yaml"
```

7. Start in:

```text
<path-to-mandys-bike-finder>
```

The task runs headed, so schedule it for a time when you are logged into Windows and a visible browser is acceptable.

## Safety Notes

- Use only URLs you are allowed to access.
- Log in manually.
- Do not use this for hidden, private, or non-visible data.
- Do not use this to bypass CAPTCHAs, paywalls, anti-bot systems, or access controls.
- Keep delays conservative.
- Respect each website's terms and acceptable-use policies.

## Troubleshooting

If the browser opens but a site is logged out, run `listing-monitor login` again and sign in manually.

If no listings are found, add site-specific selectors in `config.yaml`. Websites vary too much for a single generic extractor to be perfect.

If Gmail OAuth fails, confirm the Gmail API is enabled and `GMAIL_CLIENT_SECRET_FILE` points to your desktop OAuth client JSON.

# Local Runbook

## Setup

Use the existing Python setup flow:

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

## Sensitive Local Files

Do not commit:

- `.env`
- `config.yaml`
- `data/`
- `.browser-profile/`
- `credentials/`
- OAuth tokens
- local SQLite databases

## First Login

Run:

```powershell
listing-monitor login
```

Log in manually in the visible browser. The app does not automate login.

## Run Once

```powershell
listing-monitor run
```

Useful variants:

```powershell
listing-monitor run --dry-run
listing-monitor run --config config.yaml
listing-monitor init-db
listing-monitor show-seen --limit 20
```

## Operating Rules

- Use only listing pages the user is allowed to access.
- Keep pacing conservative.
- Review summary emails manually.
- Tune scoring and source configuration before changing application logic.

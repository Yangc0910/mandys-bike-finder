from __future__ import annotations

import argparse
import asyncio
import os

from dotenv import load_dotenv

from .config import load_config
from .db import ListingStore
from .monitor import open_login_browser, run_monitor


def main() -> None:
    load_dotenv()
    config_parent = argparse.ArgumentParser(add_help=False)
    config_parent.add_argument(
        "--config",
        default=argparse.SUPPRESS,
        help="Path to YAML config file.",
    )

    parser = argparse.ArgumentParser(prog="listing-monitor")
    parser.add_argument(
        "--config",
        default=os.environ.get("CONFIG_PATH", "config.yaml"),
        help="Path to YAML config file.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser(
        "login", parents=[config_parent], help="Open headed browser for manual login."
    )

    run_parser = subparsers.add_parser(
        "run", parents=[config_parent], help="Run the listing monitor once."
    )
    run_parser.add_argument("--dry-run", action="store_true", help="Do not write seen links or send email.")

    subparsers.add_parser(
        "init-db", parents=[config_parent], help="Create the SQLite database and tables."
    )

    seen_parser = subparsers.add_parser(
        "show-seen", parents=[config_parent], help="Show recently seen listings."
    )
    seen_parser.add_argument("--limit", type=int, default=20)

    args = parser.parse_args()
    config = load_config(args.config)

    if args.command == "login":
        asyncio.run(open_login_browser(config))
        return

    if args.command == "run":
        matches = asyncio.run(run_monitor(config, dry_run=args.dry_run))
        print(f"New matching listings: {len(matches)}")
        for item in matches:
            print(
                f"- score {item.deal_score}: {item.title} | "
                f"{item.price_text or item.price_value or 'Unknown'} | {item.link}"
            )
        return

    if args.command == "init-db":
        store = ListingStore(config.storage.sqlite_path)
        store.init()
        print(f"Initialized database: {config.storage.sqlite_path}")
        return

    if args.command == "show-seen":
        store = ListingStore(config.storage.sqlite_path)
        store.init()
        for item in store.recent(limit=args.limit):
            print(
                f"{item.first_seen_at} | {item.source_name} | {item.title} | "
                f"score {item.deal_score} | {item.price_text or item.price_value or 'Unknown'} | "
                f"{item.link}"
            )
        return


if __name__ == "__main__":
    main()

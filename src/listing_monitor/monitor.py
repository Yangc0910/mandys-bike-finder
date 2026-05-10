from __future__ import annotations

import asyncio
import random
from datetime import datetime

from playwright.async_api import TimeoutError as PlaywrightTimeoutError

from .browser import persistent_context
from .config import AppConfig, DelayRange
from .db import ListingStore
from .email_templates import html_summary, plain_text_summary
from .extractors import extract_visible_listings
from .filters import listing_matches
from .gmail_sender import send_email
from .models import Listing
from .scoring import score_listing
from .selection import select_top_listings


async def open_login_browser(config: AppConfig) -> None:
    async with persistent_context(config.browser) as context:
        page = context.pages[0] if context.pages else await context.new_page()
        first_url = config.sources[0].url
        print(f"Opening browser profile for manual login: {config.browser.user_data_dir}")
        print(f"Navigating to first configured source: {first_url}")
        await page.goto(first_url, wait_until="domcontentloaded", timeout=60_000)
        print("Log in manually. Close the browser window when finished.")
        while context.pages:
            await asyncio.sleep(1)


async def run_monitor(config: AppConfig, *, dry_run: bool = False) -> list[Listing]:
    store = ListingStore(config.storage.sqlite_path)
    store.init()

    new_matches: list[Listing] = []
    async with persistent_context(config.browser) as context:
        page = context.pages[0] if context.pages else await context.new_page()

        for index, source in enumerate(config.sources):
            if index:
                await _sleep_range(config.rate_limits.delay_between_pages_seconds)

            print(f"Loading {source.name}: {source.url}")
            try:
                await page.goto(source.url, wait_until="domcontentloaded", timeout=60_000)
                await _sleep_range(config.rate_limits.delay_after_load_seconds)
            except PlaywrightTimeoutError:
                print(f"Timed out loading {source.name}; skipping.")
                continue

            if await _looks_like_protection_or_login(page):
                print(
                    f"{source.name} appears to show a login, CAPTCHA, or protection page. "
                    "Skipping without attempting to bypass it."
                )
                continue

            listings = await extract_visible_listings(page, source)
            print(f"Extracted {len(listings)} visible candidate listing(s).")

            for listing in listings:
                if store.has_seen(listing.link):
                    continue
                if not listing_matches(listing, config.filters):
                    continue
                new_matches.append(score_listing(listing, config.scoring))

    top_matches = select_top_listings(new_matches, config.selection)
    if dry_run:
        print(
            f"Dry run complete. {len(top_matches)} top listing(s) would be emailed "
            f"out of {len(new_matches)} new scored listing(s)."
        )
        return top_matches

    store.add_many(new_matches)
    await _send_summary_if_needed(config, top_matches)
    return top_matches


async def _send_summary_if_needed(config: AppConfig, listings: list[Listing]) -> None:
    if not listings and not config.gmail.send_empty_summary:
        print("No new matches. Email skipped because send_empty_summary is false.")
        return

    title = f"Top {config.selection.top_n} listing opportunities"
    subject = f"{config.gmail.subject_prefix} - {title} - {datetime.now().strftime('%Y-%m-%d')}"
    message_id = send_email(
        sender=config.gmail.sender,
        recipient=config.gmail.recipient,
        subject=subject,
        plain_text=plain_text_summary(listings, title=title),
        html=html_summary(listings, title=title),
    )
    print(f"Sent Gmail summary message: {message_id}")


async def _sleep_range(delay: DelayRange) -> None:
    seconds = random.uniform(delay.min, delay.max)
    await asyncio.sleep(seconds)


async def _looks_like_protection_or_login(page) -> bool:
    try:
        text = (await page.locator("body").inner_text(timeout=5000)).lower()
    except Exception:
        return False
    markers = [
        "captcha",
        "verify you are human",
        "are you a robot",
        "unusual traffic",
        "access denied",
        "please sign in",
        "log in to continue",
    ]
    return any(marker in text for marker in markers)

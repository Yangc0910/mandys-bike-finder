from __future__ import annotations

import re
from html import escape

from .models import Listing

AGE_TEXT_RE = re.compile(
    r"\b(?:just listed|listed(?:\s+(?:today|yesterday|in the last day|in the last week|"
    r"within 1 week|within one week|over 2 weeks ago|over a month ago|"
    r"\d+\s+(?:day|days|week|weeks|month|months)\s+ago)))\b",
    re.IGNORECASE,
)


def plain_text_summary(listings: list[Listing], *, title: str = "Listing opportunities") -> str:
    listings = _dedupe_by_title_and_link(
        [item for item in listings if item.title and item.title != "Create new listing"]
    )
    if not listings:
        return "No new matching listings were found today."

    lines = [title, f"Showing {len(listings)} highest-scoring listing(s):", ""]
    for index, item in enumerate(listings, start=1):
        age_text = _age_text(item)
        lines.extend(
            [
                f"{index}. {item.title}",
                f"   Score: {item.deal_score}",
                f"   Reason: {item.deal_reason}",
                f"   Source: {item.source_name}",
                f"   Price: {item.price_text or item.price_value or 'Unknown'}",
                f"   Location: {item.location or 'Unknown'}",
                f"   Age text: {age_text}",
                f"   Link: {item.link}",
                "",
            ]
        )
    return "\n".join(lines)


def html_summary(listings: list[Listing], *, title: str = "Listing opportunities") -> str:
    listings = _dedupe_by_title_and_link(
        [item for item in listings if item.title and item.title != "Create new listing"]
    )
    if not listings:
        return "<p>No new matching listings were found today.</p>"

    items = []
    for item in listings:
        price = item.price_text or str(item.price_value or "Unknown")
        location = item.location or "Unknown"
        age_text = _age_text(item)
        items.append(
            f"""
            <li>
              <p>
                <strong>Score: {item.deal_score}</strong><br>
                Reason: {escape(item.deal_reason)}
              </p>
              <p><strong>{escape(item.title)}</strong></p>
              <p>
                Price: {escape(price)}<br>
                Location: {escape(location)}<br>
                Age text: {escape(age_text)}<br>
                Link: <a href="{escape(item.link)}">{escape(item.link)}</a>
              </p>
            </li>
            """
        )
    return f"""
    <html>
      <body>
        <h2>{escape(title)}</h2>
        <p>Showing {len(listings)} highest-scoring listing(s):</p>
        <ol>
          {''.join(items)}
        </ol>
      </body>
    </html>
    """


def _dedupe_by_title_and_link(listings: list[Listing]) -> list[Listing]:
    seen: set[tuple[str, str]] = set()
    unique: list[Listing] = []
    for item in listings:
        key = (item.title, item.link)
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)
    return unique


def _age_text(listing: Listing) -> str:
    match = AGE_TEXT_RE.search(listing.raw_text)
    if match:
        return match.group(0)
    return "Unknown"

from __future__ import annotations

from math import ceil
from typing import Protocol

from .models import Listing

OLD_LISTING_PHRASES = [
    "listed over 2 weeks ago",
    "listed 3 weeks ago",
    "listed 4 weeks ago",
    "listed 5 weeks ago",
    "listed 6 weeks ago",
    "listed 7 weeks ago",
    "listed 8 weeks ago",
    "listed 9 weeks ago",
    "listed 10 weeks ago",
    "listed 11 weeks ago",
    "listed 12 weeks ago",
    "listed 13 weeks ago",
    "listed 14 weeks ago",
    "listed 15 weeks ago",
    "listed 16 weeks ago",
    "listed 17 weeks ago",
    "listed 18 weeks ago",
    "listed 19 weeks ago",
    "listed 20 weeks ago",
    "listed 1 month ago",
    "listed 2 months ago",
    "listed 3 months ago",
    "listed over a month ago",
]


class SelectionSettings(Protocol):
    primary_source: str | None
    top_n: int
    min_primary_ratio: float


def select_top_listings(listings: list[Listing], config: SelectionSettings) -> list[Listing]:
    eligible = [item for item in listings if item.deal_score > 0 and not _is_old_listing(item)]
    if not config.primary_source:
        return sorted(eligible, key=_sort_key)[: config.top_n]

    primary = sorted(
        [item for item in eligible if item.source_name == config.primary_source],
        key=_sort_key,
    )
    secondary = sorted(
        [item for item in eligible if item.source_name != config.primary_source],
        key=_sort_key,
    )

    required_primary_count = ceil(config.top_n * config.min_primary_ratio)
    selected = primary[:required_primary_count]
    remaining_slots = config.top_n - len(selected)

    selected_ids = {id(item) for item in selected}
    remaining = sorted(
        [item for item in eligible if id(item) not in selected_ids],
        key=_sort_key,
    )
    selected.extend(remaining[:remaining_slots])

    return sorted(selected, key=_sort_key)[: config.top_n]


def _sort_key(listing: Listing) -> tuple[int, str, str]:
    return (-listing.deal_score, listing.title.lower(), listing.link)


def _is_old_listing(listing: Listing) -> bool:
    text = listing.searchable_text
    return any(phrase in text for phrase in OLD_LISTING_PHRASES)

from __future__ import annotations

import re

from .config import FilterConfig
from .models import Listing

PRICE_RE = re.compile(r"(?<!\w)(?:[$])?\s*([0-9][0-9,]*(?:\.\d{1,2})?)")


def parse_price(text: str | None) -> int | None:
    if not text:
        return None
    match = PRICE_RE.search(text)
    if not match:
        return None
    value = match.group(1).replace(",", "")
    try:
        return int(float(value))
    except ValueError:
        return None


def listing_matches(listing: Listing, filters: FilterConfig) -> bool:
    text = listing.searchable_text

    if filters.include_keywords and not any(keyword in text for keyword in filters.include_keywords):
        return False

    if filters.exclude_keywords and any(keyword in text for keyword in filters.exclude_keywords):
        return False

    if listing.price_value is not None:
        if filters.min_price is not None and listing.price_value < filters.min_price:
            return False
        if filters.max_price is not None and listing.price_value > filters.max_price:
            return False

    return True

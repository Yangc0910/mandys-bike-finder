from __future__ import annotations

import re
from dataclasses import replace
from typing import Protocol

from .models import Listing

STRONG_NEGATIVE_CONDITION_PHRASES = [
    "needs repair",
    "needs belt replacement",
    "needs belt",
    "belt replacement",
    "not working",
    "parts only",
    "damaged",
    "missing parts",
    "needs work",
]

STRONG_POSITIVE_CONDITION_PHRASES = [
    "like new",
    "barely used",
    "new in box",
    "excellent condition",
    "lightly used",
    "works great",
    "clean",
    "well maintained",
]

STRONG_BRAND_USEFULNESS_PHRASES = [
    "nordictrack",
    "bowflex",
    "peloton",
    "horizon",
    "gorilla",
    "lifetime",
    "rubbermaid",
    "craftsman",
    "dewalt",
    "milwaukee",
    "makita",
    "ryobi",
    "ikea",
    "pottery barn",
    "west elm",
    "restoration hardware",
]

STRONG_RECENCY_PHRASES = [
    "just listed",
    "listed today",
    "listed in the last day",
]

RECENT_WITHIN_WEEK_PHRASES = [
    "listed in the last week",
    "listed within 1 week",
    "listed within one week",
]

OLDER_THAN_TWO_WEEKS_PHRASES = [
    "listed more than 2 weeks ago",
    "listed over 2 weeks ago",
    "listed more than two weeks ago",
    "listed over two weeks ago",
]


class ScoringSettings(Protocol):
    enabled: bool
    min_score: int
    max_score: int
    low_price_threshold: int | None
    absolute_max_price: int | None
    top_n: int
    free_score: int
    low_price_score: int
    positive_keyword_score: int
    brand_keyword_score: int
    negative_keyword_penalty: int
    unknown_price_penalty: int
    max_positive_keyword_score: int
    max_brand_keyword_score: int
    max_negative_penalty: int
    free_with_negative_cap: int
    bike_type_score: int
    size_keyword_score: int
    excluded_bike_type_penalty: int
    pickup_constraint_penalty: int
    max_bike_type_score: int
    max_size_keyword_score: int
    max_excluded_bike_type_penalty: int
    max_pickup_constraint_penalty: int
    positive_keywords: list[str]
    negative_keywords: list[str]
    brand_keywords: list[str]
    desired_bike_types: list[str]
    excluded_bike_types: list[str]
    preferred_frame_sizes: list[str]
    preferred_wheel_sizes: list[str]
    pickup_constraint_keywords: list[str]


def score_listing(listing: Listing, config: ScoringSettings) -> Listing:
    if not config.enabled:
        return replace(listing, deal_score=0, deal_reason="deal scoring disabled")

    score = 0
    reasons: list[str] = []
    text = listing.searchable_text
    has_free = _contains_free_listing(listing)

    if _keyword_matches(text, OLDER_THAN_TWO_WEEKS_PHRASES):
        return replace(listing, deal_score=0, deal_reason="listed more than 2 weeks ago")

    if (
        listing.price_value is not None
        and config.absolute_max_price is not None
        and listing.price_value > config.absolute_max_price
    ):
        return replace(listing, deal_score=0, deal_reason="above absolute max price")

    if has_free:
        score += config.free_score
        reasons.append("free listing")

    if listing.price_value is None and not has_free:
        score -= config.unknown_price_penalty
        reasons.append("unknown price penalty")

    if listing.price_value is not None and config.low_price_threshold is not None:
        if listing.price_value <= config.low_price_threshold:
            score += config.low_price_score
            reasons.append(f"price at or below {config.low_price_threshold}")

    strong_recency_matches = _keyword_matches(text, STRONG_RECENCY_PHRASES)
    if strong_recency_matches:
        score += 35
        reasons.append(f"recency signal: {strong_recency_matches[0]}")
    elif _keyword_matches(text, RECENT_WITHIN_WEEK_PHRASES):
        score += 10
        reasons.append("recency signal: listed within 1 week")

    positive_matches = _keyword_matches(
        text, [*config.positive_keywords, *STRONG_POSITIVE_CONDITION_PHRASES]
    )
    if positive_matches:
        positive_score = min(
            config.positive_keyword_score * len(positive_matches),
            config.max_positive_keyword_score,
        )
        score += positive_score
        for keyword in positive_matches:
            reasons.append(f"positive keyword: {keyword}")

    brand_matches = _keyword_matches(
        text, [*config.brand_keywords, *STRONG_BRAND_USEFULNESS_PHRASES]
    )
    if brand_matches:
        brand_score = min(
            config.brand_keyword_score * len(brand_matches),
            config.max_brand_keyword_score,
        )
        score += brand_score
        for keyword in brand_matches:
            reasons.append(f"brand keyword: {keyword}")

    bike_type_matches = _keyword_matches(text, config.desired_bike_types)
    if bike_type_matches:
        bike_type_score = min(
            config.bike_type_score * len(bike_type_matches),
            config.max_bike_type_score,
        )
        score += bike_type_score
        for keyword in bike_type_matches:
            reasons.append(f"desired bike type: {keyword}")

    size_matches = _keyword_matches(
        text, [*config.preferred_frame_sizes, *config.preferred_wheel_sizes]
    )
    if size_matches:
        size_score = min(
            config.size_keyword_score * len(size_matches),
            config.max_size_keyword_score,
        )
        score += size_score
        for keyword in size_matches:
            reasons.append(f"preferred size: {keyword}")

    excluded_bike_type_matches = _keyword_matches(text, config.excluded_bike_types)
    if excluded_bike_type_matches:
        excluded_penalty = min(
            config.excluded_bike_type_penalty * len(excluded_bike_type_matches),
            config.max_excluded_bike_type_penalty,
        )
        score -= excluded_penalty
        for keyword in excluded_bike_type_matches:
            reasons.append(f"excluded bike type: {keyword}")

    pickup_constraint_matches = _keyword_matches(text, config.pickup_constraint_keywords)
    if pickup_constraint_matches:
        pickup_penalty = min(
            config.pickup_constraint_penalty * len(pickup_constraint_matches),
            config.max_pickup_constraint_penalty,
        )
        score -= pickup_penalty
        for keyword in pickup_constraint_matches:
            reasons.append(f"pickup constraint: {keyword}")

    negative_matches = _keyword_matches(
        text, [*config.negative_keywords, *STRONG_NEGATIVE_CONDITION_PHRASES]
    )
    if negative_matches:
        negative_penalty = min(
            config.negative_keyword_penalty * len(negative_matches),
            config.max_negative_penalty,
        )
        score -= negative_penalty
        for keyword in negative_matches:
            reasons.append(f"negative keyword: {keyword}")

    if has_free and negative_matches:
        score = min(score, config.free_with_negative_cap)
        reasons.append(f"free plus negative keyword cap: {config.free_with_negative_cap}")

    score = max(config.min_score, min(config.max_score, score))
    reason = "; ".join(reasons) if reasons else "no scoring signals"
    return replace(listing, deal_score=score, deal_reason=reason)


def _keyword_matches(text: str, keywords: list[str]) -> list[str]:
    return [keyword for keyword in keywords if keyword and _contains_phrase(text, keyword)]


def _contains_free_listing(listing: Listing) -> bool:
    if listing.price_value == 0:
        return True
    if listing.price_text and listing.price_text.strip().lower() == "free":
        return True
    return listing.title.strip().lower().startswith("free")


def _contains_phrase(text: str, phrase: str) -> bool:
    pattern = r"(?<!\w)" + re.escape(phrase).replace(r"\ ", r"\s+") + r"(?!\w)"
    return re.search(pattern, text) is not None

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml
from dotenv import load_dotenv


@dataclass(frozen=True)
class BrowserConfig:
    user_data_dir: Path
    headless: bool = False
    slow_mo_ms: int = 250
    viewport_width: int = 1365
    viewport_height: int = 900


@dataclass(frozen=True)
class StorageConfig:
    sqlite_path: Path


@dataclass(frozen=True)
class GmailConfig:
    sender: str
    recipient: str
    subject_prefix: str = "Daily listing monitor"
    send_empty_summary: bool = False


@dataclass(frozen=True)
class FilterConfig:
    include_keywords: list[str] = field(default_factory=list)
    exclude_keywords: list[str] = field(default_factory=list)
    min_price: int | None = None
    max_price: int | None = None


@dataclass(frozen=True)
class ScoringConfig:
    enabled: bool = True
    min_score: int = 0
    max_score: int = 100
    low_price_threshold: int | None = 100
    absolute_max_price: int | None = 100
    top_n: int = 10
    free_score: int = 50
    low_price_score: int = 25
    positive_keyword_score: int = 15
    brand_keyword_score: int = 20
    negative_keyword_penalty: int = 40
    unknown_price_penalty: int = 10
    max_positive_keyword_score: int = 30
    max_brand_keyword_score: int = 40
    max_negative_penalty: int = 80
    free_with_negative_cap: int = 35
    bike_type_score: int = 20
    size_keyword_score: int = 15
    excluded_bike_type_penalty: int = 40
    pickup_constraint_penalty: int = 20
    max_bike_type_score: int = 40
    max_size_keyword_score: int = 30
    max_excluded_bike_type_penalty: int = 80
    max_pickup_constraint_penalty: int = 40
    positive_keywords: list[str] = field(default_factory=list)
    negative_keywords: list[str] = field(default_factory=list)
    brand_keywords: list[str] = field(default_factory=list)
    desired_bike_types: list[str] = field(default_factory=list)
    excluded_bike_types: list[str] = field(default_factory=list)
    preferred_frame_sizes: list[str] = field(default_factory=list)
    preferred_wheel_sizes: list[str] = field(default_factory=list)
    pickup_constraint_keywords: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class DelayRange:
    min: float
    max: float


@dataclass(frozen=True)
class RateLimitConfig:
    delay_between_pages_seconds: DelayRange = field(default_factory=lambda: DelayRange(12, 25))
    delay_after_load_seconds: DelayRange = field(default_factory=lambda: DelayRange(5, 10))


@dataclass(frozen=True)
class SourceConfig:
    name: str
    url: str
    listing_selector: str | None = None
    fields: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class SelectionConfig:
    primary_source: str | None = None
    top_n: int = 10
    min_primary_ratio: float = 0.5


@dataclass(frozen=True)
class AppConfig:
    browser: BrowserConfig
    storage: StorageConfig
    gmail: GmailConfig
    filters: FilterConfig
    scoring: ScoringConfig
    selection: SelectionConfig
    rate_limits: RateLimitConfig
    sources: list[SourceConfig]


def load_config(config_path: str | Path) -> AppConfig:
    load_dotenv()
    path = Path(config_path)
    with path.open("r", encoding="utf-8") as f:
        raw = yaml.safe_load(f) or {}

    base_dir = path.parent.resolve()

    browser_raw = raw.get("browser", {})
    viewport = browser_raw.get("viewport", {})
    storage_raw = raw.get("storage", {})
    gmail_raw = raw.get("gmail", {})
    filters_raw = raw.get("filters", {})
    scoring_raw = raw.get("deal_scoring", raw.get("scoring", {}))
    selection_raw = raw.get("selection", {})
    rate_raw = raw.get("rate_limits", {})

    browser = BrowserConfig(
        user_data_dir=_resolve_path(base_dir, browser_raw.get("user_data_dir", ".browser-profile")),
        headless=bool(browser_raw.get("headless", False)),
        slow_mo_ms=int(browser_raw.get("slow_mo_ms", 250)),
        viewport_width=int(viewport.get("width", 1365)),
        viewport_height=int(viewport.get("height", 900)),
    )
    if browser.headless:
        raise ValueError("This tool is designed for headed mode. Set browser.headless to false.")

    storage = StorageConfig(
        sqlite_path=_resolve_path(base_dir, storage_raw.get("sqlite_path", "data/listings.sqlite3"))
    )
    gmail = GmailConfig(
        sender=str(gmail_raw["sender"]),
        recipient=str(gmail_raw["recipient"]),
        subject_prefix=str(gmail_raw.get("subject_prefix", "Daily listing monitor")),
        send_empty_summary=bool(gmail_raw.get("send_empty_summary", False)),
    )
    filters = FilterConfig(
        include_keywords=[str(x).lower() for x in filters_raw.get("include_keywords", [])],
        exclude_keywords=[str(x).lower() for x in filters_raw.get("exclude_keywords", [])],
        min_price=_optional_int(filters_raw.get("min_price")),
        max_price=_optional_int(filters_raw.get("max_price")),
    )
    scoring = ScoringConfig(
        enabled=bool(scoring_raw.get("enabled", True)),
        min_score=int(scoring_raw.get("min_score", 0)),
        max_score=int(scoring_raw.get("max_score", 100)),
        low_price_threshold=_optional_int(
            scoring_raw.get("low_price_threshold", scoring_raw.get("price_below_threshold", 100))
        ),
        absolute_max_price=_optional_int(scoring_raw.get("absolute_max_price", 100)),
        top_n=max(1, int(scoring_raw.get("top_n", 10))),
        free_score=int(scoring_raw.get("free_score", 50)),
        low_price_score=int(
            scoring_raw.get("low_price_score", scoring_raw.get("price_below_threshold_points", 25))
        ),
        positive_keyword_score=int(
            scoring_raw.get("positive_keyword_score", scoring_raw.get("urgency_keyword_points", 15))
        ),
        brand_keyword_score=int(
            scoring_raw.get("brand_keyword_score", scoring_raw.get("brand_keyword_points", 20))
        ),
        negative_keyword_penalty=abs(
            int(scoring_raw.get("negative_keyword_penalty", scoring_raw.get("negative_keyword_points", 40)))
        ),
        unknown_price_penalty=int(scoring_raw.get("unknown_price_penalty", 10)),
        max_positive_keyword_score=int(scoring_raw.get("max_positive_keyword_score", 30)),
        max_brand_keyword_score=int(scoring_raw.get("max_brand_keyword_score", 40)),
        max_negative_penalty=int(scoring_raw.get("max_negative_penalty", 80)),
        free_with_negative_cap=int(scoring_raw.get("free_with_negative_cap", 35)),
        bike_type_score=int(scoring_raw.get("bike_type_score", 20)),
        size_keyword_score=int(scoring_raw.get("size_keyword_score", 15)),
        excluded_bike_type_penalty=abs(int(scoring_raw.get("excluded_bike_type_penalty", 40))),
        pickup_constraint_penalty=abs(int(scoring_raw.get("pickup_constraint_penalty", 20))),
        max_bike_type_score=int(scoring_raw.get("max_bike_type_score", 40)),
        max_size_keyword_score=int(scoring_raw.get("max_size_keyword_score", 30)),
        max_excluded_bike_type_penalty=int(scoring_raw.get("max_excluded_bike_type_penalty", 80)),
        max_pickup_constraint_penalty=int(scoring_raw.get("max_pickup_constraint_penalty", 40)),
        positive_keywords=[
            str(x).lower()
            for x in scoring_raw.get("positive_keywords", scoring_raw.get("urgency_keywords", []))
        ],
        negative_keywords=[str(x).lower() for x in scoring_raw.get("negative_keywords", [])],
        brand_keywords=[str(x).lower() for x in scoring_raw.get("brand_keywords", [])],
        desired_bike_types=[str(x).lower() for x in scoring_raw.get("desired_bike_types", [])],
        excluded_bike_types=[str(x).lower() for x in scoring_raw.get("excluded_bike_types", [])],
        preferred_frame_sizes=[str(x).lower() for x in scoring_raw.get("preferred_frame_sizes", [])],
        preferred_wheel_sizes=[str(x).lower() for x in scoring_raw.get("preferred_wheel_sizes", [])],
        pickup_constraint_keywords=[
            str(x).lower() for x in scoring_raw.get("pickup_constraint_keywords", [])
        ],
    )
    if scoring.max_score < scoring.min_score:
        raise ValueError("scoring.max_score must be >= scoring.min_score.")
    selection = SelectionConfig(
        primary_source=selection_raw.get("primary_source"),
        top_n=max(1, int(selection_raw.get("top_n", scoring.top_n))),
        min_primary_ratio=_clamp_float(
            float(selection_raw.get("min_primary_ratio", 0.5)), minimum=0.0, maximum=1.0
        ),
    )
    rate_limits = RateLimitConfig(
        delay_between_pages_seconds=_delay_range(
            rate_raw.get("delay_between_pages_seconds"), default=(12, 25)
        ),
        delay_after_load_seconds=_delay_range(rate_raw.get("delay_after_load_seconds"), default=(5, 10)),
    )

    sources = [_source_config(item) for item in raw.get("sources", [])]
    if not sources:
        raise ValueError("At least one source must be configured.")

    return AppConfig(
        browser=browser,
        storage=storage,
        gmail=gmail,
        filters=filters,
        scoring=scoring,
        selection=selection,
        rate_limits=rate_limits,
        sources=sources,
    )


def _resolve_path(base_dir: Path, value: str | Path) -> Path:
    path = Path(value)
    if path.is_absolute():
        return path
    return (base_dir / path).resolve()


def _optional_int(value: Any) -> int | None:
    if value in (None, ""):
        return None
    return int(value)


def _delay_range(value: Any, default: tuple[float, float]) -> DelayRange:
    if not value:
        return DelayRange(*default)
    minimum = float(value.get("min", default[0]))
    maximum = float(value.get("max", default[1]))
    if minimum < 0 or maximum < minimum:
        raise ValueError("Delay ranges must be non-negative and max must be >= min.")
    return DelayRange(minimum, maximum)


def _clamp_float(value: float, *, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _source_config(raw: dict[str, Any]) -> SourceConfig:
    return SourceConfig(
        name=str(raw["name"]),
        url=str(raw["url"]),
        listing_selector=raw.get("listing_selector"),
        fields={str(k): str(v) for k, v in (raw.get("fields") or {}).items()},
    )

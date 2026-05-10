from __future__ import annotations

import unittest
from dataclasses import dataclass, field

from listing_monitor.models import Listing
from listing_monitor.scoring import score_listing


@dataclass(frozen=True)
class TestScoringConfig:
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
    positive_keywords: list[str] = field(
        default_factory=lambda: [
            "like new",
            "barely used",
            "new in box",
            "excellent condition",
            "moving sale",
            "must go",
            "pickup today",
            "priced to sell",
            "lightly used",
        ]
    )
    negative_keywords: list[str] = field(
        default_factory=lambda: [
            "broken",
            "needs repair",
            "need repair",
            "belt needs repair",
            "parts only",
            "for parts",
            "not working",
            "damaged",
            "missing parts",
            "pickup only if removed",
            "must disassemble",
            "no delivery",
            "scrap",
            "wanted",
        ]
    )
    brand_keywords: list[str] = field(
        default_factory=lambda: [
            "nordictrack",
            "bowflex",
            "peloton",
            "horizon",
            "sole",
            "life fitness",
            "precor",
            "gorilla",
            "lifetime",
            "rubbermaid",
            "craftsman",
            "dewalt",
            "milwaukee",
            "makita",
        ]
    )
    desired_bike_types: list[str] = field(
        default_factory=lambda: ["commuter bike", "road bike", "hybrid bike"]
    )
    excluded_bike_types: list[str] = field(default_factory=lambda: ["kids bike", "bmx"])
    preferred_frame_sizes: list[str] = field(default_factory=lambda: ["medium frame", "54cm"])
    preferred_wheel_sizes: list[str] = field(default_factory=lambda: ["700c", "27.5"])
    pickup_constraint_keywords: list[str] = field(
        default_factory=lambda: ["must disassemble", "no delivery", "pickup only"]
    )


class DealScoringTests(unittest.TestCase):
    def setUp(self) -> None:
        self.config = TestScoringConfig()

    def test_free_broken_treadmill_is_capped_low(self) -> None:
        listing = _listing(
            title="Free treadmill belt needs repair",
            price_text="Free",
            price_value=None,
        )

        scored = score_listing(listing, self.config)

        self.assertLessEqual(scored.deal_score, 35)
        self.assertIn("free listing", scored.deal_reason)
        self.assertIn("negative keyword: belt needs repair", scored.deal_reason)

    def test_low_price_branded_like_new_scores_high(self) -> None:
        listing = _listing(
            title="$50 NordicTrack treadmill like new",
            price_text="$50",
            price_value=50,
        )

        scored = score_listing(listing, self.config)

        self.assertGreaterEqual(scored.deal_score, 60)
        self.assertIn("brand keyword: nordictrack", scored.deal_reason)
        self.assertIn("positive keyword: like new", scored.deal_reason)

    def test_wanted_treadmill_scores_very_low(self) -> None:
        listing = _listing(
            title="Wanted treadmill",
            price_text=None,
            price_value=None,
        )

        scored = score_listing(listing, self.config)

        self.assertEqual(scored.deal_score, 0)
        self.assertIn("negative keyword: wanted", scored.deal_reason)

    def test_new_in_box_garden_bed_scores_above_generic_listing(self) -> None:
        generic = score_listing(_listing(title="garden bed kit"), self.config)
        new_in_box = score_listing(_listing(title="new in box garden bed kit"), self.config)

        self.assertGreater(new_in_box.deal_score, generic.deal_score)
        self.assertIn("positive keyword: new in box", new_in_box.deal_reason)

    def test_above_absolute_max_price_scores_zero(self) -> None:
        listing = _listing(
            title="$150 NordicTrack treadmill like new",
            price_text="$150",
            price_value=150,
        )

        scored = score_listing(listing, self.config)

        self.assertEqual(scored.deal_score, 0)
        self.assertEqual(scored.deal_reason, "above absolute max price")

    def test_bike_type_and_size_preferences_raise_score(self) -> None:
        generic = score_listing(
            _listing(title="$80 used bike", price_text="$80", price_value=80),
            self.config,
        )
        preferred = score_listing(
            _listing(
                title="$80 road bike medium frame 700c",
                price_text="$80",
                price_value=80,
            ),
            self.config,
        )

        self.assertGreater(preferred.deal_score, generic.deal_score)
        self.assertIn("desired bike type: road bike", preferred.deal_reason)
        self.assertIn("preferred size: medium frame", preferred.deal_reason)
        self.assertIn("preferred size: 700c", preferred.deal_reason)

    def test_excluded_bike_type_and_pickup_constraints_reduce_score(self) -> None:
        listing = _listing(
            title="$80 kids bike pickup only",
            price_text="$80",
            price_value=80,
        )

        scored = score_listing(listing, self.config)

        self.assertEqual(scored.deal_score, 0)
        self.assertIn("excluded bike type: kids bike", scored.deal_reason)
        self.assertIn("pickup constraint: pickup only", scored.deal_reason)


def _listing(
    *,
    title: str,
    price_text: str | None = None,
    price_value: int | None = None,
    raw_text: str | None = None,
) -> Listing:
    return Listing(
        source_name="test",
        title=title,
        price_text=price_text,
        price_value=price_value,
        location=None,
        link=f"https://example.com/{title.replace(' ', '-')}",
        raw_text=raw_text or title,
    )


if __name__ == "__main__":
    unittest.main()

from __future__ import annotations

import unittest
from dataclasses import dataclass

from listing_monitor.models import Listing
from listing_monitor.selection import select_top_listings


@dataclass(frozen=True)
class TestSelectionConfig:
    primary_source: str | None = "FB Recommended"
    top_n: int = 10
    min_primary_ratio: float = 0.5


class SelectionTests(unittest.TestCase):
    def test_primary_source_gets_minimum_quota_when_available(self) -> None:
        listings = [
            *[_listing("FB Recommended", index, 50 + index) for index in range(6)],
            *[_listing("FB Search", index, 90 - index) for index in range(8)],
        ]

        selected = select_top_listings(listings, TestSelectionConfig())

        self.assertEqual(len(selected), 10)
        self.assertGreaterEqual(
            sum(1 for item in selected if item.source_name == "FB Recommended"),
            5,
        )

    def test_other_sources_fill_when_primary_is_short(self) -> None:
        listings = [
            *[_listing("FB Recommended", index, 70 + index) for index in range(2)],
            *[_listing("FB Search", index, 60 - index) for index in range(10)],
        ]

        selected = select_top_listings(listings, TestSelectionConfig())

        self.assertEqual(len(selected), 10)
        self.assertEqual(sum(1 for item in selected if item.source_name == "FB Recommended"), 2)


def _listing(source_name: str, index: int, score: int) -> Listing:
    return Listing(
        source_name=source_name,
        title=f"{source_name} item {index}",
        price_text="$10",
        price_value=10,
        location="Local",
        link=f"https://example.com/{source_name}/{index}",
        raw_text=f"{source_name} item {index}",
        deal_score=score,
        deal_reason="test",
    )


if __name__ == "__main__":
    unittest.main()

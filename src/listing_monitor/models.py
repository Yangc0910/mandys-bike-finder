from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Listing:
    source_name: str
    title: str
    price_text: str | None
    price_value: int | None
    location: str | None
    link: str
    raw_text: str
    deal_score: int = 0
    deal_reason: str = "Not scored"
    first_seen_at: datetime | None = None

    @property
    def searchable_text(self) -> str:
        parts = [self.title, self.price_text or "", self.location or "", self.raw_text]
        return " ".join(part for part in parts if part).lower()

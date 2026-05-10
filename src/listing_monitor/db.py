from __future__ import annotations

import sqlite3
from datetime import UTC, datetime
from pathlib import Path

from .models import Listing


class ListingStore:
    def __init__(self, sqlite_path: Path) -> None:
        self.sqlite_path = sqlite_path
        self.sqlite_path.parent.mkdir(parents=True, exist_ok=True)

    def init(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS seen_listings (
                    link TEXT PRIMARY KEY,
                    source_name TEXT NOT NULL,
                    title TEXT NOT NULL,
                    price_text TEXT,
                    price_value INTEGER,
                    location TEXT,
                    deal_score INTEGER NOT NULL DEFAULT 0,
                    deal_reason TEXT NOT NULL DEFAULT 'Not scored',
                    first_seen_at TEXT NOT NULL,
                    raw_text TEXT NOT NULL
                )
                """
            )
            self._migrate(conn)
            conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_seen_listings_first_seen_at
                ON seen_listings(first_seen_at)
                """
            )

    def has_seen(self, link: str) -> bool:
        with self._connect() as conn:
            row = conn.execute("SELECT 1 FROM seen_listings WHERE link = ?", (link,)).fetchone()
        return row is not None

    def add(self, listing: Listing) -> None:
        now = datetime.now(UTC).isoformat(timespec="seconds")
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR IGNORE INTO seen_listings (
                    link, source_name, title, price_text, price_value, location,
                    deal_score, deal_reason, first_seen_at, raw_text
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    listing.link,
                    listing.source_name,
                    listing.title,
                    listing.price_text,
                    listing.price_value,
                    listing.location,
                    listing.deal_score,
                    listing.deal_reason,
                    now,
                    listing.raw_text,
                ),
            )

    def add_many(self, listings: list[Listing]) -> None:
        for listing in listings:
            self.add(listing)

    def recent(self, limit: int = 20) -> list[Listing]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT
                    source_name, title, price_text, price_value, location, link, raw_text,
                    deal_score, deal_reason, first_seen_at
                FROM seen_listings
                ORDER BY first_seen_at DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        return [
            Listing(
                source_name=row["source_name"],
                title=row["title"],
                price_text=row["price_text"],
                price_value=row["price_value"],
                location=row["location"],
                link=row["link"],
                raw_text=row["raw_text"],
                deal_score=row["deal_score"],
                deal_reason=row["deal_reason"],
                first_seen_at=datetime.fromisoformat(row["first_seen_at"]),
            )
            for row in rows
        ]

    def _migrate(self, conn: sqlite3.Connection) -> None:
        columns = {
            row["name"]
            for row in conn.execute("PRAGMA table_info(seen_listings)").fetchall()
        }
        if "deal_score" not in columns:
            conn.execute(
                "ALTER TABLE seen_listings ADD COLUMN deal_score INTEGER NOT NULL DEFAULT 0"
            )
        if "deal_reason" not in columns:
            conn.execute(
                "ALTER TABLE seen_listings ADD COLUMN deal_reason TEXT NOT NULL DEFAULT 'Not scored'"
            )

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.sqlite_path)
        conn.row_factory = sqlite3.Row
        return conn

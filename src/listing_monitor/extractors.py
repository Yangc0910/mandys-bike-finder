from __future__ import annotations

from urllib.parse import urljoin

from playwright.async_api import Locator, Page

from .config import SourceConfig
from .filters import parse_price
from .models import Listing


async def extract_visible_listings(page: Page, source: SourceConfig) -> list[Listing]:
    if source.listing_selector:
        return await _extract_with_selectors(page, source)
    return await _extract_with_visible_link_heuristic(page, source)


async def _extract_with_selectors(page: Page, source: SourceConfig) -> list[Listing]:
    cards = page.locator(source.listing_selector)
    count = await cards.count()
    listings: list[Listing] = []

    for index in range(count):
        card = cards.nth(index)
        if not await _is_visible(card):
            continue

        raw_text = _clean(await card.inner_text(timeout=3000))
        if not raw_text:
            continue

        title = await _field_text(card, source.fields.get("title")) or raw_text.splitlines()[0]
        price_text = await _field_text(card, source.fields.get("price"))
        location = await _field_text(card, source.fields.get("location"))
        link = await _field_link(card, source.fields.get("link"), page.url)

        if not link:
            continue

        listings.append(
            Listing(
                source_name=source.name,
                title=_clean(title),
                price_text=_clean(price_text) if price_text else None,
                price_value=parse_price(price_text or raw_text),
                location=_clean(location) if location else None,
                link=link,
                raw_text=raw_text,
            )
        )

    return _dedupe_by_link(listings)


async def _extract_with_visible_link_heuristic(page: Page, source: SourceConfig) -> list[Listing]:
    items = await page.evaluate(
        """
        () => {
          const isVisible = (el) => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return style &&
              style.visibility !== 'hidden' &&
              style.display !== 'none' &&
              Number(style.opacity || 1) > 0 &&
              rect.width > 0 &&
              rect.height > 0;
          };

          const meaningfulContainer = (anchor) => {
            let current = anchor;
            for (let i = 0; i < 4 && current && current.parentElement; i++) {
              current = current.parentElement;
              const text = (current.innerText || '').trim();
              if (text.length >= 30 && text.length <= 1200) return current;
            }
            return anchor;
          };

          return Array.from(document.querySelectorAll('a[href]'))
            .filter(isVisible)
            .map((anchor) => {
              const container = meaningfulContainer(anchor);
              return {
                href: anchor.href,
                title: (anchor.innerText || anchor.getAttribute('aria-label') || '').trim(),
                text: (container.innerText || '').trim()
              };
            })
            .filter((item) => item.href && item.title && item.text);
        }
        """
    )

    listings = []
    for item in items:
        raw_text = _clean(item["text"])
        title = _clean(item["title"]) or raw_text.splitlines()[0]
        listings.append(
            Listing(
                source_name=source.name,
                title=title,
                price_text=None,
                price_value=parse_price(raw_text),
                location=None,
                link=item["href"],
                raw_text=raw_text,
            )
        )

    return _dedupe_by_link(listings)


async def _field_text(card: Locator, selector: str | None) -> str | None:
    if not selector:
        return None
    field = card.locator(selector).first
    if not await _is_visible(field):
        return None
    return await field.inner_text(timeout=3000)


async def _field_link(card: Locator, selector: str | None, base_url: str) -> str | None:
    target = card.locator(selector).first if selector else card.locator("a[href]").first
    if not await _is_visible(target):
        return None
    href = await target.get_attribute("href", timeout=3000)
    if not href:
        return None
    return urljoin(base_url, href)


async def _is_visible(locator: Locator) -> bool:
    try:
        return await locator.is_visible(timeout=1000)
    except Exception:
        return False


def _clean(value: str | None) -> str:
    return " ".join((value or "").split())


def _dedupe_by_link(listings: list[Listing]) -> list[Listing]:
    seen: set[str] = set()
    unique: list[Listing] = []
    for listing in listings:
        if listing.link in seen:
            continue
        seen.add(listing.link)
        unique.append(listing)
    return unique

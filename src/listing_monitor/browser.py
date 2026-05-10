from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from playwright.async_api import BrowserContext, async_playwright

from .config import BrowserConfig


@asynccontextmanager
async def persistent_context(config: BrowserConfig) -> AsyncIterator[BrowserContext]:
    config.user_data_dir.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(config.user_data_dir),
            headless=False,
            slow_mo=config.slow_mo_ms,
            viewport={"width": config.viewport_width, "height": config.viewport_height},
        )
        try:
            yield context
        finally:
            await context.close()

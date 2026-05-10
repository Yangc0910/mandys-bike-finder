import { NextResponse } from "next/server";

import { getCached, setCached } from "@/lib/server/cache";
import { loadServerConfig } from "@/lib/server/config";
import { checkUsageLimits } from "@/lib/server/limits";
import { clientKey, safeError } from "@/lib/server/utils";
import {
  detectMarketplace,
  directFetchAllowedHost,
  isHttpUrl,
  safeParseUrl,
  type MarketplaceDetection,
} from "@/lib/marketplace";

export const dynamic = "force-dynamic";

const URL_TTL_HOURS = 2;
const FETCH_TIMEOUT_MS = 8000;

export async function POST(request: Request) {
  const config = loadServerConfig();
  const { url = "" } = await request.json();
  const detected = detectMarketplace(String(url || ""));
  const parsed = safeParseUrl(detected.normalizedUrl);

  if (!detected.isValidUrl || !parsed || !isHttpUrl(parsed)) {
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: "Please enter a valid listing URL.",
    });
  }

  if (detected.extractionMode === "fallback_only") {
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: detected.userGuidance,
      marketplace: detected,
    });
  }

  if (!directFetchAllowedHost(detected.id)) {
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: "This link is saved as reference. Please paste listing text or upload a screenshot.",
      marketplace: detected,
    });
  }

  if (!isPublicSafeTarget(parsed)) {
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: "This URL is not allowed for direct extraction.",
      marketplace: detected,
    });
  }

  const limit = checkUsageLimits("link_extract", clientKey(request), config.limits.searchDaily, config.limits.sessionSearch);
  if (!limit.allowed) {
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: "We could not read this listing automatically. Please paste the listing text or upload a screenshot.",
      marketplace: detected,
    });
  }

  const cacheKey = `link_extract:${detected.id}:${detected.normalizedUrl.toLowerCase()}`;
  const cached = getCached<Record<string, unknown>>(cacheKey, URL_TTL_HOURS);
  if (cached) return NextResponse.json({ ok: true, fallback: false, cached: true, result: cached, marketplace: detected });

  try {
    const html = await fetchPublicPage(detected.normalizedUrl);
    const result = detected.id === "craigslist"
      ? extractCraigslistFields(html, detected.normalizedUrl)
      : extractGenericMarketplaceFields(html, detected);
    setCached(cacheKey, result);
    return NextResponse.json({ ok: true, fallback: false, cached: false, result, marketplace: detected });
  } catch (error) {
    console.warn("marketplace.extract", safeError(error));
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: fallbackMessageFor(detected),
      marketplace: detected,
    });
  }
}

function fallbackMessageFor(detected: MarketplaceDetection) {
  if (detected.id === "craigslist") {
    return "We could not read this Craigslist listing automatically. Please paste the listing text or upload a screenshot.";
  }
  return `We could not read this ${detected.label} listing automatically. Please paste listing text or upload a screenshot.`;
}

async function fetchPublicPage(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; MandyBikeFinderBot/1.0)",
      },
    });
    if (!response.ok) throw new Error(`Link fetch failed: ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractGenericMarketplaceFields(html: string, detected: MarketplaceDetection) {
  const title = decodeHtml(stripTags(findMeta(html, "og:title") || findTagText(html, "h1")));
  const description = decodeHtml(
    stripTags(findMeta(html, "og:description") || findMeta(html, "description") || findTagText(html, "meta", "name", "description")),
  );
  const priceFromMeta = decodeHtml(stripTags(findMeta(html, "product:price:amount") || findMeta(html, "og:price:amount")));
  const textForPrice = `${title}\n${description}\n${stripTags(html).slice(0, 12000)}`;
  const askingPrice = (
    priceFromMeta.match(/\d+(?:\.\d{1,2})?/)?.[0] ||
    textForPrice.match(/\$\s*(\d+(?:\.\d{1,2})?)/)?.[1] ||
    ""
  ).trim();
  const lowered = `${title}\n${description}`.toLowerCase();

  const brand = inferBrand(lowered);
  const wheelSize = inferWheelSize(lowered);
  const bikeType = inferBikeType(lowered);
  const colorStyle = inferColor(lowered);
  const condition = inferCondition(lowered);
  const model = inferModel(title, brand);
  const location = decodeHtml(stripTags(findMeta(html, "geo.placename")));

  const missingFields = [
    !title ? "title" : "",
    !askingPrice ? "askingPrice" : "",
    !brand ? "brand" : "",
    !wheelSize ? "wheelSize" : "",
    !description ? "description" : "",
  ].filter(Boolean);
  const confidence = missingFields.length <= 1 ? "high" : missingFields.length <= 3 ? "medium" : "low";

  return {
    provider: `${detected.id}-best-effort-parser`,
    confidence,
    missingFields,
    fields: {
      title,
      askingPrice,
      brand,
      model,
      wheelSize,
      bikeType,
      colorStyle,
      condition,
      description,
      platform: detected.label,
      listingLink: detected.normalizedUrl,
      location,
    },
  };
}

function extractCraigslistFields(html: string, listingLink: string) {
  const title = decodeHtml(stripTags(findMeta(html, "og:title") || findTagText(html, "span", "id", "titletextonly")));
  const priceRaw = decodeHtml(stripTags(findTagText(html, "span", "class", "price")));
  const description = decodeHtml(stripTags(findTagText(html, "section", "id", "postingbody")).replace(/^QR Code Link to This Post/i, "").trim());
  const location = decodeHtml(stripTags(findMeta(html, "geo.placename") || findTagText(html, "small", "", "")));
  const textForInference = `${title}\n${description}`.toLowerCase();
  const askingPrice = (priceRaw.match(/\d{2,5}/)?.[0] || "").trim();
  const brand = inferBrand(textForInference);
  const wheelSize = inferWheelSize(textForInference);
  const bikeType = inferBikeType(textForInference);
  const colorStyle = inferColor(textForInference);
  const condition = inferCondition(textForInference);
  const model = inferModel(title, brand);

  const missingFields = [
    !title ? "title" : "",
    !askingPrice ? "askingPrice" : "",
    !brand ? "brand" : "",
    !wheelSize ? "wheelSize" : "",
    !condition ? "condition" : "",
    !description ? "description" : "",
  ].filter(Boolean);
  const confidence = missingFields.length <= 1 ? "high" : missingFields.length <= 3 ? "medium" : "low";

  return {
    provider: "craigslist-parser",
    confidence,
    missingFields,
    fields: {
      title,
      askingPrice,
      brand,
      model,
      wheelSize,
      bikeType,
      colorStyle,
      condition,
      description,
      platform: "Craigslist",
      listingLink,
      location,
    },
  };
}

function findMeta(html: string, key: string) {
  const escaped = escapeRegExp(key);
  const byContent = html.match(
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
  );
  return byContent?.[1] || "";
}

function findTagText(html: string, tag: string, attrName = "", attrValue = "") {
  const attr = attrName && attrValue ? `[^>]*${attrName}=["']${escapeRegExp(attrValue)}["'][^>]*` : "[^>]*";
  const match = html.match(new RegExp(`<${tag}${attr}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1] || "";
}

function isPublicSafeTarget(url: URL) {
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) return false;
  if (host === "127.0.0.1" || host === "::1") return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const [a, b] = host.split(".").map(Number);
    if (a === 10 || a === 127) return false;
    if (a === 192 && b === 168) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 169 && b === 254) return false;
  }
  return true;
}

function inferBrand(text: string) {
  const brands = ["trek", "specialized", "giant", "cannondale", "guardian", "woom", "schwinn", "mongoose", "raleigh", "diamondback", "huffy", "kent", "hyper", "fuji"];
  const found = brands.find((brand) => text.includes(brand));
  return found ? capitalize(found) : "";
}

function inferWheelSize(text: string) {
  return text.match(/\b(12|14|16|18|20|24|26|27\.5)\s?(?:inch|in|")\b/i)?.[1] || "";
}

function inferBikeType(text: string) {
  if (text.includes("mountain") || text.includes("mtb") || text.includes("trail")) return "kids mountain bike";
  if (text.includes("hybrid")) return "youth hybrid bike";
  if (text.includes("cruiser") || text.includes("comfort")) return "cruiser / comfort bike";
  if (text.includes("balance")) return "balance bike";
  if (text.includes("training wheel")) return "training-wheel bike";
  if (text.includes("bmx")) return "bmx bike";
  if (text.includes("road")) return "road bike";
  if (text.includes("gravel")) return "gravel bike";
  if (text.includes("bike")) return "kids pedal bike";
  return "";
}

function inferColor(text: string) {
  const colors = ["pink", "purple", "blue", "green", "red", "orange", "black", "white", "gray", "grey", "silver"];
  const found = colors.filter((color) => text.includes(color));
  return found.slice(0, 2).join(" / ");
}

function inferCondition(text: string) {
  if (text.includes("like new") || text.includes("excellent")) return "like new";
  if (text.includes("good condition") || text.includes("good")) return "good";
  if (text.includes("fair")) return "fair";
  if (text.includes("needs repair") || text.includes("broken") || text.includes("rust")) return "needs repair";
  if (text.includes("used")) return "used";
  return "";
}

function inferModel(title: string, brand: string) {
  if (!title || !brand) return "";
  const cleaned = title.replace(new RegExp(brand, "i"), "").replace(/[-,:]/g, " ").trim();
  const model = cleaned.split(/\s+/).slice(0, 4).join(" ");
  return model.length >= 2 ? model : "";
}

function stripTags(value: string) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
}

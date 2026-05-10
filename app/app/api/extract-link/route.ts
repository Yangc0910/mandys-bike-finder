import { NextResponse } from "next/server";

import { getCached, setCached } from "@/lib/server/cache";
import { loadServerConfig } from "@/lib/server/config";
import { checkUsageLimits } from "@/lib/server/limits";
import { clientKey, safeError } from "@/lib/server/utils";

export const dynamic = "force-dynamic";

const URL_TTL_HOURS = 2;
const FETCH_TIMEOUT_MS = 8000;

export async function POST(request: Request) {
  const config = loadServerConfig();
  const { url = "" } = await request.json();
  const normalizedUrl = String(url || "").trim();

  if (!isCraigslistUrl(normalizedUrl)) {
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: "Only Craigslist link extraction is supported right now.",
    });
  }

  const limit = checkUsageLimits("link_extract", clientKey(request), config.limits.searchDaily, config.limits.sessionSearch);
  if (!limit.allowed) {
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: "We could not read this Craigslist listing automatically. Please paste the listing text or upload a screenshot.",
    });
  }

  const cacheKey = `craigslist:${normalizedUrl.toLowerCase()}`;
  const cached = getCached<Record<string, unknown>>(cacheKey, URL_TTL_HOURS);
  if (cached) return NextResponse.json({ ok: true, fallback: false, cached: true, result: cached });

  try {
    const html = await fetchCraigslistPage(normalizedUrl);
    const result = extractCraigslistFields(html, normalizedUrl);
    setCached(cacheKey, result);
    return NextResponse.json({ ok: true, fallback: false, cached: false, result });
  } catch (error) {
    console.warn("craigslist.extract", safeError(error));
    return NextResponse.json({
      ok: true,
      fallback: true,
      statusMessage: "We could not read this Craigslist listing automatically. Please paste the listing text or upload a screenshot.",
    });
  }
}

async function fetchCraigslistPage(url: string) {
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
    if (!response.ok) throw new Error(`Craigslist fetch failed: ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractCraigslistFields(html: string, listingLink: string) {
  const title = decodeHtml(stripTags(findMeta(html, "og:title") || findTagText(html, "span", "id", "titletextonly")));
  const priceRaw = decodeHtml(stripTags(findTagText(html, "span", "class", "price")));
  const description = decodeHtml(stripTags(findTagText(html, "section", "id", "postingbody")).replace(/^QR Code Link to This Post/i, "").trim());
  const location = decodeHtml(stripTags(findMeta(html, "geo.placename") || findTagText(html, "small", "", "")));
  const imageUrl = decodeHtml(findMeta(html, "og:image"));
  const textForInference = `${title}\n${description}`.toLowerCase();

  const brand = inferBrand(textForInference);
  const wheelSize = inferWheelSize(textForInference);
  const bikeType = inferBikeType(textForInference);
  const colorStyle = inferColor(textForInference);
  const condition = inferCondition(textForInference);
  const model = inferModel(title, brand);
  const askingPrice = (priceRaw.match(/\d{2,5}/)?.[0] || "").trim();

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
      imageUrl,
    },
  };
}

function isCraigslistUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase().includes("craigslist.org");
  } catch {
    return false;
  }
}

function findMeta(html: string, key: string) {
  const escaped = escapeRegExp(key);
  const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"));
  return match?.[1] || "";
}

function findTagText(html: string, tag: string, attrName: string, attrValue: string) {
  const attr = attrName && attrValue ? `[^>]*${attrName}=["']${escapeRegExp(attrValue)}["'][^>]*` : "[^>]*";
  const match = html.match(new RegExp(`<${tag}${attr}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1] || "";
}

function inferBrand(text: string) {
  const brands = ["trek", "specialized", "giant", "cannondale", "guardian", "woom", "schwinn", "mongoose", "raleigh", "diamondback", "huffy", "kent", "hyper"];
  const found = brands.find((brand) => text.includes(brand));
  return found ? capitalize(found) : "";
}

function inferWheelSize(text: string) {
  return text.match(/\b(12|14|16|18|20|24|26|27\.5)\s?(?:inch|in|")\b/i)?.[1] || "";
}

function inferBikeType(text: string) {
  if (text.includes("mountain")) return "kids mountain bike";
  if (text.includes("hybrid")) return "youth hybrid bike";
  if (text.includes("cruiser") || text.includes("comfort")) return "cruiser / comfort bike";
  if (text.includes("balance")) return "balance bike";
  if (text.includes("training wheel")) return "training-wheel bike";
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
  return "";
}

function inferModel(title: string, brand: string) {
  if (!title || !brand) return "";
  const cleaned = title.replace(new RegExp(brand, "i"), "").replace(/[-,:]/g, " ").trim();
  const model = cleaned.split(/\s+/).slice(0, 3).join(" ");
  return model.length >= 2 ? model : "";
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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

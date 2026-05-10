export type MarketplaceId =
  | "craigslist"
  | "facebook_marketplace"
  | "ebay"
  | "offerup"
  | "pinkbike"
  | "bicycle_blue_book"
  | "buycycle"
  | "the_pros_closet"
  | "bikeexchange"
  | "unknown";

export type ExtractionMode = "direct_supported" | "best_effort" | "fallback_only" | "unknown";
export type PreferredInput = "link" | "screenshot_or_pasted_text" | "pasted_text" | "manual_or_pasted_text";

export type MarketplaceDetection = {
  id: MarketplaceId;
  label: string;
  extractionMode: ExtractionMode;
  supportsDirectExtraction: boolean;
  preferredInput: PreferredInput;
  userGuidance: string;
  normalizedUrl: string;
  isValidUrl: boolean;
};

type MarketplaceRule = {
  id: MarketplaceId;
  label: string;
  extractionMode: ExtractionMode;
  supportsDirectExtraction: boolean;
  preferredInput: PreferredInput;
  userGuidance: string;
  matches: (url: URL) => boolean;
};

const RULES: MarketplaceRule[] = [
  {
    id: "craigslist",
    label: "Craigslist",
    extractionMode: "direct_supported",
    supportsDirectExtraction: true,
    preferredInput: "link",
    userGuidance:
      "Craigslist listings are often readable directly. If extraction misses details, paste listing text or upload a screenshot.",
    matches: (url) => url.hostname.toLowerCase().includes("craigslist.org"),
  },
  {
    id: "facebook_marketplace",
    label: "Facebook Marketplace",
    extractionMode: "fallback_only",
    supportsDirectExtraction: false,
    preferredInput: "screenshot_or_pasted_text",
    userGuidance:
      "Facebook Marketplace pages are usually not readable directly. Paste listing text or upload a screenshot for best results.",
    matches: (url) =>
      url.hostname.toLowerCase().endsWith("facebook.com") &&
      url.pathname.toLowerCase().includes("/marketplace"),
  },
  {
    id: "ebay",
    label: "eBay",
    extractionMode: "best_effort",
    supportsDirectExtraction: true,
    preferredInput: "link",
    userGuidance:
      "eBay listings may be readable, but page structure can vary. If link analysis misses details, paste the listing text or upload a screenshot.",
    matches: (url) => /^([a-z0-9-]+\.)?ebay\./i.test(url.hostname),
  },
  {
    id: "offerup",
    label: "OfferUp",
    extractionMode: "fallback_only",
    supportsDirectExtraction: false,
    preferredInput: "screenshot_or_pasted_text",
    userGuidance:
      "OfferUp listings may not be readable directly. Paste listing text or upload a screenshot for best results.",
    matches: (url) => url.hostname.toLowerCase().includes("offerup.com"),
  },
  {
    id: "pinkbike",
    label: "Pinkbike BuySell",
    extractionMode: "best_effort",
    supportsDirectExtraction: true,
    preferredInput: "link",
    userGuidance:
      "Pinkbike BuySell listings are often bike-specific and may work well with link or pasted text analysis.",
    matches: (url) =>
      url.hostname.toLowerCase().includes("pinkbike.com") &&
      (url.pathname.toLowerCase().includes("/buysell") || url.pathname.toLowerCase().includes("/buy-sell")),
  },
  {
    id: "bicycle_blue_book",
    label: "Bicycle Blue Book",
    extractionMode: "best_effort",
    supportsDirectExtraction: true,
    preferredInput: "link",
    userGuidance:
      "Bicycle Blue Book listings and value pages can help estimate bike details and value. If link analysis misses details, paste listing text.",
    matches: (url) => url.hostname.toLowerCase().includes("bicyclebluebook.com"),
  },
  {
    id: "buycycle",
    label: "Buycycle",
    extractionMode: "best_effort",
    supportsDirectExtraction: true,
    preferredInput: "link",
    userGuidance:
      "Buycycle listings may include structured bike details. Try link analysis, or paste listing text if needed.",
    matches: (url) => url.hostname.toLowerCase().includes("buycycle.com"),
  },
  {
    id: "the_pros_closet",
    label: "The Pro's Closet",
    extractionMode: "best_effort",
    supportsDirectExtraction: true,
    preferredInput: "link",
    userGuidance:
      "The Pro's Closet listings may include detailed specs and condition notes. Try link analysis, or paste listing text if needed.",
    matches: (url) => url.hostname.toLowerCase().includes("theproscloset.com"),
  },
  {
    id: "bikeexchange",
    label: "BikeExchange",
    extractionMode: "best_effort",
    supportsDirectExtraction: true,
    preferredInput: "link",
    userGuidance:
      "BikeExchange listings may vary by seller and region. Try link analysis, or paste listing text if needed.",
    matches: (url) => url.hostname.toLowerCase().includes("bikeexchange.com"),
  },
];

const UNKNOWN: Omit<MarketplaceDetection, "normalizedUrl" | "isValidUrl"> = {
  id: "unknown",
  label: "Unknown",
  extractionMode: "fallback_only",
  supportsDirectExtraction: false,
  preferredInput: "manual_or_pasted_text",
  userGuidance: "Marketplace not recognized. Paste listing text, upload a screenshot, or enter details manually.",
};

export function detectMarketplace(input: string): MarketplaceDetection {
  const normalizedUrl = normalizeUrl(input);
  if (!normalizedUrl) {
    return { ...UNKNOWN, normalizedUrl: "", isValidUrl: false };
  }

  const parsed = safeParseUrl(normalizedUrl);
  if (!parsed || !isHttpUrl(parsed)) {
    return { ...UNKNOWN, normalizedUrl, isValidUrl: false };
  }

  const rule = RULES.find((candidate) => candidate.matches(parsed));
  if (!rule) {
    return { ...UNKNOWN, normalizedUrl: parsed.toString(), isValidUrl: true };
  }

  return {
    id: rule.id,
    label: rule.label,
    extractionMode: rule.extractionMode,
    supportsDirectExtraction: rule.supportsDirectExtraction,
    preferredInput: rule.preferredInput,
    userGuidance: rule.userGuidance,
    normalizedUrl: parsed.toString(),
    isValidUrl: true,
  };
}

export function normalizeUrl(input: string) {
  const trimmed = String(input || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function isHttpUrl(url: URL) {
  return url.protocol === "http:" || url.protocol === "https:";
}

export function safeParseUrl(input: string) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

export function directFetchAllowedHost(marketplaceId: MarketplaceId) {
  return (
    marketplaceId === "craigslist" ||
    marketplaceId === "ebay" ||
    marketplaceId === "pinkbike" ||
    marketplaceId === "bicycle_blue_book" ||
    marketplaceId === "buycycle" ||
    marketplaceId === "the_pros_closet" ||
    marketplaceId === "bikeexchange"
  );
}

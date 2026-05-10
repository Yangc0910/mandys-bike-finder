import { normalizeListingQuery } from "../utils.js";

const TRUSTED_DOMAINS = [
  "walmart.com",
  "target.com",
  "amazon.com",
  "dickssportinggoods.com",
  "rei.com",
  "costco.com",
  "samsclub.com",
  "woom.com",
  "trekbikes.com",
  "specialized.com",
  "giant-bicycles.com",
  "cannondale.com",
  "guardianbikes.com",
];

export class LocalSearchProvider {
  constructor(reason) {
    this.mode = "fallback";
    this.reason = reason;
  }

  async getPriceReference(listing) {
    return localPriceReference(listing, this.reason);
  }
}

export class HttpSearchProvider {
  constructor({ apiKey, apiUrl }) {
    this.mode = "live";
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async getPriceReference(listing) {
    const query = `${normalizeListingQuery(listing)} trusted retailer new price`;
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        query,
        trustedDomains: TRUSTED_DOMAINS,
        excludedDomains: ["facebook.com", "craigslist.org", "ebay.com"],
      }),
    });
    if (!response.ok) {
      throw new Error(`Search provider failed with ${response.status}`);
    }
    const data = await response.json();
    return normalizeSearchResponse(data, listing);
  }
}

export function createSearchProvider(config) {
  if (
    config.featureFlags.liveSearch &&
    config.providers.searchApiKey &&
    config.providers.searchApiUrl
  ) {
    return new HttpSearchProvider({
      apiKey: config.providers.searchApiKey,
      apiUrl: config.providers.searchApiUrl,
    });
  }
  return new LocalSearchProvider("Live search disabled or missing server-side search configuration.");
}

export function localPriceReference(listing, message = "Using built-in local estimate.") {
  const brand = (listing.brand || "").toLowerCase();
  const wheelSize = Number(listing.wheelSize || 24);
  let low = wheelSize >= 24 ? 180 : 120;
  let high = wheelSize >= 24 ? 320 : 220;

  if (["woom", "trek", "specialized", "giant", "cannondale", "guardian"].includes(brand)) {
    low += 120;
    high += 260;
  }

  if (["huffy", "dynacraft", "hyper", "kent"].includes(brand)) {
    low -= 30;
    high -= 60;
  }

  return {
    low: Math.max(90, low),
    high: Math.max(140, high),
    confidence: "low",
    provider: "local fallback",
    sources: [],
    message,
  };
}

function normalizeSearchResponse(data, listing) {
  if (Number.isFinite(data.low) && Number.isFinite(data.high)) {
    return {
      low: data.low,
      high: data.high,
      confidence: data.confidence || "medium",
      provider: "live search",
      sources: Array.isArray(data.sources) ? data.sources : [],
      message: "Live trusted-retailer search completed.",
    };
  }
  return {
    ...localPriceReference(listing, "Live search returned no usable range; using local estimate."),
    provider: "live search fallback",
  };
}

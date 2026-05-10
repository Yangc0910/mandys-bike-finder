import { ageBucket, heightBucket } from "../utils.js";

export class MockLoggingProvider {
  constructor(reason) {
    this.mode = "mock";
    this.reason = reason;
    this.events = [];
  }

  async logEvent(type, payload) {
    this.events.push({ type, payload, created_at: new Date().toISOString() });
    return { logged: false, provider: this.mode, fallbackReason: this.reason };
  }
}

export class HttpLoggingProvider {
  constructor({ databaseUrl }) {
    this.mode = "live";
    this.databaseUrl = databaseUrl;
  }

  async logEvent(type, payload) {
    const response = await fetch(this.databaseUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, payload, created_at: new Date().toISOString() }),
    });
    if (!response.ok) {
      throw new Error(`Logging provider failed with ${response.status}`);
    }
    return { logged: true, provider: "live logging" };
  }
}

export function createLoggingProvider(config) {
  if (config.featureFlags.backendLogging && config.providers.databaseUrl) {
    return new HttpLoggingProvider({ databaseUrl: config.providers.databaseUrl });
  }
  return new MockLoggingProvider("Backend logging disabled or missing server-side database configuration.");
}

export function reportMetadata({ child, listing, analysis, email }) {
  return {
    email,
    height_bucket: heightBucket(child.heightCm),
    age_bucket: ageBucket(child.age),
    bike_wheel_size: listing.wheelSize || "",
    brand: listing.brand || "",
    asking_price: listing.askingPrice || "",
    overall_meter: analysis.overall.meter,
    fit_meter: analysis.dimensions.fit.meter,
    price_meter: analysis.dimensions.price.meter,
    condition_meter: analysis.dimensions.condition.meter,
    brand_meter: analysis.dimensions.brand.meter,
    color_appeal_meter: analysis.dimensions.color.meter,
    risk_meter: analysis.dimensions.risk.meter,
    listing_platform: listing.platform || "",
    listing_link: listing.listingLink || "",
  };
}

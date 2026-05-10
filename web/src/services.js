export class MockExtractionService {
  extractFromText(text) {
    const priceMatch = text.match(/\$?\b(\d{2,4})\b/);
    const wheelMatch = text.match(/\b(12|14|16|18|20|24|26|27\.5)\s*(?:inch|in|")\b/i);
    const brandMatch = text.match(/\b(woom|trek|specialized|giant|cannondale|guardian|schwinn|mongoose|raleigh|diamondback|huffy|dynacraft|hyper|kent)\b/i);

    return {
      title: firstLine(text),
      askingPrice: priceMatch ? priceMatch[1] : "",
      brand: brandMatch ? capitalize(brandMatch[1]) : "",
      wheelSize: wheelMatch ? wheelMatch[1] : "",
      description: text,
    };
  }

  extractFromScreenshot() {
    return {
      title: "",
      askingPrice: "",
      brand: "",
      wheelSize: "",
      description: "Screenshot selected. Confirm listing fields manually for Phase 1.",
    };
  }
}

export class LocalPriceReferenceService {
  getReference(listing) {
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
      message: "Live retailer search is not enabled in Phase 1.",
    };
  }
}

export class LocalCostControlService {
  constructor({ searchLimit = 5, llmLimit = 8 } = {}) {
    this.searchLimit = searchLimit;
    this.llmLimit = llmLimit;
    this.searchCount = 0;
    this.llmCount = 0;
  }

  useSearchLookup() {
    if (this.searchCount >= this.searchLimit) {
      return { allowed: false, message: "Session lookup limit reached. Local fallback remains available." };
    }
    this.searchCount += 1;
    return { allowed: true, message: this.statusText() };
  }

  useMessageGeneration() {
    if (this.llmCount >= this.llmLimit) {
      return { allowed: false, message: "Session message limit reached. Edit the current draft manually." };
    }
    this.llmCount += 1;
    return { allowed: true, message: this.statusText() };
  }

  statusText() {
    return `Local mode: ${this.searchCount}/${this.searchLimit} lookups, ${this.llmCount}/${this.llmLimit} messages`;
  }
}

export class MockEmailReportService {
  buildReport({ child, listing, analysis, message, recipientName, note }) {
    const recipient = recipientName ? `${recipientName},` : "Hi,";
    return `${recipient}

Listing: ${listing.title || "Untitled listing"}
Link: ${listing.listingLink || "Not provided"}
Asking price: ${listing.askingPrice ? `$${listing.askingPrice}` : "Unknown"}

Overall: ${analysis.overall.label}
${analysis.overall.reasoning}

Fit: ${analysis.dimensions.fit.label}
${analysis.dimensions.fit.reasoning}

Price: ${analysis.dimensions.price.label}
${analysis.dimensions.price.reasoning}

Condition: ${analysis.dimensions.condition.label}
${analysis.dimensions.condition.reasoning}

Brand: ${analysis.dimensions.brand.label}
${analysis.dimensions.brand.reasoning}

Color / kid appeal: ${analysis.dimensions.color.label}
${analysis.dimensions.color.reasoning}

Risk: ${analysis.dimensions.risk.label}
${analysis.dimensions.risk.reasoning}

Seller questions:
${analysis.sellerQuestions.map((question) => `- ${question}`).join("\n")}

Suggested message:
${message || "Generate a seller message before sending."}

Note:
${note || "None"}

${analysis.disclaimer}

Phase 1 preview only. No email was sent.`;
  }
}

export class MockMetadataLogger {
  constructor() {
    this.events = [];
  }

  logReportPreview(child, listing, analysis, email) {
    this.events.push({
      email,
      created_at: new Date().toISOString(),
      height_bucket: bucketHeight(child.heightCm),
      age_bucket: bucketAge(child.age),
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
    });
  }
}

function firstLine(text) {
  return text.split(/\r?\n/).find((line) => line.trim())?.trim() || "";
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
}

function bucketHeight(heightCm) {
  const height = Number(heightCm);
  if (!height) return "unknown";
  if (height < 115) return "under-115";
  if (height < 130) return "115-129";
  if (height < 145) return "130-144";
  if (height < 155) return "145-154";
  return "155-plus";
}

function bucketAge(age) {
  const value = Number(age);
  if (!value) return "unknown";
  if (value < 5) return "under-5";
  if (value <= 7) return "5-7";
  if (value <= 10) return "8-10";
  return "11-plus";
}

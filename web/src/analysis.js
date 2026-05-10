const BRAND_TIERS = {
  entry: ["huffy", "dynacraft", "hyper", "kent"],
  mid: ["schwinn", "mongoose", "raleigh", "diamondback"],
  high: ["woom", "trek", "specialized", "giant", "cannondale", "guardian"],
};

const REPAIR_SIGNALS = [
  "needs repair",
  "not working",
  "broken",
  "rust",
  "flat tire",
  "brake issue",
  "parts only",
  "missing",
];

export function analyzeBike(child, listing, priceReference) {
  const fit = assessFit(child, listing);
  const price = assessPrice(listing, priceReference);
  const condition = assessCondition(listing);
  const brand = assessBrand(listing);
  const color = assessColorAppeal(child, listing);
  const risk = assessRisk(listing, priceReference);
  const dimensions = { fit, price, condition, brand, color, risk };
  const overall = assessOverall(dimensions);
  const sellerQuestions = buildSellerQuestions(dimensions, listing);

  return {
    overall,
    dimensions,
    sellerQuestions,
    disclaimer:
      "Mandy's Bike Finder provides general sizing and shopping guidance. Always confirm the bike's actual fit, brakes, tires, and safety condition before purchase.",
  };
}

export function recommendWheelSize(heightCm, experience) {
  const height = Number(heightCm);
  if (!height) {
    return {
      recommended: "Unknown",
      sizes: [],
      note: "Add child height to estimate bike size.",
    };
  }

  if (height >= 115 && height < 130) {
    return experience === "confident" || experience === "advanced"
      ? range("20/24 inch", ["20", "24"], "20 inch is easier now; 24 inch may work after a careful test ride.")
      : range("20 inch", ["20"], "20 inch is the safer starting point for this height range.");
  }

  if (height >= 130 && height < 145) {
    return range("24 inch", ["24"], "24 inch is likely the best fit for current control and comfort.");
  }

  if (height >= 145 && height < 155) {
    if (experience === "confident" || experience === "advanced") {
      return range("26 inch", ["26"], "At this edge, 26 inch can offer growth room if the child can test ride safely.");
    }
    if (experience === "comfortable") {
      return range("24/26 inch", ["24", "26"], "24 inch is easier now; 26 inch may offer growth room with a safe test ride.");
    }
    return range("24 inch", ["24"], "Around 145 cm, 24 inch is likely safer and easier for a beginner.");
  }

  if (height >= 155) {
    return experience === "confident" || experience === "advanced"
      ? range("26/27.5 inch", ["26", "27.5"], "26 inch is likely safe; 27.5 inch depends on frame and test ride.")
      : range("26 inch", ["26"], "26 inch is likely the best starting point.");
  }

  return range("Below MVP range", [], "This MVP focuses on older kids around 115 cm and taller.");
}

export function generateSellerMessage(goal, tone, listing, options) {
  const title = listing.title || "the bike";
  const targetOffer = options.targetOffer ? `$${options.targetOffer}` : "a lower price";
  const timing = options.pickupTiming || "soon";
  const reason = options.reason && options.reason !== "no reason" ? ` since I ${options.reason}` : "";
  const opener = tone === "very polite" ? "Hi, I hope you're doing well." : "Hi,";

  if (goal === "askAvailability") {
    return `${opener} Is ${title} still available? I'm interested for my daughter. Thanks!`;
  }

  if (goal === "askQuestions") {
    return `${opener} I'm interested in ${title}. Could you confirm the wheel size, whether the brakes work well, and if the tires hold air? Thanks!`;
  }

  if (goal === "confirmPickup") {
    return `${opener} If the bike is still available, I can pick it up ${timing}. What time works for you? Thanks!`;
  }

  if (goal === "walkAway") {
    return `${opener} Thanks for the details. I think we'll pass for now, but I appreciate your time.`;
  }

  return `${opener} I'm interested in the bike for my daughter. Would you consider ${targetOffer} if I can pick it up ${timing}${reason}? Thanks!`;
}

function assessFit(child, listing) {
  const recommendation = recommendWheelSize(child.heightCm, child.experience);
  const wheel = String(listing.wheelSize || "");

  if (!wheel) {
    return meter(
      "yellow",
      "Confirm wheel size",
      `Recommended size: ${recommendation.recommended}. Ask the seller to confirm the wheel size before deciding.`
    );
  }

  if (recommendation.sizes.includes(wheel)) {
    return meter("green", "Likely fits", `${wheel} inch matches the current recommendation. ${recommendation.note}`);
  }

  if (recommendation.recommended.includes(wheel) || isNearSize(wheel, recommendation.sizes)) {
    return meter("yellow", "May fit with test ride", `${wheel} inch is close to the recommendation. ${recommendation.note}`);
  }

  return meter("red", "Likely size mismatch", `${wheel} inch does not match the current recommendation of ${recommendation.recommended}.`);
}

function assessPrice(listing, reference) {
  const asking = Number(listing.askingPrice);
  if (!asking) {
    return meter("yellow", "Price unclear", "Add the asking price to compare against local reference ranges.");
  }

  const ratio = reference.high ? asking / reference.high : null;
  if (ratio !== null && ratio <= 0.45) {
    return meter("green", "Looks reasonable", `Estimated new range is $${reference.low}-$${reference.high}. At $${asking}, this may be reasonable if condition is good.`);
  }
  if (ratio !== null && ratio <= 0.7) {
    return meter("yellow", "Fair if condition checks out", `Estimated new range is $${reference.low}-$${reference.high}. Confirm condition before paying $${asking}.`);
  }
  return meter("red", "Price looks high", `At $${asking}, this appears close to the local estimated new range of $${reference.low}-$${reference.high}.`);
}

function assessCondition(listing) {
  const text = listingText(listing);
  if (REPAIR_SIGNALS.some((signal) => text.includes(signal))) {
    return meter("red", "Repair risk", "The listing suggests repair or safety risk. Confirm brakes, tires, chain, rust, and gears.");
  }
  if (text.includes("like new") || text.includes("excellent") || text.includes("brakes work")) {
    return meter("green", "Condition sounds promising", "The description includes positive condition signals. Still confirm brakes, tires, chain, and rust.");
  }
  return meter("yellow", "Condition needs confirmation", "Ask about brakes, tires, chain, rust, gears, and whether the bike is ready to ride.");
}

function assessBrand(listing) {
  const brand = (listing.brand || "").trim().toLowerCase();
  if (!brand) {
    return meter("yellow", "Brand unknown", "Brand is missing, so value and quality are harder to estimate.");
  }
  if (BRAND_TIERS.high.includes(brand)) {
    return meter("green", "Higher-quality brand", `${listing.brand} is generally a stronger kids bike brand if the condition is good.`);
  }
  if (BRAND_TIERS.mid.includes(brand)) {
    return meter("yellow", "Mid-level brand", `${listing.brand} can be a reasonable used choice at the right price and condition.`);
  }
  if (BRAND_TIERS.entry.includes(brand)) {
    return meter("yellow", "Entry-level brand", `${listing.brand} is often entry-level, so price and condition matter more.`);
  }
  return meter("yellow", "Brand needs context", `${listing.brand} is not in the local brand table yet.`);
}

function assessColorAppeal(child, listing) {
  const preference = child.colorPreference || "no strong preference";
  const stylePreference = child.stylePreference || "all good / no preference";
  const text = `${listing.colorStyle || ""} ${listing.title || ""} ${listing.description || ""}`.toLowerCase();

  if (preference === "no strong preference" && stylePreference === "all good / no preference") {
    return meter("green", "Neutral preference", "No strong style preference is set, so color is unlikely to block the decision.");
  }

  if (preference !== "no strong preference" && colorMatches(preference, text)) {
    return meter("green", "Likely appealing", `The listing appears to match the ${preference} preference.`);
  }

  if (stylePreference !== "all good / no preference" && text.includes(stylePreference.split("-")[0])) {
    return meter("green", "Style likely matches", `The listing language appears to match ${stylePreference}.`);
  }

  if (text.includes("princess") || text.includes("barbie") || text.includes("baby")) {
    return meter("yellow", "Check with child", "The style may be appealing to some kids but may feel too babyish for others.");
  }

  return meter("yellow", "Check with child", "Color/style is not a clear match. A quick child check may avoid a disappointing pickup.");
}

function assessRisk(listing, reference) {
  const missing = [];
  if (!listing.wheelSize) missing.push("wheel size");
  if (!listing.condition && !listing.description) missing.push("condition");
  if (!listing.brand) missing.push("brand");
  if (!listing.askingPrice) missing.push("price");

  const text = listingText(listing);
  if (REPAIR_SIGNALS.some((signal) => text.includes(signal))) {
    return meter("red", "High uncertainty", "Repair or safety signals appear in the listing.");
  }
  if (missing.length >= 2) {
    return meter("yellow", "Missing key details", `Confirm ${missing.join(", ")} before pickup.`);
  }
  if (reference.confidence === "low") {
    return meter("yellow", "Lower price confidence", "Price estimate uses local fallback ranges, not live retailer search.");
  }
  return meter("green", "Low obvious risk", "Key fields are present and no repair signals were detected.");
}

function assessOverall(dimensions) {
  const values = Object.values(dimensions).map((item) => item.meter);
  if (values.includes("red")) {
    return meter("red", "Probably skip", "One or more important dimensions has a clear concern.");
  }
  const yellowCount = values.filter((value) => value === "yellow").length;
  if (yellowCount >= 3) {
    return meter("yellow", "Ask more before deciding", "This could work, but several details should be confirmed first.");
  }
  return meter("green", "Worth contacting", "This appears to be a strong candidate based on the confirmed details.");
}

function buildSellerQuestions(dimensions, listing) {
  const questions = [];
  if (dimensions.fit.meter !== "green" || !listing.wheelSize) {
    questions.push("Can you confirm the wheel size and whether the bike fits a child around this height?");
  }
  if (dimensions.condition.meter !== "green") {
    questions.push("Do the brakes work well, do the tires hold air, and is the chain in good shape?");
  }
  if (!listing.description.toLowerCase().includes("rust")) {
    questions.push("Is there any rust, damage, or repair needed?");
  }
  questions.push("Would it be possible for my child to do a quick test ride at pickup?");
  return questions;
}

function meter(meterValue, label, reasoning) {
  return { meter: meterValue, label, reasoning };
}

function range(recommended, sizes, note) {
  return { recommended, sizes, note };
}

function listingText(listing) {
  return `${listing.title || ""} ${listing.condition || ""} ${listing.description || ""}`.toLowerCase();
}

function isNearSize(wheel, sizes) {
  const numericWheel = Number(wheel);
  return sizes.some((size) => Math.abs(Number(size) - numericWheel) <= 2);
}

function colorMatches(preference, text) {
  const groups = {
    "pink/purple": ["pink", "purple", "violet"],
    "blue/green": ["blue", "green", "teal"],
    "red/orange": ["red", "orange"],
    "black/white/neutral": ["black", "white", "gray", "grey", "silver", "neutral"],
    "bright colors": ["bright", "rainbow", "yellow", "pink", "orange"],
    "mature/simple style": ["simple", "mature", "black", "white", "gray", "grey", "blue"],
  };
  return (groups[preference] || []).some((color) => text.includes(color));
}

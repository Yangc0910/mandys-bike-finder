import type { AnalysisResult, ChildProfile, Listing } from "./types";

export type BikeCoachIntent =
  | "explain_flow"
  | "explain_required_info"
  | "explain_missing_inputs"
  | "explain_verdict"
  | "explain_fit_guidance"
  | "explain_price_range"
  | "explain_risks"
  | "suggest_seller_questions"
  | "draft_seller_message"
  | "next_step";

export type BikeCoachContext = {
  child?: Partial<ChildProfile>;
  listing?: Partial<Listing>;
  analysis?: AnalysisResult | null;
  sellerMessage?: string;
  missingInputs?: string[];
};

export const BIKE_COACH_INTENTS: BikeCoachIntent[] = [
  "explain_flow",
  "explain_required_info",
  "explain_missing_inputs",
  "explain_verdict",
  "explain_fit_guidance",
  "explain_price_range",
  "explain_risks",
  "suggest_seller_questions",
  "draft_seller_message",
  "next_step",
];

export function normalizeBikeCoachIntent(value: unknown): BikeCoachIntent {
  const raw = String(value || "").toLowerCase().trim();
  if (BIKE_COACH_INTENTS.includes(raw as BikeCoachIntent)) return raw as BikeCoachIntent;
  if (raw.includes("fit") || raw.includes("height") || raw.includes("size")) return "explain_fit_guidance";
  if (raw.includes("price") || raw.includes("offer") || raw.includes("fair")) return "explain_price_range";
  if (raw.includes("risk") || raw.includes("inspect") || raw.includes("brake") || raw.includes("rust")) return "explain_risks";
  if (raw.includes("seller") || raw.includes("ask") || raw.includes("question")) return "suggest_seller_questions";
  if (raw.includes("message") || raw.includes("write") || raw.includes("draft")) return "draft_seller_message";
  if (raw.includes("verdict") || raw.includes("result") || raw.includes("good") || raw.includes("skip")) return "explain_verdict";
  if (raw.includes("missing") || raw.includes("need")) return "explain_missing_inputs";
  if (raw.includes("how") || raw.includes("work")) return "explain_flow";
  return "next_step";
}

export function isBikeCoachOutOfScope(message: string) {
  const text = message.toLowerCase();
  if (!text.trim()) return false;
  const inScope = [
    "bike",
    "listing",
    "seller",
    "price",
    "offer",
    "fit",
    "height",
    "wheel",
    "brake",
    "tire",
    "rust",
    "condition",
    "marketplace",
    "facebook",
    "craigslist",
    "child",
    "kid",
  ].some((word) => text.includes(word));
  const clearlyOther = ["weather", "stock", "recipe", "homework", "movie", "restaurant", "vacation"].some((word) => text.includes(word));
  return clearlyOther && !inScope;
}

export function suggestedBikeCoachPrompts(hasAnalysis: boolean, missingInputs: string[] = []) {
  if (missingInputs.length) {
    return [
      { intent: "explain_missing_inputs" as const, label: "What info is missing?" },
      { intent: "explain_required_info" as const, label: "What info do I need?" },
      { intent: "explain_flow" as const, label: "How does this work?" },
    ];
  }
  if (hasAnalysis) {
    return [
      { intent: "explain_verdict" as const, label: "Explain this verdict" },
      { intent: "explain_fit_guidance" as const, label: "Why this fit guidance?" },
      { intent: "explain_price_range" as const, label: "Is this price fair?" },
      { intent: "suggest_seller_questions" as const, label: "What should I ask?" },
      { intent: "draft_seller_message" as const, label: "Help write a message" },
    ];
  }
  return [
    { intent: "explain_flow" as const, label: "How does this work?" },
    { intent: "explain_required_info" as const, label: "What info do I need?" },
    { intent: "explain_fit_guidance" as const, label: "Why child height?" },
    { intent: "next_step" as const, label: "What should I do next?" },
  ];
}

export function localBikeCoachResponse(intent: BikeCoachIntent, context: BikeCoachContext, message = "") {
  if (isBikeCoachOutOfScope(message)) {
    return "I'm focused on helping with this used kids' bike check. I can explain fit, price, risk, or seller questions for the current listing.";
  }

  const listing = context.listing || {};
  const child = context.child || {};
  const analysis = context.analysis || null;
  const missing = context.missingInputs || [];
  const title = listing.title || "this bike";
  const price = listing.askingPrice ? `$${listing.askingPrice}` : "the listed price";
  const wheel = listing.wheelSize ? `${listing.wheelSize} inch` : "the wheel size";
  const height = child.heightCm ? `${child.heightCm} cm` : "your child's height";

  const safetyReminder = "Always confirm fit, brakes, tires, rust, and condition in person before buying.";

  switch (intent) {
    case "explain_flow":
      return `Start by uploading a screenshot or pasting the listing text. Then add your child's height and riding confidence. After that, Mandy checks fit, value, condition, risk, and seller questions. ${safetyReminder}`;
    case "explain_required_info":
      return "The most helpful details are the listing screenshot or text, asking price, wheel size, bike condition, and your child's height. Age and riding confidence improve the fit guidance.";
    case "explain_missing_inputs":
      return missing.length
        ? `To improve this bike check, add: ${missing.join(", ")}. Wheel size and condition notes are especially useful when the seller includes them.`
        : "You have the basics. If possible, add wheel size, condition notes, brand, and asking price for a stronger recommendation.";
    case "explain_verdict":
      return analysis
        ? `${analysis.overall.label}: ${analysis.overall.reasoning} For ${title} at ${price}, use the fit, value, and condition notes together before contacting the seller. ${safetyReminder}`
        : "Once you run the bike check, I can explain whether the listing looks like a good deal, a maybe, or one to skip.";
    case "explain_fit_guidance":
      return analysis
        ? `The fit guidance compares ${height}, riding confidence, and ${wheel || "the listed size"}. Current fit signal: ${analysis.dimensions.fit.label}. ${analysis.dimensions.fit.reasoning}`
        : `Child height is the strongest clue for wheel size. Add ${height === "your child's height" ? "height" : "the listing details"} and run the check so I can explain the fit signal.`;
    case "explain_price_range":
      return analysis
        ? `The value signal is ${analysis.dimensions.price.label}. ${analysis.dimensions.price.reasoning} Treat this as rule-based guidance, not a full market-wide price comparison.`
        : "After you add the asking price and run the check, I can explain whether the price looks reasonable and what offer might make sense.";
    case "explain_risks":
      return analysis
        ? `Risk signal: ${analysis.dimensions.risk.label}. ${analysis.dimensions.risk.reasoning} Ask about brakes, tire condition, rust, shifting if geared, and whether the wheels wobble.`
        : `For any used kids' bike, check brakes, tires, rust, chain, wheel wobble, and whether your child can stand over and control it safely.`;
    case "suggest_seller_questions":
      return analysis?.sellerQuestions?.length
        ? `Ask the seller: ${analysis.sellerQuestions.join(" ")} Also confirm pickup logistics and final price.`
        : "Ask whether it is still available, the wheel size, seat height range, brake condition, tire condition, rust, and whether anything needs repair.";
    case "draft_seller_message":
      return context.sellerMessage || `Hi, is ${title} still available? I'm checking fit for my child and wanted to confirm the wheel size, brake condition, tire condition, and whether there is any rust or mechanical issue.`;
    case "next_step":
    default:
      if (missing.length) return `Next, add ${missing[0]}. That will make the bike check more useful.`;
      if (!analysis) return "Next, run Check this bike so Mandy can give you a verdict, fit guidance, price signal, risks, and seller questions.";
      return "Next, review the seller questions and message draft. If the bike still looks promising, contact the seller and inspect fit and safety in person.";
  }
}

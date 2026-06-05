import { generateSellerMessage, localPriceReference } from "../analysis";
import type { BikeCoachContext, BikeCoachIntent } from "../assistant";
import type { AnalysisResult, ChildProfile, Listing, PriceReference } from "../types";
import { ageBucket, heightBucket, normalizeListingQuery } from "./utils";

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

export function mockExtractListingFields(text: string) {
  const priceMatch = text.match(/\$?\b(\d{2,4})\b/);
  const wheelMatch = text.match(/\b(12|14|16|18|20|24|26|27\.5)\s*(?:inch|in|")\b/i);
  const brandMatch = text.match(/\b(woom|trek|specialized|giant|cannondale|guardian|schwinn|mongoose|raleigh|diamondback|huffy|dynacraft|hyper|kent)\b/i);
  return {
    provider: "mock",
    fallbackReason: "LLM analysis disabled or missing server-side API key.",
    fields: {
      title: text.split(/\r?\n/).find((line) => line.trim())?.trim() || "",
      askingPrice: priceMatch ? priceMatch[1] : "",
      brand: brandMatch ? capitalize(brandMatch[1]) : "",
      wheelSize: wheelMatch ? wheelMatch[1] : "",
      description: text,
    },
  };
}

export async function openAiExtractListingFields(text: string, apiKey: string, model: string) {
  const content = await openAiChatText(apiKey, model, [
    {
      role: "system",
      content:
        "Extract used kids bike listing fields. Return strict JSON with title, askingPrice, brand, model, wheelSize, bikeType, colorStyle, condition, description, platform, listingLink, location. askingPrice should be numeric when visible (for example 35 for $35, $35.00, 35 dollars, or Price: $35). Use empty strings when unknown.",
    },
    { role: "user", content: text },
  ]);
  const parsed = parseStructuredJson(content);
  return { provider: "openai", fields: normalizeExtractedListingFields(parsed, text) };
}

export async function openAiExtractListingFieldsFromImage(
  imageDataUrl: string,
  apiKey: string,
  model: string,
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract only visible marketplace listing details for a used kids bike screenshot. Return strict JSON with keys: title, askingPrice, brand, model, wheelSize, bikeType, colorStyle, condition, description, platform, listingLink, location, confidence, missingFields. Explicitly extract visible asking price and support common formats like $35, $35.00, 35 dollars, asking 90, and Price: $35; return askingPrice as a number-like string (for example 35). Extract visible pickup city, town, neighborhood, or location text into location. Do not invent missing values. Use empty strings for unknown string fields. confidence must be one of high, medium, low. missingFields must list unknown or unclear fields.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Read this marketplace screenshot and extract listing fields." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`LLM vision provider failed with ${response.status}`);
  const json = await response.json();
  const content = String(json.choices?.[0]?.message?.content || "").trim();
  const parsed = parseStructuredJson(content);
  const normalized = normalizeExtractedListingFields(parsed, [
    String(parsed.title || ""),
    String(parsed.description || ""),
    String(parsed.condition || ""),
  ].join("\n"));
  return {
    provider: "openai",
    fields: normalized,
    confidence: normalizeConfidence(parsed.confidence),
    missingFields: Array.isArray(parsed.missingFields)
      ? parsed.missingFields.map((value) => String(value))
      : [],
  };
}

export async function openAiGenerateMessage(
  apiKey: string,
  model: string,
  payload: { goal: string; tone: string; listing: Listing; options: { targetOffer?: string; pickupTiming?: string; reason?: string } },
) {
  return openAiChatText(apiKey, model, [
    { role: "system", content: "Write one short natural seller message for a used kids bike listing. No markdown. Be concise." },
    { role: "user", content: JSON.stringify(payload) },
  ]);
}

export async function openAiReportSummary(
  apiKey: string,
  model: string,
  payload: { child: ChildProfile; listing: Listing; analysis: AnalysisResult; message?: string },
) {
  return openAiChatText(apiKey, model, [
    { role: "system", content: "Summarize this used kids bike recommendation for an email report in 2-4 concise sentences. Include no numeric score." },
    { role: "user", content: JSON.stringify(payload) },
  ]);
}

export async function openAiBikeCoachResponse(
  apiKey: string,
  model: string,
  payload: { intent: BikeCoachIntent; message?: string; context: BikeCoachContext },
) {
  return openAiChatText(apiKey, model, [
    {
      role: "system",
      content:
        "You are Mandy Bike Coach, a guided assistant for evaluating used kids' bike listings. Help parents understand the current bike-check workflow, missing inputs, verdict, fit, price, risks, seller questions, and seller messages. Stay focused on used kids' bike evaluation. Use only the provided child profile, listing, and analysis context. Do not invent facts. When uncertain, say what information is missing. Always remind users that used bikes should be inspected in person for fit, brakes, tires, rust, and condition. Do not discuss CRM, Salesforce, Resend, API keys, cost controls, backend implementation, or unrelated general chat. Keep the answer concise and parent-friendly, ideally 2-5 short sentences.",
    },
    { role: "user", content: JSON.stringify(payload) },
  ]);
}

export async function trustedSearchReference(
  listing: Listing,
  apiKey: string,
  apiUrl: string,
): Promise<PriceReference> {
  void apiKey;
  void apiUrl;
  void TRUSTED_DOMAINS;
  throw new Error(`Live search provider is not implemented yet for ${normalizeListingQuery(listing)}.`);
}

export function simulatedEmailReport(email: string, report: string, reason: string, code = "email_unavailable") {
  return {
    sent: false,
    provider: "mock",
    code,
    fallbackReason: reason,
    message: "Email sending is disabled; report was simulated.",
    preview: report,
    email,
  };
}

export async function logEvent(databaseUrl: string, type: string, payload: unknown) {
  void databaseUrl;
  void type;
  void payload;
  return { logged: false, provider: "mock", message: "Backend logging provider is not implemented yet." };
}

export function reportMetadata({
  child,
  listing,
  analysis,
  email,
}: {
  child: ChildProfile;
  listing: Listing;
  analysis: AnalysisResult;
  email: string;
}) {
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

export function localNegotiationMessage(payload: {
  goal: string;
  tone: string;
  listing: Listing;
  options: { targetOffer?: string; pickupTiming?: string; reason?: string };
}) {
  return generateSellerMessage(payload.goal, payload.tone, payload.listing, payload.options);
}

async function openAiChatText(
  apiKey: string,
  model: string,
  messages: Array<{ role: "system" | "user"; content: string }>,
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.2 }),
  });
  if (!response.ok) throw new Error(`LLM provider failed with ${response.status}`);
  const json = await response.json();
  return String(json.choices?.[0]?.message?.content || "").trim();
}

function parseStructuredJson(content: string): Record<string, unknown> {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as Record<string, unknown>;
    }
    throw new Error("Invalid JSON returned from LLM.");
  }
}

function normalizeExtractedListingFields(parsed: Record<string, unknown>, fallbackText = ""): Partial<Listing> {
  const rawAskingPrice =
    parsed.askingPrice ??
    parsed.price ??
    parsed.listingPrice ??
    parsed.asking_price ??
    "";

  return {
    title: stringField(parsed.title),
    askingPrice: normalizePriceValue(rawAskingPrice, fallbackText),
    brand: stringField(parsed.brand),
    model: stringField(parsed.model),
    wheelSize: stringField(parsed.wheelSize),
    bikeType: stringField(parsed.bikeType),
    colorStyle: stringField(parsed.colorStyle),
    condition: stringField(parsed.condition),
    description: stringField(parsed.description),
    platform: stringField(parsed.platform),
    listingLink: stringField(parsed.listingLink),
    location: stringField(parsed.location ?? parsed.pickupLocation ?? parsed.pickupArea ?? parsed.city ?? parsed.town),
  };
}

function normalizePriceValue(rawValue: unknown, fallbackText: string) {
  const direct = extractPriceNumber(String(rawValue || ""));
  if (direct) return direct;
  return extractPriceNumber(fallbackText);
}

function extractPriceNumber(text: string) {
  if (!text) return "";
  const normalized = text.trim();

  const currencyMatch = normalized.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  if (currencyMatch?.[1]) return formatPriceNumber(currencyMatch[1]);

  const dollarsMatch = normalized.match(/\b(\d+(?:\.\d{1,2})?)\s*dollars?\b/i);
  if (dollarsMatch?.[1]) return formatPriceNumber(dollarsMatch[1]);

  const labelledMatch = normalized.match(/\bprice\s*[:=-]?\s*\$?\s*(\d+(?:\.\d{1,2})?)\b/i);
  if (labelledMatch?.[1]) return formatPriceNumber(labelledMatch[1]);

  const askingMatch = normalized.match(/\basking\s*\$?\s*(\d+(?:\.\d{1,2})?)\b/i);
  if (askingMatch?.[1]) return formatPriceNumber(askingMatch[1]);

  if (/^\d+(?:\.\d{1,2})?$/.test(normalized)) return formatPriceNumber(normalized);
  return "";
}

function formatPriceNumber(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function stringField(value: unknown) {
  return String(value || "").trim();
}

function normalizeConfidence(value: unknown): "high" | "medium" | "low" {
  const v = String(value || "").toLowerCase();
  if (v === "high" || v === "medium" || v === "low") return v;
  return "low";
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
}

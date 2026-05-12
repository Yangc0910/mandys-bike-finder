import { analyzeBike, localPriceReference } from "./analysis";
import type { AnalysisResult, ChildProfile, Listing } from "./types";
import type { MarketplaceId } from "./marketplace";

export type BikeScoutAlertFrequency = "daily" | "twice_daily" | "manual_review";
export type BikeScoutAutomationLevel = "planned_mvp" | "planned_best_effort" | "user_assisted_only";

export type BikeScoutChildProfile = {
  height: string;
  heightUnit: "cm" | "ft-in";
  age: string;
  ridingExperience: ChildProfile["experience"];
  weight?: string;
  weightUnit?: "lb" | "kg";
  stylePreference?: string;
  colorPreference?: string[];
};

export type BikeScoutSearchPreferences = {
  location: string;
  zipCode: string;
  radiusMiles: number;
  minBudget?: string;
  maxBudget: string;
  preferredWheelSizes: string[];
  preferredBikeTypes: string[];
  includedKeywords: string[];
  excludedKeywords: string[];
  marketplaceSources: MarketplaceId[];
  alertFrequency: BikeScoutAlertFrequency;
};

export type BikeScoutProfile = {
  id: string;
  name: string;
  childProfile: BikeScoutChildProfile;
  searchPreferences: BikeScoutSearchPreferences;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BikeSearchParams = {
  location?: string;
  zipCode?: string;
  radiusMiles: number;
  keywords: string[];
  excludedKeywords: string[];
  minBudget?: number;
  maxBudget: number;
  preferredWheelSizes: string[];
  preferredBikeTypes: string[];
};

export type NormalizedListing = {
  id: string;
  source: MarketplaceId | "manual";
  sourceListingId?: string;
  title: string;
  price: number | null;
  currency: string;
  location: string;
  distanceMiles?: number;
  url: string;
  imageUrl?: string;
  postedAt?: string;
  description: string;
  brand?: string;
  model?: string;
  bikeType?: string;
  wheelSize?: string;
  condition?: string;
  rawData?: Record<string, unknown>;
};

export type MarketplaceConnector = {
  id: MarketplaceId;
  label: string;
  search: (params: BikeSearchParams) => Promise<NormalizedListing[]>;
  supportsLocationSearch: boolean;
  supportsRadiusSearch: boolean;
  supportsDirectUrlExtraction: boolean;
  notes: string;
};

export type MarketplaceScoutSource = MarketplaceConnector & {
  automationLevel: BikeScoutAutomationLevel;
};

export type BikeScoutScorePreview = {
  overallRecommendation: AnalysisResult["overall"];
  analysis: AnalysisResult;
  listing: NormalizedListing;
  wheelSizeMatch: string;
  bikeTypeMatch: string;
  priceValueSignal: string;
  safetySignal: string;
};

const STORAGE_KEY = "mandy-bike-scout-profiles";

function plannedConnector(
  config: Omit<MarketplaceScoutSource, "search">,
): MarketplaceScoutSource {
  return {
    ...config,
    search: async () => [],
  };
}

export const BIKE_SCOUT_SOURCES: MarketplaceScoutSource[] = [
  plannedConnector({
    id: "craigslist",
    label: "Craigslist",
    automationLevel: "planned_mvp",
    supportsLocationSearch: true,
    supportsRadiusSearch: true,
    supportsDirectUrlExtraction: true,
    notes: "Public search is the most practical early automated candidate, but this prototype does not run scheduled Craigslist searches yet.",
  }),
  plannedConnector({
    id: "ebay",
    label: "eBay",
    automationLevel: "planned_best_effort",
    supportsLocationSearch: true,
    supportsRadiusSearch: false,
    supportsDirectUrlExtraction: true,
    notes: "Prefer official API integration before enabling Bike Scout automation.",
  }),
  plannedConnector({
    id: "pinkbike",
    label: "Pinkbike BuySell",
    automationLevel: "planned_best_effort",
    supportsLocationSearch: true,
    supportsRadiusSearch: true,
    supportsDirectUrlExtraction: true,
    notes: "Bike-specific public listings make this a reasonable best-effort candidate for later server-side work.",
  }),
  plannedConnector({
    id: "bicycle_blue_book",
    label: "Bicycle Blue Book",
    automationLevel: "planned_best_effort",
    supportsLocationSearch: false,
    supportsRadiusSearch: false,
    supportsDirectUrlExtraction: true,
    notes: "Useful for value context and possible listing normalization, but not implemented as automated Bike Scout search.",
  }),
  plannedConnector({
    id: "buycycle",
    label: "Buycycle",
    automationLevel: "planned_best_effort",
    supportsLocationSearch: true,
    supportsRadiusSearch: false,
    supportsDirectUrlExtraction: true,
    notes: "Public listing support varies. Keep any future connector server-side and best effort only.",
  }),
  plannedConnector({
    id: "the_pros_closet",
    label: "The Pro's Closet",
    automationLevel: "planned_best_effort",
    supportsLocationSearch: false,
    supportsRadiusSearch: false,
    supportsDirectUrlExtraction: true,
    notes: "Useful as a quality/value reference source; not live Bike Scout automation.",
  }),
  plannedConnector({
    id: "bikeexchange",
    label: "BikeExchange",
    automationLevel: "planned_best_effort",
    supportsLocationSearch: true,
    supportsRadiusSearch: true,
    supportsDirectUrlExtraction: true,
    notes: "Marketplace structure varies by region and seller. Treat as later best-effort automation only.",
  }),
  plannedConnector({
    id: "facebook_marketplace",
    label: "Facebook Marketplace",
    automationLevel: "user_assisted_only",
    supportsLocationSearch: false,
    supportsRadiusSearch: false,
    supportsDirectUrlExtraction: false,
    notes: "User-assisted only. Do not automate login-gated Facebook Marketplace searches or scraping.",
  }),
  plannedConnector({
    id: "offerup",
    label: "OfferUp",
    automationLevel: "user_assisted_only",
    supportsLocationSearch: false,
    supportsRadiusSearch: false,
    supportsDirectUrlExtraction: false,
    notes: "Keep as user-assisted only unless a reliable public integration path exists later.",
  }),
];

export const BIKE_SCOUT_SOURCE_OPTIONS = BIKE_SCOUT_SOURCES.map((source) => ({
  id: source.id,
  label: source.label,
  automationLevel: source.automationLevel,
  notes: source.notes,
}));

export const BIKE_SCOUT_PICKUP_CHECKLIST = [
  "Confirm wheel size",
  "Check standover height",
  "Test brakes",
  "Check tire condition",
  "Check rust",
  "Check shifting if geared",
  "Check wheel wobble",
  "Let child test ride if safe",
  "Confirm final price and pickup logistics",
] as const;

export function defaultBikeScoutProfile(): BikeScoutProfile {
  const now = new Date().toISOString();
  return {
    id: createBikeScoutId(),
    name: "Mandy Bike Scout",
    childProfile: {
      height: "",
      heightUnit: "cm",
      age: "",
      ridingExperience: "comfortable",
      weight: "",
      weightUnit: "lb",
      stylePreference: "all good / no preference",
      colorPreference: [],
    },
    searchPreferences: {
      location: "",
      zipCode: "",
      radiusMiles: 15,
      minBudget: "",
      maxBudget: "200",
      preferredWheelSizes: [],
      preferredBikeTypes: [],
      includedKeywords: [],
      excludedKeywords: [],
      marketplaceSources: ["craigslist", "facebook_marketplace"],
      alertFrequency: "daily",
    },
    enabled: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function hydrateBikeScoutProfile(
  base: BikeScoutProfile,
  input: {
    name?: string;
    height?: string;
    heightUnit?: BikeScoutChildProfile["heightUnit"];
    age?: string;
    ridingExperience?: BikeScoutChildProfile["ridingExperience"];
    weight?: string;
    weightUnit?: BikeScoutChildProfile["weightUnit"];
    stylePreference?: string;
    colorPreference?: string[];
  },
): BikeScoutProfile {
  return {
    ...base,
    name: input.name || base.name,
    childProfile: {
      ...base.childProfile,
      height: input.height ?? base.childProfile.height,
      heightUnit: input.heightUnit ?? base.childProfile.heightUnit,
      age: input.age ?? base.childProfile.age,
      ridingExperience: input.ridingExperience ?? base.childProfile.ridingExperience,
      weight: input.weight ?? base.childProfile.weight,
      weightUnit: input.weightUnit ?? base.childProfile.weightUnit,
      stylePreference: input.stylePreference ?? base.childProfile.stylePreference,
      colorPreference: input.colorPreference ?? base.childProfile.colorPreference,
    },
  };
}

export function bikeScoutProfileSummary(profile: BikeScoutProfile) {
  const locationLine = profile.searchPreferences.zipCode
    ? `${profile.searchPreferences.zipCode}${profile.searchPreferences.location ? ` (${profile.searchPreferences.location})` : ""}`
    : profile.searchPreferences.location || "Location not set";
  const budgetLine = profile.searchPreferences.minBudget
    ? `$${profile.searchPreferences.minBudget}-$${profile.searchPreferences.maxBudget}`
    : `Up to $${profile.searchPreferences.maxBudget}`;

  return {
    locationLine,
    budgetLine,
    sourceLabels: profile.searchPreferences.marketplaceSources.map((sourceId) => sourceLabel(sourceId)),
    wheelSizeLine: profile.searchPreferences.preferredWheelSizes.join(", ") || "Any practical size",
    bikeTypeLine: profile.searchPreferences.preferredBikeTypes.join(", ") || "Any practical kids bike",
  };
}

export function sourceLabel(sourceId: MarketplaceId) {
  return BIKE_SCOUT_SOURCES.find((source) => source.id === sourceId)?.label || sourceId;
}

export function saveBikeScoutProfiles(profiles: BikeScoutProfile[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function loadBikeScoutProfiles(): BikeScoutProfile[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isBikeScoutProfile) : [];
  } catch {
    return [];
  }
}

export function createBikeScoutId() {
  return `scout_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeBikeSearchParams(profile: BikeScoutProfile): BikeSearchParams {
  return {
    location: profile.searchPreferences.location || undefined,
    zipCode: profile.searchPreferences.zipCode || undefined,
    radiusMiles: profile.searchPreferences.radiusMiles,
    keywords: profile.searchPreferences.includedKeywords,
    excludedKeywords: profile.searchPreferences.excludedKeywords,
    minBudget: profile.searchPreferences.minBudget ? Number(profile.searchPreferences.minBudget) : undefined,
    maxBudget: Number(profile.searchPreferences.maxBudget || 0),
    preferredWheelSizes: profile.searchPreferences.preferredWheelSizes,
    preferredBikeTypes: profile.searchPreferences.preferredBikeTypes,
  };
}

export function normalizedListingToListing(listing: NormalizedListing): Listing {
  return {
    listingLink: listing.url,
    title: listing.title,
    askingPrice: listing.price ? String(listing.price) : "",
    brand: listing.brand || "",
    model: listing.model || "",
    wheelSize: listing.wheelSize || "",
    bikeType: listing.bikeType || "",
    platform: sourceLabel(listing.source as MarketplaceId),
    location: listing.location || "",
    condition: listing.condition || "",
    description: listing.description || "",
  };
}

export function bikeScoutChildToAnalysisChild(profile: BikeScoutProfile): ChildProfile {
  const childProfile = profile.childProfile;
  return {
    heightCm: childProfile.heightUnit === "cm" ? childProfile.height : "",
    age: childProfile.age,
    weight: childProfile.weight || "",
    experience: childProfile.ridingExperience,
    stylePreference: childProfile.stylePreference || "all good / no preference",
    colorPreferences: childProfile.colorPreference?.length ? childProfile.colorPreference : ["No preference / all colors are fine"],
  };
}

export function scoreBikeScoutListing(
  profile: BikeScoutProfile,
  normalizedListing: NormalizedListing,
): BikeScoutScorePreview {
  const analysisChild = bikeScoutChildToAnalysisChild(profile);
  const appListing = normalizedListingToListing(normalizedListing);
  const analysis = analyzeBike(analysisChild, appListing, localPriceReference(appListing, "Bike Scout preview uses current local rule-based pricing."));

  return {
    overallRecommendation: analysis.overall,
    analysis,
    listing: normalizedListing,
    wheelSizeMatch: analysis.dimensions.fit.label,
    bikeTypeMatch: normalizedListing.bikeType || "Bike type needs confirmation",
    priceValueSignal: analysis.dimensions.price.label,
    safetySignal: analysis.dimensions.condition.label,
  };
}

export function buildBikeScoutSellerMessageDraft(listing?: Partial<NormalizedListing>) {
  const title = listing?.title || "this bike";
  return `Hi, is ${title} still available? I’m looking for a bike for my child and wanted to confirm the wheel size, seat height range, brake condition, and whether there is any rust or mechanical issue.`;
}

function isBikeScoutProfile(value: unknown): value is BikeScoutProfile {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BikeScoutProfile>;
  return Boolean(candidate.id && candidate.name && candidate.childProfile && candidate.searchPreferences);
}

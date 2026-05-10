export type Meter = "green" | "yellow" | "red";

export type RidingExperience = "beginner" | "comfortable" | "confident" | "advanced";

export type ChildProfile = {
  heightCm: string;
  age?: string;
  weight?: string;
  experience: RidingExperience;
  stylePreference: string;
  colorPreference: string;
};

export type Listing = {
  listingLink?: string;
  title: string;
  askingPrice?: string;
  brand?: string;
  model?: string;
  wheelSize?: string;
  bikeType?: string;
  colorStyle?: string;
  platform?: string;
  location?: string;
  condition?: string;
  description: string;
};

export type MeterResult = {
  meter: Meter;
  label: string;
  reasoning: string;
};

export type AnalysisResult = {
  overall: MeterResult;
  dimensions: {
    fit: MeterResult;
    price: MeterResult;
    condition: MeterResult;
    brand: MeterResult;
    color: MeterResult;
    risk: MeterResult;
  };
  sellerQuestions: string[];
  disclaimer: string;
};

export type PriceReference = {
  low: number;
  high: number;
  confidence: "low" | "medium" | "high";
  provider: string;
  sources: Array<{ title?: string; url?: string; price?: string }>;
  message: string;
  cached?: boolean;
};

export type ProviderModes = {
  llm: string;
  search: string;
  email: string;
  logging: string;
};

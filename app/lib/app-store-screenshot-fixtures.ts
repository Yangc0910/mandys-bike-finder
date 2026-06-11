import { analyzeBike, generateSellerMessage, localPriceReference } from "./analysis";
import type { AnalysisResult, ChildProfile, Listing } from "./types";

export type ScreenshotFixtureFrame = "1" | "2" | "3" | "4" | "5" | "6";

export type ScreenshotFixtureProfile = {
  nickname: string;
  child: ChildProfile;
  savedAt: string;
};

export type ScreenshotFixtureEvaluation = {
  id: string;
  createdAt: string;
  listing: Listing;
  analysis: AnalysisResult;
  sellerMessage: string;
  childNickname: string;
  childSnapshot: ChildProfile;
  inputMode: "screenshot" | "link" | "manual";
  screenshotName?: string;
  savedAt: string;
  favorite: boolean;
};

export const screenshotFixtureProfile: ScreenshotFixtureProfile = {
  nickname: "Mandy",
  child: {
    heightCm: "122",
    age: "7",
    weight: "",
    experience: "beginner",
    stylePreference: "all good / no preference",
    colorPreferences: ["No preference / all colors are fine"],
  },
  savedAt: "2026-06-08T14:00:00.000Z",
};

export const screenshotFixturePrimaryListing: Listing = {
  title: "Trek 20-inch kids bike",
  askingPrice: "120",
  brand: "Trek",
  model: "Precaliber",
  wheelSize: "20 inch",
  bikeType: "Standard kids bike",
  colorStyle: "Blue",
  platform: "Screenshot",
  location: "Riverton",
  condition: "Used",
  description: "Seller says tires hold air. Ask whether the brakes and chain work well before pickup.",
};

export const screenshotFixturePrimaryAnalysis = createFixtureAnalysis(screenshotFixturePrimaryListing);

export const screenshotFixtureHistory: ScreenshotFixtureEvaluation[] = [
  createSavedEvaluation({
    id: "screenshot-trek-20",
    listing: screenshotFixturePrimaryListing,
    savedAt: "2026-06-10T15:30:00.000Z",
    favorite: true,
    inputMode: "screenshot",
    screenshotName: "trek-kids-bike-sample.png",
  }),
  createSavedEvaluation({
    id: "screenshot-neighborhood-18",
    listing: {
      title: "Neighborhood kids bike",
      askingPrice: "85",
      brand: "Schwinn",
      model: "Koen",
      wheelSize: "18 inch",
      bikeType: "Standard kids bike",
      colorStyle: "Teal",
      platform: "Manual entry",
      location: "Riverton",
      condition: "Good",
      description: "Brakes work. Tires hold air. Light cosmetic wear from normal use.",
    },
    savedAt: "2026-06-09T16:15:00.000Z",
    favorite: false,
    inputMode: "manual",
  }),
  createSavedEvaluation({
    id: "screenshot-youth-trail-20",
    listing: {
      title: "Youth trail bike",
      askingPrice: "160",
      brand: "Giant",
      model: "XTC Jr",
      wheelSize: "20 inch",
      bikeType: "Kids mountain bike",
      colorStyle: "Blue and white",
      platform: "Text / link",
      location: "Brookfield",
      condition: "Used",
      description: "Used kids trail bike. Ask about brakes, tire wear, chain, and frame condition.",
    },
    savedAt: "2026-06-08T17:45:00.000Z",
    favorite: false,
    inputMode: "link",
  }),
];

export function getScreenshotFixtureFrame(): ScreenshotFixtureFrame | null {
  if (typeof window === "undefined") return null;
  const frame = new URLSearchParams(window.location.search).get("screenshotFrame");
  return isScreenshotFixtureFrame(frame) ? frame : null;
}

export function screenshotFixtureTab(frame: ScreenshotFixtureFrame): "profile" | "evaluate" | "history" | "settings" {
  if (frame === "3" || frame === "4") return "evaluate";
  if (frame === "5") return "history";
  if (frame === "6") return "settings";
  return "profile";
}

function isScreenshotFixtureFrame(value: string | null): value is ScreenshotFixtureFrame {
  return Boolean(value && ["1", "2", "3", "4", "5", "6"].includes(value));
}

function createFixtureAnalysis(listing: Listing) {
  return analyzeBike(
    screenshotFixtureProfile.child,
    listing,
    localPriceReference(listing, "Screenshot fixture uses the built-in local estimate."),
  );
}

function createSavedEvaluation({
  id,
  listing,
  savedAt,
  favorite,
  inputMode,
  screenshotName,
}: {
  id: string;
  listing: Listing;
  savedAt: string;
  favorite: boolean;
  inputMode: ScreenshotFixtureEvaluation["inputMode"];
  screenshotName?: string;
}): ScreenshotFixtureEvaluation {
  return {
    id,
    createdAt: savedAt,
    listing,
    analysis: createFixtureAnalysis(listing),
    sellerMessage: generateSellerMessage("askQuestions", "friendly", listing, {}),
    childNickname: screenshotFixtureProfile.nickname,
    childSnapshot: screenshotFixtureProfile.child,
    inputMode,
    screenshotName,
    savedAt,
    favorite,
  };
}

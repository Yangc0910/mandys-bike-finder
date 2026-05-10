import type { ChildProfile, Listing } from "../types";

export function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export function normalizeListingQuery(listing: Listing) {
  return [
    listing.brand,
    listing.model,
    listing.wheelSize ? `${listing.wheelSize} inch` : "",
    listing.bikeType,
    "kids bike",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function heightBucket(heightCm: ChildProfile["heightCm"]) {
  const height = Number(heightCm);
  if (!height) return "unknown";
  if (height < 115) return "under-115";
  if (height < 130) return "115-129";
  if (height < 145) return "130-144";
  if (height < 155) return "145-154";
  return "155-plus";
}

export function ageBucket(age?: string) {
  const value = Number(age);
  if (!value) return "unknown";
  if (value < 5) return "under-5";
  if (value <= 7) return "5-7";
  if (value <= 10) return "8-10";
  return "11-plus";
}

export function safeError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

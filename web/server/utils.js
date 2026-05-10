export async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

export function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

export function clientKey(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return request.socket.remoteAddress || "local";
}

export function normalizeListingQuery(listing) {
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

export function heightBucket(heightCm) {
  const height = Number(heightCm);
  if (!height) return "unknown";
  if (height < 115) return "under-115";
  if (height < 130) return "115-129";
  if (height < 145) return "130-144";
  if (height < 155) return "145-154";
  return "155-plus";
}

export function ageBucket(age) {
  const value = Number(age);
  if (!value) return "unknown";
  if (value < 5) return "under-5";
  if (value <= 7) return "5-7";
  if (value <= 10) return "8-10";
  return "11-plus";
}

export function safeError(error) {
  return error instanceof Error ? error.message : String(error);
}

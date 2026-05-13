import { NextResponse } from "next/server";

import { reportEmailConfigurationError, sendBikeReportEmail, validateEmailAddress } from "@/lib/email";
import { checkUsageLimits } from "@/lib/server/limits";
import { buildReport } from "@/lib/server/report";
import { clientKey } from "@/lib/server/utils";
import type { AnalysisResult, ChildProfile, Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

type ReportEmailPayload = {
  email?: string;
  bikeTitle?: string;
  reportSummary?: string;
  recommendation?: string;
  score?: string;
  price?: string;
  askingPrice?: string;
  location?: string;
  distance?: string;
  distanceMiles?: string;
  reportId?: string;
  reportUrl?: string;
  childProfile?: ChildProfile;
  child?: ChildProfile;
  listing?: Listing;
  analysisResult?: AnalysisResult;
  analysis?: AnalysisResult;
  report?: string;
  reportTitle?: string;
  sourceUrl?: string;
  sellerMessage?: string;
  message?: string;
  recipientName?: string;
  note?: string;
  screenshotDataUrl?: string;
  recommendedBikeType?: string;
  recommendedWheelSize?: string;
};

export async function POST(request: Request) {
  const configError = reportEmailConfigurationError();
  if (configError) return errorResponse(configError, 503, "email_configuration_error");

  const payload = (await request.json().catch(() => null)) as ReportEmailPayload | null;
  if (!payload) return errorResponse("Request body must be valid JSON.", 400);

  const email = sanitize(payload.email || "");
  const childProfile = payload.childProfile || payload.child;
  const listing = payload.listing;
  const analysisResult = payload.analysisResult || payload.analysis;

  if (!email) return errorResponse("Email is required.", 400);
  if (!validateEmailAddress(email)) return errorResponse("Email must be valid.", 400);
  if (!childProfile || !listing || !analysisResult) {
    return errorResponse("A completed bike check is required before emailing a report.", 400);
  }

  const limit = checkUsageLimits("report-email", clientKey(request), 5, 3);
  if (!limit.allowed) {
    return errorResponse(`${limit.reason === "session" ? "Session" : "Daily"} report email limit reached.`, 429);
  }

  const sourceUrl = sanitizeUrl(payload.reportUrl || payload.sourceUrl || listing.listingLink || "");
  const report = sanitizeMultiline(payload.report || buildReport({
    child: childProfile,
    listing,
    analysis: analysisResult,
    message: payload.sellerMessage || payload.message,
    recipientName: payload.recipientName,
    note: payload.note,
  }));

  if (!report.trim()) return errorResponse("Report content is required.", 400);

  const result = await sendBikeReportEmail({
    to: email,
    bikeTitle: sanitize(payload.bikeTitle || listing.title),
    reportTitle: sanitize(payload.reportTitle || "Your Mandy's Bike Finder report"),
    reportSummary: sanitizeMultiline(payload.reportSummary || analysisResult.overall.reasoning || report),
    recommendation: sanitize(payload.recommendation || analysisResult.overall.label),
    score: sanitize(payload.score || analysisResult.overall.label),
    askingPrice: sanitize(payload.askingPrice || payload.price || formatPrice(listing.askingPrice || "")),
    location: sanitize(payload.location || listing.location || ""),
    distanceMiles: sanitize(payload.distanceMiles || payload.distance || ""),
    reportUrl: sourceUrl || buildReportUrl(payload.reportId),
    keyReasoning: sanitizeMultiline(payload.message || payload.sellerMessage || analysisResult.dimensions.fit.reasoning),
    childProfile,
    listing,
    analysisResult,
    sellerMessage: sanitizeMultiline(payload.sellerMessage || payload.message || ""),
    reportBody: report,
    listingUrl: sourceUrl,
    screenshotUrl: sanitizeImageUrl(payload.screenshotDataUrl || ""),
    recommendedBikeType: sanitize(payload.recommendedBikeType || ""),
    recommendedWheelSize: sanitize(payload.recommendedWheelSize || ""),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message, code: result.code }, { status: result.code === "email_configuration_error" ? 503 : 502 });
  }

  return NextResponse.json({ ok: true, message: "Report sent - please check your inbox.", provider: result.provider, id: result.id });
}

function errorResponse(error: string, status: number, code = "request_error") {
  return NextResponse.json({ ok: false, error, code }, { status });
}

function sanitize(value: string) {
  return String(value || "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, 500);
}

function sanitizeMultiline(value: string) {
  return String(value || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ").trim().slice(0, 12000);
}

function sanitizeUrl(value: string) {
  const raw = sanitize(value);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function buildReportUrl(reportId?: string) {
  const baseUrl = sanitizeUrl(process.env.APP_BASE_URL || "");
  const safeId = sanitize(reportId || "");
  if (!baseUrl || !safeId) return "";
  return `${baseUrl.replace(/\/$/, "")}/?report=${encodeURIComponent(safeId)}`;
}

function formatPrice(value: string) {
  const price = sanitize(value);
  if (!price) return "Unknown";
  return price.startsWith("$") ? price : `$${price}`;
}

function sanitizeImageUrl(value: string) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:image/")) return raw.length <= 2_800_000 ? raw : "";
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

import "server-only";

import { Resend } from "resend";
import type { AnalysisResult, ChildProfile, Listing } from "@/lib/types";

type EmailFailureCode = "email_configuration_error" | "invalid_email" | "email_send_failed";

export type ReportEmailPayload = {
  to: string;
  bikeTitle: string;
  reportTitle?: string;
  reportSummary: string;
  recommendation: string;
  score?: string;
  askingPrice?: string;
  location?: string;
  distanceMiles?: string;
  reportUrl?: string;
  keyReasoning?: string;
  childProfile?: ChildProfile;
  listing?: Listing;
  analysisResult?: AnalysisResult;
  sellerMessage?: string;
  reportBody?: string;
  listingUrl?: string;
  screenshotUrl?: string;
  recommendedBikeType?: string;
  recommendedWheelSize?: string;
};

export type EmailSendResult =
  | { ok: true; provider: "resend"; id: string; message: string }
  | { ok: false; provider: "configuration" | "resend"; code: EmailFailureCode; message: string };

export function validateEmailAddress(email: string) {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(String(email || "").trim());
}

export function reportEmailConfigurationError(env = process.env) {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  const from = String(env.REPORT_EMAIL_FROM || "").trim();

  if (!apiKey) return "Email service is not configured: missing RESEND_API_KEY.";
  if (!from) return "Email service is not configured: missing REPORT_EMAIL_FROM.";
  if (!senderLooksValid(from)) {
    return "Email service is not configured: REPORT_EMAIL_FROM must be a valid sender address.";
  }

  const replyTo = String(env.REPORT_EMAIL_REPLY_TO || "").trim();
  if (replyTo && !validateEmailAddress(replyTo)) {
    return "Email service is not configured: REPORT_EMAIL_REPLY_TO must be a valid email address.";
  }

  return "";
}

export async function sendBikeReportEmail(payload: ReportEmailPayload): Promise<EmailSendResult> {
  const configError = reportEmailConfigurationError();
  if (configError) {
    return { ok: false, provider: "configuration", code: "email_configuration_error", message: configError };
  }
  if (!validateEmailAddress(payload.to)) {
    return { ok: false, provider: "configuration", code: "invalid_email", message: "Recipient email must be valid." };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const response = await resend.emails.send({
      from: process.env.REPORT_EMAIL_FROM as string,
      to: [payload.to],
      replyTo: process.env.REPORT_EMAIL_REPLY_TO || undefined,
      subject: "Your Mandy's Bike Finder report",
      html: buildReportHtml(payload),
      text: buildReportText(payload),
    });

    if (response.error) {
      return { ok: false, provider: "resend", code: "email_send_failed", message: response.error.message || "Resend could not send the report email." };
    }

    return {
      ok: true,
      provider: "resend",
      id: String(response.data?.id || ""),
      message: "Report sent - please check your inbox.",
    };
  } catch (error) {
    console.error("reports.email.send", error);
    return { ok: false, provider: "resend", code: "email_send_failed", message: "Report email could not be sent." };
  }
}

function buildReportHtml(payload: ReportEmailPayload) {
  const brandColor = "#2563eb";
  const heroImageUrl = buildHeroImageUrl();
  const overallTone = meterTone(payload.analysisResult?.overall.meter);
  const dimensions = payload.analysisResult?.dimensions;
  const sellerQuestions = (payload.analysisResult?.sellerQuestions || []).slice(0, 4);
  const keyTakeaways = buildKeyTakeaways(payload);
  const sourceRows = buildSourceRows(payload);
  const bikeRows = buildBikeDetailRows(payload);

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif;">
    <main style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:${brandColor};">Mandy's Bike Finder</p>
        ${heroImageUrl ? `<img src="${escapeAttribute(heroImageUrl)}" alt="Mandy Bike Finder" style="display:block;width:100%;max-height:150px;object-fit:cover;border-radius:10px;margin:6px 0 18px;" />` : ""}
        <h1 style="margin:0 0 12px;font-size:24px;">${escapeHtml(payload.reportTitle || "Your bike report")}</h1>
        <div style="margin:0 0 20px;padding:14px;border-radius:10px;border:1px solid ${overallTone.border};background:${overallTone.bg};">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${overallTone.text};">Overall Recommendation</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:${overallTone.text};">${escapeHtml(payload.recommendation)}</p>
          <p style="margin:6px 0 0;font-size:14px;line-height:1.5;color:${overallTone.text};">${escapeHtml(payload.reportSummary)}</p>
        </div>

        ${section("Listing source", sourceRows.length
          ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${sourceRows.map(([label, value]) => detailRow(label, value)).join("")}</table>`
          : `<p style="margin:0;color:#475569;">No link or screenshot was included with this report.</p>`
        )}

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:16px 0;">
          <tr>
            <td style="width:50%;padding:0 6px 0 0;vertical-align:top;">${infoCard("Extracted bike details", bikeRows, payload.listingUrl)}</td>
            <td style="width:50%;padding:0 0 0 6px;vertical-align:top;">${infoCard("Rider fit", [
              ["Height", payload.childProfile?.heightCm ? `${payload.childProfile.heightCm} cm` : "Unknown"],
              ["Age", payload.childProfile?.age || "Unknown"],
              ["Experience", payload.childProfile?.experience || "Unknown"],
              ["Recommended", formatRecommendation(payload)],
            ])}</td>
          </tr>
        </table>

        ${payload.screenshotUrl ? section("Listing screenshot", `<img src="${escapeAttribute(payload.screenshotUrl)}" alt="Listing screenshot" style="display:block;width:100%;max-height:360px;object-fit:contain;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;" />`) : ""}

        ${section("Key takeaways", `
          <ul style="margin:0;padding-left:18px;">${keyTakeaways.map((item) => `<li style="margin:0 0 8px;line-height:1.5;">${escapeHtml(item)}</li>`).join("")}</ul>
          ${dimensions ? renderDimensionSummary(dimensions) : ""}
        `)}

        ${section("Pickup check", `
          <ul style="margin:0;padding-left:18px;">
            <li style="margin:0 0 6px;">Confirm wheel size and seat height range.</li>
            <li style="margin:0 0 6px;">Check standover height with your child standing over the bike.</li>
            <li style="margin:0 0 6px;">Test brakes, tire condition, rust, and wheel wobble.</li>
            <li style="margin:0 0 6px;">Let your child test ride only if the bike looks safe.</li>
          </ul>
        `)}

        ${sellerQuestions.length ? section("Seller questions to ask", `<ul style="margin:0;padding-left:18px;">${sellerQuestions.map((q) => `<li style="margin:0 0 6px;">${escapeHtml(q)}</li>`).join("")}</ul>`) : ""}
        ${payload.sellerMessage ? section("Suggested seller message", `<p style="white-space:pre-wrap;margin:0;line-height:1.6;">${escapeHtml(payload.sellerMessage)}</p>`) : ""}
        ${payload.reportUrl ? `<p style="margin:18px 0 0;"><a href="${escapeAttribute(payload.reportUrl)}">Open this report in Mandy's Bike Finder</a></p>` : ""}

        <p style="margin-top:20px;font-size:13px;line-height:1.6;color:#475569;">
          Used bikes still need an in-person fit and safety check before purchase.
        </p>
      </div>
    </main>
  </body>
</html>`;
}

function buildReportText(payload: ReportEmailPayload) {
  const dimensions = payload.analysisResult?.dimensions;
  const takeaways = buildKeyTakeaways(payload);
  return [
    "Mandy's Bike Finder",
    payload.reportTitle || "Your bike report",
    "",
    `Recommendation: ${payload.recommendation}`,
    payload.reportSummary,
    "",
    `Bike: ${payload.bikeTitle || "Untitled bike listing"}`,
    `Asking price: ${payload.askingPrice || "Unknown"}`,
    `Location: ${formatLocation(payload.location, payload.distanceMiles)}`,
    payload.listingUrl ? `Listing link: ${payload.listingUrl}` : "",
    payload.screenshotUrl ? "Listing screenshot: included in HTML email" : "",
    "",
    "Extracted bike details:",
    ...buildBikeDetailRows(payload).map(([label, value]) => `- ${label}: ${value}`),
    payload.recommendedBikeType ? `Recommended bike type: ${payload.recommendedBikeType}` : "",
    payload.recommendedWheelSize ? `Recommended wheel size: ${payload.recommendedWheelSize}` : "",
    "",
    "Key takeaways:",
    ...takeaways.map((item) => `- ${item}`),
    dimensions ? `Score snapshot: Fit ${dimensions.fit.label}; Price ${dimensions.price.label}; Condition ${dimensions.condition.label}; Risk ${dimensions.risk.label}` : "",
    "",
    "Pickup check: confirm wheel size and seat height, test brakes and tires, check rust/wobble, and let your child test ride only if safe.",
    payload.sellerMessage ? `Suggested seller message: ${payload.sellerMessage}` : "",
    payload.reportUrl ? `Report link: ${payload.reportUrl}` : "",
    "",
    "Used bikes still need an in-person fit and safety check before purchase.",
  ].filter(Boolean).join("\n");
}

function section(title: string, content: string) {
  return `<section style="border-top:1px solid #e2e8f0;padding-top:16px;margin-top:16px;"><h2 style="margin:0 0 8px;font-size:18px;">${escapeHtml(title)}</h2>${content}</section>`;
}

function infoCard(title: string, rows: Array<[string, string]>, link?: string) {
  return `<div style="border:1px solid #e2e8f0;background:#f8fafc;border-radius:10px;padding:14px;min-height:150px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#475569;">${escapeHtml(title)}</p>
    ${rows.map(([label, value]) => `<p style="margin:0 0 8px;font-size:14px;line-height:1.4;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join("")}
    ${link ? `<p style="margin:10px 0 0;font-size:14px;"><a href="${escapeAttribute(link)}">View listing</a></p>` : ""}
  </div>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="width:130px;padding:6px 10px 6px 0;vertical-align:top;font-size:13px;font-weight:700;color:#475569;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;vertical-align:top;font-size:14px;line-height:1.5;color:#0f172a;">${value.startsWith("http") ? `<a href="${escapeAttribute(value)}">${escapeHtml(value)}</a>` : escapeHtml(value)}</td>
  </tr>`;
}

function buildSourceRows(payload: ReportEmailPayload): Array<[string, string]> {
  return [
    payload.listingUrl ? ["Shared link", payload.listingUrl] : null,
    payload.screenshotUrl ? ["Screenshot", "Included below"] : null,
    payload.listing?.platform ? ["Marketplace", payload.listing.platform] : null,
  ].filter(Boolean) as Array<[string, string]>;
}

function buildBikeDetailRows(payload: ReportEmailPayload): Array<[string, string]> {
  const listing = payload.listing;
  const rows: Array<[string, string]> = [
    ["Title", payload.bikeTitle || listing?.title || "Untitled bike listing"],
    ["Asking price", payload.askingPrice || "Unknown"],
    ["Location", formatLocation(payload.location || listing?.location, payload.distanceMiles)],
    ["Brand", listing?.brand || "Unknown"],
    ["Model", listing?.model || "Unknown"],
    ["Wheel size", listing?.wheelSize || "Unknown"],
    ["Bike type", listing?.bikeType || "Unknown"],
    ["Color/style", listing?.colorStyle || "Unknown"],
  ];
  const condition = listing?.condition || summarizeDescription(listing?.description || "");
  if (condition) rows.push(["Condition notes", condition]);
  return rows;
}

function summarizeDescription(description: string) {
  const text = description.replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function formatRecommendation(payload: ReportEmailPayload) {
  const parts = [payload.recommendedWheelSize, payload.recommendedBikeType].filter(Boolean);
  return parts.length ? parts.join(" ") : "Use fit-first sizing";
}

function formatLocation(location?: string, distanceMiles?: string) {
  const safeLocation = location || "Unknown";
  return distanceMiles ? `${safeLocation} (${distanceMiles} mi)` : safeLocation;
}

function buildKeyTakeaways(payload: ReportEmailPayload) {
  const dimensions = payload.analysisResult?.dimensions;
  const items = [
    payload.keyReasoning || payload.reportSummary,
    dimensions?.fit ? `Fit: ${dimensions.fit.label}. ${dimensions.fit.reasoning}` : "",
    dimensions?.price ? `Value: ${dimensions.price.label}. ${dimensions.price.reasoning}` : "",
    dimensions?.condition ? `Condition: ${dimensions.condition.label}. ${dimensions.condition.reasoning}` : "",
    dimensions?.risk && dimensions.risk.meter !== "green" ? `Risk: ${dimensions.risk.label}. ${dimensions.risk.reasoning}` : "",
  ].filter(Boolean);
  return items.map((item) => String(item).replace(/\s+/g, " ").trim()).slice(0, 4);
}

function renderDimensionSummary(dimensions: AnalysisResult["dimensions"]) {
  const items: Array<[string, AnalysisResult["dimensions"][keyof AnalysisResult["dimensions"]]]> = [
    ["Fit", dimensions.fit],
    ["Price", dimensions.price],
    ["Condition", dimensions.condition],
    ["Risk", dimensions.risk],
  ];
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:14px;">
      <tr>
        ${items
          .map(([name, value]) => {
            const tone = meterTone(value.meter);
            return `<td style="width:25%;padding:4px;vertical-align:top;"><div style="border:1px solid ${tone.border};background:${tone.bg};padding:9px;border-radius:8px;"><p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${tone.text};">${escapeHtml(name)}</p><p style="margin:0;font-size:12px;color:${tone.text};">${escapeHtml(value.label)}</p></div></td>`;
          })
          .join("")}
      </tr>
    </table>
  `;
}

function meterTone(meter?: AnalysisResult["overall"]["meter"]) {
  if (meter === "green") return { bg: "#ecfdf5", border: "#6ee7b7", text: "#065f46" };
  if (meter === "red") return { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b" };
  return { bg: "#fffbeb", border: "#fcd34d", text: "#92400e" };
}

function buildHeroImageUrl() {
  const base = String(process.env.APP_BASE_URL || "").trim().replace(/\/$/, "");
  if (!base) return "";
  return `${base}/images/mandy-bike-hero.jpg`;
}

function senderLooksValid(value: string) {
  const match = value.match(/<([^<>]+)>/);
  return validateEmailAddress(match?.[1] || value);
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

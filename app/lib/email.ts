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
  const reportLink = payload.reportUrl ? `<p><a href="${escapeAttribute(payload.reportUrl)}">Open this report in Mandy's Bike Finder</a></p>` : "";
  const dimensions = payload.analysisResult?.dimensions;
  const sellerQuestions = payload.analysisResult?.sellerQuestions || [];

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif;">
    <main style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:${brandColor};">Mandy's Bike Finder</p>
        ${heroImageUrl ? `<img src="${escapeAttribute(heroImageUrl)}" alt="Mandy Bike Finder" style="display:block;width:100%;max-height:220px;object-fit:cover;border-radius:10px;margin:6px 0 18px;" />` : ""}
        <h1 style="margin:0 0 12px;font-size:24px;">${escapeHtml(payload.reportTitle || "Your bike report")}</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">${escapeHtml(payload.reportSummary)}</p>
        <div style="margin:0 0 20px;padding:14px;border-radius:10px;border:1px solid ${overallTone.border};background:${overallTone.bg};">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${overallTone.text};">Overall Recommendation</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:${overallTone.text};">${escapeHtml(payload.recommendation)}</p>
          <p style="margin:6px 0 0;font-size:14px;color:${overallTone.text};">Deal score: ${escapeHtml(payload.score || "Not provided")}</p>
        </div>

        ${section("Bike", `
          <p><strong>${escapeHtml(payload.bikeTitle || "Untitled bike listing")}</strong></p>
          <p>Asking price: ${escapeHtml(payload.askingPrice || "Unknown")}</p>
          <p>Location: ${escapeHtml(formatLocation(payload.location, payload.distanceMiles))}</p>
          ${payload.listing?.wheelSize ? `<p>Wheel size: ${escapeHtml(payload.listing.wheelSize)}</p>` : ""}
          ${payload.listing?.bikeType ? `<p>Bike type: ${escapeHtml(payload.listing.bikeType)}</p>` : ""}
        `)}

        ${section("Why this recommendation", `
          <p>${escapeHtml(payload.keyReasoning || payload.reportSummary)}</p>
          ${dimensions ? renderDimensionGrid(dimensions) : ""}
        `)}

        ${section("Rider profile", `
          <p>Height: ${escapeHtml(payload.childProfile?.heightCm ? `${payload.childProfile.heightCm} cm` : "Unknown")}</p>
          <p>Age: ${escapeHtml(payload.childProfile?.age || "Unknown")}</p>
          <p>Riding experience: ${escapeHtml(payload.childProfile?.experience || "Unknown")}</p>
          <p>Style preference: ${escapeHtml(payload.childProfile?.stylePreference || "No preference")}</p>
        `)}

        ${payload.sellerMessage ? section("Suggested seller message", `<p style="white-space:pre-wrap;">${escapeHtml(payload.sellerMessage)}</p>`) : ""}
        ${sellerQuestions.length ? section("Seller questions to ask", `<ul style="margin:0;padding-left:18px;">${sellerQuestions.map((q) => `<li style="margin:0 0 6px;">${escapeHtml(q)}</li>`).join("")}</ul>`) : ""}
        ${payload.reportBody ? section("Full report notes", `<p style="white-space:pre-wrap;">${escapeHtml(payload.reportBody).slice(0, 2200)}</p>`) : ""}
        ${reportLink}

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
  return [
    "Mandy's Bike Finder",
    payload.reportTitle || "Your bike report",
    "",
    payload.reportSummary,
    "",
    `Bike: ${payload.bikeTitle || "Untitled bike listing"}`,
    `Asking price: ${payload.askingPrice || "Unknown"}`,
    `Location: ${formatLocation(payload.location, payload.distanceMiles)}`,
    `Overall deal score: ${payload.score || "Not provided"}`,
    `Recommendation: ${payload.recommendation}`,
    `Key reasoning: ${payload.keyReasoning || payload.reportSummary}`,
    dimensions ? `Fit: ${dimensions.fit.label} | Price: ${dimensions.price.label} | Condition: ${dimensions.condition.label} | Brand: ${dimensions.brand.label} | Kid Appeal: ${dimensions.color.label} | Risk: ${dimensions.risk.label}` : "",
    payload.sellerMessage ? `Suggested seller message: ${payload.sellerMessage}` : "",
    payload.reportUrl ? `Report link: ${payload.reportUrl}` : "",
    "",
    "Used bikes still need an in-person fit and safety check before purchase.",
  ].filter(Boolean).join("\n");
}

function section(title: string, content: string) {
  return `<section style="border-top:1px solid #e2e8f0;padding-top:16px;margin-top:16px;"><h2 style="margin:0 0 8px;font-size:18px;">${escapeHtml(title)}</h2>${content}</section>`;
}

function formatLocation(location?: string, distanceMiles?: string) {
  const safeLocation = location || "Unknown";
  return distanceMiles ? `${safeLocation} (${distanceMiles} mi)` : safeLocation;
}

function renderDimensionGrid(dimensions: AnalysisResult["dimensions"]) {
  const items: Array<[string, AnalysisResult["dimensions"][keyof AnalysisResult["dimensions"]]]> = [
    ["Fit", dimensions.fit],
    ["Price", dimensions.price],
    ["Condition", dimensions.condition],
    ["Brand", dimensions.brand],
    ["Kid Appeal", dimensions.color],
    ["Risk", dimensions.risk],
  ];
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:12px;">
      <tr>
        ${items
          .map(([name, value]) => {
            const tone = meterTone(value.meter);
            return `<td style="width:50%;padding:6px;vertical-align:top;"><div style="border:1px solid ${tone.border};background:${tone.bg};padding:10px;border-radius:8px;"><p style="margin:0 0 4px;font-size:12px;font-weight:700;color:${tone.text};">${escapeHtml(name)}</p><p style="margin:0;font-size:13px;color:${tone.text};">${escapeHtml(value.label)}</p></div></td>`;
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

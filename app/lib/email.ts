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
    const attachments = buildReportAttachments(payload);
    const response = await resend.emails.send({
      from: process.env.REPORT_EMAIL_FROM as string,
      to: [payload.to],
      replyTo: process.env.REPORT_EMAIL_REPLY_TO || undefined,
      subject: "Your Mandy's Bike Finder report",
      html: buildReportHtml(payload),
      text: buildReportText(payload),
      attachments: attachments.length ? attachments : undefined,
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
  const overallTone = meterTone(payload.analysisResult?.overall.meter);
  const dimensions = payload.analysisResult?.dimensions;
  const sellerQuestions = (payload.analysisResult?.sellerQuestions || []).slice(0, 4);
  const keyTakeaways = buildKeyTakeaways(payload);
  const screenshotAttachment = buildScreenshotAttachment(payload.screenshotUrl);
  const sourceRows = buildSourceRows(payload, screenshotAttachment?.filename);
  const bikeRows = buildBikeDetailRows(payload);
  const riderRows = buildRiderRows(payload);
  const decision = buildDecisionSummary(payload);
  const screenshotPreview = buildScreenshotPreview(payload.screenshotUrl, screenshotAttachment?.filename);

  return `<!doctype html>
<html>
  <body style="margin:0;background:#eef3f8;color:#102033;font-family:Arial,Helvetica,sans-serif;">
    <main style="max-width:700px;margin:0 auto;padding:24px 14px;">
      <div style="background:#ffffff;border:1px solid #d9e4f2;border-radius:18px;overflow:hidden;box-shadow:0 12px 28px rgba(15,35,65,0.08);">
        <div style="background:#0f2f4f;padding:22px 24px;color:#ffffff;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#bfe1ff;">Mandy's Bike Finder</p>
          <h1 style="margin:0;font-size:28px;line-height:1.18;color:#ffffff;">${escapeHtml(payload.reportTitle || "Your bike report")}</h1>
          <p style="margin:10px 0 0;font-size:15px;line-height:1.55;color:#dbeafe;">A parent-friendly used-bike review based on the rider profile, listing details, and the information you shared.</p>
        </div>

        <div style="padding:24px;">
          <section style="border:1px solid ${overallTone.border};background:${overallTone.bg};border-radius:16px;padding:18px;margin:0 0 18px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${overallTone.text};">Decision summary</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="vertical-align:top;padding:0 14px 0 0;">
                  <p style="margin:0;font-size:26px;line-height:1.2;font-weight:800;color:${overallTone.text};">${escapeHtml(payload.recommendation)}</p>
                  <p style="margin:8px 0 0;font-size:15px;line-height:1.55;color:#20344c;">${escapeHtml(decision)}</p>
                </td>
                <td style="width:160px;vertical-align:top;">
                  ${renderDecisionMeter(payload.analysisResult?.overall.meter)}
                </td>
              </tr>
            </table>
          </section>

          ${section("1. Listing source", sourceRows.length
            ? `${keyValueTable(sourceRows)}${screenshotPreview}`
            : `<p style="margin:0;color:#475569;line-height:1.55;">No listing link or screenshot was included with this report. If you have one, add it before sending the report so the email can preserve the original source context.</p>`
          )}

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="width:50%;padding:0 7px 0 0;vertical-align:top;">${infoCard("2. Extracted bike details", bikeRows, payload.listingUrl)}</td>
              <td style="width:50%;padding:0 0 0 7px;vertical-align:top;">${infoCard("3. Rider fit profile", riderRows)}</td>
            </tr>
          </table>

          ${section("4. What matters most", `
            <ul style="margin:0;padding-left:18px;">${keyTakeaways.map((item) => `<li style="margin:0 0 8px;line-height:1.55;color:#20344c;">${escapeHtml(item)}</li>`).join("")}</ul>
            ${dimensions ? renderDimensionSummary(dimensions) : ""}
          `)}

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="width:50%;padding:0 7px 0 0;vertical-align:top;">${actionCard("Pickup inspection checklist", [
                "Confirm wheel size and seat-height range.",
                "Check standover height with your child.",
                "Test brakes, tires, rust, and wheel wobble.",
                "Let your child test ride only if the bike looks safe.",
              ])}</td>
              <td style="width:50%;padding:0 0 0 7px;vertical-align:top;">${sellerQuestions.length ? actionCard("Questions for the seller", sellerQuestions) : actionCard("Questions for the seller", [
                "Confirm wheel size, condition, and whether anything needs repair.",
                "Ask if the brakes work well and whether there is rust or wheel wobble.",
              ])}</td>
            </tr>
          </table>

          ${payload.sellerMessage ? section("Suggested seller message", `<div style="background:#f8fafc;border:1px solid #dbe7f4;border-radius:12px;padding:14px;color:#20344c;white-space:pre-wrap;line-height:1.6;">${escapeHtml(payload.sellerMessage)}</div>`) : ""}
          ${payload.reportUrl ? `<p style="margin:18px 0 0;"><a href="${escapeAttribute(payload.reportUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 16px;font-weight:700;">Open this report in Mandy's Bike Finder</a></p>` : ""}

          <p style="margin-top:20px;font-size:13px;line-height:1.6;color:#5b6f86;">
            Mandy's Bike Finder provides practical guidance, not a guarantee. Used bikes still need an in-person fit and safety check before purchase.
          </p>
        </div>
      </div>
    </main>
  </body>
</html>`;
}

function buildReportText(payload: ReportEmailPayload) {
  const dimensions = payload.analysisResult?.dimensions;
  const takeaways = buildKeyTakeaways(payload);
  const screenshotAttachment = buildScreenshotAttachment(payload.screenshotUrl);
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
    screenshotAttachment ? `Listing screenshot: attached as ${screenshotAttachment.filename}` : payload.screenshotUrl ? `Listing image: ${payload.screenshotUrl}` : "",
    "",
    "Extracted bike details:",
    ...buildBikeDetailRows(payload).map(([label, value]) => `- ${label}: ${value}`),
    "",
    "Rider fit profile:",
    ...buildRiderRows(payload).map(([label, value]) => `- ${label}: ${value}`),
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
  return `<section style="border-top:1px solid #dbe7f4;padding-top:18px;margin-top:18px;"><h2 style="margin:0 0 10px;font-size:18px;line-height:1.3;color:#102033;">${escapeHtml(title)}</h2>${content}</section>`;
}

function infoCard(title: string, rows: Array<[string, string]>, link?: string) {
  return `<div style="border:1px solid #dbe7f4;background:#f8fbff;border-radius:14px;padding:14px;min-height:190px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:#496278;">${escapeHtml(title)}</p>
    ${rows.map(([label, value]) => `<p style="margin:0 0 9px;font-size:14px;line-height:1.45;color:#20344c;"><strong style="color:#102033;">${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join("")}
    ${link ? `<p style="margin:12px 0 0;font-size:14px;"><a href="${escapeAttribute(link)}" style="color:#2563eb;font-weight:700;">View original listing</a></p>` : ""}
  </div>`;
}

function actionCard(title: string, items: string[]) {
  return `<div style="border:1px solid #dbe7f4;background:#ffffff;border-radius:14px;padding:14px;min-height:160px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:#496278;">${escapeHtml(title)}</p>
    <ul style="margin:0;padding-left:18px;">${items.map((item) => `<li style="margin:0 0 7px;font-size:14px;line-height:1.45;color:#20344c;">${escapeHtml(item)}</li>`).join("")}</ul>
  </div>`;
}

function keyValueTable(rows: Array<[string, string]>) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f8fbff;border:1px solid #dbe7f4;border-radius:12px;">${rows.map(([label, value]) => detailRow(label, value)).join("")}</table>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="width:140px;padding:9px 12px;vertical-align:top;font-size:13px;font-weight:700;color:#496278;border-bottom:1px solid #e7eef7;">${escapeHtml(label)}</td>
    <td style="padding:9px 12px;vertical-align:top;font-size:14px;line-height:1.5;color:#102033;border-bottom:1px solid #e7eef7;">${value.startsWith("http") ? `<a href="${escapeAttribute(value)}" style="color:#2563eb;">${escapeHtml(value)}</a>` : escapeHtml(value)}</td>
  </tr>`;
}

function buildSourceRows(payload: ReportEmailPayload, screenshotFilename?: string): Array<[string, string]> {
  return [
    payload.listingUrl ? ["Shared link", payload.listingUrl] : null,
    screenshotFilename ? ["Screenshot", `Attached as ${screenshotFilename}`] : payload.screenshotUrl ? ["Listing image", payload.screenshotUrl] : null,
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

function buildRiderRows(payload: ReportEmailPayload): Array<[string, string]> {
  return [
    ["Rider height", payload.childProfile?.heightCm ? `${payload.childProfile.heightCm} cm` : "Unknown"],
    ["Age", payload.childProfile?.age || "Unknown"],
    ["Experience", payload.childProfile?.experience || "Unknown"],
    ["Style preference", payload.childProfile?.stylePreference || "No preference"],
    ["Color preference", payload.childProfile?.colorPreferences?.length ? payload.childProfile.colorPreferences.join(", ") : "No preference"],
    ["Recommended setup", formatRecommendation(payload)],
  ];
}

function buildDecisionSummary(payload: ReportEmailPayload) {
  const summary = payload.reportSummary || payload.analysisResult?.overall.reasoning || "";
  const title = payload.bikeTitle || payload.listing?.title || "this bike";
  const price = payload.askingPrice || "unknown price";
  const fit = payload.analysisResult?.dimensions.fit.label;
  const priceSignal = payload.analysisResult?.dimensions.price.label;
  const condition = payload.analysisResult?.dimensions.condition.label;

  return [
    `${title} at ${price}.`,
    summary,
    fit ? `Fit signal: ${fit}.` : "",
    priceSignal ? `Value signal: ${priceSignal}.` : "",
    condition ? `Condition signal: ${condition}.` : "",
  ].filter(Boolean).join(" ");
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

function renderDecisionMeter(meter?: AnalysisResult["overall"]["meter"]) {
  const active = meter || "yellow";
  const columns: Array<[AnalysisResult["overall"]["meter"], string, string]> = [
    ["red", "Skip", "#b91c1c"],
    ["yellow", "Review", "#b45309"],
    ["green", "Good", "#047857"],
  ];

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr>${columns.map(([key, label, color]) => `<td style="width:33.33%;padding:0 2px;text-align:center;">
      <div style="height:8px;border-radius:8px;background:${color};opacity:${active === key ? "1" : "0.25"};"></div>
      <p style="margin:6px 0 0;font-size:11px;font-weight:${active === key ? "800" : "600"};color:${active === key ? color : "#64748b"};">${label}</p>
      <p style="margin:2px 0 0;font-size:13px;line-height:1;color:${active === key ? color : "#ffffff"};">&#9650;</p>
    </td>`).join("")}</tr>
  </table>`;
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

function buildReportAttachments(payload: ReportEmailPayload) {
  const screenshot = buildScreenshotAttachment(payload.screenshotUrl);
  return screenshot ? [screenshot] : [];
}

function buildScreenshotPreview(value?: string, filename?: string) {
  if (!value) return "";
  if (filename) {
    return `<div style="margin-top:12px;border:1px solid #cfe0f2;background:#ffffff;border-radius:12px;padding:12px;">
      <p style="margin:0;font-size:14px;line-height:1.55;color:#20344c;"><strong>Screenshot included:</strong> the listing screenshot is attached to this email as <strong>${escapeHtml(filename)}</strong>. Many email clients block embedded base64 images, so Mandy sends it as a real attachment for easier review.</p>
    </div>`;
  }
  return `<div style="margin-top:12px;border:1px solid #cfe0f2;background:#ffffff;border-radius:12px;padding:12px;">
    <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#20344c;"><strong>Listing image:</strong></p>
    <img src="${escapeAttribute(value)}" alt="Listing image" style="display:block;width:100%;max-height:320px;object-fit:contain;border:1px solid #dbe7f4;border-radius:10px;background:#f8fafc;" />
  </div>`;
}

function buildScreenshotAttachment(value?: string) {
  const image = parseDataImage(value);
  if (!image) return null;
  return {
    filename: `mandy-bike-listing-screenshot.${image.extension}`,
    content: image.content,
    contentType: image.contentType,
  };
}

function parseDataImage(value?: string) {
  const raw = String(value || "").trim();
  const match = raw.match(/^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) return null;

  const contentType = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  const extension = contentType === "image/jpeg" ? "jpg" : contentType.replace("image/", "");
  const content = match[2].replace(/\s+/g, "");
  if (!content) return null;

  return { contentType, extension, content };
}

function meterTone(meter?: AnalysisResult["overall"]["meter"]) {
  if (meter === "green") return { bg: "#ecfdf5", border: "#6ee7b7", text: "#065f46" };
  if (meter === "red") return { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b" };
  return { bg: "#fffbeb", border: "#fcd34d", text: "#92400e" };
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

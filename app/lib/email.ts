import "server-only";

import { Resend } from "resend";

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
  const reportLink = payload.reportUrl ? `<p><a href="${escapeAttribute(payload.reportUrl)}">Open this report in Mandy's Bike Finder</a></p>` : "";

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif;">
    <main style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#2563eb;">Mandy's Bike Finder</p>
        <h1 style="margin:0 0 12px;font-size:24px;">${escapeHtml(payload.reportTitle || "Your bike report")}</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">${escapeHtml(payload.reportSummary)}</p>

        ${section("Bike", `
          <p><strong>${escapeHtml(payload.bikeTitle || "Untitled bike listing")}</strong></p>
          <p>Asking price: ${escapeHtml(payload.askingPrice || "Unknown")}</p>
          <p>Location: ${escapeHtml(formatLocation(payload.location, payload.distanceMiles))}</p>
        `)}

        ${section("Recommendation", `
          <p><strong>${escapeHtml(payload.recommendation)}</strong></p>
          <p>Overall deal score: ${escapeHtml(payload.score || "Not provided")}</p>
          <p>${escapeHtml(payload.keyReasoning || payload.reportSummary)}</p>
        `)}

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

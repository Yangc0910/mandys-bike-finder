import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { analyzeBike } from "../src/analysis.js";
import { TtlCache } from "./cache.js";
import { loadServerConfig } from "./config.js";
import { DailyLimitStore } from "./limits.js";
import { createEmailProvider } from "./providers/email.js";
import { createLlmProvider } from "./providers/llm.js";
import { createLoggingProvider, reportMetadata } from "./providers/logging.js";
import { createSearchProvider, localPriceReference } from "./providers/search.js";
import { buildReport } from "./report.js";
import { clientKey, normalizeListingQuery, readJson, safeError, sendJson } from "./utils.js";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const config = loadServerConfig();
const limits = new DailyLimitStore();
const searchCache = new TtlCache(config.limits.searchCacheTtlHours);
const llmProvider = createLlmProvider(config);
const searchProvider = createSearchProvider(config);
const emailProvider = createEmailProvider(config);
const loggingProvider = createLoggingProvider(config);

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }
    await serveStatic(response, url.pathname);
  } catch (error) {
    console.error("Unhandled request error", safeError(error));
    sendJson(response, 500, { ok: false, error: "Unexpected server error." });
  }
});

server.listen(config.port, "127.0.0.1", () => {
  console.log(`Mandy's Bike Finder running at http://127.0.0.1:${config.port}/`);
});

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/status") {
    sendJson(response, 200, {
      ok: true,
      featureFlags: config.featureFlags,
      providers: {
        llm: llmProvider.mode,
        search: searchProvider.mode,
        email: emailProvider.mode,
        logging: loggingProvider.mode,
      },
      limits: config.limits,
    });
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  if (url.pathname === "/api/extract") {
    await handleExtract(request, response);
    return;
  }
  if (url.pathname === "/api/analyze") {
    await handleAnalyze(request, response);
    return;
  }
  if (url.pathname === "/api/message") {
    await handleMessage(request, response);
    return;
  }
  if (url.pathname === "/api/report") {
    await handleReport(request, response);
    return;
  }

  sendJson(response, 404, { ok: false, error: "API route not found." });
}

async function handleExtract(request, response) {
  const key = clientKey(request);
  const limit = limits.check("llm", key, config.limits.llmDaily);
  const { text = "" } = await readJson(request);
  if (!limit.allowed) {
    sendJson(response, 200, {
      ok: true,
      fallback: true,
      statusMessage: "Daily LLM limit reached. Using local extraction fallback.",
      result: await llmProviderFallback().extractListingFields(text),
    });
    return;
  }

  try {
    const result = await llmProvider.extractListingFields(text);
    sendJson(response, 200, { ok: true, fallback: result.provider === "mock", result });
  } catch (error) {
    await logApiFailure("llm.extract", error);
    sendJson(response, 200, {
      ok: true,
      fallback: true,
      statusMessage: "Live extraction failed. Local extraction fallback was used.",
      result: await llmProviderFallback().extractListingFields(text),
    });
  }
}

async function handleAnalyze(request, response) {
  const key = clientKey(request);
  const { child = {}, listing = {} } = await readJson(request);
  const priceReference = await getPriceReferenceWithControls(key, listing);
  const analysis = analyzeBike(child, listing, priceReference);

  let reasoning = "";
  if (config.featureFlags.llmAnalysis) {
    const limit = limits.check("llm", key, config.limits.llmDaily);
    if (limit.allowed) {
      try {
        reasoning = (await llmProvider.generateReasoning({ child, listing, analysis })).reasoning;
      } catch (error) {
        await logApiFailure("llm.reasoning", error);
      }
    }
  }

  await safeLog("analysis", {
    provider_modes: providerModes(),
    overall_meter: analysis.overall.meter,
    listing_platform: listing.platform || "",
  });

  sendJson(response, 200, {
    ok: true,
    analysis,
    priceReference,
    reasoning,
    apiStatus: providerModes(),
  });
}

async function handleMessage(request, response) {
  const key = clientKey(request);
  const body = await readJson(request);
  const limit = limits.check("llm", key, config.limits.llmDaily);
  if (!limit.allowed) {
    const result = await llmProviderFallback().generateNegotiationMessage(body);
    sendJson(response, 200, {
      ok: true,
      fallback: true,
      statusMessage: "Daily LLM limit reached. Local message fallback was used.",
      ...result,
    });
    return;
  }

  try {
    const result = await llmProvider.generateNegotiationMessage(body);
    sendJson(response, 200, { ok: true, fallback: result.provider === "mock", ...result });
  } catch (error) {
    await logApiFailure("llm.message", error);
    const result = await llmProviderFallback().generateNegotiationMessage(body);
    sendJson(response, 200, {
      ok: true,
      fallback: true,
      statusMessage: "Live message generation failed. Local fallback was used.",
      ...result,
    });
  }
}

async function handleReport(request, response) {
  const key = clientKey(request);
  const body = await readJson(request);
  const { child = {}, listing = {}, analysis, email = "", message = "", recipientName = "", note = "" } = body;
  const emailLimit = limits.check("email", key, config.limits.emailDaily);
  const summary = await reportSummaryWithFallback(body);
  const report = buildReport({ child, listing, analysis, message, recipientName, note, summary });

  let emailResult;
  if (!emailLimit.allowed) {
    emailResult = {
      sent: false,
      provider: "limit fallback",
      message: "Daily email limit reached. Report preview was generated but not sent.",
      preview: report,
    };
  } else {
    try {
      emailResult = await emailProvider.sendReport({
        email,
        subject: "Mandy's Bike Finder report",
        report,
      });
    } catch (error) {
      await logApiFailure("email.send", error);
      emailResult = {
        sent: false,
        provider: "mock fallback",
        message: "Email sending failed. Report preview was generated instead.",
        preview: report,
      };
    }
  }

  await safeLog("report", reportMetadata({ child, listing, analysis, email }));
  sendJson(response, 200, { ok: true, report, emailResult, apiStatus: providerModes() });
}

async function getPriceReferenceWithControls(key, listing) {
  const cacheKey = normalizeListingQuery(listing);
  const cached = searchCache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true, message: `${cached.message} Cached result used.` };
  }

  const limit = limits.check("search", key, config.limits.searchDaily);
  if (!limit.allowed) {
    return localPriceReference(listing, "Daily live search limit reached. Using local estimate.");
  }

  try {
    const reference = await searchProvider.getPriceReference(listing);
    searchCache.set(cacheKey, reference);
    return reference;
  } catch (error) {
    await logApiFailure("search.reference", error);
    return localPriceReference(listing, "Live price check failed. Using local estimate.");
  }
}

async function reportSummaryWithFallback(body) {
  if (!config.featureFlags.llmAnalysis) return "";
  try {
    const limit = limits.check("llm", "global-report-summary", config.limits.llmDaily);
    if (!limit.allowed) return "";
    return (await llmProvider.generateReportSummary(body)).summary;
  } catch (error) {
    await logApiFailure("llm.reportSummary", error);
    return "";
  }
}

async function serveStatic(response, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(rootDir, safePath));
  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    await readFile(filePath);
  } catch {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "content-type": contentType(filePath) });
  createReadStream(filePath).pipe(response);
}

function contentType(filePath) {
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
  }[extname(filePath)] || "application/octet-stream";
}

function providerModes() {
  return {
    llm: llmProvider.mode,
    search: searchProvider.mode,
    email: emailProvider.mode,
    logging: loggingProvider.mode,
  };
}

async function logApiFailure(type, error) {
  console.warn(type, safeError(error));
  await safeLog("api_failure", { type, error: safeError(error) });
}

async function safeLog(type, payload) {
  try {
    await loggingProvider.logEvent(type, payload);
  } catch (error) {
    console.warn("logging failure", safeError(error));
  }
}

function llmProviderFallback() {
  return createLlmProvider({ ...config, featureFlags: { ...config.featureFlags, llmAnalysis: false } });
}

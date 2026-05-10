import { generateSellerMessage } from "../../src/analysis.js";

export class MockLlmProvider {
  constructor(reason) {
    this.mode = "mock";
    this.reason = reason;
  }

  async extractListingFields(text) {
    const priceMatch = text.match(/\$?\b(\d{2,4})\b/);
    const wheelMatch = text.match(/\b(12|14|16|18|20|24|26|27\.5)\s*(?:inch|in|")\b/i);
    const brandMatch = text.match(/\b(woom|trek|specialized|giant|cannondale|guardian|schwinn|mongoose|raleigh|diamondback|huffy|dynacraft|hyper|kent)\b/i);
    return {
      provider: this.mode,
      fallbackReason: this.reason,
      fields: {
        title: firstLine(text),
        askingPrice: priceMatch ? priceMatch[1] : "",
        brand: brandMatch ? capitalize(brandMatch[1]) : "",
        wheelSize: wheelMatch ? wheelMatch[1] : "",
        description: text,
      },
    };
  }

  async generateReasoning() {
    return { provider: this.mode, fallbackReason: this.reason, reasoning: "" };
  }

  async generateNegotiationMessage({ goal, tone, listing, options }) {
    return {
      provider: this.mode,
      fallbackReason: this.reason,
      message: generateSellerMessage(goal, tone, listing, options),
    };
  }

  async generateReportSummary({ listing, analysis }) {
    return {
      provider: this.mode,
      fallbackReason: this.reason,
      summary: `${listing.title || "This bike"} is rated ${analysis.overall.label}. ${analysis.overall.reasoning}`,
    };
  }
}

export class OpenAiLlmProvider {
  constructor({ apiKey, model }) {
    this.mode = "live";
    this.apiKey = apiKey;
    this.model = model;
  }

  async extractListingFields(text) {
    const content = await this.#chatJson([
      {
        role: "system",
        content:
          "Extract used kids bike listing fields. Return strict JSON with title, askingPrice, brand, model, wheelSize, bikeType, colorStyle, condition, description, platform, listingLink, location. Use empty strings when unknown.",
      },
      { role: "user", content: text },
    ]);
    return { provider: "openai", fields: content };
  }

  async generateReasoning({ child, listing, analysis }) {
    const content = await this.#chatText([
      {
        role: "system",
        content:
          "Write concise parent-friendly reasoning for a used kids bike analysis. Do not include numeric scores. Keep the red/yellow/green qualitative framing.",
      },
      { role: "user", content: JSON.stringify({ child, listing, analysis }) },
    ]);
    return { provider: "openai", reasoning: content };
  }

  async generateNegotiationMessage({ goal, tone, listing, options }) {
    const content = await this.#chatText([
      {
        role: "system",
        content:
          "Write one short natural seller message for a used kids bike listing. No markdown. Be concise.",
      },
      { role: "user", content: JSON.stringify({ goal, tone, listing, options }) },
    ]);
    return { provider: "openai", message: content };
  }

  async generateReportSummary({ child, listing, analysis, message }) {
    const content = await this.#chatText([
      {
        role: "system",
        content:
          "Summarize this used kids bike recommendation for an email report in 2-4 concise sentences. Include no numeric score.",
      },
      { role: "user", content: JSON.stringify({ child, listing, analysis, message }) },
    ]);
    return { provider: "openai", summary: content };
  }

  async #chatText(messages) {
    const json = await this.#request(messages);
    return json.choices?.[0]?.message?.content?.trim() || "";
  }

  async #chatJson(messages) {
    const text = await this.#chatText(messages);
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("LLM returned non-JSON extraction output.");
    }
  }

  async #request(messages) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.2,
      }),
    });
    if (!response.ok) {
      throw new Error(`LLM provider failed with ${response.status}`);
    }
    return response.json();
  }
}

export function createLlmProvider(config) {
  if (config.featureFlags.llmAnalysis && config.providers.openAiApiKey) {
    return new OpenAiLlmProvider({
      apiKey: config.providers.openAiApiKey,
      model: config.providers.openAiModel,
    });
  }
  return new MockLlmProvider("LLM analysis disabled or missing server-side API key.");
}

function firstLine(text) {
  return text.split(/\r?\n/).find((line) => line.trim())?.trim() || "";
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
}

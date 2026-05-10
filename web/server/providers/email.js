export class MockEmailProvider {
  constructor(reason) {
    this.mode = "mock";
    this.reason = reason;
  }

  async sendReport({ email, report }) {
    return {
      sent: false,
      provider: this.mode,
      fallbackReason: this.reason,
      message: "Email sending is disabled; report was simulated.",
      preview: report,
      email,
    };
  }
}

export class HttpEmailProvider {
  constructor({ apiKey, apiUrl, from }) {
    this.mode = "live";
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.from = from;
  }

  async sendReport({ email, subject, report }) {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        from: this.from,
        to: email,
        subject,
        text: report,
      }),
    });
    if (!response.ok) {
      throw new Error(`Email provider failed with ${response.status}`);
    }
    return {
      sent: true,
      provider: "live email",
      message: "Email report sent.",
      providerResponse: await response.json().catch(() => ({})),
    };
  }
}

export function createEmailProvider(config) {
  if (
    config.featureFlags.emailReport &&
    config.providers.emailApiKey &&
    config.providers.emailApiUrl &&
    config.providers.emailFrom
  ) {
    return new HttpEmailProvider({
      apiKey: config.providers.emailApiKey,
      apiUrl: config.providers.emailApiUrl,
      from: config.providers.emailFrom,
    });
  }
  return new MockEmailProvider("Email report disabled or missing server-side email configuration.");
}

import { NextResponse } from "next/server";

import { loadServerConfig } from "@/lib/server/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = loadServerConfig();
  return NextResponse.json({
    ok: true,
    featureFlags: config.featureFlags,
    providers: {
      llm: config.featureFlags.llmAnalysis && config.providers.openAiApiKey ? "openai" : "mock",
      search: "fallback",
      email: "mock",
      logging: "mock",
    },
    limits: config.limits,
  });
}

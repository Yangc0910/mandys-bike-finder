import type { AnalysisResult, ChildProfile, Listing } from "../types";

export function buildReport({
  child,
  listing,
  analysis,
  message,
  recipientName,
  note,
  summary,
}: {
  child: ChildProfile;
  listing: Listing;
  analysis: AnalysisResult;
  message?: string;
  recipientName?: string;
  note?: string;
  summary?: string;
}) {
  const recipient = recipientName ? `${recipientName},` : "Hi,";
  return `${recipient}

${summary || "Here is the bike listing report."}

Listing: ${listing.title || "Untitled listing"}
Link: ${listing.listingLink || "Not provided"}
Asking price: ${listing.askingPrice ? `$${listing.askingPrice}` : "Unknown"}
Child height: ${child.heightCm ? `${child.heightCm} cm entered` : "Not provided"}

Overall: ${analysis.overall.label}
${analysis.overall.reasoning}

Fit: ${analysis.dimensions.fit.label}
${analysis.dimensions.fit.reasoning}

Price: ${analysis.dimensions.price.label}
${analysis.dimensions.price.reasoning}

Condition: ${analysis.dimensions.condition.label}
${analysis.dimensions.condition.reasoning}

Brand: ${analysis.dimensions.brand.label}
${analysis.dimensions.brand.reasoning}

Color / kid appeal: ${analysis.dimensions.color.label}
${analysis.dimensions.color.reasoning}

Risk: ${analysis.dimensions.risk.label}
${analysis.dimensions.risk.reasoning}

Seller questions:
${analysis.sellerQuestions.map((question) => `- ${question}`).join("\n")}

Suggested message:
${message || "No suggested message generated yet."}

Note:
${note || "None"}

${analysis.disclaimer}`;
}

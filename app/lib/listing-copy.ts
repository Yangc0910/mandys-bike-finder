const MAX_LISTING_TITLE_LENGTH = 80;

export function normalizeListingTitle(value: unknown) {
  const firstLine = String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) return "";

  const compact = firstLine.replace(/\s+/g, " ");
  const sentenceEnd = compact.search(/[.!?](?=\s|$)/);
  const firstSentence = sentenceEnd >= 0 ? compact.slice(0, sentenceEnd) : compact;

  if (firstSentence.length <= MAX_LISTING_TITLE_LENGTH) {
    return trimTerminalPunctuation(firstSentence);
  }

  const shortened = firstSentence.slice(0, MAX_LISTING_TITLE_LENGTH + 1);
  const wordBoundary = shortened.lastIndexOf(" ");
  const bounded = wordBoundary >= 40 ? shortened.slice(0, wordBoundary) : shortened.slice(0, MAX_LISTING_TITLE_LENGTH);
  return trimTerminalPunctuation(bounded);
}

function trimTerminalPunctuation(value: string) {
  return value.trim().replace(/[\s.!?,;:]+$/g, "");
}

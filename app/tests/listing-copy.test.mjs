import assert from "node:assert/strict";
import test from "node:test";

import { normalizeListingTitle } from "../lib/listing-copy.ts";

test("uses the first sentence instead of the full pasted description", () => {
  assert.equal(
    normalizeListingTitle("Specialized kids bike $95 20 inch. Brakes work and tires hold air."),
    "Specialized kids bike $95 20 inch",
  );
});

test("limits unusually long listing titles at a word boundary", () => {
  const title = normalizeListingTitle(
    "A very long marketplace listing title for a carefully maintained children's bicycle with many extra details included",
  );

  assert.ok(title.length <= 80);
  assert.equal(title.endsWith(" "), false);
});

test("removes punctuation that would be duplicated in generated copy", () => {
  const title = normalizeListingTitle("20 inch Trek kids bike...");
  assert.equal(title, "20 inch Trek kids bike");
  assert.equal(`I'm interested in ${title}.`.includes(".."), false);
});

import assert from "node:assert/strict";
import test from "node:test";

import { mergeAppStoreSavedEvaluation } from "../lib/app-store-history.ts";

const analysis = {
  overall: { meter: "green", label: "Worth contacting", reasoning: "Looks good." },
  dimensions: {
    fit: { meter: "green", label: "Good size match", reasoning: "Fits." },
    price: { meter: "green", label: "Looks reasonable", reasoning: "Fair." },
    condition: { meter: "yellow", label: "Condition needs confirmation", reasoning: "Ask." },
    brand: { meter: "green", label: "Higher-quality brand", reasoning: "Known." },
    color: { meter: "green", label: "Neutral preference", reasoning: "Fine." },
    risk: { meter: "yellow", label: "Lower price confidence", reasoning: "Local." },
  },
  sellerQuestions: [],
  disclaimer: "Check the bike.",
};

const childSnapshot = {
  heightCm: "122",
  age: "7",
  experience: "beginner",
  stylePreference: "all good / no preference",
  colorPreferences: ["No preference / all colors are fine"],
};

function draft(overrides = {}) {
  return {
    listing: {
      title: "20 inch kids bike",
      askingPrice: "100",
      brand: "Trek",
      model: "Listing A",
      wheelSize: "20",
      bikeType: "",
      colorStyle: "",
      platform: "Facebook Marketplace",
      location: "Town A",
      condition: "",
      description: "",
      listingLink: "",
      ...overrides,
    },
    analysis,
    sellerMessage: "Hello",
    childNickname: "Mandy",
    childSnapshot,
    inputMode: "manual",
  };
}

test("keeps similar listings separate when model or location differs", () => {
  const first = mergeAppStoreSavedEvaluation([], draft(), {
    id: "first",
    now: "2026-06-13T12:00:00.000Z",
  });
  const second = mergeAppStoreSavedEvaluation(
    first.evaluations,
    draft({ model: "Listing B", location: "Town B" }),
    { id: "second", now: "2026-06-13T12:05:00.000Z" },
  );

  assert.equal(second.wasDuplicate, false);
  assert.equal(second.evaluations.length, 2);
  assert.equal(second.evaluations[0].listing.location, "Town B");
  assert.equal(second.evaluations[1].listing.location, "Town A");
});

test("moves an exact repeat to the top without creating another record", () => {
  const first = mergeAppStoreSavedEvaluation([], draft(), {
    id: "first",
    now: "2026-06-13T12:00:00.000Z",
  });
  const repeated = mergeAppStoreSavedEvaluation(first.evaluations, draft(), {
    id: "unused",
    now: "2026-06-13T12:05:00.000Z",
  });

  assert.equal(repeated.wasDuplicate, true);
  assert.equal(repeated.evaluations.length, 1);
  assert.equal(repeated.evaluation.id, "first");
  assert.equal(repeated.evaluation.savedAt, "2026-06-13T12:05:00.000Z");
});

import assert from "node:assert/strict";
import test from "node:test";

import {
  appText,
  localizeAnalysisResult,
  resolveAppLocale,
} from "../lib/app-store-i18n.ts";

test("uses a saved locale before the device language", () => {
  assert.equal(resolveAppLocale("en", "zh-CN"), "en");
  assert.equal(resolveAppLocale("zh-Hans", "en-US"), "zh-Hans");
});

test("defaults Chinese devices to Simplified Chinese", () => {
  assert.equal(resolveAppLocale(null, "zh-CN"), "zh-Hans");
  assert.equal(resolveAppLocale(null, "en-US"), "en");
});

test("translates core navigation and analysis output", () => {
  const result = {
    overall: {
      meter: "green",
      label: "Worth contacting",
      reasoning: "This appears to be a strong candidate based on the confirmed details.",
    },
    dimensions: {
      fit: {
        meter: "green",
        label: "Good size match",
        reasoning: "20 inch matches the current recommendation of 20 inch. 20 inch is the safer starting point for this height range.",
      },
      price: {
        meter: "green",
        label: "Looks reasonable",
        reasoning: "Estimated new range is $240-$480. At $100, this may be reasonable if condition is good.",
      },
      condition: { meter: "yellow", label: "Condition needs confirmation", reasoning: "Ask about brakes." },
      brand: { meter: "green", label: "Higher-quality brand", reasoning: "Trek is generally a stronger kids bike brand if the condition is good." },
      color: { meter: "green", label: "Neutral preference", reasoning: "No strong style preference is set, so color is unlikely to block the decision." },
      risk: { meter: "yellow", label: "Lower price confidence", reasoning: "Price estimate uses local fallback ranges, not live retailer search." },
    },
    sellerQuestions: ["Do the brakes work well, do the tires hold air, and is the chain in good shape?"],
    disclaimer: "English disclaimer",
  };

  const localized = localizeAnalysisResult("zh-Hans", result);
  assert.equal(appText("zh-Hans", "History"), "历史");
  assert.equal(localized.overall.label, "值得联系卖家");
  assert.equal(localized.dimensions.fit.label, "尺寸匹配良好");
  assert.match(localized.dimensions.price.reasoning, /新品价格/);
  assert.match(localized.sellerQuestions[0], /刹车/);
});

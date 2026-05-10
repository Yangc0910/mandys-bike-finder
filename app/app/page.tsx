"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import { analyzeBike, generateSellerMessage, localPriceReference, recommendWheelSize } from "@/lib/analysis";
import type { AnalysisResult, ChildProfile, Listing, MeterResult, ProviderModes } from "@/lib/types";

const defaultChild: ChildProfile = {
  heightCm: "",
  age: "",
  weight: "",
  experience: "comfortable",
  stylePreference: "all good / no preference",
  colorPreferences: ["No preference / all colors are fine"],
};

const defaultListing: Listing = {
  listingLink: "",
  title: "",
  askingPrice: "",
  brand: "",
  model: "",
  wheelSize: "",
  bikeType: "",
  colorStyle: "",
  platform: "",
  location: "",
  description: "",
};

const colorPreferenceOptions = [
  "No preference / all colors are fine",
  "pink / purple",
  "blue / green",
  "red / orange",
  "black / white / neutral",
  "bright colors",
  "mature / simple style",
] as const;

export default function Home() {
  const [child, setChild] = useState<ChildProfile>(defaultChild);
  const [listing, setListing] = useState<Listing>(defaultListing);
  const [inputMode, setInputMode] = useState("screenshot");
  const [listingSource, setListingSource] = useState("Not set");
  const [pastedText, setPastedText] = useState("");
  const [screenshotName, setScreenshotName] = useState("");
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isExtractingScreenshot, setIsExtractingScreenshot] = useState(false);
  const [isExtractingLink, setIsExtractingLink] = useState(false);
  const [screenshotNotice, setScreenshotNotice] = useState("");
  const [linkNotice, setLinkNotice] = useState("");
  const [hasTriedCraigslistAutoExtract, setHasTriedCraigslistAutoExtract] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft-in">("cm");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [heightCmInput, setHeightCmInput] = useState("");
  const [weightUnit, setWeightUnit] = useState<"lb" | "kg">("lb");
  const [weightInput, setWeightInput] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analyzedSignature, setAnalyzedSignature] = useState("");
  const [status, setStatus] = useState("Local fallback ready");
  const [providerModes, setProviderModes] = useState<ProviderModes | null>(null);
  const [messageGoal, setMessageGoal] = useState("lowerOffer");
  const [messageTone, setMessageTone] = useState("friendly");
  const [targetOffer, setTargetOffer] = useState("50");
  const [pickupTiming, setPickupTiming] = useState("today or tomorrow");
  const [offerReason, setOfferReason] = useState("can pick up today");
  const [sellerMessage, setSellerMessage] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [reportPreview, setReportPreview] = useState("");
  const [showProfileRecommendation, setShowProfileRecommendation] = useState(false);
  const [profileRecommendation, setProfileRecommendation] = useState<ChildBikeRecommendation | null>(null);
  const [profileRecommendationSignature, setProfileRecommendationSignature] = useState("");

  const normalizedChild = useMemo(() => {
    const normalizedHeightCm = heightUnit === "cm" ? heightCmInput : feetInchesToCm(heightFeet, heightInches);
    const normalizedWeightKg = weightInput ? (weightUnit === "lb" ? lbToKg(weightInput) : toFixed(weightInput, 1)) : "";
    return { ...child, heightCm: normalizedHeightCm, weight: normalizedWeightKg };
  }, [child, heightCmInput, heightFeet, heightInches, heightUnit, weightInput, weightUnit]);

  const localAnalysis = useMemo(() => analyzeBike(normalizedChild, listing, localPriceReference(listing)), [normalizedChild, listing]);
  const visibleAnalysis = analysis || localAnalysis;
  const inputSignature = useMemo(
    () => JSON.stringify({ child: normalizedChild, listing, pastedText, screenshotName }),
    [normalizedChild, listing, pastedText, screenshotName],
  );
  const hasHeight = Boolean((normalizedChild.heightCm || "").trim());
  const hasAgeForRecommendation = Boolean((normalizedChild.age || "").trim());
  const hasExperience = Boolean((normalizedChild.experience || "").trim());
  const hasCoreListing = Boolean((listing.wheelSize || "").trim() || (listing.title || "").trim() || pastedText.trim());
  const hasAnyListingField = Boolean(
    (listing.title || "").trim() ||
      (listing.askingPrice || "").trim() ||
      (listing.brand || "").trim() ||
      (listing.model || "").trim() ||
      (listing.wheelSize || "").trim() ||
      (listing.bikeType || "").trim() ||
      (listing.colorStyle || "").trim() ||
      (listing.platform || "").trim() ||
      (listing.description || "").trim(),
  );
  const hasScreenshotManualListing = Boolean(screenshotName && hasAnyListingField);
  const canAnalyze = hasHeight && hasExperience && (hasCoreListing || hasScreenshotManualListing);
  const needsRerun = hasAnalyzed && analyzedSignature !== inputSignature;
  const showAnalysisResults = hasAnalyzed && !needsRerun;
  const profileSignature = useMemo(
    () => JSON.stringify({
      heightCm: normalizedChild.heightCm,
      age: normalizedChild.age,
      weight: normalizedChild.weight,
      experience: normalizedChild.experience,
      stylePreference: normalizedChild.stylePreference,
      colorPreferences: normalizedChild.colorPreferences,
    }),
    [normalizedChild.heightCm, normalizedChild.age, normalizedChild.weight, normalizedChild.experience, normalizedChild.stylePreference, normalizedChild.colorPreferences],
  );
  const needsProfileRecommendationRerun = showProfileRecommendation && profileRecommendationSignature !== profileSignature;
  const profileRecommendationImage = profileRecommendation ? resolveBikeTypeImage(profileRecommendation.category, profileRecommendation.illustrationHint) : "";
  const analyzeDisabledReason = !hasHeight || !hasExperience
    ? "Enter child height and riding experience."
    : !hasCoreListing && !hasScreenshotManualListing
      ? "Please add listing text, screenshot extraction, or key bike details before analyzing."
      : "";
  const linkValue = (listing.listingLink || "").trim();
  const lowerLinkValue = linkValue.toLowerCase();
  const isCraigslistLink = lowerLinkValue.includes("craigslist.org");
  const isFacebookMarketplaceLink = lowerLinkValue.includes("facebook.com/marketplace");
  const isOtherMarketplaceLikeLink = Boolean(linkValue) && !isCraigslistLink && !isFacebookMarketplaceLink;

  useEffect(() => {
    apiGet("/api/status").then((result) => {
      if (result?.providers) {
        setProviderModes(result.providers);
        setStatus(providerStatusText(result.providers));
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      if (screenshotPreviewUrl) URL.revokeObjectURL(screenshotPreviewUrl);
    };
  }, [screenshotPreviewUrl]);

  useEffect(() => {
    if (!linkValue || !isCraigslistLink || !isLikelyHttpUrl(linkValue)) return;
    if (hasTriedCraigslistAutoExtract === linkValue) return;
    setHasTriedCraigslistAutoExtract(linkValue);
    void extractCraigslistLink(linkValue);
  }, [hasTriedCraigslistAutoExtract, isCraigslistLink, linkValue]);

  function updateListingField<K extends keyof Listing>(field: K, value: Listing[K], source = "manual entry") {
    setListing((current) => ({ ...current, [field]: value }));
    setListingSource((current) => {
      if (source !== "manual entry") return source;
      if (current === "link only") return "link + manual edits";
      if (current === "Craigslist link extraction") return "Craigslist link extraction + manual edits";
      if (current === "screenshot") return "screenshot + manual edits";
      if (current === "screenshot AI extraction") return "screenshot AI extraction + manual edits";
      return "manual entry";
    });
  }

  function toggleColorPreference(option: string) {
    setChild((current) => {
      const values = current.colorPreferences || [];
      if (option === "No preference / all colors are fine") {
        return { ...current, colorPreferences: ["No preference / all colors are fine"] };
      }
      const next = values.filter((value) => value !== "No preference / all colors are fine");
      if (next.includes(option)) {
        const filtered = next.filter((value) => value !== option);
        return { ...current, colorPreferences: filtered.length ? filtered : ["No preference / all colors are fine"] };
      }
      return { ...current, colorPreferences: [...next, option] };
    });
  }

  async function extractPastedText() {
    if (!pastedText.trim()) return;
    const result = await apiPost("/api/extract", { text: pastedText });
    const fields = result?.result?.fields || localExtract(pastedText);
    setListing((current) => ({ ...current, ...compactFields(fields) }));
    setListingSource("pasted text AI extraction");
    setScreenshotNotice("");
    setStatus(result?.statusMessage || providerStatusText(result?.apiStatus || providerModes) || "Listing fields extracted.");
  }

  function handleInputModeChange(mode: string) {
    setInputMode(mode);
    setScreenshotNotice("");
    setLinkNotice("");
  }

  async function analyze(event: FormEvent) {
    event.preventDefault();
    if (!canAnalyze) return;
    const result = await apiPost("/api/analyze", { child: normalizedChild, listing });
    const nextAnalysis = result?.analysis || analyzeBike(normalizedChild, listing, localPriceReference(listing));
    setAnalysis(nextAnalysis);
    setHasAnalyzed(true);
    setAnalyzedSignature(inputSignature);
    setStatus(result?.priceReference?.message || providerStatusText(result?.apiStatus || providerModes) || "Analysis complete.");
    setSellerMessage(await generateMessage("lowerOffer", "friendly", listing, false));
  }

  async function extractScreenshotDetails() {
    if (!screenshotFile) return;
    if (screenshotFile.size > 5 * 1024 * 1024) {
      setScreenshotNotice("Screenshot file is too large. Please upload an image under 5 MB.");
      return;
    }
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(screenshotFile.type)) {
      setScreenshotNotice("Unsupported screenshot format. Please upload jpg, jpeg, png, or webp.");
      return;
    }

    setIsExtractingScreenshot(true);
    try {
      const prepared = await prepareScreenshotForExtraction(screenshotFile);
      const result = await apiPost("/api/extract", {
        imageDataUrl: prepared.dataUrl,
        imageMimeType: prepared.mimeType,
        imageSizeBytes: prepared.sizeBytes,
      });
      if (result?.result?.fields) {
        setListing((current) => ({ ...current, ...compactFields(result.result.fields) }));
        setListingSource("screenshot AI extraction");
        setScreenshotNotice(
          `AI extraction complete${result?.result?.confidence ? ` (${result.result.confidence} confidence)` : ""}. Please confirm and edit any unclear fields.`,
        );
      } else {
        setScreenshotNotice(
          result?.statusMessage || "AI extraction could not read enough listing details. Please enter the details manually.",
        );
      }
      setStatus(result?.statusMessage || providerStatusText(result?.apiStatus || providerModes) || "Screenshot extraction complete.");
    } catch {
      setScreenshotNotice("AI extraction could not read enough listing details. Please enter the details manually.");
    } finally {
      setIsExtractingScreenshot(false);
    }
  }

  async function extractCraigslistLink(inputUrl?: string) {
    const url = (inputUrl || listing.listingLink || "").trim();
    if (!url) return;
    setIsExtractingLink(true);
    try {
      const result = await apiPost("/api/extract-link", { url });
      if (result?.result?.fields) {
        setListing((current) => ({ ...current, ...compactFields(result.result.fields) }));
        setListingSource("Craigslist link extraction");
        setLinkNotice("Craigslist listing details were extracted. Please confirm and edit any missing fields.");
        setStatus(result?.cached ? "Craigslist details loaded from cache." : "Craigslist extraction complete.");
      } else {
        const message = result?.statusMessage || "We could not read this Craigslist listing automatically. Please paste the listing text or upload a screenshot.";
        setLinkNotice(message);
        setStatus(message);
      }
    } catch {
      const message = "We could not read this Craigslist listing automatically. Please paste the listing text or upload a screenshot.";
      setLinkNotice(message);
      setStatus(message);
    } finally {
      setIsExtractingLink(false);
    }
  }

  async function generateMessage(goal = messageGoal, tone = messageTone, currentListing = listing, updateStatus = true) {
    const payload = {
      goal,
      tone,
      listing: currentListing,
      options: { targetOffer, pickupTiming, reason: offerReason },
    };
    const result = await apiPost("/api/message", payload);
    if (updateStatus) setStatus(result?.statusMessage || providerStatusText(result?.apiStatus || providerModes) || "Message generated.");
    return result?.message || generateSellerMessage(goal, tone, currentListing, payload.options);
  }

  async function previewReport() {
    const currentAnalysis = analysis || localAnalysis;
    const payload = {
      child: normalizedChild,
      listing,
      analysis: currentAnalysis,
      email: reportEmail,
      message: sellerMessage,
      recipientName,
      note: reportNote,
    };
    const result = await apiPost("/api/report", payload);
    if (result?.report) {
      setReportPreview(`${result.emailResult?.message || "Report generated."}\n\n${result.report}`);
      setStatus(result.emailResult?.message || "Report generated.");
      return;
    }
    setReportPreview(localReport(payload));
    setStatus("Report preview generated locally.");
  }

  function recommendFromChildProfile() {
    if (!hasHeight || !hasExperience) return;
    setProfileRecommendation(buildChildBikeRecommendation(normalizedChild));
    setProfileRecommendationSignature(profileSignature);
    setShowProfileRecommendation(true);
  }

  return (
    <main className="min-h-screen bg-slate-50/70 px-4 py-5 md:px-6 md:py-7">
      <section className="mx-auto max-w-[1320px]">
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-amber-50/35 to-blue-50/30 shadow-[0_18px_45px_-22px_rgba(15,23,42,0.35)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(59,130,246,0.12),transparent_42%),radial-gradient(circle_at_36%_72%,rgba(251,191,36,0.10),transparent_46%)]" />
          <div className="relative grid items-stretch md:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-10 p-6 md:p-9">
              <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand backdrop-blur-sm">
                Mandy&apos;s Bike Finder
              </span>
              <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.08] tracking-[-0.01em] text-slate-900 md:text-[2.8rem]">
                Find the{" "}
                <span className="bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                  right used kids bike
                </span>{" "}
                before you message the seller
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
                Check fit, price, condition, brand, and kid appeal in one simple flow.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {["Fit for your child", "Deal quality", "Seller message help"].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-100/90 bg-white/85 px-3.5 py-1.5 text-sm font-semibold text-blue-700 shadow-[0_6px_18px_-14px_rgba(59,130,246,0.55)] backdrop-blur-sm"
                  >
                    <span className="text-[11px]">✓</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative min-h-[220px] md:min-h-[280px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/mandy-bike-hero.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/94 via-white/64 via-34% to-white/8 md:bg-gradient-to-r md:from-white/88 md:via-white/26 md:to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_76%_45%,transparent_44%,rgba(15,23,42,0.1)_100%)]" />
            </div>
          </div>
        </div>

        <form onSubmit={analyze} className="mb-6 grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
              <SectionTitle step="1" title="Child profile" />
              <div className="grid gap-3 md:grid-cols-2">
              <Field label="Height" required>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <select className={inputClass} value={heightUnit} onChange={(e) => setHeightUnit(e.target.value as "cm" | "ft-in")}>
                    <option value="cm">cm</option>
                    <option value="ft-in">ft-in</option>
                  </select>
                  {heightUnit === "cm" ? (
                    <input className={inputClass} type="number" min="80" max="220" placeholder="Height value" value={heightCmInput} onChange={(e) => setHeightCmInput(e.target.value)} />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputClass} type="number" min="2" max="7" placeholder="feet" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
                      <input className={inputClass} type="number" min="0" max="11" placeholder="inches" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} />
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Age" required>
                <input className={inputClass} type="number" placeholder="Age" value={child.age} onChange={(e) => setChild({ ...child, age: e.target.value })} />
              </Field>
              <Field label="Weight" optional>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <select className={inputClass} value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as "lb" | "kg")}>
                    <option value="lb">lb</option>
                    <option value="kg">kg</option>
                  </select>
                  <input className={inputClass} type="number" placeholder="Weight value" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
                </div>
              </Field>
              <Field label="Riding experience" required>
                <select className={inputClass} value={child.experience} onChange={(e) => setChild({ ...child, experience: e.target.value as ChildProfile["experience"] })}>
                  <option value="beginner">Beginner</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="confident">Confident</option>
                  <option value="advanced">Advanced</option>
                </select>
              </Field>
              <Field label="Style preference" optional>
                <select className={inputClass} value={child.stylePreference} onChange={(e) => setChild({ ...child, stylePreference: e.target.value })}>
                  <option value="all good / no preference">All good / no preference</option>
                  <option value="boy-style">Boy-style</option>
                  <option value="girl-style">Girl-style</option>
                </select>
              </Field>
              <Field label="Color preference" optional>
                <div className="grid min-h-[102px] gap-2 rounded-md border border-slate-300 bg-slate-50 p-2">
                  {colorPreferenceOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm font-normal text-slate-700">
                      <input
                        type="checkbox"
                        checked={child.colorPreferences.includes(option)}
                        onChange={() => toggleColorPreference(option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </Field>
              </div>
              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={recommendFromChildProfile}
                  disabled={!hasHeight || !hasAgeForRecommendation || !hasExperience}
                  className="min-h-11 rounded-md bg-blue-50 px-4 text-left font-bold text-brand disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Recommend bike type and size
                </button>
                {(!hasHeight || !hasAgeForRecommendation || !hasExperience) && (
                  <p className="text-sm text-slate-600">Enter height, age, and riding experience to get a bike recommendation.</p>
                )}
              </div>
              {showProfileRecommendation && profileRecommendation && (
                <article className="mt-4 rounded-lg border border-blue-200 bg-blue-50/40 p-4 shadow-panel">
                  {needsProfileRecommendationRerun && (
                    <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700">
                      Child profile changed. Re-run recommendation.
                    </p>
                  )}
                  <h3 className="text-lg font-bold text-slate-900">Child profile recommendation</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <InfoLine label="Recommended bike type" value={profileRecommendation.category} />
                    <InfoLine label="Recommended wheel size" value={profileRecommendation.wheelSize} />
                    <InfoLine label="Growth option" value={profileRecommendation.growthOption || "No growth option needed now"} />
                    <InfoLine label="Bike style recommendation" value={profileRecommendation.styleRecommendation || "Use fit-first neutral styling"} />
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{profileRecommendation.explanation}</p>
                  {profileRecommendation.optionalNotes.length > 0 && (
                    <div className="mt-2 rounded-md border border-slate-200 bg-white p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Optional personalization notes</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {profileRecommendation.optionalNotes.map((note) => <li key={note}>{note}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-md border border-slate-200 bg-white p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">What to look for</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {profileRecommendation.lookFor.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">What to avoid</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {profileRecommendation.avoid.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg border border-blue-200 bg-white/90 p-4 text-sm text-slate-600">
                    {profileRecommendationImage ? (
                      <div className="grid gap-3">
                        <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                          <img
                            src={profileRecommendationImage}
                            alt={`${profileRecommendation.category} illustration`}
                            className="h-auto w-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{profileRecommendation.category} illustration</p>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-800">Bike type illustration coming later</p>
                        <p className="mt-1">Future illustration: {profileRecommendation.illustrationHint}</p>
                      </>
                    )}
                  </div>
                </article>
              )}
            </section>

            <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
            <SectionTitle step="2" title="Listing input" />
            <div className="mb-4 grid grid-cols-3 gap-2">
              {["screenshot", "link", "manual"].map((mode) => (
                <button key={mode} type="button" onClick={() => handleInputModeChange(mode)} className={`min-h-11 rounded-md border font-bold ${inputMode === mode ? "border-brand bg-brand text-white" : "border-line bg-slate-50"}`}>
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            {inputMode === "link" && (
              <div className="mb-5 grid gap-3">
                <Field label="Listing link">
                  <input
                    className={inputClass}
                    type="url"
                    placeholder="https://www.facebook.com/marketplace/item/... or Craigslist URL"
                    value={listing.listingLink}
                    onChange={(e) => {
                      const value = e.target.value;
                      const lower = value.toLowerCase();
                      const platform = lower.includes("craigslist.org")
                        ? "Craigslist"
                        : lower.includes("facebook.com/marketplace")
                          ? "Facebook Marketplace"
                          : "";
                      setListing((current) => ({ ...current, listingLink: value, platform: platform || current.platform || "" }));
                      setLinkNotice("");
                      if (!lower.includes("craigslist.org")) {
                        setHasTriedCraigslistAutoExtract("");
                      }
                      setListingSource((current) => {
                        if (!value.trim()) return current === "link only" ? "Not set" : current;
                        if (current === "Not set") return "link only";
                        return current;
                      });
                    }}
                  />
                </Field>
                <Field label="Pasted listing text">
                  <textarea className={inputClass} rows={4} placeholder="Paste title, price, description, or seller text" value={pastedText} onChange={(e) => setPastedText(e.target.value)} onBlur={extractPastedText} />
                </Field>
                <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-slate-700">
                  AI-assisted extraction supports pasted listing text. You can also use screenshot extraction in screenshot mode.
                </p>
                {isFacebookMarketplaceLink && (
                  <p className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-slate-700">
                    Facebook Marketplace links usually cannot be read directly. Please upload a screenshot or paste the listing text for AI-assisted extraction.
                  </p>
                )}
                {isOtherMarketplaceLikeLink && (
                  <p className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-slate-700">
                    This link will be saved as a reference. For analysis, please paste listing text, upload a screenshot, or enter key details manually.
                  </p>
                )}
                {isCraigslistLink && (
                  <>
                    <button
                      type="button"
                      onClick={() => void extractCraigslistLink()}
                      disabled={isExtractingLink}
                      className="min-h-11 rounded-md bg-blue-50 px-4 font-bold text-brand disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isExtractingLink ? "Extracting Craigslist link..." : "Extract details from Craigslist link"}
                    </button>
                    {linkNotice && (
                      <p className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">{linkNotice}</p>
                    )}
                  </>
                )}
              </div>
            )}
            {inputMode === "screenshot" && (
              <div className="mb-5 grid gap-3">
                <Field label="Listing screenshot">
                  <input className={inputClass} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(event) => {
                    const file = event.target.files?.[0];
                    const nextName = file?.name || "";
                    setScreenshotName(nextName);
                    setScreenshotFile(file || null);
                    if (!nextName) return;
                    if (screenshotPreviewUrl) URL.revokeObjectURL(screenshotPreviewUrl);
                    setScreenshotPreviewUrl(URL.createObjectURL(file as Blob));
                    setListing(defaultListing);
                    setListingSource("screenshot");
                    setScreenshotNotice("Screenshot uploaded. You can extract listing details with AI or enter them manually.");
                  }} />
                </Field>
                <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 text-muted">
                  {screenshotPreviewUrl ? (
                    <div className="grid w-full gap-2">
                      <div className="grid h-44 place-items-center overflow-hidden rounded-md border border-slate-200 bg-white">
                        <img src={screenshotPreviewUrl} alt="Uploaded listing screenshot preview" className="max-h-full max-w-full object-contain" />
                      </div>
                      <p className="text-xs text-slate-600">{screenshotName}</p>
                    </div>
                  ) : (
                    <span>No image selected</span>
                  )}
                </div>
                {screenshotNotice && (
                  <p className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-slate-700">
                    {screenshotNotice}
                  </p>
                )}
                <button
                  className="min-h-11 rounded-md bg-blue-50 px-4 font-bold text-brand disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={!screenshotFile || isExtractingScreenshot}
                  onClick={extractScreenshotDetails}
                >
                  {isExtractingScreenshot ? "Extracting..." : "Extract listing details from screenshot"}
                </button>
                <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-slate-700">
                  Screenshot uploaded. You can extract listing details with AI or enter them manually.
                </p>
              </div>
            )}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs text-muted">Source: {listingSource}</span>
            </div>

            <SectionTitle step="3" title="Confirm listing fields" />
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Title" wide>
                <input className={inputClass} value={listing.title} onChange={(e) => updateListingField("title", e.target.value)} />
              </Field>
              <Field label="Asking price">
                <input className={inputClass} type="number" value={listing.askingPrice} onChange={(e) => updateListingField("askingPrice", e.target.value)} />
              </Field>
              <Field label="Brand">
                <input className={inputClass} value={listing.brand} onChange={(e) => updateListingField("brand", e.target.value)} />
              </Field>
              <Field label="Model">
                <input className={inputClass} value={listing.model} onChange={(e) => updateListingField("model", e.target.value)} />
              </Field>
              <Field label="Wheel size">
                <select className={inputClass} value={listing.wheelSize} onChange={(e) => updateListingField("wheelSize", e.target.value)}>
                  <option value="">Unknown</option>
                  {["12", "14", "16", "18", "20", "24", "26", "27.5"].map((size) => (
                    <option key={size} value={size}>{size} inch</option>
                  ))}
                </select>
              </Field>
              <Field label="Bike type">
                <input className={inputClass} value={listing.bikeType} onChange={(e) => updateListingField("bikeType", e.target.value)} />
              </Field>
              <Field label="Color/style">
                <input className={inputClass} value={listing.colorStyle} onChange={(e) => updateListingField("colorStyle", e.target.value)} />
              </Field>
              <Field label="Platform">
                <input className={inputClass} value={listing.platform} onChange={(e) => updateListingField("platform", e.target.value)} />
              </Field>
              <Field label="Condition / description" wide>
                <textarea className={inputClass} rows={4} value={listing.description} onChange={(e) => updateListingField("description", e.target.value)} />
              </Field>
            </div>
            </section>
          </div>
          <div className="grid gap-2">
            <button
              className="min-h-12 w-full rounded-md bg-brand px-4 font-bold text-white shadow-panel disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-64"
              type="submit"
              disabled={!canAnalyze}
            >
              Analyze bike
            </button>
            {!canAnalyze && <p className="text-sm text-slate-600">{analyzeDisabledReason}</p>}
            {canAnalyze && (
              <p className="text-xs text-slate-500">
                Best results include asking price, brand, and condition details.
              </p>
            )}
          </div>
        </form>

        {showAnalysisResults ? (
          <section className="grid gap-4">
            <BikeSizeRecommendation child={normalizedChild} />
            <div className="grid min-h-40 grid-cols-[72px_1fr] items-center gap-5 rounded-lg border border-line bg-white p-6 shadow-panel">
              <div className={`h-16 w-16 rounded-full border-8 ${meterSignal(visibleAnalysis.overall.meter)}`} />
              <div>
                <p className="mb-1 text-xs font-bold uppercase text-muted">Overall</p>
                <h2 className="text-3xl font-bold md:text-4xl">{visibleAnalysis.overall.label}</h2>
                <p className="mt-2 text-muted">{visibleAnalysis.overall.reasoning}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {dimensionCards(visibleAnalysis).map(([name, item]) => <DimensionCard key={name} name={name} item={item} />)}
            </div>

            <PanelTitle step="4" title="Seller questions">
              <ul className="list-disc space-y-2 pl-5 text-slate-700">
                {visibleAnalysis.sellerQuestions.map((question) => <li key={question}>{question}</li>)}
              </ul>
            </PanelTitle>

            <PanelTitle step="5" title="Negotiation Boost">
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <Field label="Goal"><select className={inputClass} value={messageGoal} onChange={(e) => setMessageGoal(e.target.value)}><option value="askAvailability">Ask if still available</option><option value="askQuestions">Ask key questions</option><option value="lowerOffer">Make a lower offer</option><option value="confirmPickup">Confirm pickup time</option><option value="walkAway">Walk away politely</option></select></Field>
                <Field label="Tone"><select className={inputClass} value={messageTone} onChange={(e) => setMessageTone(e.target.value)}><option>friendly</option><option>concise</option><option>very polite</option><option>firm but respectful</option></select></Field>
                <Field label="Target offer"><input className={inputClass} type="number" value={targetOffer} onChange={(e) => setTargetOffer(e.target.value)} /></Field>
                <Field label="Pickup timing"><input className={inputClass} value={pickupTiming} onChange={(e) => setPickupTiming(e.target.value)} /></Field>
              </div>
              <button className="mb-3 min-h-11 rounded-md bg-blue-50 px-4 font-bold text-brand" type="button" onClick={async () => setSellerMessage(await generateMessage())}>Need a negotiation boost?</button>
              <textarea className={inputClass} rows={4} value={sellerMessage} onChange={(e) => setSellerMessage(e.target.value)} />
            </PanelTitle>

            <PanelTitle step="6" title="Email report">
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <Field label="Email"><input className={inputClass} type="email" value={reportEmail} onChange={(e) => setReportEmail(e.target.value)} placeholder="parent@example.com" /></Field>
                <Field label="Recipient name"><input className={inputClass} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Optional" /></Field>
                <Field label="Note" wide><textarea className={inputClass} rows={3} value={reportNote} onChange={(e) => setReportNote(e.target.value)} placeholder="Optional" /></Field>
              </div>
              <button className="mb-3 min-h-11 rounded-md bg-blue-50 px-4 font-bold text-brand" type="button" onClick={previewReport}>Email this report</button>
              <pre className="min-h-32 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-700">{reportPreview}</pre>
            </PanelTitle>
          </section>
        ) : needsRerun ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-slate-700 shadow-panel">
            <p className="font-semibold">Update inputs and re-run analysis</p>
            <p className="mt-1">
              Your child or listing details changed after the last result. Run Analyze again to refresh the recommendation.
            </p>
          </section>
        ) : (
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-lg text-brand">i</div>
              <div>
                <p className="text-base font-semibold text-slate-900">Add your child&apos;s details and a bike listing to get a recommendation.</p>
                <p className="mt-1 text-sm text-slate-600">
                  We&apos;ll check fit, price, condition, brand, kid appeal, and seller questions once enough information is provided.
                </p>
              </div>
            </div>
          </section>
        )}
        <details className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-panel">
          <summary className="cursor-pointer font-semibold text-slate-700">Beta status</summary>
          <p className="mt-2">{status}</p>
        </details>
      </section>
    </main>
  );
}

function BikeSizeRecommendation({ child }: { child: ChildProfile }) {
  const result = recommendWheelSize(child.heightCm, child.experience);
  const details = buildSizeRecommendationDetails(child.heightCm, child.experience, result);
  return (
    <article className="rounded-lg border border-blue-200 bg-blue-50/50 p-5 shadow-panel">
      <h2 className="text-xl font-bold text-slate-900">Recommended bike size</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <InfoLine label="Best size now" value={details.bestSizeNow} />
        <InfoLine label="Growth option" value={details.growthOption} />
        <InfoLine label="Size caution" value={details.caution} />
      </div>
      <p className="mt-3 text-sm text-slate-700">{details.reasoning}</p>
    </article>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-blue-100 bg-white px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function buildSizeRecommendationDetails(
  heightCm: string,
  experience: string,
  recommendation: { recommended: string; note: string },
) {
  const height = Number(heightCm || 0);
  if (!height) {
    return {
      bestSizeNow: "Add height",
      growthOption: "Unknown",
      caution: "Need child height",
      reasoning: "Enter child height and riding experience to estimate the safest bike size.",
    };
  }

  if (height >= 145 && height < 155 && experience === "comfortable") {
    return {
      bestSizeNow: "24 inch",
      growthOption: "26 inch if confident and able to test ride safely",
      caution: "Do not size up without test ride",
      reasoning: "24 inch is easier to control now; 26 inch may offer more growth room but should be test-ridden.",
    };
  }

  const recommended = recommendation.recommended || "Unknown";
  const alternatives = recommended.includes("/") ? recommended.split("/").map((item) => `${item.trim()} inch`) : [];
  const bestSizeNow = alternatives[0] || recommended;
  const growthOption = alternatives[1] || "No clear growth alternative";
  return {
    bestSizeNow,
    growthOption,
    caution: recommendation.note.includes("test ride") ? "Test ride is recommended before pickup" : "Confirm wheel size with seller",
    reasoning: recommendation.note,
  };
}

type ChildBikeRecommendation = {
  category: string;
  wheelSize: string;
  growthOption: string;
  styleRecommendation: string;
  explanation: string;
  optionalNotes: string[];
  lookFor: string[];
  avoid: string[];
  illustrationHint: string;
};

function buildChildBikeRecommendation(child: ChildProfile): ChildBikeRecommendation {
  const height = Number(child.heightCm || 0);
  const age = Number(child.age || 0);
  const experience = child.experience;
  const stylePreference = child.stylePreference || "all good / no preference";
  const weightKg = Number(child.weight || 0);
  const colorPreferences = child.colorPreferences || [];

  let baseWheel = 12;
  if (height < 95) baseWheel = 12;
  else if (height < 105) baseWheel = 14;
  else if (height < 115) baseWheel = 16;
  else if (height < 125) baseWheel = 18;
  else if (height < 145) baseWheel = 20;
  else if (height < 155) baseWheel = 24;
  else baseWheel = 26;

  // Age sanity checks as secondary adjustment
  if (age > 0) {
    if (age <= 4) baseWheel = Math.min(baseWheel, 14);
    else if (age <= 6) baseWheel = Math.min(baseWheel, 16);
    else if (age <= 8) baseWheel = Math.min(baseWheel, 20);
  }

  let category = "Standard kids bike";
  if (experience === "beginner") {
    if (height < 105 || age <= 5) category = "Balance bike";
    else if (height < 120 || age <= 7) category = "Training wheels bike";
    else category = "Standard kids bike";
  } else if (experience === "comfortable") {
    category = baseWheel >= 24 ? "Kids cruiser bike" : "Standard kids bike";
  } else {
    category = baseWheel >= 24 ? "Hybrid / neighborhood bike" : "Kids mountain bike";
  }

  const wheelSize = `${baseWheel} inch`;
  const growthOption = baseWheel >= 24
    ? "Consider 26 inch only if the child is confident and can test ride safely."
    : `Consider ${Math.min(baseWheel + 2, 26)} inch only after control and stopping confidence improve.`;

  const styleRecommendation = stylePreference === "all good / no preference"
    ? `${category} with practical geometry and neutral long-term style.`
    : `${category} that matches ${stylePreference} while still prioritizing fit and control.`;
  const explanation = `Based on height ${height || "unknown"} cm, age ${age || "unknown"}, and ${experience} riding experience, a ${wheelSize} ${category.toLowerCase()} is the safest starting point now.`;
  const optionalNotes: string[] = [];

  if (weightKg > 0) {
    if (weightKg < 20) optionalNotes.push("Prioritize lightweight frames so starts and handling feel easier.");
    else if (weightKg > 45) optionalNotes.push("Check weight rating and frame stiffness for comfort and control.");
  }
  if (stylePreference !== "all good / no preference") {
    optionalNotes.push(`Use ${stylePreference} as a preference filter after fit and safety are confirmed.`);
  }
  if (!colorPreferences.includes("No preference / all colors are fine") && colorPreferences.length > 0) {
    optionalNotes.push(`Preferred color directions: ${colorPreferences.join(", ")}.`);
  }

  return {
    category,
    wheelSize,
    growthOption,
    styleRecommendation,
    explanation,
    optionalNotes,
    lookFor: [
      "Low standover height",
      "Adjustable seat height",
      "Working hand brakes",
      "Not too heavy",
      "Simple gearing if the child is not advanced",
      "Test ride if considering a larger size",
    ],
    avoid: [
      "Bike that is too large to grow into",
      "Very heavy department-store bike if the child is still learning",
      "Poor brake condition",
      "Rusty chain or flat tires unless willing to repair",
      "Overly childish color/style if the child may outgrow it emotionally",
    ],
    illustrationHint: `${wheelSize} ${category}`.replace(/\s+/g, " ").trim(),
  };
}

const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-ink outline-brand/20 focus:border-brand focus:outline";

function SectionTitle({ step, title }: { step: string; title: string }) {
  return <div className="mb-4 mt-2 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand font-bold text-white">{step}</span><h2 className="text-lg font-bold">{title}</h2></div>;
}

function Field({
  label,
  wide,
  required,
  optional,
  children,
}: {
  label: string;
  wide?: boolean;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`grid gap-1 text-sm font-bold text-slate-700 ${wide ? "md:col-span-2" : ""}`}>
      <span className="flex items-center gap-2">
        <span>{label}</span>
        {required && <span className="text-xs font-semibold text-brand">Required</span>}
        {optional && <span className="text-xs font-semibold text-slate-500">Optional</span>}
      </span>
      {children}
    </label>
  );
}

function PanelTitle({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return <div className="rounded-lg border border-line bg-white p-5 shadow-panel"><SectionTitle step={step} title={title} />{children}</div>;
}

function DimensionCard({ name, item }: { name: string; item: MeterResult }) {
  const cardTone = item.meter === "green"
    ? "border-green-300 bg-green-50/70"
    : item.meter === "red"
      ? "border-red-300 bg-red-50/70"
      : "border-amber-300 bg-amber-50/70";
  const accent = item.meter === "green" ? "border-l-good" : item.meter === "red" ? "border-l-danger" : "border-l-caution";
  return (
    <article className={`min-h-44 rounded-lg border-2 border-l-8 p-5 shadow-panel ${cardTone} ${accent}`}>
      <h3 className="text-2xl font-bold text-slate-900">{name}</h3>
      <p className="mt-2 text-base font-semibold text-slate-800">{item.label}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.reasoning}</p>
    </article>
  );
}

function dimensionCards(analysis: AnalysisResult): Array<[string, MeterResult]> {
  return [["Fit", analysis.dimensions.fit], ["Price", analysis.dimensions.price], ["Condition", analysis.dimensions.condition], ["Brand", analysis.dimensions.brand], ["Kid Appeal", analysis.dimensions.color], ["Risk", analysis.dimensions.risk]];
}

function meterSignal(meter: MeterResult["meter"]) {
  if (meter === "green") return "border-good bg-green-50";
  if (meter === "red") return "border-danger bg-red-50";
  return "border-caution bg-yellow-50";
}

async function apiGet(path: string) {
  try {
    const response = await fetch(path);
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}

async function apiPost(path: string, payload: unknown) {
  try {
    const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}

function providerStatusText(status?: ProviderModes | null) {
  if (!status) return "";
  return `Server beta: LLM ${status.llm}, search ${status.search}, email ${status.email}, logging ${status.logging}`;
}

function localExtract(text: string) {
  const priceMatch = text.match(/\$?\b(\d{2,4})\b/);
  const wheelMatch = text.match(/\b(12|14|16|18|20|24|26|27\.5)\s*(?:inch|in|")\b/i);
  return { title: text.split(/\r?\n/).find((line) => line.trim()) || "", askingPrice: priceMatch?.[1] || "", wheelSize: wheelMatch?.[1] || "", description: text };
}

function isLikelyHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function resolveBikeTypeImage(category: string, hint = "") {
  const text = `${category || ""} ${hint || ""}`.toLowerCase().trim();
  if (!text) return "";

  if (text.includes("balance")) return "/images/Balance bike.png";
  if (text.includes("training")) return "/images/Training-wheel bike.png";
  if (text.includes("mountain")) return "/images/Kids mountain bike.png";
  if (text.includes("hybrid")) return "/images/Youth hybrid bike.png";
  if (text.includes("cruiser") || text.includes("comfort")) return "/images/Cruiser comfort bike.png";
  if (text.includes("pedal")) return "/images/Kids pedal bike.png";

  return "";
}

function compactFields(fields: Partial<Listing>) {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined && value !== "")) as Partial<Listing>;
}

function localReport(payload: { listing: Listing; analysis: AnalysisResult; message: string; note?: string }) {
  return `Report preview generated locally.\n\nListing: ${payload.listing.title}\nOverall: ${payload.analysis.overall.label}\n${payload.analysis.overall.reasoning}\n\nSuggested message:\n${payload.message || "Generate a seller message before sending."}\n\nNote:\n${payload.note || "None"}\n\n${payload.analysis.disclaimer}`;
}

function feetInchesToCm(feet: string, inches: string) {
  const f = Number(feet || 0);
  const i = Number(inches || 0);
  if (!f && !i) return "";
  return String(Math.round((f * 12 + i) * 2.54));
}

function lbToKg(weightLb: string) {
  const value = Number(weightLb);
  if (!value) return "";
  return toFixed(String(value * 0.45359237), 1);
}

function toFixed(value: string, decimals: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(decimals).replace(/\.0$/, "") : "";
}

async function prepareScreenshotForExtraction(file: File): Promise<{ dataUrl: string; mimeType: string; sizeBytes: number }> {
  const maxEdge = 1400;
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas not available");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const preferredType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const dataUrl = canvas.toDataURL(preferredType, preferredType === "image/jpeg" ? 0.82 : undefined);
  const base64 = dataUrl.split(",")[1] || "";
  const sizeBytes = Math.floor((base64.length * 3) / 4);
  return { dataUrl, mimeType: preferredType, sizeBytes };
}

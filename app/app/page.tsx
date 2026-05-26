"use client";

import Image from "next/image";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import { analyzeBike, generateSellerMessage, localPriceReference, recommendWheelSize } from "@/lib/analysis";
import {
  BIKE_SCOUT_PICKUP_CHECKLIST,
  BIKE_SCOUT_SOURCE_OPTIONS,
  bikeScoutProfileSummary,
  buildBikeScoutSellerMessageDraft,
  defaultBikeScoutProfile,
  defaultBikeScoutWaitlistEntry,
  hydrateBikeScoutProfile,
  loadBikeScoutProfiles,
  loadBikeScoutWaitlist,
  saveBikeScoutProfiles,
  saveBikeScoutWaitlist,
  scoreBikeScoutListing,
  sourceLabel,
} from "@/lib/bike-scout";
import { detectMarketplace } from "@/lib/marketplace";
import type { MarketplaceId } from "@/lib/marketplace";
import type { BikeScoutProfile, BikeScoutWaitlistEntry, NormalizedListing } from "@/lib/bike-scout";
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

const RIDER_PROFILE_STORAGE_KEY = "mandy-free-bike-check-rider-profile";
const APP_STORE_MVP_MODE = process.env.NEXT_PUBLIC_APP_STORE_MVP_MODE === "true";
const APP_STORE_ACTIVE_CHILD_PROFILE_KEY = "mbf.appStore.activeChildProfile";
const APP_STORE_SAVED_EVALUATIONS_KEY = "mbf.appStore.savedEvaluations";
const APP_STORE_MVP_LOCAL_STORAGE_KEYS = [
  APP_STORE_ACTIVE_CHILD_PROFILE_KEY,
  APP_STORE_SAVED_EVALUATIONS_KEY,
];

type AppStoreTab = "profile" | "evaluate" | "history" | "settings";
type AppStoreEvaluateInputMode = "screenshot" | "link" | "manual";

type AppStoreActiveChildProfile = {
  nickname?: string;
  child: ChildProfile;
  savedAt: string;
};

type AppStoreSavedEvaluation = {
  id: string;
  createdAt: string;
  listing: Listing;
  analysis: AnalysisResult;
  sellerMessage: string;
  childNickname?: string;
  childSnapshot: ChildProfile;
  inputMode: AppStoreEvaluateInputMode;
  screenshotName?: string;
  savedAt: string;
  favorite: boolean;
};

type AppStoreSavedEvaluationWriteResult = {
  evaluation: AppStoreSavedEvaluation;
  wasDuplicate: boolean;
};

type SavedRiderProfile = {
  child: ChildProfile;
  recommendation: ChildBikeRecommendation;
  savedAt: string;
};

const colorPreferenceOptions = [
  "pink / purple",
  "blue / green",
  "red / orange",
  "black / white / neutral",
  "bright colors",
  "mature / simple style",
  "No preference / all colors are fine",
] as const;

const bikeScoutWheelSizeOptions = ["12 inch", "14 inch", "16 inch", "18 inch", "20 inch", "24 inch", "26 inch"] as const;
const bikeScoutTypeOptions = [
  "Balance bike",
  "Training wheels bike",
  "Standard kids bike",
  "Kids cruiser bike",
  "Kids mountain bike",
  "Hybrid / neighborhood bike",
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
  const [isScreenshotPreviewOpen, setIsScreenshotPreviewOpen] = useState(false);
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
  const [isOffline, setIsOffline] = useState(false);
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
  const [reportEmailNotice, setReportEmailNotice] = useState("");
  const [reportEmailNoticeTone, setReportEmailNoticeTone] = useState<"info" | "success" | "error">("info");
  const [isSendingReportEmail, setIsSendingReportEmail] = useState(false);
  const [wantsBikeDealUpdates, setWantsBikeDealUpdates] = useState(false);
  const [showProfileRecommendation, setShowProfileRecommendation] = useState(false);
  const [profileRecommendation, setProfileRecommendation] = useState<ChildBikeRecommendation | null>(null);
  const [profileRecommendationSignature, setProfileRecommendationSignature] = useState("");
  const [savedRiderProfile, setSavedRiderProfile] = useState<SavedRiderProfile | null>(null);
  const [scoutDraft, setScoutDraft] = useState<BikeScoutProfile>(defaultBikeScoutProfile);
  const [savedScoutProfiles, setSavedScoutProfiles] = useState<BikeScoutProfile[]>([]);
  const [scoutNotice, setScoutNotice] = useState("Bike Scout profiles are stored only in this browser during this prototype.");
  const [waitlistDraft, setWaitlistDraft] = useState<BikeScoutWaitlistEntry>(defaultBikeScoutWaitlistEntry);
  const [savedWaitlistEntries, setSavedWaitlistEntries] = useState<BikeScoutWaitlistEntry[]>([]);
  const [waitlistNotice, setWaitlistNotice] = useState("");
  const [showScoutSetup, setShowScoutSetup] = useState(false);
  const [activeFreeStep, setActiveFreeStep] = useState<"rider" | "listing" | "review" | "result">("listing");
  const [activeAppStoreTab, setActiveAppStoreTab] = useState<AppStoreTab>("profile");

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
  const canContinueFromRider = hasHeight && hasAgeForRecommendation && hasExperience;
  const canContinueFromListing = Boolean(hasCoreListing || hasScreenshotManualListing || hasAnyListingField);
  const needsRerun = hasAnalyzed && analyzedSignature !== inputSignature;
  const showAnalysisResults = hasAnalyzed && !needsRerun;
  const profileSignature = useMemo(
    () => childProfileSignature(normalizedChild),
    [normalizedChild],
  );
  const needsProfileRecommendationRerun = showProfileRecommendation && profileRecommendationSignature !== profileSignature;
  const profileRecommendationImage = profileRecommendation ? resolveBikeTypeImage(profileRecommendation.category, profileRecommendation.illustrationHint) : "";
  const analyzeDisabledReason = !hasHeight || !hasExperience
    ? "Enter child height and riding experience."
    : !hasCoreListing && !hasScreenshotManualListing
      ? "Please add listing text, screenshot extraction, or key bike details before analyzing."
      : "";
  const linkValue = (listing.listingLink || "").trim();
  const detectedMarketplace = useMemo(() => detectMarketplace(linkValue), [linkValue]);
  const hasPastedText = Boolean(pastedText.trim());
  const isCraigslistLink = detectedMarketplace.id === "craigslist";
  const isFacebookMarketplaceLink = detectedMarketplace.id === "facebook_marketplace";
  const hasValidReportEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reportEmail.trim());
  const canRunLinkAction = Boolean(linkValue) && (
    detectedMarketplace.extractionMode !== "fallback_only" || hasPastedText
  );
  const scoutPreview = useMemo(() => {
    if (!savedScoutProfiles.length) return null;
    return scoreBikeScoutListing(savedScoutProfiles[0], buildScoutPreviewListing(savedScoutProfiles[0], listing));
  }, [listing, savedScoutProfiles]);

  useEffect(() => {
    setIsOffline(typeof navigator !== "undefined" ? !navigator.onLine : false);
    apiGet("/api/status").then((result) => {
      if (result?.providers) {
        setProviderModes(result.providers);
        setStatus(providerStatusText(result.providers));
      }
    });
  }, []);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const storedProfiles = loadBikeScoutProfiles();
    const storedWaitlist = loadBikeScoutWaitlist();
    const storedRiderProfile = loadSavedRiderProfile();
    setSavedScoutProfiles(storedProfiles);
    setSavedWaitlistEntries(storedWaitlist);
    setSavedRiderProfile(storedRiderProfile);
    if (storedProfiles[0]) {
      setScoutDraft(storedProfiles[0]);
    }
    if (storedWaitlist[0]) setShowScoutSetup(true);
  }, []);

  useEffect(() => {
    return () => {
      if (screenshotPreviewUrl) URL.revokeObjectURL(screenshotPreviewUrl);
    };
  }, [screenshotPreviewUrl]);

  useEffect(() => {
    if (inputMode !== "link") return;
    if (!linkValue || !isCraigslistLink || !detectedMarketplace.isValidUrl) return;
    if (hasTriedCraigslistAutoExtract === linkValue) return;
    setHasTriedCraigslistAutoExtract(linkValue);
    void extractListingLink(linkValue);
    // The auto-extract trigger is intentionally keyed to link state, not the function identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedMarketplace.isValidUrl, hasTriedCraigslistAutoExtract, inputMode, isCraigslistLink, linkValue]);

  function updateListingField<K extends keyof Listing>(field: K, value: Listing[K], source = "manual entry") {
    setListing((current) => ({ ...current, [field]: value }));
    setListingSource((current) => {
      if (source !== "manual entry") return source;
      if (current === "link") return "link + manual edits";
      if (current.toLowerCase().includes("link extraction")) return `${current} + manual edits`;
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

  function updateScoutDraft(
    recipe: (current: BikeScoutProfile) => BikeScoutProfile,
  ) {
    setScoutDraft((current) => ({
      ...recipe(current),
      updatedAt: new Date().toISOString(),
    }));
  }

  function toggleScoutSource(sourceId: MarketplaceId) {
    updateScoutDraft((current) => {
      const currentSources = current.searchPreferences.marketplaceSources;
      const nextSources = currentSources.includes(sourceId)
        ? currentSources.filter((item) => item !== sourceId)
        : [...currentSources, sourceId];
      return {
        ...current,
        searchPreferences: {
          ...current.searchPreferences,
          marketplaceSources: nextSources,
        },
      };
    });
  }

  function toggleScoutListValue(field: "preferredWheelSizes" | "preferredBikeTypes", value: string) {
    updateScoutDraft((current) => {
      const currentValues = current.searchPreferences[field];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return {
        ...current,
        searchPreferences: {
          ...current.searchPreferences,
          [field]: nextValues,
        },
      };
    });
  }

  function useCurrentChildForScout() {
    updateScoutDraft((current) =>
      hydrateBikeScoutProfile(current, {
        height: normalizedChild.heightCm || current.childProfile.height,
        heightUnit: "cm",
        age: normalizedChild.age || current.childProfile.age,
        ridingExperience: normalizedChild.experience || current.childProfile.ridingExperience,
        weight: normalizedChild.weight || current.childProfile.weight,
        weightUnit: "kg",
        stylePreference: normalizedChild.stylePreference || current.childProfile.stylePreference,
        colorPreference: normalizedChild.colorPreferences || current.childProfile.colorPreference,
      }),
    );
    setScoutNotice("Copied the current rider profile into the local Bike Scout draft.");
  }

  function saveScoutProfile() {
    const hasLocation = scoutDraft.searchPreferences.zipCode.trim() || scoutDraft.searchPreferences.location.trim();
    const hasBudget = scoutDraft.searchPreferences.maxBudget.trim();
    if (!hasLocation || !hasBudget) {
      setScoutNotice("Add a ZIP or location and a max budget before saving this local Bike Scout profile.");
      return;
    }

    const nextProfile = {
      ...scoutDraft,
      updatedAt: new Date().toISOString(),
      createdAt: scoutDraft.createdAt || new Date().toISOString(),
    };
    const nextProfiles = [nextProfile];
    setSavedScoutProfiles(nextProfiles);
    setScoutDraft(nextProfile);
    saveBikeScoutProfiles(nextProfiles);
    setScoutNotice("Saved locally. Alerts and automated searches are not active yet in this prototype.");
  }

  function saveWaitlistEntry() {
    const email = waitlistDraft.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setWaitlistNotice("Please enter a valid email address to join the Bike Scout waitlist.");
      return;
    }

    const nextEntry = {
      ...waitlistDraft,
      id: waitlistDraft.id || `waitlist_${Math.random().toString(36).slice(2, 10)}`,
      email,
      createdAt: new Date().toISOString(),
    };
    const nextEntries = [nextEntry, ...savedWaitlistEntries];
    setSavedWaitlistEntries(nextEntries);
    saveBikeScoutWaitlist(nextEntries);
    setWaitlistDraft(defaultBikeScoutWaitlistEntry());
    setWaitlistNotice("Thanks - you're on the Bike Scout early-access list for this browser. This remains a local backup prototype for now.");
    setShowScoutSetup(true);
  }

  async function extractPastedText() {
    if (!pastedText.trim()) return;
    const result = await apiPost("/api/extract", { text: pastedText });
    const fields = result?.result?.fields || localExtract(pastedText);
    setListing((current) => ({ ...current, ...compactFields(fields) }));
    setListingSource("pasted text AI extraction");
    setScreenshotNotice("");
    setStatus(result?.statusMessage || providerStatusText(result?.apiStatus || providerModes) || "Listing fields extracted.");
    setActiveFreeStep("review");
  }

  function handleInputModeChange(mode: string) {
    setInputMode(mode);
    setScreenshotNotice("");
    setLinkNotice("");
    if (mode === "screenshot") {
      setListingSource("screenshot");
    } else if (mode === "link") {
      setListingSource("link");
    } else {
      setListingSource("manual");
    }
  }

  async function runLinkAction() {
    if (!linkValue) return;
    if (!detectedMarketplace.isValidUrl) {
      setLinkNotice("Please enter a valid listing URL.");
      return;
    }
    if (hasPastedText && (detectedMarketplace.extractionMode === "fallback_only" || detectedMarketplace.extractionMode === "best_effort")) {
      await extractPastedText();
      setListingSource("link + pasted text AI extraction");
      setLinkNotice("Pasted listing text was analyzed. The link is saved as listing reference.");
      return;
    }
    if (detectedMarketplace.extractionMode === "direct_supported" || detectedMarketplace.extractionMode === "best_effort") {
      await extractListingLink(linkValue);
      return;
    }
    setLinkNotice("Paste listing text or upload a screenshot to analyze this marketplace listing.");
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
    setActiveFreeStep("result");
  }

  function continueToListing() {
    if (!canContinueFromRider) return;
    if (!showProfileRecommendation || needsProfileRecommendationRerun) {
      recommendFromChildProfile();
    }
    setActiveFreeStep(canContinueFromListing ? "review" : "listing");
  }

  function continueToReview() {
    if (!canContinueFromListing) return;
    setActiveFreeStep("review");
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
        setActiveFreeStep("review");
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

  async function extractListingLink(inputUrl?: string) {
    const url = (inputUrl || listing.listingLink || "").trim();
    if (!url) return;
    const marketplace = detectMarketplace(url);
    setIsExtractingLink(true);
    try {
      const result = await apiPost("/api/extract-link", { url });
      if (result?.result?.fields) {
        setListing((current) => ({ ...current, ...compactFields(result.result.fields) }));
        setListingSource(`${marketplace.label} link extraction`);
        setLinkNotice(`${marketplace.label} listing details were extracted. Please confirm and edit any missing fields.`);
        setStatus(result?.cached ? `${marketplace.label} details loaded from cache.` : `${marketplace.label} extraction complete.`);
        setActiveFreeStep("review");
      } else {
        const message = result?.statusMessage || "We could not read this listing automatically. Please paste the listing text or upload a screenshot.";
        setLinkNotice(message);
        setStatus(message);
      }
    } catch {
      const message = "We could not read this listing automatically. Please paste the listing text or upload a screenshot.";
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
      setReportPreview(result.report);
      setStatus("Report generated.");
      return;
    }
    setReportPreview(localReport(payload));
    setStatus("Report preview generated locally.");
  }

  async function sendReportToEmail() {
    if (!showAnalysisResults) {
      setReportEmailNoticeTone("error");
      setReportEmailNotice("Complete a bike check first to email the report.");
      return;
    }
    if (!hasValidReportEmail) {
      setReportEmailNoticeTone("error");
      setReportEmailNotice("Please enter a valid email address.");
      return;
    }

    const currentAnalysis = analysis || localAnalysis;
    const recommendedBike = buildChildBikeRecommendation(normalizedChild);
    const screenshotDataUrl = screenshotFile ? await buildReportScreenshotDataUrl(screenshotFile) : "";
    const report = localReport({
      listing,
      analysis: currentAnalysis,
      message: sellerMessage,
      note: reportNote,
    });

    setIsSendingReportEmail(true);
    setReportEmailNoticeTone("info");
    setReportEmailNotice("Sending your report...");
    try {
      const response = await fetch("/api/reports/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: reportEmail,
          bikeTitle: listing.title,
          reportSummary: currentAnalysis.overall.reasoning,
          recommendation: currentAnalysis.overall.label,
          score: currentAnalysis.overall.label,
          askingPrice: listing.askingPrice ? `$${listing.askingPrice}` : "",
          location: listing.location,
          childProfile: normalizedChild,
          listing,
          analysisResult: currentAnalysis,
          report,
          reportTitle: "Your Mandy's Bike Finder report",
          sourceUrl: listing.listingLink,
          reportId: listing.listingLink || listing.title,
          sellerMessage,
          recipientName,
          note: reportNote,
          screenshotDataUrl,
          recommendedBikeType: recommendedBike.category,
          recommendedWheelSize: recommendedBike.wheelSize,
          marketingConsent: wantsBikeDealUpdates,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        setReportEmailNoticeTone("error");
        setReportEmailNotice(formatReportEmailError(result?.code, result?.error));
        return;
      }
      setReportEmailNoticeTone("success");
      setReportEmailNotice(result.message || "Report sent successfully. Please check your inbox.");
      setStatus("Report sent by email.");
    } catch {
      setReportEmailNoticeTone("error");
      setReportEmailNotice("Email could not be sent.");
    } finally {
      setIsSendingReportEmail(false);
    }
  }

  function recommendFromChildProfile() {
    if (!hasHeight || !hasAgeForRecommendation || !hasExperience) return;
    const nextRecommendation = buildChildBikeRecommendation(normalizedChild);
    setProfileRecommendation(nextRecommendation);
    setProfileRecommendationSignature(profileSignature);
    setShowProfileRecommendation(true);
    saveRiderProfileSnapshot(normalizedChild, nextRecommendation);
  }

  function saveRiderProfileSnapshot(childProfile: ChildProfile, recommendation: ChildBikeRecommendation) {
    const snapshot = {
      child: childProfile,
      recommendation,
      savedAt: new Date().toISOString(),
    };
    setSavedRiderProfile(snapshot);
    saveSavedRiderProfile(snapshot);
  }

  function useSavedRiderForCheck() {
    if (!savedRiderProfile) return;
    const savedChild = savedRiderProfile.child;
    setHeightUnit("cm");
    setHeightCmInput(savedChild.heightCm || "");
    setHeightFeet("");
    setHeightInches("");
    setWeightUnit("kg");
    setWeightInput(savedChild.weight || "");
    setChild({
      ...defaultChild,
      ...savedChild,
      colorPreferences: savedChild.colorPreferences?.length ? savedChild.colorPreferences : defaultChild.colorPreferences,
    });
    setProfileRecommendation(savedRiderProfile.recommendation);
    setProfileRecommendationSignature(childProfileSignature(savedChild));
    setShowProfileRecommendation(true);
    setActiveFreeStep("listing");
  }

  function startNewRiderProfile() {
    setChild(defaultChild);
    setHeightUnit("cm");
    setHeightCmInput("");
    setHeightFeet("");
    setHeightInches("");
    setWeightUnit("lb");
    setWeightInput("");
    setProfileRecommendation(null);
    setProfileRecommendationSignature("");
    setShowProfileRecommendation(false);
  }

  function switchMode(_nextMode: "free" | "scout", anchorId: string) {
    requestAnimationFrame(() => {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (APP_STORE_MVP_MODE) {
    return (
      <AppStoreTabShell
        activeTab={activeAppStoreTab}
        isOffline={isOffline}
        onSelectTab={setActiveAppStoreTab}
      />
    );
  }

  return (
    <main className="app-safe-shell min-h-screen bg-[#fff8ea] px-4 py-5 md:px-6 md:py-7">
      {isOffline && (
        <div className="app-safe-top sticky z-40 mx-auto mb-4 max-w-[1320px] rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-panel">
          You are offline. Local guidance may remain visible, but screenshot extraction, link analysis, and email reports need a connection.
        </div>
      )}
      <section className="mx-auto max-w-[1320px]">
        <div className="relative mb-7 min-h-[520px] overflow-hidden rounded-section border border-[#f1dfba] bg-[#fff2d4] shadow-soft">
          <Image
            src="/images/mandy-bike-hero.jpg"
            alt="Mandy's Bike Finder illustrated bike assistant"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1320px"
            className="object-cover object-[72%_center] md:object-[62%_center]"
            unoptimized
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,248,234,0.98)_0%,rgba(255,248,234,0.94)_48%,rgba(255,248,234,0.42)_78%,rgba(255,248,234,0.16)_100%)] md:bg-[linear-gradient(90deg,rgba(255,248,234,0.96)_0%,rgba(255,248,234,0.88)_35%,rgba(255,248,234,0.28)_68%,rgba(255,248,234,0.05)_100%)]" />
          <div className="relative flex min-h-[520px] items-center p-6 md:p-10">
            <div className="max-w-xl">
              <span className="inline-flex items-center rounded-full border border-[#edd59f] bg-white/82 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                Mandy&apos;s Bike Finder
              </span>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.07] text-ink md:text-[3.35rem]">
                Is this used kids&apos; bike worth it?
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-700 md:text-lg">
                Upload a marketplace screenshot or paste the listing. Mandy helps you check price, fit, and safety before messaging the seller.
              </p>
              <p className="mt-4 text-sm font-semibold text-slate-600">
                Free to try · No account needed · One listing at a time
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => switchMode("free", "free-analyzer")}
                  className="inline-flex min-h-11 items-center justify-center rounded-button bg-brand px-5 text-sm font-bold text-white shadow-soft transition hover:bg-brand-hover"
                >
                  Check a bike now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("link");
                    setActiveFreeStep("listing");
                    switchMode("free", "free-analyzer");
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-button border border-line bg-white/90 px-5 text-sm font-bold text-ink shadow-panel transition hover:shadow-panel-hover"
                >
                  Paste listing text
                </button>
              </div>
              <div className="mt-6 grid max-w-lg gap-2 rounded-card border border-[#ecd9ae] bg-white/78 p-3 shadow-panel backdrop-blur-sm sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Verdict</p>
                  <p className="mt-1 text-sm font-bold text-good">Worth asking</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Fair price</p>
                  <p className="mt-1 text-sm font-bold text-ink">$65-$95</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Fit hint</p>
                  <p className="mt-1 text-sm font-bold text-teal">Likely 20-24&quot;</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <>
            <section id="free-analyzer" className="mb-5 overflow-hidden rounded-section border border-[#ead8b1] bg-white shadow-panel">
              <div className="grid gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
                <div className="bg-[#fff4d8] p-5 md:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Start here</p>
                  <h2 className="mt-2 text-2xl font-bold leading-tight text-ink">Add the bike listing you found.</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    Upload a screenshot or paste the seller text first. Mandy will help turn it into a fit, price, and safety check.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode("screenshot");
                        setActiveFreeStep("listing");
                      }}
                      className="min-h-11 rounded-button bg-brand px-4 text-sm font-bold text-white shadow-soft transition hover:bg-brand-hover"
                    >
                      Upload screenshot
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputMode("link");
                        setActiveFreeStep("listing");
                      }}
                      className="min-h-11 rounded-button border border-line bg-white px-4 text-sm font-bold text-ink transition hover:shadow-panel"
                    >
                      Paste listing
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 p-4 md:grid-cols-4 md:p-5">
                  <FlowStepButton
                    step="1"
                    title="Listing"
                    status={canContinueFromListing ? "Details added" : "Start here"}
                    active={activeFreeStep === "listing"}
                    complete={canContinueFromListing}
                    onClick={() => setActiveFreeStep("listing")}
                  />
                  <FlowStepButton
                    step="2"
                    title="Child info"
                    status={canContinueFromRider ? "Fit ready" : "Add height"}
                    active={activeFreeStep === "rider"}
                    complete={canContinueFromRider}
                    onClick={() => setActiveFreeStep("rider")}
                  />
                  <FlowStepButton
                    step="3"
                    title="Review"
                    status={canContinueFromListing ? "Check fields" : "Waiting"}
                    active={activeFreeStep === "review"}
                    complete={canContinueFromListing && hasAnyListingField}
                    disabled={!canContinueFromListing}
                    onClick={() => setActiveFreeStep("review")}
                  />
                  <FlowStepButton
                    step="4"
                    title="Result"
                    status={showAnalysisResults ? visibleAnalysis.overall.label : "Evaluate"}
                    active={activeFreeStep === "result"}
                    complete={showAnalysisResults}
                    disabled={!showAnalysisResults && !canAnalyze}
                    onClick={() => setActiveFreeStep("result")}
                  />
                </div>
              </div>
            </section>

            <form onSubmit={analyze} className={`${activeFreeStep === "result" ? "hidden" : "mb-6 grid gap-5"}`}>
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="grid gap-5">
            <section className={`${activeFreeStep === "rider" ? "block" : "hidden"} rounded-lg border border-line bg-white p-5 shadow-panel`}>
              <SectionTitle step="2" title="Add your child info" />
              <p className="mb-4 text-sm text-slate-600">Height and riding confidence help estimate the right wheel size. Optional preferences stay tucked away.</p>
              {savedRiderProfile && (
                <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Saved rider profile on this browser</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-950">
                        {savedRiderProfile.child.heightCm || "Unknown"} cm rider, age {savedRiderProfile.child.age || "unknown"} - {savedRiderProfile.recommendation.category}, {savedRiderProfile.recommendation.wheelSize}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={useSavedRiderForCheck}
                        className="min-h-10 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white"
                      >
                        Use saved profile
                      </button>
                      <button
                        type="button"
                        onClick={startNewRiderProfile}
                        className="min-h-10 rounded-md border border-emerald-200 bg-white px-4 text-sm font-bold text-emerald-800"
                      >
                        Enter new rider
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
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
              <Field label="Riding experience" required>
                <select className={inputClass} value={child.experience} onChange={(e) => setChild({ ...child, experience: e.target.value as ChildProfile["experience"] })}>
                  <option value="beginner">Beginner</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="confident">Confident</option>
                  <option value="advanced">Advanced</option>
                </select>
              </Field>
              <details className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-800">Advanced options</summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Weight" optional>
                    <div className="grid grid-cols-[110px_1fr] gap-2">
                      <select className={inputClass} value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as "lb" | "kg")}>
                        <option value="lb">lb</option>
                        <option value="kg">kg</option>
                      </select>
                      <input className={inputClass} type="number" placeholder="Weight value" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
                    </div>
                  </Field>
                  <Field label="Style preference" optional>
                    <select className={inputClass} value={child.stylePreference} onChange={(e) => setChild({ ...child, stylePreference: e.target.value })}>
                      <option value="all good / no preference">All good / no preference</option>
                      <option value="boy-style">Boy-style</option>
                      <option value="girl-style">Girl-style</option>
                    </select>
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Color preference" optional>
                      <div className="grid gap-2 rounded-md border border-slate-300 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
                        {colorPreferenceOptions.map((option) => (
                          <ColorPreferenceChip
                            key={option}
                            option={option}
                            selected={child.colorPreferences.includes(option)}
                            onClick={() => toggleColorPreference(option)}
                          />
                        ))}
                      </div>
                    </Field>
                  </div>
                </div>
              </details>
              </div>
              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={recommendFromChildProfile}
                  disabled={!hasHeight || !hasAgeForRecommendation || !hasExperience}
                  className="min-h-14 rounded-md bg-brand px-5 text-left text-base font-bold text-white shadow-panel transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Update fit guidance
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
                  <h3 className="text-lg font-bold text-slate-900">Step 2 - Recommended bike fit</h3>
                  <p className="mt-1 text-sm text-slate-600">This is a starting point. A quick test ride is still the best final check.</p>
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
                          <Image
                            src={profileRecommendationImage}
                            alt={`${profileRecommendation.category} illustration`}
                            width={1200}
                            height={900}
                            className="h-auto w-full object-cover"
                            unoptimized
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
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={continueToListing}
                  disabled={!canContinueFromRider}
                  className="min-h-11 rounded-md bg-brand px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Use this fit to evaluate a listing
                </button>
                {!canContinueFromRider && (
                  <p className="text-sm text-slate-600">Height, age, and riding experience unlock the next step.</p>
                )}
              </div>
            </section>

            <section className={`${activeFreeStep === "listing" || activeFreeStep === "review" ? "block" : "hidden"} rounded-lg border border-line bg-white p-5 shadow-panel`}>
            <SectionTitle step="1" title="Add the bike listing" />
            <p className="mb-4 text-sm text-slate-600">Upload a screenshot, paste listing text, or enter the bike details manually.</p>
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
                      const detected = detectMarketplace(value);
                      setListing((current) => ({ ...current, listingLink: value, platform: detected.label }));
                      setLinkNotice("");
                      if (detected.id !== "craigslist") {
                        setHasTriedCraigslistAutoExtract("");
                      }
                      setListingSource(value.trim() ? "link" : "Not set");
                    }}
                  />
                </Field>
              <Field label="Pasted listing text">
                  <textarea className={inputClass} rows={4} placeholder="Paste title, price, description, or seller text" value={pastedText} onChange={(e) => setPastedText(e.target.value)} onBlur={extractPastedText} />
                </Field>
                <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-slate-700">
                  AI-assisted extraction supports pasted listing text. You can also use screenshot extraction in screenshot mode.
                </p>
                {Boolean(linkValue) && (
                  <p className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <span className="font-semibold">Detected: {detectedMarketplace.label}</span>
                    <br />
                    {detectedMarketplace.userGuidance}
                  </p>
                )}
                {isFacebookMarketplaceLink && (
                  <p className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-slate-700">
                    Facebook Marketplace links usually cannot be read directly. Please upload a screenshot or paste the listing text for AI-assisted extraction.
                  </p>
                )}
                {Boolean(linkValue) && (
                  <>
                    <button
                      type="button"
                      onClick={() => void runLinkAction()}
                      disabled={isExtractingLink || !canRunLinkAction}
                      className="min-h-11 rounded-md bg-blue-50 px-4 font-bold text-brand disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isExtractingLink
                        ? "Analyzing listing link..."
                        : detectedMarketplace.extractionMode === "direct_supported"
                          ? "Analyze this listing"
                          : detectedMarketplace.extractionMode === "best_effort"
                            ? "Try link analysis"
                            : "Analyze pasted text"}
                    </button>
                    {!canRunLinkAction && detectedMarketplace.extractionMode === "fallback_only" && (
                      <p className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
                        Paste listing text or upload a screenshot to analyze this marketplace listing.
                      </p>
                    )}
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
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 text-muted">
                  {screenshotPreviewUrl ? (
                    <div className="grid w-full gap-2">
                      <button
                        type="button"
                        onClick={() => setIsScreenshotPreviewOpen(true)}
                        className="w-full rounded-md border border-slate-200 bg-white p-0 text-left"
                      >
                        <div className="max-h-[500px] overflow-auto md:max-h-[620px]">
                          <Image
                            src={screenshotPreviewUrl}
                            alt="Uploaded listing screenshot preview"
                            width={1200}
                            height={1600}
                            className="block h-auto w-full object-contain"
                            unoptimized
                          />
                        </div>
                      </button>
                      <p className="text-xs text-slate-600">{screenshotName}</p>
                      <p className="text-xs text-slate-500">
                        Preview shown at reduced size. AI extraction uses the full uploaded image.
                      </p>
                    </div>
                  ) : (
                    <div className="grid min-h-40 place-items-center">
                      <span>No image selected</span>
                    </div>
                  )}
                </div>
                {isScreenshotPreviewOpen && screenshotPreviewUrl && (
                  <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/70 p-4">
                    <div className="w-full max-w-5xl rounded-lg border border-slate-200 bg-white shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-slate-800">{screenshotName || "Screenshot preview"}</p>
                        <button
                          type="button"
                          onClick={() => setIsScreenshotPreviewOpen(false)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Close
                        </button>
                      </div>
                      <div className="max-h-[82vh] overflow-auto bg-slate-50 p-3">
                        <Image
                          src={screenshotPreviewUrl}
                          alt="Uploaded listing screenshot full preview"
                          width={1200}
                          height={1600}
                          className="block h-auto w-full object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                )}
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
              </div>
            )}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs text-muted">Source: {listingSource}</span>
              {inputMode === "link" && Boolean(linkValue) && (
                <span className="text-xs text-muted">Marketplace: {detectedMarketplace.label}</span>
              )}
            </div>
            {activeFreeStep === "listing" && (
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={continueToReview}
                  disabled={!canContinueFromListing}
                  className="min-h-11 rounded-md bg-brand px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue to details review
                </button>
                {!canContinueFromListing && (
                  <p className="text-sm text-slate-600">Add a screenshot, pasted listing text, or a few listing fields first.</p>
                )}
              </div>
            )}

            <details className={`${activeFreeStep === "review" || (activeFreeStep === "listing" && inputMode === "manual") ? "block" : "hidden"} rounded-2xl border border-slate-200 bg-slate-50/70 p-4`} open>
              <summary className="cursor-pointer list-none">
                <SectionTitle step="4" title="Review listing details" />
                <p className="mt-2 text-sm text-slate-600">AI can miss details, especially from screenshots, so please adjust anything that looks wrong.</p>
              </summary>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
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
            </details>
            </section>
          </div>
          <aside className="grid gap-4 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Session snapshot</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">Your AI bike check so far</h3>
              <p className="mt-2 text-sm text-slate-600">
                Mandy checks rider fit, wheel size, value, condition, and seller follow-up questions from the details you provide.
              </p>
              <div className="mt-4 grid gap-3">
                <InfoLine label="Rider height" value={normalizedChild.heightCm ? `${normalizedChild.heightCm} cm` : "Add rider details first"} />
                <InfoLine label="Riding experience" value={normalizedChild.experience || "Not set"} />
                <InfoLine label="Listing status" value={hasAnyListingField ? "Listing details added" : "Waiting for a listing"} />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Bike fit preview</p>
              {showProfileRecommendation && profileRecommendation && !needsProfileRecommendationRerun ? (
                <div className="mt-2 grid gap-3">
                  <InfoLine label="Recommended size" value={profileRecommendation.wheelSize} />
                  <InfoLine label="Bike type" value={profileRecommendation.category} />
                  <p className="text-sm text-slate-600">{profileRecommendation.explanation}</p>
                </div>
              ) : needsProfileRecommendationRerun ? (
                <p className="mt-2 text-sm text-amber-700">Your rider details changed. Re-run bike fit to refresh this summary.</p>
              ) : (
                <p className="mt-2 text-sm text-slate-600">Step 1 stays open by default. Enter child info, then refresh fit guidance before checking the listing.</p>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Match result</p>
              {showAnalysisResults ? (
                <div className="mt-2 grid gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full border-4 ${meterSignal(visibleAnalysis.overall.meter)}`} />
                    <div>
                      <p className="text-lg font-bold text-slate-900">{visibleAnalysis.overall.label}</p>
                      <p className="text-sm text-slate-600">{visibleAnalysis.overall.reasoning}</p>
                    </div>
                  </div>
                  <InfoLine label="Fit" value={visibleAnalysis.dimensions.fit.label} />
                  <InfoLine label="Value" value={visibleAnalysis.dimensions.price.label} />
                </div>
              ) : needsRerun ? (
                <p className="mt-2 text-sm text-amber-700">Inputs changed after the last run. Analyze again to refresh the recommendation.</p>
              ) : (
                <p className="mt-2 text-sm text-slate-600">Your result card will appear here after enough rider and listing details are ready.</p>
              )}
            </section>

          </aside>
          <div className={`${activeFreeStep === "review" || activeFreeStep === "result" ? "grid" : "hidden"} gap-2`}>
            <button
              className="min-h-12 w-full rounded-md bg-brand px-4 font-bold text-white shadow-panel disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-64"
              type="submit"
              disabled={!canAnalyze}
            >
              Check this bike
            </button>
            {!canAnalyze && <p className="text-sm text-slate-600">{analyzeDisabledReason}</p>}
            {canAnalyze && (
              <p className="text-xs text-slate-500">
                Best results include asking price, brand, and condition details.
              </p>
            )}
          </div>
              </div>
        </form>

        {activeFreeStep === "result" && showAnalysisResults ? (
            <section className="grid gap-4">
              <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Bike verdict</p>
                  <h2 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">{visibleAnalysis.overall.label}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{visibleAnalysis.overall.reasoning}</p>
                  <OverallRecommendationMeter meter={visibleAnalysis.overall.meter} />
                </div>
                <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <InfoLine label="Recommended size" value={profileRecommendation?.wheelSize || recommendWheelSize(normalizedChild.heightCm, normalizedChild.experience).recommended} />
                  <InfoLine label="Recommended type" value={profileRecommendation?.category || buildChildBikeRecommendation(normalizedChild).category} />
                  <InfoLine label="Listing" value={listing.title || "Untitled bike"} />
                  <InfoLine label="Asking price" value={listing.askingPrice ? `$${listing.askingPrice}` : "Unknown"} />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Score breakdown</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {dimensionCards(visibleAnalysis).map(([name, item]) => <CompactDimensionCard key={name} name={name} item={item} />)}
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Seller action</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Questions and message draft</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {visibleAnalysis.sellerQuestions.map((question) => <li key={question}>{question}</li>)}
                </ul>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Field label="Goal"><select className={inputClass} value={messageGoal} onChange={(e) => setMessageGoal(e.target.value)}><option value="askAvailability">Ask if still available</option><option value="askQuestions">Ask key questions</option><option value="lowerOffer">Make a lower offer</option><option value="confirmPickup">Confirm pickup time</option><option value="walkAway">Walk away politely</option></select></Field>
                  <Field label="Tone"><select className={inputClass} value={messageTone} onChange={(e) => setMessageTone(e.target.value)}><option>friendly</option><option>concise</option><option>very polite</option><option>firm but respectful</option></select></Field>
                  <Field label="Target offer"><input className={inputClass} type="number" value={targetOffer} onChange={(e) => setTargetOffer(e.target.value)} /></Field>
                  <Field label="Pickup timing"><input className={inputClass} value={pickupTiming} onChange={(e) => setPickupTiming(e.target.value)} /></Field>
                </div>
                <button className="mt-3 min-h-11 rounded-md bg-blue-50 px-4 font-bold text-brand" type="button" onClick={async () => setSellerMessage(await generateMessage())}>Generate seller message</button>
                <textarea className={`${inputClass} mt-3`} rows={4} value={sellerMessage} onChange={(e) => setSellerMessage(e.target.value)} />
              </div>

              <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Share or save</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Email report</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Field label="Email"><input className={inputClass} type="email" value={reportEmail} onChange={(e) => { setReportEmail(e.target.value); setReportEmailNotice(""); }} placeholder="parent@example.com" /></Field>
                  <Field label="Recipient name"><input className={inputClass} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Optional" /></Field>
                  <Field label="Note" wide><textarea className={inputClass} rows={3} value={reportNote} onChange={(e) => setReportNote(e.target.value)} placeholder="Optional" /></Field>
                </div>
                <label className="mt-3 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <input
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand"
                    type="checkbox"
                    checked={wantsBikeDealUpdates}
                    onChange={(e) => setWantsBikeDealUpdates(e.target.checked)}
                  />
                  <span>
                    <span className="block font-semibold text-slate-900">Send me future bike deal alerts and product updates.</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">
                      Your report email is transactional. Updates are optional and only saved if you check this box.
                    </span>
                  </span>
                </label>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button className="min-h-11 rounded-md bg-blue-50 px-4 font-bold text-brand" type="button" onClick={previewReport}>
                    Preview report
                  </button>
                  <button
                    className="min-h-11 rounded-md bg-brand px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={sendReportToEmail}
                    disabled={!showAnalysisResults || !hasValidReportEmail || isSendingReportEmail}
                  >
                    {isSendingReportEmail ? "Sending..." : "Send report to my email"}
                  </button>
                </div>
                {reportEmailNotice && (
                  <p
                    className={`mt-3 rounded-md border p-3 text-sm font-semibold ${
                      reportEmailNoticeTone === "success"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : reportEmailNoticeTone === "error"
                          ? "border-rose-300 bg-rose-50 text-rose-800"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {reportEmailNotice}
                  </p>
                )}
                {reportPreview && (
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-700">{reportPreview}</pre>
                )}
              </div>
            </section>
          </section>
        ) : activeFreeStep === "result" && needsRerun ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-slate-700 shadow-panel">
            <p className="font-semibold">Update inputs and re-run analysis</p>
            <p className="mt-1">
              Your child or listing details changed after the last result. Run Analyze again to refresh the recommendation.
            </p>
          </section>
        ) : activeFreeStep === "result" ? (
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
            ) : null}
          <section id="bike-scout-details" className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-panel">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#e0f2fe_0%,#ffffff_38%,#fef3c7_100%)] px-5 py-6 md:px-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Paid feature entry</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Mandy Bike Scout</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Bike Scout is a planned paid feature for nearby used-bike monitoring. For this MVP, we are validating demand first with an early-access waitlist before building payment and launch infrastructure.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_30px_-26px_rgba(15,23,42,0.45)]">
                Planned price: about $2.99/week
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="border-b border-slate-200 bg-slate-950 px-5 py-6 text-white lg:border-b-0 lg:border-r">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-200/80">Early access</p>
              <h3 className="mt-2 text-xl font-bold">Waitlist-first validation</h3>
              <p className="mt-2 text-sm leading-6 text-white/78">
                We are not collecting payment yet. Instead, we are collecting early-interest signals from parents before wiring Stripe Checkout and a real Bike Scout backend.
              </p>
              <div className="mt-4 rounded-2xl border border-white/12 bg-white/8 p-4">
                <p className="text-sm font-semibold text-white">Planned price</p>
                <p className="mt-1 text-3xl font-bold">$2.99<span className="text-base font-semibold text-white/75">/week</span></p>
                <p className="mt-2 text-sm text-white/75">No payment is collected now. Bike Scout is not fully live yet.</p>
                <div className="mt-4 rounded-xl border border-emerald-200/20 bg-emerald-400/10 px-3 py-3 text-sm text-emerald-50">
                  Join the waitlist to help us prioritize early Bike Scout features and launch order.
                </div>
              </div>
            </article>

            <article className="px-5 py-6 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Join Bike Scout waitlist</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">Early-access waitlist</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Tell us what kind of bike you&apos;re looking for. This helps us prioritize early Bike Scout features.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScoutSetup((current) => !current)}
                  className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-brand"
                >
                  {showScoutSetup ? "Hide local setup preview" : "Preview local setup"}
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Email address" required>
                    <input
                      className={inputClass}
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={waitlistDraft.email}
                      onChange={(e) => setWaitlistDraft((current) => ({ ...current, email: e.target.value }))}
                    />
                  </Field>
                  <Field label="ZIP code" optional>
                    <input
                      className={inputClass}
                      placeholder="Optional"
                      value={waitlistDraft.zipCode}
                      onChange={(e) => setWaitlistDraft((current) => ({ ...current, zipCode: e.target.value }))}
                    />
                  </Field>
                  <Field label="Child age" optional>
                    <input
                      className={inputClass}
                      type="number"
                      min="1"
                      max="18"
                      placeholder="Optional"
                      value={waitlistDraft.childAge}
                      onChange={(e) => setWaitlistDraft((current) => ({ ...current, childAge: e.target.value }))}
                    />
                  </Field>
                  <Field label="Desired wheel size" optional>
                    <select
                      className={inputClass}
                      value={waitlistDraft.desiredWheelSize}
                      onChange={(e) => setWaitlistDraft((current) => ({ ...current, desiredWheelSize: e.target.value }))}
                    >
                      <option value="">Optional</option>
                      {["12 inch", "14 inch", "16 inch", "18 inch", "20 inch", "24 inch", "26 inch"].map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Max budget" optional>
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      placeholder="Optional"
                      value={waitlistDraft.maxBudget}
                      onChange={(e) => setWaitlistDraft((current) => ({ ...current, maxBudget: e.target.value }))}
                    />
                  </Field>
                  <Field label="Notes" wide optional>
                    <textarea
                      className={inputClass}
                      rows={3}
                      placeholder="Optional notes about the kind of used bike you want"
                      value={waitlistDraft.notes}
                      onChange={(e) => setWaitlistDraft((current) => ({ ...current, notes: e.target.value }))}
                    />
                  </Field>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Bike Scout is planned as a paid feature around $2.99/week. Join the waitlist and we&apos;ll notify you when early access is ready.
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Local prototype: this waitlist is still saved only in this browser.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={saveWaitlistEntry}
                    className="min-h-11 rounded-md bg-brand px-4 text-sm font-bold text-white"
                  >
                    Join Bike Scout waitlist
                  </button>
                  {savedWaitlistEntries.length > 0 && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                      Waitlist saved locally
                    </span>
                  )}
                </div>
                {waitlistNotice && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    {waitlistNotice}
                  </div>
                )}
              </div>

              {!showScoutSetup ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-700">
                  Optional local prototype preview: open this to see the future Bike Scout profile setup flow. It does not submit to a server or turn alerts on.
                </div>
              ) : (
                <div className="mt-5 grid gap-5">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">Local Bike Scout setup preview</h4>
                        <p className="mt-1 text-sm text-slate-600">Prototype storage only. Saved data stays in this browser until a real backend exists.</p>
                      </div>
                      <button
                        type="button"
                        onClick={useCurrentChildForScout}
                        className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-brand"
                      >
                        Use current rider profile
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Field label="Profile name">
                        <input
                          className={inputClass}
                          value={scoutDraft.name}
                          onChange={(e) => updateScoutDraft((current) => ({ ...current, name: e.target.value }))}
                        />
                      </Field>
                      <Field label="ZIP code or location" required>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            className={inputClass}
                            placeholder="ZIP code"
                            value={scoutDraft.searchPreferences.zipCode}
                            onChange={(e) => updateScoutDraft((current) => ({
                              ...current,
                              searchPreferences: { ...current.searchPreferences, zipCode: e.target.value },
                            }))}
                          />
                          <input
                            className={inputClass}
                            placeholder="City or area"
                            value={scoutDraft.searchPreferences.location}
                            onChange={(e) => updateScoutDraft((current) => ({
                              ...current,
                              searchPreferences: { ...current.searchPreferences, location: e.target.value },
                            }))}
                          />
                        </div>
                      </Field>
                      <Field label="Child height (cm)">
                        <input
                          className={inputClass}
                          type="number"
                          min="80"
                          max="220"
                          placeholder="Height in cm"
                          value={scoutDraft.childProfile.height}
                          onChange={(e) => updateScoutDraft((current) => ({
                            ...current,
                            childProfile: { ...current.childProfile, height: e.target.value, heightUnit: "cm" },
                          }))}
                        />
                      </Field>
                      <Field label="Child age">
                        <input
                          className={inputClass}
                          type="number"
                          min="1"
                          max="16"
                          placeholder="Age"
                          value={scoutDraft.childProfile.age}
                          onChange={(e) => updateScoutDraft((current) => ({
                            ...current,
                            childProfile: { ...current.childProfile, age: e.target.value },
                          }))}
                        />
                      </Field>
                      <Field label="Riding experience">
                        <select
                          className={inputClass}
                          value={scoutDraft.childProfile.ridingExperience}
                          onChange={(e) => updateScoutDraft((current) => ({
                            ...current,
                            childProfile: {
                              ...current.childProfile,
                              ridingExperience: e.target.value as ChildProfile["experience"],
                            },
                          }))}
                        >
                          <option value="beginner">Beginner</option>
                          <option value="comfortable">Comfortable</option>
                          <option value="confident">Confident</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </Field>
                      <Field label="Radius miles">
                        <input
                          className={inputClass}
                          type="number"
                          min="5"
                          max="100"
                          value={scoutDraft.searchPreferences.radiusMiles}
                          onChange={(e) => updateScoutDraft((current) => ({
                            ...current,
                            searchPreferences: { ...current.searchPreferences, radiusMiles: Number(e.target.value || 0) },
                          }))}
                        />
                      </Field>
                      <Field label="Budget range" required>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            className={inputClass}
                            inputMode="numeric"
                            placeholder="Min budget (optional)"
                            value={scoutDraft.searchPreferences.minBudget}
                            onChange={(e) => updateScoutDraft((current) => ({
                              ...current,
                              searchPreferences: { ...current.searchPreferences, minBudget: e.target.value },
                            }))}
                          />
                          <input
                            className={inputClass}
                            inputMode="numeric"
                            placeholder="Max budget"
                            value={scoutDraft.searchPreferences.maxBudget}
                            onChange={(e) => updateScoutDraft((current) => ({
                              ...current,
                              searchPreferences: { ...current.searchPreferences, maxBudget: e.target.value },
                            }))}
                          />
                        </div>
                      </Field>
                    </div>

                    <div className="mt-4 grid gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-700">Preferred wheel sizes</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {bikeScoutWheelSizeOptions.map((size) => (
                            <SelectableChip
                              key={size}
                              selected={scoutDraft.searchPreferences.preferredWheelSizes.includes(size)}
                              onClick={() => toggleScoutListValue("preferredWheelSizes", size)}
                            >
                              {size}
                            </SelectableChip>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Preferred bike types</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {bikeScoutTypeOptions.map((type) => (
                            <SelectableChip
                              key={type}
                              selected={scoutDraft.searchPreferences.preferredBikeTypes.includes(type)}
                              onClick={() => toggleScoutListValue("preferredBikeTypes", type)}
                            >
                              {type}
                            </SelectableChip>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Sources</p>
                        <div className="mt-2 grid gap-2">
                          {BIKE_SCOUT_SOURCE_OPTIONS.map((source) => (
                            <label key={source.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={scoutDraft.searchPreferences.marketplaceSources.includes(source.id)}
                                  onChange={() => toggleScoutSource(source.id)}
                                />
                                <div>
                                  <p className="font-semibold text-slate-900">{source.label}</p>
                                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{renderAutomationLevel(source.automationLevel)}</p>
                                  <p className="mt-1 text-xs leading-5 text-slate-600">{source.notes}</p>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <Field label="Included keywords">
                          <input
                            className={inputClass}
                            placeholder="guardian, woom, lightweight"
                            value={scoutDraft.searchPreferences.includedKeywords.join(", ")}
                            onChange={(e) => updateScoutDraft((current) => ({
                              ...current,
                              searchPreferences: { ...current.searchPreferences, includedKeywords: splitCommaValues(e.target.value) },
                            }))}
                          />
                        </Field>
                        <Field label="Excluded keywords">
                          <input
                            className={inputClass}
                            placeholder="repair, rust, too small"
                            value={scoutDraft.searchPreferences.excludedKeywords.join(", ")}
                            onChange={(e) => updateScoutDraft((current) => ({
                              ...current,
                              searchPreferences: { ...current.searchPreferences, excludedKeywords: splitCommaValues(e.target.value) },
                            }))}
                          />
                        </Field>
                        <Field label="Alert frequency">
                          <select
                            className={inputClass}
                            value={scoutDraft.searchPreferences.alertFrequency}
                            onChange={(e) => updateScoutDraft((current) => ({
                              ...current,
                              searchPreferences: {
                                ...current.searchPreferences,
                                alertFrequency: e.target.value as BikeScoutProfile["searchPreferences"]["alertFrequency"],
                              },
                            }))}
                          >
                            <option value="daily">Daily (planned)</option>
                            <option value="twice_daily">Twice daily (planned)</option>
                            <option value="manual_review">Manual review only</option>
                          </select>
                        </Field>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={saveScoutProfile}
                        className="min-h-11 rounded-md bg-brand px-4 text-sm font-bold text-white"
                      >
                        Save local setup preview
                      </button>
                      <p className="text-sm text-slate-600">{scoutNotice}</p>
                    </div>
                  </div>

                  {(savedScoutProfiles[0] || scoutPreview) && (
                    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                      {savedScoutProfiles[0] && (
                        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Saved locally</p>
                              <h3 className="mt-1 text-lg font-bold text-slate-900">{savedScoutProfiles[0].name}</h3>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${savedScoutProfiles[0].enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                              {savedScoutProfiles[0].enabled ? "Prototype enabled" : "Prototype paused"}
                            </span>
                          </div>
                          {(() => {
                            const summary = bikeScoutProfileSummary(savedScoutProfiles[0]);
                            return (
                              <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <InfoLine label="Location" value={summary.locationLine} />
                                <InfoLine label="Budget" value={summary.budgetLine} />
                                <InfoLine label="Wheel sizes" value={summary.wheelSizeLine} />
                                <InfoLine label="Bike types" value={summary.bikeTypeLine} />
                                <InfoLine label="Sources" value={summary.sourceLabels.join(", ") || "None selected"} />
                                <InfoLine label="Alert frequency" value={savedScoutProfiles[0].searchPreferences.alertFrequency.replace("_", " ")} />
                              </div>
                            );
                          })()}
                          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Bike Scout conveniences planned</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">Seller message draft</p>
                            <p className="mt-1 text-sm text-slate-700">{buildBikeScoutSellerMessageDraft()}</p>
                            <p className="mt-3 text-sm font-semibold text-slate-900">Pickup inspection checklist</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                              {BIKE_SCOUT_PICKUP_CHECKLIST.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                          </div>
                        </article>
                      )}

                      {scoutPreview && (
                        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Future scoring preview</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-900">{scoutPreview.listing.title}</h3>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${meterSignal(scoutPreview.overallRecommendation.meter)}`}>
                              {scoutPreview.overallRecommendation.label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            This is a local preview showing how future Bike Scout results can reuse today&apos;s fit, value, and safety logic. No background search or alert has actually run.
                          </p>
                          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <InfoLine label="Source" value={sourceLabel(scoutPreview.listing.source as MarketplaceId)} />
                            <InfoLine label="Wheel size match" value={scoutPreview.wheelSizeMatch} />
                            <InfoLine label="Price/value" value={scoutPreview.priceValueSignal} />
                            <InfoLine label="Safety signal" value={scoutPreview.safetySignal} />
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {dimensionCards(scoutPreview.analysis).slice(0, 3).map(([name, item]) => (
                              <div key={name} className={`rounded-xl border p-3 ${meterSignal(item.meter)}`}>
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{name}</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">{item.label}</p>
                                <p className="mt-1 text-xs leading-5 text-slate-700">{item.reasoning}</p>
                              </div>
                            ))}
                          </div>
                        </article>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          </div>
          </section>
          <details className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-700 shadow-panel">
            <summary className="cursor-pointer list-none font-semibold text-slate-900">
              What this AI check can and cannot do
            </summary>
            <p className="mt-3">
              AI can help screen listings, but always check fit, brakes, tires, rust, and condition in person.
            </p>
          </details>
        </>
      </section>
    </main>
  );
}

function AppStoreTabShell({
  activeTab,
  isOffline,
  onSelectTab,
}: {
  activeTab: AppStoreTab;
  isOffline: boolean;
  onSelectTab: (tab: AppStoreTab) => void;
}) {
  return (
    <main className="app-safe-shell min-h-screen bg-slate-50 px-4 pb-28 text-slate-900 md:px-6">
      {isOffline && (
        <div className="app-safe-top sticky z-40 mx-auto mb-4 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-panel">
          You are offline. Local guidance may remain visible, but screenshot extraction and link analysis need a connection.
        </div>
      )}
      <section className="mx-auto grid max-w-2xl gap-4">
        {activeTab === "profile" && <ProfileScreenPlaceholder onEvaluate={() => onSelectTab("evaluate")} />}
        {activeTab === "evaluate" && (
          <EvaluateScreenPlaceholder
            onHistory={() => onSelectTab("history")}
            onProfile={() => onSelectTab("profile")}
          />
        )}
        {activeTab === "history" && <HistoryScreenPlaceholder onEvaluate={() => onSelectTab("evaluate")} />}
        {activeTab === "settings" && <SettingsScreenPlaceholder />}
      </section>
      <BottomTabNav activeTab={activeTab} onSelectTab={onSelectTab} />
    </main>
  );
}

function AppScreenHeader({ title, eyebrow, copy }: { title: string; eyebrow: string; copy: string }) {
  return (
    <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
    </header>
  );
}

function ProfileScreenPlaceholder({ onEvaluate }: { onEvaluate: () => void }) {
  const [savedProfile, setSavedProfile] = useState<AppStoreActiveChildProfile | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [nickname, setNickname] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft-in">("cm");
  const [heightCmInput, setHeightCmInput] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [age, setAge] = useState("");
  const [experience, setExperience] = useState<ChildProfile["experience"]>("beginner");
  const [weightUnit, setWeightUnit] = useState<"lb" | "kg">("lb");
  const [weightInput, setWeightInput] = useState("");
  const [stylePreference, setStylePreference] = useState("all good / no preference");
  const [colorPreferences, setColorPreferences] = useState<string[]>(defaultChild.colorPreferences);
  const [validationMessage, setValidationMessage] = useState("");
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  useEffect(() => {
    const storedProfile = loadAppStoreActiveChildProfile();
    if (!storedProfile) return;
    setSavedProfile(storedProfile);
    hydrateAppStoreProfileForm(storedProfile);
    setIsEditing(false);
    // Profile hydration should run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedChild = useMemo<ChildProfile>(() => {
    const normalizedHeightCm = heightUnit === "cm" ? heightCmInput : feetInchesToCm(heightFeet, heightInches);
    const normalizedWeightKg = weightInput ? (weightUnit === "lb" ? lbToKg(weightInput) : toFixed(weightInput, 1)) : "";
    return {
      ...defaultChild,
      heightCm: normalizedHeightCm,
      age,
      weight: normalizedWeightKg,
      experience,
      stylePreference,
      colorPreferences,
    };
  }, [age, colorPreferences, experience, heightCmInput, heightFeet, heightInches, heightUnit, stylePreference, weightInput, weightUnit]);

  const activeRecommendation = savedProfile ? buildChildBikeRecommendation(savedProfile.child) : null;

  function hydrateAppStoreProfileForm(profile: AppStoreActiveChildProfile) {
    const childProfile = profile.child;
    setNickname(profile.nickname || "");
    setHeightUnit("cm");
    setHeightCmInput(childProfile.heightCm || "");
    setHeightFeet("");
    setHeightInches("");
    setAge(childProfile.age || "");
    setExperience(childProfile.experience || "beginner");
    setWeightUnit("kg");
    setWeightInput(childProfile.weight || "");
    setStylePreference(childProfile.stylePreference || "all good / no preference");
    setColorPreferences(childProfile.colorPreferences?.length ? childProfile.colorPreferences : defaultChild.colorPreferences);
  }

  function toggleAppStoreColorPreference(option: string) {
    setColorPreferences((current) => {
      const values = current || [];
      if (option === "No preference / all colors are fine") {
        return ["No preference / all colors are fine"];
      }
      const next = values.filter((value) => value !== "No preference / all colors are fine");
      if (next.includes(option)) {
        const filtered = next.filter((value) => value !== option);
        return filtered.length ? filtered : ["No preference / all colors are fine"];
      }
      return [...next, option];
    });
  }

  function validateAppStoreProfile() {
    const height = Number(normalizedChild.heightCm);
    const parsedAge = Number(age);
    if (!height) return "Enter height to estimate bike size.";
    if (height < 80 || height > 190) return "Check height. Use a child-height value.";
    if (age && (!Number.isFinite(parsedAge) || parsedAge < 2 || parsedAge > 18)) return "Check age. Use a value from 2 to 18.";
    if (!experience) return "Choose riding experience.";
    return "";
  }

  function saveProfile() {
    const error = validateAppStoreProfile();
    if (error) {
      setValidationMessage(error);
      return;
    }
    const nextProfile: AppStoreActiveChildProfile = {
      nickname: nickname.trim(),
      child: normalizedChild,
      savedAt: new Date().toISOString(),
    };
    saveAppStoreActiveChildProfile(nextProfile);
    setSavedProfile(nextProfile);
    setValidationMessage("");
    setIsConfirmingClear(false);
    setIsEditing(false);
  }

  function editProfile() {
    if (savedProfile) hydrateAppStoreProfileForm(savedProfile);
    setValidationMessage("");
    setIsConfirmingClear(false);
    setIsEditing(true);
  }

  function clearProfile() {
    clearAppStoreActiveChildProfile();
    setSavedProfile(null);
    setNickname("");
    setHeightUnit("cm");
    setHeightCmInput("");
    setHeightFeet("");
    setHeightInches("");
    setAge("");
    setExperience("beginner");
    setWeightUnit("lb");
    setWeightInput("");
    setStylePreference("all good / no preference");
    setColorPreferences(defaultChild.colorPreferences);
    setValidationMessage("");
    setIsConfirmingClear(false);
    setIsEditing(true);
  }

  function cancelEdit() {
    if (!savedProfile) return;
    hydrateAppStoreProfileForm(savedProfile);
    setValidationMessage("");
    setIsConfirmingClear(false);
    setIsEditing(false);
  }

  return (
    <>
      <AppScreenHeader
        eyebrow="Mandy's Bike Finder"
        title="Profile"
        copy="Save your child's bike fit profile so each listing check starts from the right size and riding context."
      />
      {!savedProfile && !isEditing && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Child profile</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">Add your rider</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Height, age, and riding experience help Mandy estimate the right bike size. Stored locally. No account needed.
          </p>
          <button type="button" onClick={() => setIsEditing(true)} className="mt-5 min-h-11 rounded-md bg-brand px-4 text-sm font-bold text-white">
            Create profile
          </button>
        </section>
      )}
      {savedProfile && !isEditing && activeRecommendation && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Saved on this device</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">{savedProfile.nickname || "Your child"}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Age {savedProfile.child.age || "not set"} - {savedProfile.child.heightCm || "unknown"} cm - {savedProfile.child.experience}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={editProfile} className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700">
                Edit
              </button>
              <button type="button" onClick={() => setIsConfirmingClear(true)} className="min-h-10 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-bold text-red-700">
                Clear
              </button>
            </div>
          </div>
          {isConfirmingClear && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-800">Clear this profile from this device?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={clearProfile} className="min-h-10 rounded-md bg-red-700 px-3 text-sm font-bold text-white">
                  Confirm clear
                </button>
                <button type="button" onClick={() => setIsConfirmingClear(false)} className="min-h-10 rounded-md border border-red-200 bg-white px-3 text-sm font-bold text-red-700">
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoLine label="Recommended wheel size" value={activeRecommendation.wheelSize} />
            <InfoLine label="Recommended bike type" value={activeRecommendation.category} />
            <InfoLine label="Growth option" value={activeRecommendation.growthOption || "No growth option needed now"} />
            <InfoLine label="Style guidance" value={activeRecommendation.styleRecommendation || "Fit-first neutral styling"} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">{activeRecommendation.explanation}</p>
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700">
            This recommendation is a starting point. Parents should still check fit, brakes, tires, rust, and test-ride comfort before buying.
          </p>
          <button type="button" onClick={onEvaluate} className="mt-5 min-h-11 w-full rounded-md bg-brand px-4 text-sm font-bold text-white">
            Evaluate a bike
          </button>
        </section>
      )}
      {isEditing && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Child profile</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">{savedProfile ? "Edit rider profile" : "Set up your rider"}</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Child name / nickname" optional>
              <input className={inputClass} value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="Optional nickname" />
            </Field>
            <Field label="Height" required>
              <div className="grid grid-cols-[110px_1fr] gap-2">
                <select className={inputClass} value={heightUnit} onChange={(event) => setHeightUnit(event.target.value as "cm" | "ft-in")}>
                  <option value="cm">cm</option>
                  <option value="ft-in">ft-in</option>
                </select>
                {heightUnit === "cm" ? (
                  <input className={inputClass} type="number" min="80" max="190" placeholder="Height value" value={heightCmInput} onChange={(event) => setHeightCmInput(event.target.value)} />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inputClass} type="number" min="2" max="6" placeholder="feet" value={heightFeet} onChange={(event) => setHeightFeet(event.target.value)} />
                    <input className={inputClass} type="number" min="0" max="11" placeholder="inches" value={heightInches} onChange={(event) => setHeightInches(event.target.value)} />
                  </div>
                )}
              </div>
            </Field>
            <Field label="Age" required>
              <input className={inputClass} type="number" min="2" max="18" placeholder="Age" value={age} onChange={(event) => setAge(event.target.value)} />
            </Field>
            <Field label="Riding experience" required>
              <select className={inputClass} value={experience} onChange={(event) => setExperience(event.target.value as ChildProfile["experience"])}>
                <option value="beginner">Beginner</option>
                <option value="comfortable">Comfortable</option>
                <option value="confident">Confident</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
            <Field label="Weight" optional>
              <div className="grid grid-cols-[110px_1fr] gap-2">
                <select className={inputClass} value={weightUnit} onChange={(event) => setWeightUnit(event.target.value as "lb" | "kg")}>
                  <option value="lb">lb</option>
                  <option value="kg">kg</option>
                </select>
                <input className={inputClass} type="number" placeholder="Weight value" value={weightInput} onChange={(event) => setWeightInput(event.target.value)} />
              </div>
            </Field>
            <Field label="Style preference" optional>
              <select className={inputClass} value={stylePreference} onChange={(event) => setStylePreference(event.target.value)}>
                <option value="all good / no preference">All good / no preference</option>
                <option value="boy-style">Boy-style</option>
                <option value="girl-style">Girl-style</option>
              </select>
            </Field>
            <Field label="Color preference" optional>
              <div className="grid gap-2 rounded-md border border-slate-300 bg-slate-50 p-3 sm:grid-cols-2">
                {colorPreferenceOptions.map((option) => (
                  <ColorPreferenceChip
                    key={option}
                    option={option}
                    selected={colorPreferences.includes(option)}
                    onClick={() => toggleAppStoreColorPreference(option)}
                  />
                ))}
              </div>
            </Field>
          </div>
          {validationMessage && (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
              {validationMessage}
            </p>
          )}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={saveProfile} className="min-h-11 rounded-md bg-brand px-4 text-sm font-bold text-white">
              {savedProfile ? "Update profile" : "Save profile"}
            </button>
            {savedProfile ? (
              <button type="button" onClick={cancelEdit} className="min-h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700">
                Cancel
              </button>
            ) : (
              <button type="button" onClick={onEvaluate} className="min-h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700">
                Evaluate a bike
              </button>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function EvaluateScreenPlaceholder({ onHistory, onProfile }: { onHistory: () => void; onProfile: () => void }) {
  const [activeProfile, setActiveProfile] = useState<AppStoreActiveChildProfile | null>(null);
  const [inputMode, setInputMode] = useState<AppStoreEvaluateInputMode>("screenshot");
  const [draftListing, setDraftListing] = useState<Listing>(defaultListing);
  const [pastedListingText, setPastedListingText] = useState("");
  const [screenshotName, setScreenshotName] = useState("");
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState("");
  const [notice, setNotice] = useState("Local analysis is ready. AI extraction is not automatic; if enabled later, it must require a separate user tap.");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [sellerMessage, setSellerMessage] = useState("");

  const hasProfile = Boolean(activeProfile);
  const hasListingDetails = Boolean(
    (draftListing.title || "").trim() ||
      (draftListing.askingPrice || "").trim() ||
      (draftListing.wheelSize || "").trim() ||
      (draftListing.description || "").trim() ||
      pastedListingText.trim() ||
      screenshotName,
  );
  const canAnalyze = hasProfile && hasListingDetails;

  useEffect(() => {
    setActiveProfile(loadAppStoreActiveChildProfile());
  }, []);

  useEffect(() => {
    return () => {
      if (screenshotPreviewUrl) URL.revokeObjectURL(screenshotPreviewUrl);
    };
  }, [screenshotPreviewUrl]);

  function updateDraftListingField<K extends keyof Listing>(field: K, value: Listing[K]) {
    setDraftListing((current) => ({ ...current, [field]: value }));
    setResult(null);
    setSellerMessage("");
  }

  function handleScreenshotUpload(file: File | null) {
    if (screenshotPreviewUrl) URL.revokeObjectURL(screenshotPreviewUrl);
    setResult(null);
    setSellerMessage("");
    if (!file) {
      setScreenshotName("");
      setScreenshotPreviewUrl("");
      setNotice("Screenshot removed. You can still paste text or enter details manually.");
      return;
    }
    setScreenshotName(file.name);
    setScreenshotPreviewUrl(URL.createObjectURL(file));
    setNotice("Screenshot attached for local preview only. No AI or server processing started.");
  }

  function applyPastedTextLocally() {
    const text = pastedListingText.trim();
    if (!text) {
      setNotice("Paste listing text first, then apply it to the editable review fields.");
      return;
    }
    const extracted = localExtract(text);
    setDraftListing((current) => ({
      ...current,
      ...compactFields(extracted),
      description: extracted.description || current.description,
    }));
    setResult(null);
    setSellerMessage("");
    setNotice("Listing text was parsed locally on this device. Review the fields before analyzing.");
  }

  function analyzeListingLocally() {
    if (!activeProfile) {
      setNotice("Save a child profile first so Mandy can check bike fit.");
      return;
    }

    const parsedText: Partial<Listing> = pastedListingText.trim() ? localExtract(pastedListingText) : {};
    const listingForAnalysis: Listing = {
      ...draftListing,
      ...compactFields({
        title: draftListing.title || parsedText.title,
        askingPrice: draftListing.askingPrice || parsedText.askingPrice,
        wheelSize: draftListing.wheelSize || parsedText.wheelSize,
        description: draftListing.description || parsedText.description,
      }),
    };

    if (!hasListingDetails) {
      setNotice("Add a screenshot, pasted text, or a few manual listing details before analyzing.");
      return;
    }

    const localResult = analyzeBike(activeProfile.child, listingForAnalysis, localPriceReference(listingForAnalysis));
    setDraftListing(listingForAnalysis);
    setResult(localResult);
    setSellerMessage(generateSellerMessage("askQuestions", "friendly", listingForAnalysis, {}));
    setNotice("Local analysis complete. No screenshot, listing text, or child profile was sent to an AI service for this result.");
  }

  function saveResultToHistory() {
    if (!activeProfile || !result) {
      setNotice("Run an analysis before saving to History.");
      return;
    }

    const saved = addAppStoreSavedEvaluation({
      listing: draftListing,
      analysis: result,
      sellerMessage,
      childNickname: activeProfile.nickname,
      childSnapshot: activeProfile.child,
      inputMode,
      screenshotName,
    });
    setNotice(saved.wasDuplicate ? "This result is already in History, so the existing saved item was moved to the top." : "Saved to History on this device.");
    onHistory();
  }

  return (
    <>
      <AppScreenHeader
        eyebrow="One listing at a time"
        title="Evaluate"
        copy="Upload a screenshot, paste listing text, or enter details manually. This App Store MVP slice uses local guidance until the user explicitly chooses an AI action in a future pass."
      />

      {!hasProfile && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-panel">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Profile needed</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">Save a child profile first</h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Bike fit depends on height and riding experience. Your profile stays on this device.
          </p>
          <button type="button" onClick={onProfile} className="mt-5 min-h-11 rounded-md bg-brand px-4 text-sm font-bold text-white">
            Go to Profile
          </button>
        </section>
      )}

      {activeProfile && (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-emerald-950">
            Checking for {activeProfile.nickname?.trim() || "your child"}
          </p>
          <p className="mt-1 text-xs font-semibold text-emerald-800">
            {activeProfile.child.heightCm || "Unknown"} cm, {activeProfile.child.experience} rider
          </p>
        </section>
      )}

      <section className="grid gap-3">
        <AppStoreInputMethodButton
          active={inputMode === "screenshot"}
          title="Upload screenshot"
          copy="Attach an image for local preview. Selecting a file does not start AI or server processing."
          onClick={() => setInputMode("screenshot")}
        />
        <AppStoreInputMethodButton
          active={inputMode === "link"}
          title="Paste link or text"
          copy="Save the link as a reference and paste readable listing text. No marketplace page is scraped automatically."
          onClick={() => setInputMode("link")}
        />
        <AppStoreInputMethodButton
          active={inputMode === "manual"}
          title="Manual entry"
          copy="Enter details yourself and use local guidance. No AI is required."
          onClick={() => setInputMode("manual")}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Input</p>
        {inputMode === "screenshot" && (
          <div className="mt-4 grid gap-4">
            <label className="grid min-h-28 cursor-pointer place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <span className="text-sm font-bold text-slate-900">{screenshotName || "Choose listing screenshot"}</span>
              <span className="mt-1 text-xs font-semibold text-slate-500">JPG, PNG, or HEIC from the system picker</span>
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(event) => handleScreenshotUpload(event.target.files?.[0] || null)}
              />
            </label>
            {screenshotPreviewUrl && (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={screenshotPreviewUrl} alt="Uploaded listing screenshot preview" className="max-h-72 w-full object-contain" />
              </div>
            )}
            <p className="text-xs font-semibold text-slate-600">
              Choosing a screenshot only creates a local preview. Any future AI extraction must use a separate button and server-side limits.
            </p>
          </div>
        )}

        {inputMode === "link" && (
          <div className="mt-4 grid gap-4">
            <Field label="Listing link" optional>
              <input
                className={inputClass}
                type="url"
                placeholder="https://..."
                value={draftListing.listingLink || ""}
                onChange={(event) => {
                  const url = event.target.value;
                  const marketplace = detectMarketplace(url);
                  updateDraftListingField("listingLink", url);
                  updateDraftListingField("platform", marketplace.label || draftListing.platform || "");
                }}
              />
            </Field>
            <Field label="Listing text" optional>
              <textarea
                className={`${inputClass} min-h-32`}
                placeholder="Paste the marketplace title, price, wheel size, condition, or description here."
                value={pastedListingText}
                onChange={(event) => {
                  setPastedListingText(event.target.value);
                  setResult(null);
                  setSellerMessage("");
                }}
              />
            </Field>
            <button type="button" onClick={applyPastedTextLocally} className="min-h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800">
              Apply pasted text locally
            </button>
          </div>
        )}

        {inputMode === "manual" && (
          <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
            Enter or edit the listing details below, then run local analysis.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-blue-100 bg-blue-50/80 p-5 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Review first</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">Listing details</h2>
        <div className="mt-4 grid gap-4">
          <Field label="Bike title" optional>
            <input className={inputClass} value={draftListing.title} onChange={(event) => updateDraftListingField("title", event.target.value)} placeholder="20 inch Trek kids bike" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price" optional>
              <input className={inputClass} inputMode="numeric" value={draftListing.askingPrice || ""} onChange={(event) => updateDraftListingField("askingPrice", event.target.value)} placeholder="120" />
            </Field>
            <Field label="Wheel size" optional>
              <input className={inputClass} value={draftListing.wheelSize || ""} onChange={(event) => updateDraftListingField("wheelSize", event.target.value)} placeholder="20 inch" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand" optional>
              <input className={inputClass} value={draftListing.brand || ""} onChange={(event) => updateDraftListingField("brand", event.target.value)} placeholder="Trek, Woom, Schwinn" />
            </Field>
            <Field label="Bike type" optional>
              <input className={inputClass} value={draftListing.bikeType || ""} onChange={(event) => updateDraftListingField("bikeType", event.target.value)} placeholder="Hybrid, mountain, cruiser" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Platform/source" optional>
              <input className={inputClass} value={draftListing.platform || ""} onChange={(event) => updateDraftListingField("platform", event.target.value)} placeholder="Facebook Marketplace" />
            </Field>
            <Field label="Location" optional>
              <input className={inputClass} value={draftListing.location || ""} onChange={(event) => updateDraftListingField("location", event.target.value)} placeholder="Nearby city or pickup area" />
            </Field>
          </div>
          <Field label="Condition / description" optional>
            <textarea
              className={`${inputClass} min-h-28`}
              value={draftListing.description}
              onChange={(event) => updateDraftListingField("description", event.target.value)}
              placeholder="Brakes work, tires hold air, light rust, needs tube..."
            />
          </Field>
        </div>
        {notice && (
          <p className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
            {notice}
          </p>
        )}
        <button
          type="button"
          disabled={!canAnalyze}
          onClick={analyzeListingLocally}
          className={`mt-5 min-h-11 w-full rounded-md px-4 text-sm font-bold ${
            canAnalyze ? "bg-brand text-white" : "cursor-not-allowed bg-slate-300 text-slate-600"
          }`}
        >
          Analyze bike locally
        </button>
        <p className="mt-3 text-xs font-semibold text-slate-600">
          This button uses the local fallback engine only. It does not send listing text, screenshots, or profile data to OpenAI.
        </p>
      </section>

      {result && (
        <section className="rounded-lg border border-emerald-200 bg-white p-5 shadow-panel">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Result</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{result.overall.label}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{result.overall.reasoning}</p>
          <div className="mt-4 grid gap-3">
            <ResultMeter label="Fit" item={result.dimensions.fit} />
            <ResultMeter label="Deal/value" item={result.dimensions.price} />
            <ResultMeter label="Risk" item={result.dimensions.risk} />
          </div>
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-900">Seller message</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{sellerMessage}</p>
          </div>
          <button type="button" onClick={saveResultToHistory} className="mt-4 min-h-11 w-full rounded-md bg-brand px-4 text-sm font-bold text-white">
            Save to History
          </button>
          <p className="mt-3 text-xs font-semibold text-slate-600">
            Saved history stores this local result on this device and does not re-run AI.
          </p>
        </section>
      )}
    </>
  );
}

function AppStoreInputMethodButton({
  active,
  title,
  copy,
  onClick,
}: {
  active: boolean;
  title: string;
  copy: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-5 text-left shadow-panel transition ${
        active ? "border-brand bg-blue-50" : "border-slate-200 bg-white"
      }`}
      aria-pressed={active}
    >
      <span className="block text-lg font-bold text-slate-950">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-slate-600">{copy}</span>
    </button>
  );
}

function ResultMeter({ label, item }: { label: string; item: MeterResult }) {
  const meterClasses: Record<MeterResult["meter"], string> = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    yellow: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-rose-200 bg-rose-50 text-rose-900",
  };

  return (
    <article className={`rounded-md border p-3 ${meterClasses[item.meter]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em]">{label}</p>
      <h3 className="mt-1 text-sm font-bold">{item.label}</h3>
      <p className="mt-1 text-xs leading-5">{item.reasoning}</p>
    </article>
  );
}

function HistoryScreenPlaceholder({ onEvaluate }: { onEvaluate: () => void }) {
  const [savedEvaluations, setSavedEvaluations] = useState<AppStoreSavedEvaluation[]>([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState("");

  useEffect(() => {
    const saved = loadAppStoreSavedEvaluations();
    setSavedEvaluations(saved);
    setSelectedEvaluationId(saved[0]?.id || "");
  }, []);

  const selectedEvaluation = savedEvaluations.find((evaluation) => evaluation.id === selectedEvaluationId) || null;

  function refreshHistory(next: AppStoreSavedEvaluation[]) {
    saveAppStoreSavedEvaluations(next);
    setSavedEvaluations(next);
    if (selectedEvaluationId && !next.some((evaluation) => evaluation.id === selectedEvaluationId)) {
      setSelectedEvaluationId(next[0]?.id || "");
    }
  }

  function toggleFavorite(id: string) {
    refreshHistory(savedEvaluations.map((evaluation) => (
      evaluation.id === id ? { ...evaluation, favorite: !evaluation.favorite } : evaluation
    )));
  }

  function deleteEvaluation(id: string) {
    if (!window.confirm("Delete this saved bike check from this device?")) return;
    refreshHistory(savedEvaluations.filter((evaluation) => evaluation.id !== id));
  }

  return (
    <>
      <AppScreenHeader
        eyebrow="Saved on this device"
        title="History"
        copy="Saved evaluations stay on this device for the first App Store MVP. Opening History does not re-run analysis or call AI."
      />

      {!savedEvaluations.length ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Empty state</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">No saved bike checks yet</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Save an evaluation to keep title, price, source, recommendation, fit/deal/risk summary, and favorite status on this device.
          </p>
          <button type="button" onClick={onEvaluate} className="mt-5 min-h-11 rounded-md bg-brand px-4 text-sm font-bold text-white">
            Evaluate a bike
          </button>
        </section>
      ) : (
        <section className="grid gap-3">
          {savedEvaluations.map((evaluation) => (
            <article key={evaluation.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {evaluation.listing.platform || sourceLabelFromInputMode(evaluation.inputMode)}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">{evaluation.listing.title || "Untitled bike listing"}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {evaluation.listing.askingPrice ? `$${evaluation.listing.askingPrice}` : "Price not set"} - {formatAppStoreDate(evaluation.savedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(evaluation.id)}
                  className={`min-h-10 rounded-md border px-3 text-xs font-bold ${
                    evaluation.favorite ? "border-amber-300 bg-amber-50 text-amber-900" : "border-slate-300 bg-white text-slate-700"
                  }`}
                  aria-pressed={evaluation.favorite}
                >
                  {evaluation.favorite ? "Favorite" : "Shortlist"}
                </button>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <p className="font-bold text-slate-950">{evaluation.analysis.overall.label}</p>
                <p>
                  Fit: {evaluation.analysis.dimensions.fit.label} - Deal: {evaluation.analysis.dimensions.price.label} - Risk: {evaluation.analysis.dimensions.risk.label}
                </p>
                {evaluation.screenshotName && (
                  <p className="text-xs font-semibold text-slate-500">Screenshot reference: {evaluation.screenshotName}</p>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvaluationId((current) => current === evaluation.id ? "" : evaluation.id)}
                  className="min-h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800"
                >
                  {selectedEvaluationId === evaluation.id ? "Hide details" : "View details"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteEvaluation(evaluation.id)}
                  className="min-h-10 rounded-md border border-rose-200 bg-rose-50 px-3 text-sm font-bold text-rose-800"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {selectedEvaluation && (
        <section className="rounded-lg border border-blue-100 bg-blue-50/80 p-5 shadow-panel">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Saved detail</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">{selectedEvaluation.analysis.overall.label}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{selectedEvaluation.analysis.overall.reasoning}</p>
          <div className="mt-4 grid gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <p className="font-bold text-slate-950">Listing basics</p>
            <p>{selectedEvaluation.listing.title || "Untitled bike listing"}</p>
            <p>
              {selectedEvaluation.listing.askingPrice ? `$${selectedEvaluation.listing.askingPrice}` : "Price not set"}
              {selectedEvaluation.listing.wheelSize ? ` - ${selectedEvaluation.listing.wheelSize}` : ""}
              {selectedEvaluation.listing.brand ? ` - ${selectedEvaluation.listing.brand}` : ""}
            </p>
            <p>{selectedEvaluation.listing.location || selectedEvaluation.listing.platform || sourceLabelFromInputMode(selectedEvaluation.inputMode)}</p>
            {selectedEvaluation.listing.listingLink && <p className="break-words text-xs font-semibold text-slate-500">Reference: {selectedEvaluation.listing.listingLink}</p>}
          </div>
          <div className="mt-3 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
            <p className="font-bold text-slate-950">Child snapshot</p>
            <p className="mt-1">
              {selectedEvaluation.childNickname?.trim() || "Your child"} - {selectedEvaluation.childSnapshot.heightCm || "unknown"} cm - {selectedEvaluation.childSnapshot.experience}
            </p>
          </div>
          <div className="mt-4 grid gap-3">
            <ResultMeter label="Fit" item={selectedEvaluation.analysis.dimensions.fit} />
            <ResultMeter label="Deal/value" item={selectedEvaluation.analysis.dimensions.price} />
            <ResultMeter label="Risk" item={selectedEvaluation.analysis.dimensions.risk} />
          </div>
          <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
            <p className="text-sm font-bold text-slate-900">Seller message</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{selectedEvaluation.sellerMessage}</p>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-600">
            Opening this saved item does not re-run AI, re-analyze the listing, or re-fetch marketplace pages.
          </p>
        </section>
      )}
    </>
  );
}

function SettingsScreenPlaceholder() {
  const [hasProfile, setHasProfile] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    refreshSettingsDataSummary();
  }, []);

  function refreshSettingsDataSummary() {
    setHasProfile(Boolean(loadAppStoreActiveChildProfile()));
    setHistoryCount(loadAppStoreSavedEvaluations().length);
  }

  function clearProfileFromSettings() {
    if (!hasProfile) {
      setNotice("No child profile is saved on this device.");
      return;
    }
    if (!window.confirm("Clear the saved child profile from this device?")) return;
    clearAppStoreActiveChildProfile();
    refreshSettingsDataSummary();
    setNotice("Child profile cleared from this device.");
  }

  function clearHistoryFromSettings() {
    if (!historyCount) {
      setNotice("No saved evaluations are stored on this device.");
      return;
    }
    if (!window.confirm("Clear all saved bike evaluations from this device?")) return;
    clearAppStoreSavedEvaluations();
    refreshSettingsDataSummary();
    setNotice("Saved evaluations cleared from this device.");
  }

  function clearAllLocalDataFromSettings() {
    if (!hasProfile && !historyCount) {
      setNotice("No App Store MVP local data is stored on this device.");
      return;
    }
    if (!window.confirm("Clear child profile and saved evaluations from this device?")) return;
    clearAppStoreMvpLocalData();
    refreshSettingsDataSummary();
    setNotice("All App Store MVP local data cleared from this device.");
  }

  return (
    <>
      <AppScreenHeader
        eyebrow="Privacy and controls"
        title="Settings"
        copy="The App Store MVP keeps privacy, AI disclosure, local data controls, and app information in one predictable place."
      />
      <section className="grid gap-3">
        <SettingsPlaceholderCard title="Privacy summary" copy="Child profile and saved evaluations are stored on this device for the App Store MVP. No account or cloud sync is required, and you can clear local data at any time." />
        <SettingsPlaceholderCard title="AI disclosure" copy="AI features are optional and must start from a clear user action. Choosing a screenshot or pasting text does not start AI by itself. Local fallback analysis works without AI, provider keys stay server-side, and initial app load does not call OpenAI or an LLM." />
        <SettingsPlaceholderCard title="Marketplace disclosure" copy="Links, text, and screenshots are user-provided references. Mandy's Bike Finder does not automatically scrape Facebook, OfferUp, Craigslist, or login-gated marketplace pages, and saved History does not re-fetch marketplace pages." />
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h2 className="text-lg font-bold text-slate-950">Privacy policy</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Review the public product privacy draft for the App Store MVP.
          </p>
          <a className="mt-4 inline-flex min-h-11 items-center rounded-md bg-brand px-4 text-sm font-bold text-white" href="/privacy">
            Open privacy policy
          </a>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h2 className="text-lg font-bold text-slate-950">Local data controls</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Current device data: {hasProfile ? "1 child profile" : "no child profile"} and {historyCount} saved {historyCount === 1 ? "evaluation" : "evaluations"}.
          </p>
          {notice && (
            <p className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-900">
              {notice}
            </p>
          )}
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={clearProfileFromSettings}
              className="min-h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800"
            >
              Clear child profile
            </button>
            <button
              type="button"
              onClick={clearHistoryFromSettings}
              className="min-h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800"
            >
              Clear history
            </button>
            <button
              type="button"
              onClick={clearAllLocalDataFromSettings}
              className="min-h-11 rounded-md border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-800"
            >
              Clear all local data
            </button>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h2 className="text-lg font-bold text-slate-950">About</h2>
          <div className="mt-2 grid gap-2 text-sm leading-6 text-slate-600">
            <p><span className="font-bold text-slate-800">App:</span> Mandy&apos;s Bike Finder</p>
            <p><span className="font-bold text-slate-800">Mode:</span> App Store MVP</p>
            <p><span className="font-bold text-slate-800">Version:</span> Build placeholder</p>
            <p><span className="font-bold text-slate-800">Feedback:</span> Coming in a later release.</p>
          </div>
        </article>

        <SettingsPlaceholderCard
          title="Disclaimer"
          copy="Bike recommendations are decision support only. Parents should inspect fit, brakes, tires, frame condition, and safety before purchase."
        />
      </section>
    </>
  );
}

function SettingsPlaceholderCard({ title, copy }: { title: string; copy: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
    </article>
  );
}

function BottomTabNav({
  activeTab,
  onSelectTab,
}: {
  activeTab: AppStoreTab;
  onSelectTab: (tab: AppStoreTab) => void;
}) {
  const tabs: Array<{ id: AppStoreTab; label: string }> = [
    { id: "profile", label: "Profile" },
    { id: "evaluate", label: "Evaluate" },
    { id: "history", label: "History" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_-24px_rgba(15,23,42,0.55)] backdrop-blur" aria-label="App Store MVP tabs">
      <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-12 rounded-md px-2 text-xs font-bold transition ${
                active ? "bg-brand text-white shadow-panel" : "bg-slate-50 text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
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
    <div className="rounded-input border border-line bg-white px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function HowItWorksCard({ icon, title, copy }: { icon: string; title: string; copy: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <p className="text-lg" aria-hidden>{icon}</p>
      <h3 className="mt-1 text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{copy}</p>
    </article>
  );
}

function FlowStepButton({
  step,
  title,
  status,
  active,
  complete,
  disabled,
  onClick,
}: {
  step: string;
  title: string;
  status: string;
  active: boolean;
  complete: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const tone = active
    ? "border-brand bg-surface-blue text-ink shadow-sm"
    : complete
      ? "border-emerald-200 bg-surface-green text-emerald-950"
      : "border-line bg-white text-slate-600";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-16 items-center gap-3 rounded-card border p-3 text-left transition hover:shadow-panel disabled:cursor-not-allowed disabled:opacity-55 md:min-h-24 ${tone}`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold md:h-10 md:w-10 ${active ? "bg-brand text-white" : complete ? "bg-good text-white" : "bg-slate-100 text-muted"}`}>
        {complete ? "OK" : step}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{title}</span>
        <span className="mt-0.5 block truncate text-xs font-semibold opacity-75">{status}</span>
      </span>
    </button>
  );
}

function ColorPreferenceChip({
  option,
  selected,
  onClick,
}: {
  option: string;
  selected: boolean;
  onClick: () => void;
}) {
  const swatches = colorSwatches(option);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center gap-3 rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
        selected ? "border-brand bg-white text-slate-950 shadow-sm" : "border-slate-200 bg-white/70 text-slate-700 hover:border-blue-200"
      }`}
    >
      <span className="flex shrink-0 -space-x-1">
        {swatches.map((color) => (
          <span key={color} className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ background: color }} />
        ))}
      </span>
      <span className="min-w-0 flex-1">{option}</span>
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${selected ? "border-brand bg-brand text-white" : "border-slate-300 bg-white text-transparent"}`}>
        OK
      </span>
    </button>
  );
}

function colorSwatches(option: string) {
  if (option.includes("pink")) return ["#f9a8d4", "#a855f7"];
  if (option.includes("blue")) return ["#60a5fa", "#34d399"];
  if (option.includes("red")) return ["#ef4444", "#fb923c"];
  if (option.includes("black")) return ["#111827", "#f8fafc", "#94a3b8"];
  if (option.includes("bright")) return ["#facc15", "#22c55e", "#38bdf8"];
  if (option.includes("mature")) return ["#64748b", "#e2e8f0"];
  return ["#cbd5e1", "#f8fafc"];
}

function SelectableChip({
  children,
  onClick,
  selected,
}: {
  children: ReactNode;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${selected ? "border-brand bg-blue-50 text-brand" : "border-slate-200 bg-white text-slate-700"}`}
    >
      {children}
    </button>
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

  // Age reasonableness checks as secondary adjustment
  if (age > 0) {
    if (age <= 4) baseWheel = Math.min(baseWheel, 14);
    else if (age <= 6) baseWheel = Math.min(baseWheel, 18);
  }

  const categoryScores: Record<string, number> = {
    "Balance bike": 0,
    "Training wheels bike": 0,
    "Standard kids bike": 0,
    "Kids cruiser bike": 0,
    "Kids mountain bike": 0,
    "Hybrid / neighborhood bike": 0,
  };

  // Fit signal from wheel size
  if (baseWheel <= 12) {
    categoryScores["Balance bike"] += 6;
    categoryScores["Training wheels bike"] += 3;
  } else if (baseWheel <= 16) {
    categoryScores["Training wheels bike"] += 5;
    categoryScores["Standard kids bike"] += 4;
  } else if (baseWheel <= 18) {
    categoryScores["Standard kids bike"] += 5;
    categoryScores["Training wheels bike"] += 2;
  } else if (baseWheel <= 20) {
    categoryScores["Standard kids bike"] += 4;
    categoryScores["Hybrid / neighborhood bike"] += 3;
    categoryScores["Kids mountain bike"] += 3;
  } else {
    categoryScores["Hybrid / neighborhood bike"] += 5;
    categoryScores["Kids mountain bike"] += 5;
    categoryScores["Kids cruiser bike"] += 1;
  }

  // Experience heavily influences bike type
  if (experience === "beginner") {
    categoryScores["Balance bike"] += 3;
    categoryScores["Training wheels bike"] += 4;
    categoryScores["Standard kids bike"] += 3;
    categoryScores["Kids mountain bike"] -= 3;
    categoryScores["Hybrid / neighborhood bike"] -= 2;
  } else if (experience === "comfortable") {
    categoryScores["Standard kids bike"] += 2;
    categoryScores["Hybrid / neighborhood bike"] += 4;
    categoryScores["Kids mountain bike"] += 4;
    categoryScores["Kids cruiser bike"] += 1;
  } else {
    categoryScores["Kids mountain bike"] += 6;
    categoryScores["Hybrid / neighborhood bike"] += 5;
    categoryScores["Kids cruiser bike"] -= 3;
    categoryScores["Training wheels bike"] -= 5;
    categoryScores["Balance bike"] -= 6;
  }

  // Age reasonableness
  if (age > 0) {
    if (age <= 5) {
      categoryScores["Balance bike"] += 4;
      categoryScores["Training wheels bike"] += 4;
      categoryScores["Kids mountain bike"] -= 4;
      categoryScores["Hybrid / neighborhood bike"] -= 4;
    } else if (age <= 7) {
      categoryScores["Standard kids bike"] += 3;
      categoryScores["Training wheels bike"] += 2;
      categoryScores["Kids mountain bike"] += 1;
      categoryScores["Hybrid / neighborhood bike"] += 1;
    } else {
      categoryScores["Kids mountain bike"] += 3;
      categoryScores["Hybrid / neighborhood bike"] += 3;
      categoryScores["Balance bike"] -= 4;
      categoryScores["Training wheels bike"] -= 3;
    }
  }

  // Cruiser as narrower, explicit style/use-case signal
  const styleLower = stylePreference.toLowerCase();
  const hasCruiserSignal = styleLower.includes("girl") || styleLower.includes("comfort") || styleLower.includes("cruiser");
  if (hasCruiserSignal) {
    categoryScores["Kids cruiser bike"] += 3;
  }
  if (experience === "advanced" || experience === "confident") {
    categoryScores["Kids cruiser bike"] -= 4;
  }
  if (baseWheel >= 24 && age >= 8 && (experience === "comfortable" || experience === "advanced" || experience === "confident")) {
    categoryScores["Kids mountain bike"] += 2;
    categoryScores["Hybrid / neighborhood bike"] += 2;
  }

  // Practicality penalty: cruiser can be heavier / less versatile for progression
  if (baseWheel >= 20 && age >= 7 && (experience === "comfortable" || experience === "advanced" || experience === "confident")) {
    categoryScores["Kids cruiser bike"] -= 2;
  }

  const categoryPriority = [
    "Kids mountain bike",
    "Hybrid / neighborhood bike",
    "Standard kids bike",
    "Kids cruiser bike",
    "Training wheels bike",
    "Balance bike",
  ];
  let category = categoryPriority[0];
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const candidate of categoryPriority) {
    const score = categoryScores[candidate];
    if (score > bestScore) {
      bestScore = score;
      category = candidate;
    }
  }

  const wheelSize = `${baseWheel} inch`;
  const growthOption = baseWheel >= 24
    ? "Consider 26 inch only if the child is confident and can test ride safely."
    : `Consider ${Math.min(baseWheel + 2, 26)} inch only after control and stopping confidence improve.`;

  const styleRecommendation = stylePreference === "all good / no preference"
    ? `${category} with practical geometry and neutral long-term style.`
    : `${category} that matches ${stylePreference} while still prioritizing fit and control.`;
  const explanation = category === "Kids mountain bike"
    ? `Given the child's height, age, and riding experience, a ${wheelSize} kids mountain bike is a practical and versatile option for neighborhood riding, parks, gravel, and light trails.`
    : category === "Hybrid / neighborhood bike"
      ? `A youth hybrid or neighborhood bike is a good all-around option when the child mainly rides on paved paths, driveway, and neighborhood roads. ${wheelSize} is the current fit-first size target.`
      : category === "Kids cruiser bike"
        ? `Cruiser bikes are best for relaxed flat neighborhood riding and style/comfort preference, but they can be heavier and less versatile than mountain or hybrid bikes. ${wheelSize} should still be confirmed with fit and control checks.`
        : category === "Training wheels bike"
          ? `Based on height, age, and riding confidence, a ${wheelSize} training-wheels setup can support stable early riding while control skills improve.`
          : category === "Balance bike"
            ? `A balance bike is the best early option for this height/age stage to build steering, balance, and braking confidence before moving to pedals.`
            : `Based on height ${height || "unknown"} cm, age ${age || "unknown"}, and ${experience} riding experience, a ${wheelSize} standard kids bike is a practical and safe starting point now.`;
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

  const lookForByCategory: Record<string, string[]> = {
    "Kids mountain bike": [
      "Lightweight frame if possible",
      "Working hand brakes",
      "Smooth shifting if the bike has gears",
      `${wheelSize} wheel size for current height range`,
      "Reasonable standover height",
      "Tires suitable for neighborhood and light trail use",
    ],
    "Kids cruiser bike": [
      "Comfortable upright position",
      "Low step-through frame",
      "Simple controls",
      "Good fit and manageable weight",
      "Good condition tires and brakes",
    ],
  };
  const avoidByCategory: Record<string, string[]> = {
    "Kids mountain bike": [
      "Bike that is too heavy for the child to control",
      "Poor brake condition",
      "Suspension that is cheap, broken, or unnecessarily heavy",
      "Adult-sized 26 inch bike unless height and age clearly support it",
      "Rust, bent wheels, or rough shifting",
    ],
    "Kids cruiser bike": [
      "Very heavy frame",
      "Poor braking",
      "Bike that is too large despite low step-through frame",
      "Single-speed bike if the area has hills",
      "Choosing cruiser only for looks if the child needs a more versatile bike",
    ],
  };

  return {
    category,
    wheelSize,
    growthOption,
    styleRecommendation,
    explanation,
    optionalNotes,
    lookFor: lookForByCategory[category] || [
      "Low standover height",
      "Adjustable seat height",
      "Working hand brakes",
      "Not too heavy",
      "Simple gearing if the child is not advanced",
      "Test ride if considering a larger size",
    ],
    avoid: avoidByCategory[category] || [
      "Bike that is too large to grow into",
      "Very heavy department-store bike if the child is still learning",
      "Poor brake condition",
      "Rusty chain or flat tires unless willing to repair",
      "Overly childish color/style if the child may outgrow it emotionally",
    ],
    illustrationHint: `${wheelSize} ${category}`.replace(/\s+/g, " ").trim(),
  };
}

const inputClass = "w-full rounded-input border border-line bg-white px-3 py-2 text-ink outline-brand/20 transition placeholder:text-muted focus:border-brand focus:outline";

function SectionTitle({ step, title }: { step: string; title: string }) {
  return <div className="mb-4 mt-2 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand font-bold text-white">{step}</span><h2 className="text-lg font-bold text-ink">{title}</h2></div>;
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

function CompactDimensionCard({ name, item }: { name: string; item: MeterResult }) {
  const cardTone = item.meter === "green"
    ? "border-green-200 bg-green-50"
    : item.meter === "red"
      ? "border-red-200 bg-red-50"
      : "border-amber-200 bg-amber-50";
  return (
    <article className={`rounded-md border p-4 ${cardTone}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">{name}</h3>
        <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-bold uppercase text-slate-600">{item.meter}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-800">{item.label}</p>
      <p className="mt-2 text-sm leading-5 text-slate-700">{item.reasoning}</p>
    </article>
  );
}

function OverallRecommendationMeter({ meter }: { meter: MeterResult["meter"] }) {
  const pointer = meter === "green" ? "84%" : meter === "yellow" ? "50%" : "16%";
  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="relative pt-6">
        <div
          className="absolute top-0 h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-slate-900"
          style={{ left: pointer }}
          aria-hidden
        />
        <div className="grid h-4 overflow-hidden rounded-full border border-white shadow-inner sm:h-5" aria-label={`Overall recommendation meter: ${meter}`}>
          <div className="grid grid-cols-3">
            <span className="bg-red-400" />
            <span className="bg-amber-300" />
            <span className="bg-emerald-400" />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 text-xs font-bold uppercase tracking-wide text-slate-500">
          <span>Skip</span>
          <span className="text-center">Caution</span>
          <span className="text-right">Good</span>
        </div>
      </div>
    </div>
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

function splitCommaValues(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function renderAutomationLevel(level: "planned_mvp" | "planned_best_effort" | "user_assisted_only") {
  if (level === "planned_mvp") return "Practical automated candidate";
  if (level === "planned_best_effort") return "Best-effort planned";
  return "User-assisted only";
}

function buildScoutPreviewListing(profile: BikeScoutProfile, listing: Listing): NormalizedListing {
  const preferredWheelSize = profile.searchPreferences.preferredWheelSizes[0] || "20 inch";
  const preferredBikeType = profile.searchPreferences.preferredBikeTypes[0] || "Hybrid / neighborhood bike";
  const title = listing.title || `${preferredWheelSize} ${preferredBikeType} in good condition`;
  const description = listing.description || "Prototype preview listing using the current Mandy fit, value, and safety rules.";

  return {
    id: "local-preview-listing",
    source: (profile.searchPreferences.marketplaceSources[0] || "craigslist") as MarketplaceId,
    title,
    price: listing.askingPrice ? Number(listing.askingPrice) : 140,
    currency: "USD",
    location: listing.location || profile.searchPreferences.location || profile.searchPreferences.zipCode || "Local area",
    url: listing.listingLink || "https://example.com/local-bike-preview",
    description,
    brand: listing.brand || "Guardian",
    model: listing.model || "",
    bikeType: listing.bikeType || preferredBikeType,
    wheelSize: listing.wheelSize || preferredWheelSize,
    condition: listing.condition || "Used but ready to ride",
    rawData: {
      preview: true,
      note: "Bike Scout preview only. No live marketplace polling has run.",
    },
  };
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

function childProfileSignature(child: ChildProfile) {
  return JSON.stringify({
    heightCm: child.heightCm,
    age: child.age,
    weight: child.weight,
    experience: child.experience,
    stylePreference: child.stylePreference,
    colorPreferences: child.colorPreferences,
  });
}

function loadSavedRiderProfile(): SavedRiderProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RIDER_PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) as SavedRiderProfile : null;
  } catch {
    return null;
  }
}

function saveSavedRiderProfile(profile: SavedRiderProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RIDER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function loadAppStoreActiveChildProfile(): AppStoreActiveChildProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(APP_STORE_ACTIVE_CHILD_PROFILE_KEY);
    return raw ? JSON.parse(raw) as AppStoreActiveChildProfile : null;
  } catch {
    return null;
  }
}

function saveAppStoreActiveChildProfile(profile: AppStoreActiveChildProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APP_STORE_ACTIVE_CHILD_PROFILE_KEY, JSON.stringify(profile));
}

function clearAppStoreActiveChildProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(APP_STORE_ACTIVE_CHILD_PROFILE_KEY);
}

function loadAppStoreSavedEvaluations(): AppStoreSavedEvaluation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(APP_STORE_SAVED_EVALUATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) as AppStoreSavedEvaluation[] : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAppStoreSavedEvaluations(evaluations: AppStoreSavedEvaluation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APP_STORE_SAVED_EVALUATIONS_KEY, JSON.stringify(evaluations.slice(0, 10)));
}

function clearAppStoreSavedEvaluations() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(APP_STORE_SAVED_EVALUATIONS_KEY);
}

function clearAppStoreMvpLocalData() {
  if (typeof window === "undefined") return;
  APP_STORE_MVP_LOCAL_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

function addAppStoreSavedEvaluation(evaluation: Omit<AppStoreSavedEvaluation, "createdAt" | "favorite" | "id" | "savedAt">): AppStoreSavedEvaluationWriteResult {
  const existing = loadAppStoreSavedEvaluations();
  const duplicateIndex = existing.findIndex((savedEvaluation) => appStoreEvaluationSignature(savedEvaluation) === appStoreEvaluationSignature(evaluation));
  if (duplicateIndex >= 0) {
    const duplicate = {
      ...existing[duplicateIndex],
      ...evaluation,
      id: existing[duplicateIndex].id,
      createdAt: existing[duplicateIndex].createdAt || existing[duplicateIndex].savedAt || new Date().toISOString(),
      savedAt: new Date().toISOString(),
      favorite: existing[duplicateIndex].favorite,
    };
    saveAppStoreSavedEvaluations([duplicate, ...existing.filter((_, index) => index !== duplicateIndex)]);
    return { evaluation: duplicate, wasDuplicate: true };
  }

  const next: AppStoreSavedEvaluation = {
    ...evaluation,
    id: createAppStoreEvaluationId(),
    createdAt: new Date().toISOString(),
    savedAt: new Date().toISOString(),
    favorite: false,
  };
  saveAppStoreSavedEvaluations([next, ...existing].slice(0, 10));
  return { evaluation: next, wasDuplicate: false };
}

function appStoreEvaluationSignature(evaluation: Pick<AppStoreSavedEvaluation, "analysis" | "childSnapshot" | "listing">) {
  const listing = evaluation.listing || defaultListing;
  return JSON.stringify({
    title: normalizeHistoryValue(listing.title),
    askingPrice: normalizeHistoryValue(listing.askingPrice),
    brand: normalizeHistoryValue(listing.brand),
    wheelSize: normalizeHistoryValue(listing.wheelSize),
    platform: normalizeHistoryValue(listing.platform),
    overall: normalizeHistoryValue(evaluation.analysis?.overall?.label),
    fit: normalizeHistoryValue(evaluation.analysis?.dimensions?.fit?.label),
    deal: normalizeHistoryValue(evaluation.analysis?.dimensions?.price?.label),
    risk: normalizeHistoryValue(evaluation.analysis?.dimensions?.risk?.label),
    childHeight: normalizeHistoryValue(evaluation.childSnapshot?.heightCm),
    childExperience: normalizeHistoryValue(evaluation.childSnapshot?.experience),
  });
}

function normalizeHistoryValue(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function createAppStoreEvaluationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `evaluation-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatAppStoreDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved recently";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function sourceLabelFromInputMode(inputMode: AppStoreEvaluateInputMode) {
  if (inputMode === "screenshot") return "Screenshot";
  if (inputMode === "link") return "Link/text";
  return "Manual entry";
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

async function buildReportScreenshotDataUrl(file: File) {
  if (!file.type.startsWith("image/")) return "";
  if (file.size > 2 * 1024 * 1024) return "";
  return fileToDataUrl(file);
}

function formatReportEmailError(code?: string, error?: string) {
  const text = String(error || "").toLowerCase();
  if (code === "email_configuration_error") {
    return "Email service is not configured yet. Please check RESEND_API_KEY and REPORT_EMAIL_FROM.";
  }
  if (
    text.includes("domain") && text.includes("not verified")
    || text.includes("associated domain with your api key")
    || text.includes("verified domain")
  ) {
    return "Email sender domain is not verified for the current Resend API key. Verify your domain in Resend and update Vercel env vars, then redeploy.";
  }
  return error || "Email could not be sent.";
}

async function prepareScreenshotForExtraction(file: File): Promise<{ dataUrl: string; mimeType: string; sizeBytes: number }> {
  const dataUrl = await fileToDataUrl(file);
  return { dataUrl, mimeType: file.type || "image/jpeg", sizeBytes: file.size };
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read screenshot file."));
    reader.readAsDataURL(file);
  });
}


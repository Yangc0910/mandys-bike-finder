"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import { analyzeBike, generateSellerMessage, localPriceReference } from "@/lib/analysis";
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

const sampleListing: Listing = {
  listingLink: "",
  title: "24 inch Schwinn kids bike, blue, good condition",
  askingPrice: "70",
  brand: "Schwinn",
  model: "",
  wheelSize: "24",
  bikeType: "kids bike",
  colorStyle: "blue",
  platform: "Facebook Marketplace",
  location: "",
  description: "Good condition. Brakes work. Some normal scratches.",
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
  const [inputMode, setInputMode] = useState("link");
  const [listingSource, setListingSource] = useState("Not set");
  const [pastedText, setPastedText] = useState("");
  const [screenshotName, setScreenshotName] = useState("");
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState("");
  const [screenshotNotice, setScreenshotNotice] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft-in">("cm");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [heightCmInput, setHeightCmInput] = useState("");
  const [weightUnit, setWeightUnit] = useState<"lb" | "kg">("lb");
  const [weightInput, setWeightInput] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
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

  const normalizedChild = useMemo(() => {
    const normalizedHeightCm = heightUnit === "cm" ? heightCmInput : feetInchesToCm(heightFeet, heightInches);
    const normalizedWeightKg = weightInput ? (weightUnit === "lb" ? lbToKg(weightInput) : toFixed(weightInput, 1)) : "";
    return { ...child, heightCm: normalizedHeightCm, weight: normalizedWeightKg };
  }, [child, heightCmInput, heightFeet, heightInches, heightUnit, weightInput, weightUnit]);

  const localAnalysis = useMemo(() => analyzeBike(normalizedChild, listing, localPriceReference(listing)), [normalizedChild, listing]);
  const visibleAnalysis = analysis || localAnalysis;

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

  function updateListingField<K extends keyof Listing>(field: K, value: Listing[K], source = "manual entry") {
    setListing((current) => ({ ...current, [field]: value }));
    setListingSource((current) => {
      if (source !== "manual entry") return source;
      if (current === "screenshot") return "screenshot + manual edits";
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
    setListingSource("pasted text");
    setScreenshotNotice("");
    setStatus(result?.statusMessage || providerStatusText(result?.apiStatus || providerModes) || "Listing fields extracted.");
  }

  function loadSampleListing() {
    setListing(sampleListing);
    setListingSource("sample listing");
    setScreenshotName("");
    if (screenshotPreviewUrl) URL.revokeObjectURL(screenshotPreviewUrl);
    setScreenshotPreviewUrl("");
    setScreenshotNotice("");
    setStatus("Sample listing loaded.");
  }

  function handleInputModeChange(mode: string) {
    setInputMode(mode);
    setScreenshotNotice("");
    if (mode === "screenshot" && listingSource === "sample listing") {
      setListing(defaultListing);
      setListingSource("Not set");
    }
  }

  async function analyze(event: FormEvent) {
    event.preventDefault();
    const result = await apiPost("/api/analyze", { child: normalizedChild, listing });
    const nextAnalysis = result?.analysis || analyzeBike(normalizedChild, listing, localPriceReference(listing));
    setAnalysis(nextAnalysis);
    setStatus(result?.priceReference?.message || providerStatusText(result?.apiStatus || providerModes) || "Analysis complete.");
    setSellerMessage(await generateMessage("lowerOffer", "friendly", listing, false));
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

  return (
    <main className="min-h-screen p-4 md:p-6">
      <section className="mx-auto max-w-[1440px]">
        <div className="relative mb-6 overflow-hidden rounded-xl border border-line shadow-panel">
          <div
            className="h-[260px] bg-cover md:h-[340px]"
            style={{ backgroundImage: "url('/images/mandy-bike-hero.jpg')", backgroundPosition: "68% center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-4 text-white md:p-8">
            <p className="text-xs font-bold uppercase tracking-wide text-white/90">Mandy&apos;s Bike Finder</p>
            <h2 className="mt-1 text-2xl font-bold md:text-4xl">Find the right used bike with confidence</h2>
            <p className="mt-2 text-sm text-white/90 md:text-base">
              Fit, price, condition, style, and a ready-to-send message in one flow.
            </p>
          </div>
        </div>

        <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-muted">Mandy&apos;s Bike Finder</p>
            <h1 className="text-4xl font-bold tracking-normal md:text-6xl">Used kids bike check</h1>
            <p className="mt-3 max-w-3xl text-muted">
              Decide whether a used kids bike is the right fit, right style, and a good enough deal before messaging the seller.
            </p>
          </div>
          <div className="rounded-full border border-line bg-blue-50 px-3 py-2 text-sm font-bold text-brand">{status}</div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.15fr]">
          <form onSubmit={analyze} className="rounded-lg border border-line bg-white p-5 shadow-panel">
            <SectionTitle step="1" title="Child profile" />
            <div className="mb-6 grid gap-3 md:grid-cols-2">
              <Field label="Height">
                <div className="grid gap-2">
                  <select className={inputClass} value={heightUnit} onChange={(e) => setHeightUnit(e.target.value as "cm" | "ft-in")}>
                    <option value="cm">cm</option>
                    <option value="ft-in">ft-in</option>
                  </select>
                  {heightUnit === "cm" ? (
                    <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                      <input className={inputClass} type="number" min="80" max="220" value={heightCmInput} onChange={(e) => setHeightCmInput(e.target.value)} />
                      <span>cm</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputClass} type="number" min="2" max="7" placeholder="feet" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
                      <input className={inputClass} type="number" min="0" max="11" placeholder="inches" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} />
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Age">
                <input className={inputClass} type="number" placeholder="Optional" value={child.age} onChange={(e) => setChild({ ...child, age: e.target.value })} />
              </Field>
              <Field label="Weight">
                <div className="grid gap-2">
                  <select className={inputClass} value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as "lb" | "kg")}>
                    <option value="lb">lb</option>
                    <option value="kg">kg</option>
                  </select>
                  <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                    <input className={inputClass} type="number" placeholder="Optional" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
                    <span>{weightUnit}</span>
                  </div>
                </div>
              </Field>
              <Field label="Riding experience">
                <select className={inputClass} value={child.experience} onChange={(e) => setChild({ ...child, experience: e.target.value as ChildProfile["experience"] })}>
                  <option value="beginner">Beginner</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="confident">Confident</option>
                  <option value="advanced">Advanced</option>
                </select>
              </Field>
              <Field label="Style preference">
                <select className={inputClass} value={child.stylePreference} onChange={(e) => setChild({ ...child, stylePreference: e.target.value })}>
                  <option value="all good / no preference">All good / no preference</option>
                  <option value="boy-style">Boy-style</option>
                  <option value="girl-style">Girl-style</option>
                </select>
              </Field>
              <Field label="Color preference">
                <div className="grid gap-2 rounded-md border border-slate-300 bg-slate-50 p-2">
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

            <SectionTitle step="2" title="Listing input" />
            <div className="mb-4 grid grid-cols-3 gap-2">
              {["link", "screenshot", "manual"].map((mode) => (
                <button key={mode} type="button" onClick={() => handleInputModeChange(mode)} className={`min-h-11 rounded-md border font-bold ${inputMode === mode ? "border-brand bg-brand text-white" : "border-line bg-slate-50"}`}>
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            {inputMode === "link" && (
              <div className="mb-5 grid gap-3">
                <Field label="Listing link">
                  <input className={inputClass} type="url" placeholder="https://www.facebook.com/marketplace/item/..." value={listing.listingLink} onChange={(e) => updateListingField("listingLink", e.target.value, "manual entry")} />
                </Field>
                <Field label="Pasted listing text">
                  <textarea className={inputClass} rows={4} placeholder="Paste title, price, description, or seller text" value={pastedText} onChange={(e) => setPastedText(e.target.value)} onBlur={extractPastedText} />
                </Field>
                <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-slate-700">
                  AI-assisted extraction currently supports pasted listing text. Screenshot OCR is not implemented yet.
                </p>
                {listing.listingLink && !pastedText.trim() && !screenshotName && (
                  <p className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-slate-700">
                    Marketplace links may not be readable directly yet. Please paste listing text or upload a screenshot.
                  </p>
                )}
              </div>
            )}
            {inputMode === "screenshot" && (
              <div className="mb-5 grid gap-3">
                <Field label="Listing screenshot">
                  <input className={inputClass} type="file" accept="image/*" onChange={(event) => {
                    const file = event.target.files?.[0];
                    const nextName = file?.name || "";
                    setScreenshotName(nextName);
                    if (!nextName) return;
                    if (screenshotPreviewUrl) URL.revokeObjectURL(screenshotPreviewUrl);
                    setScreenshotPreviewUrl(URL.createObjectURL(file as Blob));
                    setListing(defaultListing);
                    setListingSource("screenshot");
                    setScreenshotNotice("Screenshot uploaded. Please review and enter listing details manually unless you paste listing text for AI-assisted extraction.");
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
                <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-slate-700">
                  Screenshot OCR is not implemented yet. For AI-assisted extraction, please paste the listing text below.
                </p>
              </div>
            )}
            <div className="mb-4 flex items-center gap-2">
              {!screenshotName && (
                <button className="min-h-10 rounded-md border border-line bg-slate-50 px-3 text-sm font-bold" type="button" onClick={loadSampleListing}>
                  Load sample listing
                </button>
              )}
              <span className="text-xs text-muted">Source: {listingSource}</span>
            </div>

            <SectionTitle step="3" title="Confirm listing fields" />
            <div className="mb-6 grid gap-3 md:grid-cols-2">
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
            <button className="min-h-12 w-full rounded-md bg-brand px-4 font-bold text-white" type="submit">Analyze bike</button>
          </form>

          <section className="grid gap-4">
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
        </div>
      </section>
    </main>
  );
}

const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-ink outline-brand/20 focus:border-brand focus:outline";

function SectionTitle({ step, title }: { step: string; title: string }) {
  return <div className="mb-4 mt-2 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-brand font-bold text-white">{step}</span><h2 className="text-lg font-bold">{title}</h2></div>;
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label className={`grid gap-1 text-sm font-bold text-slate-700 ${wide ? "md:col-span-2" : ""}`}><span>{label}</span>{children}</label>;
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

import { analyzeBike, generateSellerMessage } from "./analysis.js";
import {
  LocalCostControlService,
  LocalPriceReferenceService,
  MockEmailReportService,
  MockExtractionService,
  MockMetadataLogger,
} from "./services.js";

const extractionService = new MockExtractionService();
const priceReferenceService = new LocalPriceReferenceService();
const costControlService = new LocalCostControlService();
const emailReportService = new MockEmailReportService();
const metadataLogger = new MockMetadataLogger();

let currentAnalysis = null;
let currentListing = null;
let currentChild = null;

const form = document.querySelector("#analysis-form");
const dimensionGrid = document.querySelector("#dimension-grid");
const sellerQuestions = document.querySelector("#seller-questions");
const overallCard = document.querySelector("#overall-card");
const overallLabel = document.querySelector("#overall-label");
const overallReason = document.querySelector("#overall-reason");
const pastedText = document.querySelector("#pasted-text");
const screenshot = document.querySelector("#screenshot");
const screenshotPreview = document.querySelector("#screenshot-preview");
const sellerMessage = document.querySelector("#seller-message");
const reportPreview = document.querySelector("#report-preview");
const costStatus = document.querySelector("#cost-status");

document.querySelectorAll("[data-input-mode]").forEach((button) => {
  button.addEventListener("click", () => switchInputMode(button.dataset.inputMode));
});

pastedText.addEventListener("blur", () => {
  if (!pastedText.value.trim()) return;
  applyExtractedFields(extractionService.extractFromText(pastedText.value));
});

screenshot.addEventListener("change", () => {
  const file = screenshot.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  screenshotPreview.innerHTML = `<img src="${url}" alt="Uploaded listing screenshot preview">`;
  applyExtractedFields(extractionService.extractFromScreenshot());
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  currentChild = readChild();
  currentListing = readListing();
  costControlService.useSearchLookup();
  updateCostStatus();
  const reference = priceReferenceService.getReference(currentListing);
  currentAnalysis = analyzeBike(currentChild, currentListing, reference);
  renderAnalysis(currentAnalysis);
  sellerMessage.value = generateSellerMessage("lowerOffer", "friendly", currentListing, {
    targetOffer: document.querySelector("#target-offer").value,
    pickupTiming: document.querySelector("#pickup-timing").value,
    reason: document.querySelector("#offer-reason").value,
  });
});

document.querySelector("#generate-message").addEventListener("click", () => {
  const allowance = costControlService.useMessageGeneration();
  updateCostStatus();
  if (!allowance.allowed) {
    sellerMessage.value = allowance.message;
    return;
  }
  const listing = currentListing || readListing();
  sellerMessage.value = generateSellerMessage(
    document.querySelector("#message-goal").value,
    document.querySelector("#message-tone").value,
    listing,
    {
      targetOffer: document.querySelector("#target-offer").value,
      pickupTiming: document.querySelector("#pickup-timing").value,
      reason: document.querySelector("#offer-reason").value,
    }
  );
});

document.querySelector("#preview-report").addEventListener("click", () => {
  const child = currentChild || readChild();
  const listing = currentListing || readListing();
  const reference = priceReferenceService.getReference(listing);
  const analysis = currentAnalysis || analyzeBike(child, listing, reference);
  const email = document.querySelector("#report-email").value;

  metadataLogger.logReportPreview(child, listing, analysis, email);
  reportPreview.textContent = emailReportService.buildReport({
    child,
    listing,
    analysis,
    message: sellerMessage.value,
    recipientName: document.querySelector("#recipient-name").value,
    note: document.querySelector("#report-note").value,
  });
});

form.dispatchEvent(new Event("submit"));
updateCostStatus();

function switchInputMode(mode) {
  document.querySelectorAll("[data-input-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.inputMode === mode);
  });
  document.querySelectorAll("[data-mode-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.modePanel === mode);
  });
}

function applyExtractedFields(fields) {
  setValue("#title", fields.title);
  setValue("#asking-price", fields.askingPrice);
  setValue("#brand", fields.brand);
  setValue("#wheel-size", fields.wheelSize);
  setValue("#description", fields.description);
}

function readChild() {
  return {
    heightCm: document.querySelector("#height-cm").value,
    age: document.querySelector("#age").value,
    weight: document.querySelector("#weight").value,
    experience: document.querySelector("#experience").value,
    stylePreference: document.querySelector("#style-preference").value,
    colorPreference: document.querySelector("#color-preference").value,
  };
}

function readListing() {
  return {
    listingLink: document.querySelector("#listing-link").value,
    title: document.querySelector("#title").value,
    askingPrice: document.querySelector("#asking-price").value,
    brand: document.querySelector("#brand").value,
    model: document.querySelector("#model").value,
    wheelSize: document.querySelector("#wheel-size").value,
    bikeType: document.querySelector("#bike-type").value,
    colorStyle: document.querySelector("#color-style").value,
    platform: document.querySelector("#platform").value,
    location: document.querySelector("#location").value,
    description: document.querySelector("#description").value,
  };
}

function renderAnalysis(analysis) {
  overallCard.querySelector(".meter-signal").className = `meter-signal meter-${analysis.overall.meter}`;
  overallLabel.textContent = analysis.overall.label;
  overallReason.textContent = analysis.overall.reasoning;

  const dimensions = [
    ["Fit", analysis.dimensions.fit],
    ["Price", analysis.dimensions.price],
    ["Condition", analysis.dimensions.condition],
    ["Brand", analysis.dimensions.brand],
    ["Color / kid appeal", analysis.dimensions.color],
    ["Risk", analysis.dimensions.risk],
  ];

  dimensionGrid.innerHTML = dimensions
    .map(
      ([name, item]) => `
        <article class="dimension-card ${item.meter}">
          <span class="meter-label">${item.meter.toUpperCase()}</span>
          <h3>${name}: ${item.label}</h3>
          <p>${item.reasoning}</p>
        </article>
      `
    )
    .join("");

  sellerQuestions.innerHTML = analysis.sellerQuestions
    .map((question) => `<li>${question}</li>`)
    .join("");
}

function setValue(selector, value) {
  if (!value) return;
  document.querySelector(selector).value = value;
}

function updateCostStatus() {
  costStatus.textContent = costControlService.statusText();
}

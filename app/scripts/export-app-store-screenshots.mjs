import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const sourceDirectory = path.join(repositoryRoot, "artifacts/app-store/v1.1/source");
const outputDirectory = path.join(repositoryRoot, "artifacts/app-store/v1.1/final");

const canvasWidth = 1320;
const canvasHeight = 2868;
const captureWidth = 990;
const captureHeight = 2151;
const captureLeft = 165;
const captureTop = 640;

const frames = [
  {
    source: "frame-01-profile.png",
    output: "frame-01-find-the-right-bike-size.png",
    headline: ["Find the right bike size"],
    supporting: ["Get practical fit guidance built around your child."],
  },
  {
    source: "frame-02-profile-setup.png",
    output: "frame-02-guidance-built-for-your-child.png",
    headline: ["Guidance built for", "your child"],
    supporting: ["Height, age, and riding confidence shape", "every recommendation."],
  },
  {
    source: "frame-03-evaluate.png",
    output: "frame-03-check-a-used-bike-listing.png",
    headline: ["Check a used-bike listing"],
    supporting: ["Add a screenshot, review the details, then decide."],
  },
  {
    source: "frame-04-result.png",
    output: "frame-04-see-fit-deal-and-risk-clearly.png",
    headline: ["See fit, deal, and", "risk clearly"],
    supporting: ["Understand the recommendation and know", "what to do next."],
  },
  {
    source: "frame-05-history.png",
    output: "frame-05-save-the-bikes-worth-considering.png",
    headline: ["Save the bikes worth", "considering"],
    supporting: ["Keep promising options organized on this device."],
  },
  {
    source: "frame-06-privacy.png",
    output: "frame-06-your-data-stays-in-your-control.png",
    headline: ["Your data stays in", "your control"],
    supporting: ["Local saves, clear controls, and optional", "user-triggered AI."],
  },
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function textLines(lines, startY, lineHeight, className) {
  return lines
    .map(
      (line, index) =>
        `<text x="96" y="${startY + index * lineHeight}" class="${className}">${escapeXml(line)}</text>`,
    )
    .join("");
}

function backgroundSvg(frame) {
  const supportingStart = frame.headline.length === 1 ? 310 : 395;
  return Buffer.from(`
    <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stop-color="#DDEAFF"/>
          <stop offset="62%" stop-color="#EEF5FF"/>
          <stop offset="100%" stop-color="#F5F7FA"/>
        </radialGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="24" stdDeviation="30" flood-color="#0F172A" flood-opacity="0.16"/>
        </filter>
        <clipPath id="captureClip">
          <rect x="${captureLeft}" y="${captureTop}" width="${captureWidth}" height="${captureHeight}" rx="48"/>
        </clipPath>
        <style>
          .headline {
            fill: #0F172A;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
            font-size: 88px;
            font-weight: 750;
            letter-spacing: -2.4px;
          }
          .supporting {
            fill: #64748B;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
            font-size: 48px;
            font-weight: 500;
            letter-spacing: -0.4px;
          }
        </style>
      </defs>
      <rect width="${canvasWidth}" height="${canvasHeight}" fill="#F5F7FA"/>
      <ellipse cx="660" cy="870" rx="760" ry="720" fill="url(#glow)"/>
      <rect x="${captureLeft}" y="${captureTop}" width="${captureWidth}" height="${captureHeight}" rx="48" fill="#FFFFFF" filter="url(#shadow)"/>
      ${textLines(frame.headline, 205, 102, "headline")}
      ${textLines(frame.supporting, supportingStart, 62, "supporting")}
    </svg>
  `);
}

await fs.mkdir(outputDirectory, { recursive: true });

for (const frame of frames) {
  const sourcePath = path.join(sourceDirectory, frame.source);
  const outputPath = path.join(outputDirectory, frame.output);
  await fs.access(sourcePath);

  const capture = await sharp(sourcePath)
    .resize(captureWidth, captureHeight, { fit: "fill" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 3,
      background: "#F5F7FA",
    },
  })
    .composite([
      { input: backgroundSvg(frame), left: 0, top: 0 },
      {
        input: capture,
        left: captureLeft,
        top: captureTop,
        blend: "over",
      },
    ])
    .flatten({ background: "#F5F7FA" })
    .removeAlpha()
    .withMetadata({ density: 72 })
    .png({ compressionLevel: 9, palette: false })
    .toFile(outputPath);

  console.log(path.relative(repositoryRoot, outputPath));
}

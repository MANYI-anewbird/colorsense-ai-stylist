#!/usr/bin/env node
/**
 * Generate app icon assets from logo-source.png.
 * Crops to eye mark (no text), adds safe padding, outputs PNGs + favicon.ico.
 */

import sharp from "sharp";
import ico from "sharp-ico";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "public/brand/logo-source.png");
const ICONS_DIR = join(ROOT, "public/icons");
const PUBLIC_DIR = join(ROOT, "public");

// Crop: remove top ~28% (text), take centered square from remainder. Add ~10% safe padding.
const CROP_TOP_RATIO = 0.28;
const PADDING_RATIO = 0.10;

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });

  const img = sharp(SRC);
  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) throw new Error("Could not read image dimensions");

  const cropTop = Math.round(h * CROP_TOP_RATIO);
  const remainH = h - cropTop;
  const size = Math.min(w, remainH);
  const left = Math.round((w - size) / 2);
  const top = cropTop + Math.round((remainH - size) / 2);

  const cropped = await img
    .extract({ left, top, width: size, height: size })
    .png()
    .toBuffer();

  const pad = Math.round(size * PADDING_RATIO);
  const base = await sharp(cropped)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  const outputs = [
    { path: join(ICONS_DIR, "icon-192.png"), size: 192 },
    { path: join(ICONS_DIR, "icon-512.png"), size: 512 },
    { path: join(ICONS_DIR, "apple-touch-icon.png"), size: 180 },
    { path: join(PUBLIC_DIR, "favicon.png"), size: 32 },
  ];

  for (const { path: outPath, size: s } of outputs) {
    await sharp(base)
      .resize(s, s)
      .png()
      .toFile(outPath);
    console.log("Wrote:", outPath);
  }

  const favicon32 = await sharp(base).resize(32, 32).png().toBuffer();
  const faviconSharp = sharp(favicon32);
  await ico.sharpsToIco([faviconSharp], join(PUBLIC_DIR, "favicon.ico"), {
    sizes: [32],
  });
  console.log("Wrote:", join(PUBLIC_DIR, "favicon.ico"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

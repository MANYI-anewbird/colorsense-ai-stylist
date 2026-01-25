#!/usr/bin/env node
/**
 * Generate app icon assets from logo-source.png.
 * Full logo kept (no cropping). Add padding to square, then safe padding for rounded masks.
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

// Safe padding ~12% so icon isn't clipped in iOS rounded masks. No cropping.
const PADDING_RATIO = 0.12;

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });

  const img = sharp(SRC);
  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) throw new Error("Could not read image dimensions");

  // Center full logo in a square (no cropping)
  const size = Math.max(w, h);
  const padLeft = Math.floor((size - w) / 2);
  const padRight = size - w - padLeft;
  const padTop = Math.floor((size - h) / 2);
  const padBottom = size - h - padTop;

  const squared = await img
    .extend({
      top: padTop,
      bottom: padBottom,
      left: padLeft,
      right: padRight,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  const pad = Math.round(size * PADDING_RATIO);
  const base = await sharp(squared)
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

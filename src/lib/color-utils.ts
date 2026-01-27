// Color conversion and analysis utilities

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface LAB {
  l: number;
  a: number;
  b: number;
}

export interface LCH {
  L: number;
  C: number;
  h: number; // hue angle in degrees [0, 360)
}

export type TemperatureCategory = 'warm' | 'cool' | 'neutral' | 'neutral-warm' | 'neutral-cool';
export type ChromaCategory = 'clear' | 'soft' | 'medium';
export type ValueCategory = 'light' | 'medium' | 'deep';
export type SeasonFamily = 'spring' | 'summer' | 'autumn' | 'winter';

// 12-season ids aligned with existing SkinTone types (minus null)
export type Season12 =
  | 'spring-light'
  | 'spring-true' // Warm Spring
  | 'spring-bright' // Clear Spring
  | 'summer-light'
  | 'summer-true' // Cool Summer
  | 'summer-soft'
  | 'autumn-soft'
  | 'autumn-true' // Warm Autumn
  | 'autumn-deep'
  | 'winter-bright' // Clear Winter
  | 'winter-true' // Cool Winter
  | 'winter-deep';

export interface SeasonThresholds {
  temperature: {
    warm: number; // b* >= warm => Warm
    cool: number; // b* <= cool => Cool
    strongWarm: number;
    strongCool: number;
  };
  chroma: {
    clear: number; // C* >= clear => Clear
    soft: number; // C* <= soft => Soft
    veryClear: number;
    verySoft: number;
  };
  value: {
    light: number; // L* >= light => Light
    deep: number; // L* <= deep => Deep
  };
}

export const DEFAULT_SEASON_THRESHOLDS: SeasonThresholds = {
  temperature: {
    warm: 8,
    cool: -8,
    strongCool: -12,
    strongWarm: 18,
  },
  chroma: {
    clear: 38,
    soft: 22,
    veryClear: 45,
    verySoft: 20,
  },
  value: {
    light: 72,
    deep: 38,
  },
};

export interface ColorValues {
  rgb: RGB;
  hex: string;
  hsl: HSL;
  lab: LAB;
  lch: LCH;
}

export interface ColorMetrics {
  lightness: number;
  saturation: number;
  temperature: TemperatureCategory;
  seasonalTendency: SeasonFamily; // legacy 4-season family (used by compatibility scoring)
  season12: Season12; // professional 12-season result
}

export interface ColorAnalysis {
  color: ColorValues;
  metrics: ColorMetrics;
  confidence: 'high' | 'medium' | 'low';
  confidenceNote?: string;
}

// RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return { r, g, b };
}

// RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// RGB to LAB (via XYZ)
export function rgbToLab(r: number, g: number, b: number): LAB {
  const srgbToLinear = (u: number) =>
    u > 0.04045 ? Math.pow((u + 0.055) / 1.055, 2.4) : u / 12.92;

  // sRGB [0..1] -> linear RGB
  const rr = srgbToLinear(r / 255);
  const gg = srgbToLinear(g / 255);
  const bb = srgbToLinear(b / 255);

  // linear RGB -> XYZ (D65)
  const X = rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375;
  const Y = rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750;
  const Z = rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041;

  // Normalize by reference white (D65)
  let x = X / 0.95047;
  let y = Y / 1.0;
  let z = Z / 1.08883;

  // XYZ -> LAB
  const epsilon = 216 / 24389; // 0.008856...
  const kappa = 24389 / 27; // 903.3...
  const f = (t: number) => (t > epsilon ? Math.cbrt(t) : (kappa * t + 16) / 116);

  x = f(x);
  y = f(y);
  z = f(z);

  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const bStar = 200 * (y - z);

  return {
    l: Math.round(l * 100) / 100,
    a: Math.round(a * 100) / 100,
    b: Math.round(bStar * 100) / 100,
  };
}

export function labToLch(lab: LAB): LCH {
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  // If chroma is extremely low, hue is effectively undefined; keep 0 for determinism.
  if (C < 1e-6) h = 0;
  return {
    L: lab.l,
    C: Math.round(C * 100) / 100,
    h: Math.round(h * 100) / 100,
  };
}

function isWarmHue(h: number): boolean {
  // Tie-break when b* is near neutral: reds/yellows are warm; cyans/blues are cool.
  return h < 135 || h >= 315;
}

export function getTemperatureCategoryFromLab(
  lab: { L: number; a: number; b: number },
  _lch: { h: number },
  _thresholds: SeasonThresholds = DEFAULT_SEASON_THRESHOLDS
): TemperatureCategory {
  // New b-axis logic: b > 5: Warm, b < -5: Cool
  // For neutral range (-5 <= b <= 5), return directional lean
  if (lab.b > 5) return 'warm';
  if (lab.b < -5) return 'cool';
  // Neutral with directional lean: b >= 0 -> neutral-warm, b < 0 -> neutral-cool
  return lab.b >= 0 ? 'neutral-warm' : 'neutral-cool';
}

export function getChromaCategoryFromLch(
  lch: { C: number },
  thresholds: SeasonThresholds = DEFAULT_SEASON_THRESHOLDS
): ChromaCategory {
  if (lch.C >= thresholds.chroma.clear) return 'clear';
  if (lch.C <= thresholds.chroma.soft) return 'soft';
  return 'medium';
}

export function getValueCategoryFromLab(
  lab: { L: number },
  thresholds: SeasonThresholds = DEFAULT_SEASON_THRESHOLDS
): ValueCategory {
  if (lab.L >= thresholds.value.light) return 'light';
  if (lab.L <= thresholds.value.deep) return 'deep';
  return 'medium';
}

function resolveChromaForFamily(
  chroma: ChromaCategory,
  lch: { C: number },
  thresholds: SeasonThresholds
): 'clear' | 'soft' {
  if (chroma === 'clear' || chroma === 'soft') return chroma;
  const distToClear = Math.abs(lch.C - thresholds.chroma.clear);
  const distToSoft = Math.abs(lch.C - thresholds.chroma.soft);
  if (distToClear < distToSoft) return 'clear';
  if (distToSoft < distToClear) return 'soft';
  const midpoint = (thresholds.chroma.clear + thresholds.chroma.soft) / 2;
  return lch.C >= midpoint ? 'clear' : 'soft';
}

export function determineSeasonFamilyFromLab(
  lab: { L: number; a: number; b: number },
  lch: { C: number; h: number },
  thresholds: SeasonThresholds = DEFAULT_SEASON_THRESHOLDS
): SeasonFamily {
  const temperatureCategory = getTemperatureCategoryFromLab(lab, lch, thresholds);
  const resolvedTemperature =
    temperatureCategory === 'neutral' ? (isWarmHue(lch.h) ? 'warm' : 'cool') : temperatureCategory;
  const chroma = getChromaCategoryFromLch(lch, thresholds);
  const resolvedChroma = resolveChromaForFamily(chroma, lch, thresholds);

  if (resolvedTemperature === 'warm') {
    return resolvedChroma === 'clear' ? 'spring' : 'autumn';
  }

  return resolvedChroma === 'clear' ? 'winter' : 'summer';
}

/**
 * Professional 12-season classification based on CIE LAB color space.
 * 
 * Implements the 12 Seasonal Color Analysis Theory with:
 * - Grey trap handling (Chroma < 3.0 cannot be Autumn/Spring)
 * - Temperature determination via b-axis
 * - Comprehensive 12-season decision tree
 */
export function determineColorSeasonFromLab(
  lab: { L: number; a: number; b: number },
  lch: { L: number; C: number; h: number },
  _thresholds: SeasonThresholds = DEFAULT_SEASON_THRESHOLDS
): Season12 {
  const L = lab.L;
  const C = lch.C; // Chroma = sqrt(a² + b²), already calculated in labToLch
  
  // Step 1: Handle Greyscale & Neutrals (The "Grey Trap")
  // If Chroma < 3.0, color CANNOT be Autumn or Spring
  if (C < 3.0) {
    if (L > 65) {
      return 'summer-light'; // Light Summer (Light Cool Neutral)
    }
    if (L < 30) {
      return 'winter-deep'; // Deep Winter (Dark Cool Neutral)
    }
    return 'winter-true'; // Cool Winter (Standard Grey)
  }
  
  // Step 2: Determine Temperature (b-axis)
  let temperature: 'warm' | 'cool' | 'neutral';
  if (lab.b > 5) {
    temperature = 'warm';
  } else if (lab.b < -5) {
    temperature = 'cool';
  } else {
    // Neutral: lean depends on slight b bias or a-axis
    // If b is slightly positive, lean warm; if slightly negative, lean cool
    temperature = lab.b >= 0 ? 'warm' : 'cool';
  }
  
  // Step 3: The 12-Season Decision Tree
  
  // 1. Light Category (L > 70)
  if (L > 70) {
    if (temperature === 'warm') {
      return 'spring-light';
    }
    // temperature === 'cool' or neutral-cool
    return 'summer-light';
  }
  
  // 2. Deep Category (L < 35)
  if (L < 35) {
    if (temperature === 'warm') {
      return 'autumn-deep';
    }
    // temperature === 'cool' or neutral-cool
    return 'winter-deep';
  }
  
  // 3. Bright/Clear Category (Chroma > 50)
  if (C > 50) {
    if (temperature === 'warm') {
      return 'spring-bright';
    }
    // temperature === 'cool' or neutral-cool
    return 'winter-bright';
  }
  
  // 4. Muted/Soft Category (Chroma < 25) AND not caught by Step 1 (C >= 3.0)
  if (C < 25) {
    if (temperature === 'warm') {
      return 'autumn-soft';
    }
    // temperature === 'cool' (or neutral-cool, already resolved)
    return 'summer-soft';
  }
  
  // 5. True Seasons (Mid-range L: 35 <= L <= 70, Mid-to-High Chroma: 25 <= C <= 50)
  if (temperature === 'warm') {
    // Brighter warm colors -> True Spring, darker/muted warm -> True Autumn
    if (C >= 35 && L >= 50) {
      return 'spring-true'; // Brighter True Spring
    }
    return 'autumn-true'; // True Autumn
  }
  
  // temperature === 'cool' or neutral-cool
  // Sharper cool colors -> True Winter, softer cool -> True Summer
  if (C >= 35 && L <= 55) {
    return 'winter-true'; // Sharp True Winter
  }
  return 'summer-true'; // True Summer
}

// Get all color values from RGB
export function getColorValues(r: number, g: number, b: number): ColorValues {
  const lab = rgbToLab(r, g, b);
  return {
    rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
    hex: rgbToHex(r, g, b),
    hsl: rgbToHsl(r, g, b),
    lab,
    lch: labToLch(lab),
  };
}

// Get color metrics
export function getColorMetrics(color: ColorValues): ColorMetrics {
  const labDecision = { L: color.lab.l, a: color.lab.a, b: color.lab.b };
  const lchDecision = color.lch;
  const season12 = determineColorSeasonFromLab(labDecision, lchDecision);
  const seasonalTendency = season12.split('-')[0] as SeasonFamily;

  return {
    lightness: Math.round(color.lab.l),
    saturation: color.hsl.s,
    temperature: getTemperatureCategoryFromLab(labDecision, lchDecision),
    seasonalTendency,
    season12,
  };
}

// Analyze image quality and confidence
export function analyzeConfidence(
  avgLightness: number,
  variance: number
): { confidence: 'high' | 'medium' | 'low'; note?: string } {
  if (avgLightness < 15) {
    return {
      confidence: 'low',
      note: 'The selected area appears very dark. Lighting conditions may affect accuracy.',
    };
  }

  if (avgLightness > 90) {
    return {
      confidence: 'low',
      note: 'The selected area appears very bright. Lighting conditions may affect accuracy.',
    };
  }

  if (variance > 50) {
    return {
      confidence: 'medium',
      note: 'The selected area has high color variation. Consider selecting a more uniform region.',
    };
  }

  return { confidence: 'high' };
}

// Extract average color from image data
export function extractAverageColor(
  imageData: ImageData,
  centerX: number,
  centerY: number,
  radius: number
): { rgb: RGB; variance: number } {
  const { data, width, height } = imageData;
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;
  const colors: RGB[] = [];

  // Sample pixels in the circular region
  for (let y = Math.max(0, centerY - radius); y < Math.min(height, centerY + radius); y++) {
    for (let x = Math.max(0, centerX - radius); x < Math.min(width, centerX + radius); x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        totalR += r;
        totalG += g;
        totalB += b;
        count++;
        colors.push({ r, g, b });
      }
    }
  }

  if (count === 0) {
    return { rgb: { r: 128, g: 128, b: 128 }, variance: 0 };
  }

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;

  // Calculate variance
  let variance = 0;
  for (const color of colors) {
    variance +=
      Math.pow(color.r - avgR, 2) +
      Math.pow(color.g - avgG, 2) +
      Math.pow(color.b - avgB, 2);
  }
  variance = Math.sqrt(variance / colors.length / 3);

  return {
    rgb: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) },
    variance,
  };
}

// Full color analysis
export function analyzeColor(
  imageData: ImageData,
  centerX: number,
  centerY: number,
  radius: number
): ColorAnalysis {
  const { rgb, variance } = extractAverageColor(imageData, centerX, centerY, radius);
  const color = getColorValues(rgb.r, rgb.g, rgb.b);
  const metrics = getColorMetrics(color);
  const { confidence, note } = analyzeConfidence(color.lab.l, variance);

  return {
    color,
    metrics,
    confidence,
    confidenceNote: note,
  };
}

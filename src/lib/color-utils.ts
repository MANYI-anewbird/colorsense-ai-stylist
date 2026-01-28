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

export interface SeasonMatch {
  season: Season12;
  confidence: number; // 0-100%
  totalScore: number; // Lower is better
}

export interface SeasonMatchBreakdown {
  primaryMatch: SeasonMatch; // The winner
  secondaryMatch: SeasonMatch | null; // The runner-up (only if borderline)
  isBorderline: boolean; // True if scoreGap <= 6 OR confidenceGap <= 15
  gaps: {
    scoreGap: number; // secondary.totalScore - primary.totalScore
    confidenceGap: number; // primary.confidence - secondary.confidence
  };
  breakdown: Array<{ season: Season12; score: number }>; // Full list sorted by score (descending)
  // Legacy fields for backward compatibility
  primarySeason: Season12;
  secondarySeason: Season12 | null;
  confidence: number;
  isAmbiguous: boolean;
}

export interface ColorMetrics {
  lightness: number;
  saturation: number;
  temperature: TemperatureCategory;
  seasonalTendency: SeasonFamily; // legacy 4-season family (used by compatibility scoring)
  season12: Season12; // professional 12-season result
  seasonMatch?: SeasonMatchBreakdown; // Optional detailed match breakdown
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
  // Bluish greens (145°-180°) should be considered cool, not warm
  return h < 135 || h >= 315;
}

export function getTemperatureCategoryFromLab(
  lab: { L: number; a: number; b: number },
  lch: { h: number },
  _thresholds: SeasonThresholds = DEFAULT_SEASON_THRESHOLDS
): TemperatureCategory {
  // New b-axis logic: b > 5: Warm, b < -5: Cool
  // For neutral range (-5 <= b <= 5), consider hue as tie-breaker
  // Special case: Bluish greens (hue 145°-180°) should be cool even if b is slightly positive
  
  // Strong warm (b > 5)
  if (lab.b > 5) {
    // Exception: Bluish greens (145°-180°) are cool even with positive b
    if (lch.h >= 145 && lch.h <= 180) {
      return 'cool';
    }
    return 'warm';
  }
  
  // Strong cool (b < -5)
  if (lab.b < -5) {
    return 'cool';
  }
  
  // Neutral range (-5 <= b <= 5): Use hue as tie-breaker
  // Bluish greens (145°-180°) are cool
  if (lch.h >= 145 && lch.h <= 180) {
    return lab.b < 0 ? 'neutral-cool' : 'neutral-cool';
  }
  
  // For other hues, use b-axis lean
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
 * Season metadata with attributes and LAB centroids
 */
interface SeasonMetadata {
  centroidLab: { L: number; a: number; b: number };
  isSoftSeason: boolean;
  isBrightSeason: boolean;
  isLightSeason: boolean;
  isDeepSeason: boolean;
  isCoolSeason: boolean;
  isWarmSeason: boolean;
  isTrueSeason: boolean;
}

const SEASON_METADATA: Record<Season12, SeasonMetadata> = {
  // Spring seasons - warm, light to medium, clear/bright
  'spring-light': {
    centroidLab: { L: 85, a: 8, b: 25 },
    isSoftSeason: false,
    isBrightSeason: false,
    isLightSeason: true,
    isDeepSeason: false,
    isCoolSeason: false,
    isWarmSeason: true,
    isTrueSeason: false,
  },
  'spring-true': {
    centroidLab: { L: 65, a: 15, b: 30 },
    isSoftSeason: false,
    isBrightSeason: false,
    isLightSeason: false,
    isDeepSeason: false,
    isCoolSeason: false,
    isWarmSeason: true,
    isTrueSeason: true,
  },
  'spring-bright': {
    centroidLab: { L: 70, a: 20, b: 35 },
    isSoftSeason: false,
    isBrightSeason: true,
    isLightSeason: false,
    isDeepSeason: false,
    isCoolSeason: false,
    isWarmSeason: true,
    isTrueSeason: false,
  },
  
  // Summer seasons - cool, light to medium, soft/muted
  'summer-light': {
    centroidLab: { L: 80, a: -5, b: -8 },
    isSoftSeason: false,
    isBrightSeason: false,
    isLightSeason: true,
    isDeepSeason: false,
    isCoolSeason: true,
    isWarmSeason: false,
    isTrueSeason: false,
  },
  'summer-true': {
    centroidLab: { L: 60, a: -8, b: -12 },
    isSoftSeason: false,
    isBrightSeason: false,
    isLightSeason: false,
    isDeepSeason: false,
    isCoolSeason: true,
    isWarmSeason: false,
    isTrueSeason: true,
  },
  'summer-soft': {
    centroidLab: { L: 55, a: -6, b: -10 },
    isSoftSeason: true,
    isBrightSeason: false,
    isLightSeason: false,
    isDeepSeason: false,
    isCoolSeason: true,
    isWarmSeason: false,
    isTrueSeason: false,
  },
  
  // Autumn seasons - warm, medium to deep, soft/muted
  'autumn-soft': {
    centroidLab: { L: 50, a: 10, b: 15 },
    isSoftSeason: true,
    isBrightSeason: false,
    isLightSeason: false,
    isDeepSeason: false,
    isCoolSeason: false,
    isWarmSeason: true,
    isTrueSeason: false,
  },
  'autumn-true': {
    centroidLab: { L: 45, a: 12, b: 18 },
    isSoftSeason: false,
    isBrightSeason: false,
    isLightSeason: false,
    isDeepSeason: false,
    isCoolSeason: false,
    isWarmSeason: true,
    isTrueSeason: true,
  },
  'autumn-deep': {
    centroidLab: { L: 30, a: 8, b: 12 },
    isSoftSeason: false,
    isBrightSeason: false,
    isLightSeason: false,
    isDeepSeason: true,
    isCoolSeason: false,
    isWarmSeason: true,
    isTrueSeason: false,
  },
  
  // Winter seasons - cool, medium to deep, clear/bright
  'winter-bright': {
    centroidLab: { L: 50, a: -15, b: -20 },
    isSoftSeason: false,
    isBrightSeason: true,
    isLightSeason: false,
    isDeepSeason: false,
    isCoolSeason: true,
    isWarmSeason: false,
    isTrueSeason: false,
  },
  'winter-true': {
    centroidLab: { L: 40, a: -12, b: -18 },
    isSoftSeason: false,
    isBrightSeason: false,
    isLightSeason: false,
    isDeepSeason: false,
    isCoolSeason: true,
    isWarmSeason: false,
    isTrueSeason: true,
  },
  'winter-deep': {
    centroidLab: { L: 25, a: -8, b: -12 },
    isSoftSeason: false,
    isBrightSeason: false,
    isLightSeason: false,
    isDeepSeason: true,
    isCoolSeason: true,
    isWarmSeason: false,
    isTrueSeason: false,
  },
};

/**
 * Calculate DeltaE76 (Euclidean distance in LAB color space)
 */
function calculateDeltaE76(
  lab1: { L: number; a: number; b: number },
  lab2: { L: number; a: number; b: number }
): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Feature thresholds (LAB-based)
 */
const FEATURE_THRESHOLDS = {
  veryMuted: 18,
  muted: 28,
  clear: 35,
  light: 80,
  deep: 35,
};

/**
 * Calculate warm/cool mismatch (0..1)
 * Returns 0 if match, 1 if complete mismatch
 */
function calculateWarmCoolMismatch(
  inputLab: { L: number; a: number; b: number },
  seasonMetadata: SeasonMetadata
): number {
  // Determine input temperature
  const isInputWarm = inputLab.b > 0;
  const isInputCool = inputLab.b < 0;
  
  // Check mismatch
  if (seasonMetadata.isWarmSeason && isInputCool) return 1.0;
  if (seasonMetadata.isCoolSeason && isInputWarm) return 1.0;
  
  // Partial mismatch for neutral colors
  if (Math.abs(inputLab.b) < 3) {
    // Very neutral input
    if (seasonMetadata.isWarmSeason || seasonMetadata.isCoolSeason) return 0.3;
    return 0.1;
  }
  
  return 0.0; // Match
}

/**
 * Calculate season match breakdown using hierarchical penalty scoring system.
 * Returns probabilities/percentages for all 12 seasons based on DeltaE76 + penalties.
 */
export function calculateSeasonMatchBreakdown(
  lab: { L: number; a: number; b: number }
): SeasonMatchBreakdown {
  // Compute Chroma and Lightness
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  const L = lab.L;
  
  // Determine feature flags
  const isVeryMuted = C < FEATURE_THRESHOLDS.veryMuted;
  const isMuted = C >= FEATURE_THRESHOLDS.veryMuted && C < FEATURE_THRESHOLDS.muted;
  const isClear = C >= FEATURE_THRESHOLDS.clear;
  const isLight = L > FEATURE_THRESHOLDS.light;
  const isDeep = L < FEATURE_THRESHOLDS.deep;
  
  // Adaptive temperature reliability
  const temperatureReliability = C < 20 ? 0.2 : (C >= 35 ? 1.0 : 0.6);
  
  // Calculate scores for all seasons
  const seasonScores: Array<{
    season: Season12;
    baseScore: number;
    penaltyMuted: number;
    penaltyLightDeep: number;
    penaltyTemperature: number;
    totalScore: number;
  }> = [];
  
  for (const [season, metadata] of Object.entries(SEASON_METADATA) as Array<[Season12, SeasonMetadata]>) {
    // Base score: DeltaE76
    const baseScore = calculateDeltaE76(lab, metadata.centroidLab);
    
    // Penalty: Muted vs Bright/Soft
    let penaltyMuted = 0;
    if (isVeryMuted) {
      if (metadata.isBrightSeason) penaltyMuted += 60;
      if (metadata.isTrueSeason) penaltyMuted += 25;
      if (metadata.isLightSeason) penaltyMuted += 15;
    }
    if (isClear && metadata.isSoftSeason) {
      penaltyMuted += 35;
    }
    
    // Penalty: Light vs Deep
    let penaltyLightDeep = 0;
    if (isLight && metadata.isDeepSeason) {
      penaltyLightDeep += 45;
    }
    if (isDeep && metadata.isLightSeason) {
      penaltyLightDeep += 45;
    }
    
    // Penalty: Temperature mismatch (reliability-weighted)
    const warmCoolMismatch = calculateWarmCoolMismatch(lab, metadata);
    const penaltyTemperature = warmCoolMismatch * 30 * temperatureReliability;
    
    const totalScore = baseScore + penaltyMuted + penaltyLightDeep + penaltyTemperature;
    
    seasonScores.push({
      season,
      baseScore,
      penaltyMuted,
      penaltyLightDeep,
      penaltyTemperature,
      totalScore,
    });
  }
  
  // Convert to confidence using softmax (lower score = better match)
  // Use negative scores for softmax (we want lower totalScore = higher probability)
  // To avoid numerical overflow, subtract the minimum (best) score
  const minScore = Math.min(...seasonScores.map(s => s.totalScore));
  const expScores = seasonScores.map(s => Math.exp(-(s.totalScore - minScore)));
  const sumExpScores = expScores.reduce((sum, exp) => sum + exp, 0);
  
  // Create matches with confidence and totalScore
  const matches: SeasonMatch[] = seasonScores
    .map((seasonScore, index) => ({
      season: seasonScore.season,
      confidence: Math.round((expScores[index] / sumExpScores) * 100),
      totalScore: seasonScore.totalScore,
    }))
    .sort((a, b) => a.totalScore - b.totalScore); // Sort by totalScore ascending (lower is better)
  
  // Primary and secondary matches
  const primaryMatch = matches[0];
  const secondaryMatch = matches[1];
  
  // Calculate gaps
  const scoreGap = secondaryMatch ? secondaryMatch.totalScore - primaryMatch.totalScore : Infinity;
  const confidenceGap = secondaryMatch ? primaryMatch.confidence - secondaryMatch.confidence : Infinity;
  
  // Determine if borderline: (scoreGap <= 6) OR (confidenceGap <= 15)
  const isBorderline = (scoreGap <= 6) || (confidenceGap <= 15);
  
  // Only return secondaryMatch when isBorderline is true
  const finalSecondaryMatch = isBorderline && secondaryMatch ? secondaryMatch : null;
  
  // Create breakdown for display (sorted by confidence descending)
  const breakdown = matches
    .map(m => ({
      season: m.season,
      score: m.confidence,
    }))
    .sort((a, b) => b.score - a.score); // Sort descending by confidence
  
  // Legacy fields for backward compatibility
  const primarySeason = primaryMatch.season;
  const secondarySeason = finalSecondaryMatch?.season ?? null;
  const confidence = primaryMatch.confidence;
  const isAmbiguous = isBorderline; // Map isBorderline to isAmbiguous for compatibility
  
  return {
    primaryMatch,
    secondaryMatch: finalSecondaryMatch,
    isBorderline,
    gaps: {
      scoreGap: finalSecondaryMatch ? scoreGap : 0,
      confidenceGap: finalSecondaryMatch ? confidenceGap : 0,
    },
    breakdown,
    // Legacy fields
    primarySeason,
    secondarySeason,
    confidence,
    isAmbiguous,
  };
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
  
  // Calculate detailed match breakdown using distance-based algorithm
  const seasonMatch = calculateSeasonMatchBreakdown(labDecision);

  return {
    lightness: Math.round(color.lab.l),
    saturation: color.hsl.s,
    temperature: getTemperatureCategoryFromLab(labDecision, lchDecision),
    seasonalTendency,
    season12,
    seasonMatch,
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

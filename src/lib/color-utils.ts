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
  | 'spring-true'
  | 'spring-bright'
  | 'summer-light'
  | 'summer-true'
  | 'summer-soft'
  | 'autumn-soft'
  | 'autumn-true'
  | 'autumn-deep'
  | 'winter-bright'
  | 'winter-true'
  | 'winter-deep';

/**
 * Get standard display name for a 12-season type.
 * Uses professional terminology: True/Bright/Soft/Light/Deep
 */
export function getSeasonDisplayName(season: Season12): string {
  const displayNames: Record<Season12, string> = {
    'spring-light': 'Light Spring',
    'spring-true': 'True Spring',
    'spring-bright': 'Bright Spring',
    'summer-light': 'Light Summer',
    'summer-true': 'True Summer',
    'summer-soft': 'Soft Summer',
    'autumn-soft': 'Soft Autumn',
    'autumn-true': 'True Autumn',
    'autumn-deep': 'Deep Autumn',
    'winter-bright': 'Bright Winter',
    'winter-true': 'True Winter',
    'winter-deep': 'Deep Winter',
  };
  return displayNames[season] ?? season;
}

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

export interface FeatureFlags {
  veryMuted: boolean;
  muted: boolean;
  clear: boolean;
  light: boolean;
  deep: boolean;
  isEarthyBrownish: boolean;
  isVividYellow: boolean;
  isGreyed: boolean;
  isDusty: boolean;
  isSmoky: boolean;
}

export interface SeasonDebugInfo {
  season: Season12;
  baseScore: number;
  penaltyMuted: number;
  penaltyLightDeep: number;
  penaltyTemperature: number;
  penaltyEarthy: number;
  penaltyDusty: number;
  penaltyClarityMismatch: number;
  penaltyMutedGate: number;
  penaltyMutedness: number;
  penaltySpringBrightness: number;
  totalScore: number;
  confidence: number;
}

export interface TopCandidate {
  season: Season12;
  confidence: number;
  totalScore: number;
  baseScore: number;
  penaltyMuted: number;
  penaltyLightDeep: number;
  penaltyTemperature: number;
  penaltyEarthy: number;
  penaltyDusty: number;
  penaltyClarityMismatch: number;
  penaltyMutedGate: number;
  penaltyMutedness: number;
  penaltySpringBrightness: number;
  flags: FeatureFlags;
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
  debugInfo: {
    isEarthyBrownish: boolean;
    isVividYellow: boolean;
    seasonScores: SeasonDebugInfo[]; // Detailed scores for all seasons
    topCandidates: TopCandidate[]; // Top 3 candidates with full breakdown
    autumnCentroids?: {
      'autumn-soft': { L: number; a: number; b: number };
      'autumn-true': { L: number; a: number; b: number };
      'autumn-deep': { L: number; a: number; b: number };
    };
    baseTemperature?: 'warm' | 'cool'; // Base temperature from primary season
    isNeutral?: boolean; // Whether color is neutral (from LAB chroma)
    finalTemperatureLabel?: TemperatureCategory; // Final temperature label for UI (neutral-warm/neutral-cool/warm/cool)
    rawTemperature?: TemperatureCategory; // Original temperature calculation (for debug only)
    chroma?: number; // Chroma value C = sqrt(a^2 + b^2)
    isVerySoft?: boolean; // C < 15
    isSoft?: boolean; // 15 <= C < 25
    isClear?: boolean; // 25 <= C < 40
    isVeryClear?: boolean; // C >= 40
  };
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

/**
 * Get base temperature from season classification.
 * Winter/Summer => Cool; Spring/Autumn => Warm
 * This ensures UI consistency (no Winter + Warm conflicts).
 */
export function getBaseTemperatureFromSeason(season: Season12): 'warm' | 'cool' {
  if (season.startsWith('winter') || season.startsWith('summer')) {
    return 'cool';
  }
  return 'warm'; // spring/autumn
}

/**
 * Check if color is neutral based on LAB values.
 * Uses chroma threshold: C = sqrt(a^2 + b^2) <= 18
 */
export function isNeutralColor(lab: { a: number; b: number }): boolean {
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  return C <= 18;
}

/**
 * Derive final temperature label from season and color neutrality.
 * Combines base temperature (from season) with neutral flag (from color).
 * Returns: 'warm' | 'cool' | 'neutral-warm' | 'neutral-cool'
 */
export function getTemperatureLabelFromSeasonAndColor(
  season: Season12,
  lab: { a: number; b: number }
): TemperatureCategory {
  const baseTemperature = getBaseTemperatureFromSeason(season);
  const isNeutral = isNeutralColor(lab);
  
  if (isNeutral) {
    return baseTemperature === 'warm' ? 'neutral-warm' : 'neutral-cool';
  }
  return baseTemperature;
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
  isSpringFamily: boolean;
  isAutumnFamily: boolean;
  clarityProfile: 'very-soft' | 'soft' | 'clear' | 'very-clear';
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
    isSpringFamily: true,
    isAutumnFamily: false,
    clarityProfile: 'clear',
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
    isSpringFamily: true,
    isAutumnFamily: false,
    clarityProfile: 'clear',
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
    isSpringFamily: true,
    isAutumnFamily: false,
    clarityProfile: 'very-clear',
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
    isSpringFamily: false,
    isAutumnFamily: false,
    clarityProfile: 'clear',
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
    isSpringFamily: false,
    isAutumnFamily: false,
    clarityProfile: 'clear',
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
    isSpringFamily: false,
    isAutumnFamily: false,
    clarityProfile: 'soft',
  },
  
  // Autumn seasons - warm, medium to deep, soft/muted
  'autumn-soft': {
    centroidLab: { L: 55, a: 6, b: 18 },
    isSoftSeason: true,
    isBrightSeason: false,
    isLightSeason: false,
    isDeepSeason: false,
    isCoolSeason: false,
    isWarmSeason: true,
    isTrueSeason: false,
    isSpringFamily: false,
    isAutumnFamily: true,
    clarityProfile: 'soft',
  },
  'autumn-true': {
    centroidLab: { L: 65, a: 10, b: 30 },
    isSoftSeason: false,
    isBrightSeason: false,
    isLightSeason: false,
    isDeepSeason: false,
    isCoolSeason: false,
    isWarmSeason: true,
    isTrueSeason: true,
    isSpringFamily: false,
    isAutumnFamily: true,
    clarityProfile: 'soft',
  },
  'autumn-deep': {
    centroidLab: { L: 35, a: 10, b: 20 },
    isSoftSeason: false,
    isBrightSeason: false,
    isLightSeason: false,
    isDeepSeason: true,
    isCoolSeason: false,
    isWarmSeason: true,
    isTrueSeason: false,
    isSpringFamily: false,
    isAutumnFamily: true,
    clarityProfile: 'soft',
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
    isSpringFamily: false,
    isAutumnFamily: false,
    clarityProfile: 'very-clear',
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
    isSpringFamily: false,
    isAutumnFamily: false,
    clarityProfile: 'clear',
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
    isSpringFamily: false,
    isAutumnFamily: false,
    clarityProfile: 'clear',
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
 * Borderline detection thresholds
 */
const BORDERLINE_THRESHOLDS = {
  SCORE_GAP: 4, // Maximum score gap for borderline
  CONF_GAP: 10, // Maximum confidence gap for borderline
  HIGH_CONFIDENCE: 85, // Above this, never borderline
};

/**
 * Secondary match display thresholds
 */
const SECONDARY_THRESHOLDS = {
  SHOW_PRIMARY_MAX: 70, // Show secondary if primary confidence < 70%
  MIN_CONFIDENCE: 15,   // Only show if secondary confidence >= 15%
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
  lab: { L: number; a: number; b: number },
  hsl?: { s: number } // Optional HSL saturation for vividness calculation
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
  
  // Extremely muted gate: chroma < 10 (very greyed colors)
  const isExtremelyMuted = C < 10;
  
  // Mutedness gate: chroma < 30 (muted/dusty colors)
  // This helps fix misclassification of muted colors as Light/Bright instead of Soft
  const isMutedColor = C < 30;
  
  // Earthy/Brownish feature detection (warm brown/tan/caramel tones)
  const isEarthyBrownish =
    lab.b > 22 &&
    lab.a < 14 &&
    L > 45 && L < 78 &&
    C > 20; // avoid greys
  
  // Vivid Yellow feature detection (protect true Spring yellows)
  const isVividYellow =
    lab.b > 28 &&
    lab.a >= 14 &&
    L >= 75;
  
  // New semantic features for fine-grained accuracy
  const isGreyed = C < 28;
  const isDusty = C < 28 && L > 45 && L < 75;
  const isSmoky = C < 28 && L <= 45;
  
  // Clarity vs Softness flags (independent semantic dimension)
  const isVerySoft = C < 15;
  const isSoft = C >= 15 && C < 25;
  const isClearClarity = C >= 25 && C < 40;
  const isVeryClear = C >= 40;
  
  // Create feature flags snapshot
  const featureFlags: FeatureFlags = {
    veryMuted: isVeryMuted,
    muted: isMuted,
    clear: isClear,
    light: isLight,
    deep: isDeep,
    isEarthyBrownish,
    isVividYellow,
    isGreyed,
    isDusty,
    isSmoky,
  };
  
  // Adaptive temperature reliability
  const temperatureReliability = C < 20 ? 0.2 : (C >= 35 ? 1.0 : 0.6);
  
  // Compute Spring vs Autumn penalty factors (applied to distance, not post-hoc)
  // This fixes systematic misclassification of warm, medium-lightness, earthy colors
  const isWarm = lab.b > 0; // Warm color (positive b*)
  let springPenaltyFactor = 1.0;
  let autumnPenaltyFactor = 1.0;
  let springClearScore = 0;
  let autumnEarthScore = 0;
  
  if (isWarm) {
    // Compute springClearScore: high when L >= 65 and chroma >= 35
    const springClearL = Math.max(0, Math.min(1, (L - 60) / (70 - 60))); // Ramp from 60 to 70
    const springClearChroma = Math.max(0, Math.min(1, (C - 30) / (40 - 30))); // Ramp from 30 to 40
    springClearScore = springClearL * springClearChroma;
    
    // Compute autumnEarthScore: high when 45 <= L <= 65 and 18 <= chroma <= 38
    const autumnEarthL = Math.max(0, Math.min(1, 
      L >= 45 && L <= 65 ? 1 : (L < 45 ? (L - 40) / (45 - 40) : (70 - L) / (70 - 65))
    )); // Peak at 45-65, ramp down outside
    const autumnEarthChroma = Math.max(0, Math.min(1,
      C >= 18 && C <= 38 ? 1 : (C < 18 ? (C - 13) / (18 - 13) : (43 - C) / (43 - 38))
    )); // Peak at 18-38, ramp down outside
    autumnEarthScore = autumnEarthL * autumnEarthChroma;
    
    // Compute penalty factors (multiplicative, applied to distance)
    // Lower distance = better match, so:
    // - When earthy: Spring gets penalty (distance * factor > 1), Autumn gets bonus (distance * factor < 1)
    // - When clear: Autumn gets penalty (distance * factor > 1), Spring gets bonus (distance * factor < 1)
    const K = 0.3; // Multiplicative factor (0.15-0.3 range, using 0.3 for stronger effect)
    
    // Base factors: start at 1.0 (no adjustment)
    springPenaltyFactor = 1.0;
    autumnPenaltyFactor = 1.0;
    
    // Apply earthy adjustments
    if (autumnEarthScore > 0) {
      springPenaltyFactor = 1 + K * autumnEarthScore; // Spring penalized when earthy (distance increased)
      autumnPenaltyFactor = Math.max(0.7, 1 - K * autumnEarthScore); // Autumn rewarded when earthy (distance decreased, min 0.7)
    }
    
    // Apply clear adjustments (can override earthy for Spring if very clear)
    if (springClearScore > 0) {
      springPenaltyFactor = Math.max(0.7, springPenaltyFactor - K * springClearScore); // Spring rewarded when clear (distance decreased)
      autumnPenaltyFactor = Math.max(1.0, autumnPenaltyFactor + K * springClearScore * 0.5); // Autumn slightly penalized when clear
    }
  }
  
  // Calculate scores for all seasons
  const seasonScores: Array<{
    season: Season12;
    baseScore: number;
    effectiveBaseScore: number; // baseScore after penalty factor
    penaltyMuted: number;
    penaltyLightDeep: number;
    penaltyTemperature: number;
    penaltyEarthy: number;
    penaltyDusty: number;
    penaltyClarityMismatch: number;
    penaltyMutedGate: number;
    penaltyMutedness: number;
    penaltySpringBrightness: number;
    totalScore: number;
  }> = [];
  
  for (const [season, metadata] of Object.entries(SEASON_METADATA) as Array<[Season12, SeasonMetadata]>) {
    // Base score: DeltaE76
    const baseScore = calculateDeltaE76(lab, metadata.centroidLab);
    
    // Apply Spring vs Autumn penalty factor to distance (multiplicative)
    let effectiveBaseScore = baseScore;
    if (isWarm) {
      if (season.startsWith('spring-')) {
        effectiveBaseScore = baseScore * springPenaltyFactor;
      } else if (season.startsWith('autumn-')) {
        effectiveBaseScore = baseScore * autumnPenaltyFactor;
      }
    }
    
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
    
    // Penalty: Earthy/Brownish colors should prefer Autumn over Spring
    let penaltyEarthy = 0;
    if (isEarthyBrownish && !isVividYellow && metadata.isSpringFamily) {
      penaltyEarthy += 22;
    }
    
    // Penalty: Dusty/Greyed colors (polish-level, small weights)
    let penaltyDusty = 0;
    if (isDusty || isGreyed) {
      if (metadata.isBrightSeason) {
        penaltyDusty += 12; // Dusty colors should not match Bright seasons
      }
      if (metadata.isLightSeason && isSmoky) {
        penaltyDusty += 15; // Smoky rejects light seasons
      }
    }
    if (isSmoky) {
      if (metadata.isDeepSeason) {
        penaltyDusty -= 4; // Smoky slightly prefers deep seasons (negative penalty = preference)
      }
    }
    
    // Penalty: Clarity vs Softness mismatch (mild weights, semantic tie-breaker)
    let penaltyClarityMismatch = 0;
    if (isSoft && (metadata.clarityProfile === 'clear' || metadata.clarityProfile === 'very-clear')) {
      penaltyClarityMismatch += 10;
    }
    if (isClearClarity && metadata.clarityProfile === 'soft') {
      penaltyClarityMismatch += 8;
    }
    if (isVerySoft && metadata.clarityProfile === 'very-clear') {
      penaltyClarityMismatch += 15;
    }
    
    // Penalty: Muted gate for Winter/Spring (very low chroma colors cannot be Winter/Spring)
    // Winter and Spring require clarity and saturation, so extremely muted colors (chroma < 10) get strong penalty
    let penaltyMutedGate = 0;
    if (isExtremelyMuted) {
      if (season.startsWith('winter') || season.startsWith('spring')) {
        penaltyMutedGate += 40; // Strong penalty: +30~50 range, using 40 as middle value
      }
    }
    
    // Penalty/Bonus: Mutedness gate for Light/Bright vs Soft seasons
    // Muted colors (chroma < 30) should prefer Soft seasons over Light/Bright
    let penaltyMutedness = 0;
    if (isMutedColor) {
      // Penalty for Light seasons (light-spring, light-summer)
      if (season.includes('light')) {
        penaltyMutedness += 25; // Penalty for Light seasons
      }
      // Penalty for Bright seasons (bright-spring, bright-winter)
      if (season.includes('bright')) {
        penaltyMutedness += 25; // Penalty for Bright seasons
      }
      // Bonus (negative penalty) for Soft seasons (soft-summer, soft-autumn)
      if (season.includes('soft')) {
        penaltyMutedness -= 20; // Bonus for Soft seasons (reduces totalScore)
      }
    }
    
    // Penalty/Bonus: Spring internal distinction (Bright Spring vs True Spring)
    // Bright Spring requires extreme clarity (candy-like, fluorescent), while True Spring is warm, high-chroma but "juicy/not piercing"
    let penaltySpringBrightness = 0;
    const isHighChroma = C >= 35; // High chroma threshold
    const isNotExtremelyClear = L < 70 || isSmoky || isDusty || isGreyed; // Not extremely clear conditions
    
    if (isHighChroma && isNotExtremelyClear) {
      // High chroma but not extremely clear (thick/juicy colors like #D68A58)
      if (season === 'spring-bright') {
        penaltySpringBrightness += 10; // Penalty for Bright Spring (should be very clear/fluorescent)
      }
      if (season === 'spring-true' && lab.b > 0) {
        // Warm, high-chroma, non-extremely-clear colors prefer True Spring
        penaltySpringBrightness -= 6; // Bonus for True Spring (reduces totalScore)
      }
    }
    
    // Use effectiveBaseScore (with penalty factor) instead of raw baseScore
    const totalScore = effectiveBaseScore + penaltyMuted + penaltyLightDeep + penaltyTemperature + penaltyEarthy + penaltyDusty + penaltyClarityMismatch + penaltyMutedGate + penaltyMutedness + penaltySpringBrightness;
    
    seasonScores.push({
      season,
      baseScore,
      effectiveBaseScore,
      penaltyMuted,
      penaltyLightDeep,
      penaltyTemperature,
      penaltyEarthy,
      penaltyDusty,
      penaltyClarityMismatch,
      penaltyMutedGate,
      penaltyMutedness,
      penaltySpringBrightness,
      totalScore,
    });
  }
  
  // Apply vividness adjustment for Spring internal distinction (spring-true vs spring-bright)
  // This is a targeted tie-breaker for high-vividness Spring colors
  if (hsl && lab.b > 0) { // Only for warm colors
    const VIVID_HIGH = 0.45;
    const VIVID_LOW = 0.30;
    const VIVID_EXTREME = 0.5; // Extreme vividness threshold
    const BONUS = 8.0; // Increased from 2.0 to ensure ranking change
    
    // Compute vividness metric (C is already computed above)
    const vivid = (C / 100) * (hsl.s / 100);
    
    // Additional clarity/vividness feature for Bright Spring
    // Very high chroma (>= 55) OR high saturation (>= 85) with medium L (35-75)
    const isVeryHighChroma = C >= 55;
    const isHighSatMediumL = hsl.s >= 85 && L >= 35 && L <= 75;
    const isExtremelyVivid = isVeryHighChroma || isHighSatMediumL;
    
    // Find spring-true and spring-bright scores
    const springTrueIndex = seasonScores.findIndex(s => s.season === 'spring-true');
    const springBrightIndex = seasonScores.findIndex(s => s.season === 'spring-bright');
    
    if (springTrueIndex !== -1 && springBrightIndex !== -1) {
      const springTrueScore = { ...seasonScores[springTrueIndex] }; // Copy for debug
      const springBrightScore = { ...seasonScores[springBrightIndex] }; // Copy for debug
      
      // Calculate adjustment using linear interpolation
      let adjustment = 0;
      if (vivid >= VIVID_EXTREME || isExtremelyVivid) {
        // Extreme vividness: enforce spring-bright must beat spring-true
        // Calculate minimum adjustment needed to ensure spring-bright wins
        const scoreGap = springTrueScore.totalScore - springBrightScore.totalScore;
        adjustment = Math.max(BONUS, scoreGap + 1); // Ensure spring-bright wins by at least 1
      } else if (vivid >= VIVID_HIGH || isVeryHighChroma) {
        // High vividness: favor spring-bright
        adjustment = BONUS;
      } else if (vivid <= VIVID_LOW && C < 55) {
        // Low vividness and not very high chroma: favor spring-true
        adjustment = -BONUS;
      } else {
        // Linear interpolation between thresholds
        const t = (vivid - VIVID_LOW) / (VIVID_HIGH - VIVID_LOW);
        adjustment = BONUS * (2 * t - 1); // Maps [VIVID_LOW, VIVID_HIGH] to [-BONUS, BONUS]
      }
      
      // Apply adjustment: positive adjustment favors bright (reduces bright score, increases true score)
      // Negative adjustment favors true (reduces true score, increases bright score)
      seasonScores[springTrueIndex].totalScore += adjustment;
      seasonScores[springBrightIndex].totalScore -= adjustment;
      
      // Debug logging - always log for vividness adjustments (can be filtered by flag if needed)
      const debugInfo = {
        chroma: C,
        sat: hsl.s,
        vivid,
        preAdjust: {
          'spring-true': springTrueScore.totalScore,
          'spring-bright': springBrightScore.totalScore,
        },
        adjustment,
        postAdjust: {
          'spring-true': seasonScores[springTrueIndex].totalScore,
          'spring-bright': seasonScores[springBrightIndex].totalScore,
        },
      };
      
      // Always log for debugging (can be filtered by flag)
      if (typeof window !== 'undefined' && (window as any).DEBUG_SPRING_VIVIDNESS) {
        console.log('SPRING_VIVIDNESS_ADJUSTMENT (pre-softmax):', debugInfo);
      }
      
      // Store for post-softmax logging
      (seasonScores as any).__vividnessDebug = debugInfo;
    }
  }
  
  // Store debug info for post-softmax logging
  let springAutumnDebugInfo: any = null;
  if (typeof window !== 'undefined' && (window as any).DEBUG_SPRING_AUTUMN_BOUNDARY && isWarm) {
    const top3Before = [...seasonScores]
      .sort((a, b) => a.totalScore - b.totalScore)
      .slice(0, 3)
      .map(s => ({ 
        season: s.season, 
        baseScore: s.baseScore,
        effectiveBaseScore: s.effectiveBaseScore,
        totalScore: s.totalScore 
      }));
    
    springAutumnDebugInfo = {
      lab: { L: lab.L, a: lab.a, b: lab.b },
      chroma: C,
      springClearScore,
      autumnEarthScore,
      penaltyFactors: {
        springPenaltyFactor,
        autumnPenaltyFactor,
      },
      top3Before,
    };
  }
  
  // Convert to confidence using temperature-controlled, numerically stable softmax
  // Lower score = better match, so we use negative scores
  const TAU = 6; // Temperature parameter for softmax
  const minScore = Math.min(...seasonScores.map(s => s.totalScore));
  const logits = seasonScores.map(s => -((s.totalScore - minScore) / TAU));
  
  // Numerically stable softmax: subtract max logit before exp
  const maxLogit = Math.max(...logits);
  const expScores = logits.map(l => Math.exp(l - maxLogit));
  const sumExpScores = expScores.reduce((sum, e) => sum + e, 0);
  
  // Create matches with confidence and totalScore
  const matches: SeasonMatch[] = seasonScores
    .map((seasonScore, index) => ({
      season: seasonScore.season,
      confidence: Math.round((expScores[index] / sumExpScores) * 100),
      totalScore: seasonScore.totalScore,
    }))
    .sort((a, b) => a.totalScore - b.totalScore); // Sort by totalScore ascending (lower is better)
  
  // Debug logging for vividness adjustment (behind flag)
  if (typeof window !== 'undefined' && (window as any).DEBUG_SPRING_VIVIDNESS && (seasonScores as any).__vividnessDebug) {
    const debugInfo = (seasonScores as any).__vividnessDebug;
    const springTrueMatch = matches.find(m => m.season === 'spring-true');
    const springBrightMatch = matches.find(m => m.season === 'spring-bright');
    const top3 = matches.slice(0, 3);
    
    console.log('SPRING_VIVIDNESS_ADJUSTMENT:', {
      lab: { L: lab.L, a: lab.a, b: lab.b },
      chroma: debugInfo.chroma,
      sat: debugInfo.sat,
      vivid: debugInfo.vivid,
      preAdjust: debugInfo.preAdjust,
      adjustment: debugInfo.adjustment,
      postAdjust: debugInfo.postAdjust,
      finalProbabilities: {
        'spring-true': springTrueMatch ? springTrueMatch.confidence : 0,
        'spring-bright': springBrightMatch ? springBrightMatch.confidence : 0,
      },
      topCandidates: top3.map(m => ({ season: m.season, confidence: m.confidence, totalScore: m.totalScore })),
    });
    
    // Clean up debug info
    delete (seasonScores as any).__vividnessDebug;
  }
  
  // Debug logging for Spring vs Autumn boundary adjustment (after softmax)
  if (springAutumnDebugInfo) {
    const top3After = matches.slice(0, 3).map(m => ({
      season: m.season,
      confidence: m.confidence,
      totalScore: m.totalScore,
    }));
    
    // Find spring and autumn matches for detailed comparison
    const springMatches = matches.filter(m => m.season.startsWith('spring-'));
    const autumnMatches = matches.filter(m => m.season.startsWith('autumn-'));
    
    console.log('SPRING_AUTUMN_BOUNDARY_ADJUSTMENT:', {
      ...springAutumnDebugInfo,
      top3After,
      springMatches: springMatches.map(m => ({ season: m.season, confidence: m.confidence, totalScore: m.totalScore })),
      autumnMatches: autumnMatches.map(m => ({ season: m.season, confidence: m.confidence, totalScore: m.totalScore })),
    });
  }
  
  // Primary and secondary matches
  const primaryMatch = matches[0];
  const secondaryMatch = matches[1];
  
  // Calculate gaps
  const scoreGap = secondaryMatch ? secondaryMatch.totalScore - primaryMatch.totalScore : Infinity;
  const confidenceGap = secondaryMatch ? primaryMatch.confidence - secondaryMatch.confidence : Infinity;
  
  // Determine if borderline: Use AND instead of OR, with stricter thresholds
  // Hard rule: if primary confidence >= 85, never borderline
  // Borderline controls ONLY the "Borderline" label (very close top-2)
  const isBorderline = 
    primaryMatch.confidence < BORDERLINE_THRESHOLDS.HIGH_CONFIDENCE &&
    (scoreGap <= BORDERLINE_THRESHOLDS.SCORE_GAP) && 
    (confidenceGap <= BORDERLINE_THRESHOLDS.CONF_GAP);
  
  // Determine if secondary match should be shown
  // Secondary match display depends on LOW confidence (uncertainty), not just borderline
  const shouldShowSecondary = 
    secondaryMatch &&
    (primaryMatch.confidence < SECONDARY_THRESHOLDS.SHOW_PRIMARY_MAX) &&
    (secondaryMatch.confidence >= SECONDARY_THRESHOLDS.MIN_CONFIDENCE);
  
  // Return secondaryMatch when shouldShowSecondary is true (independent of isBorderline)
  const finalSecondaryMatch = shouldShowSecondary ? secondaryMatch : null;
  
  // Create breakdown for display (sorted by confidence descending)
  const breakdown = matches
    .map(m => ({
      season: m.season,
      score: m.confidence,
    }))
    .sort((a, b) => b.score - a.score); // Sort descending by confidence
  
  // Create detailed debug info for all seasons
  const seasonDebugInfo: SeasonDebugInfo[] = seasonScores
    .map((seasonScore, index) => ({
      season: seasonScore.season,
      baseScore: seasonScore.baseScore,
      penaltyMuted: seasonScore.penaltyMuted,
      penaltyLightDeep: seasonScore.penaltyLightDeep,
      penaltyTemperature: seasonScore.penaltyTemperature,
      penaltyEarthy: seasonScore.penaltyEarthy,
      penaltyDusty: seasonScore.penaltyDusty,
      penaltyClarityMismatch: seasonScore.penaltyClarityMismatch,
      penaltyMutedGate: seasonScore.penaltyMutedGate,
      penaltyMutedness: seasonScore.penaltyMutedness,
      penaltySpringBrightness: seasonScore.penaltySpringBrightness,
      totalScore: seasonScore.totalScore,
      confidence: Math.round((expScores[index] / sumExpScores) * 100),
    }))
    .sort((a, b) => a.totalScore - b.totalScore); // Sort by totalScore ascending
  
  // Create top 3 candidates with full breakdown for calibration
  const topCandidates: TopCandidate[] = seasonDebugInfo
    .slice(0, 3) // Top 3
    .map(debugInfo => ({
      season: debugInfo.season,
      confidence: debugInfo.confidence,
      totalScore: debugInfo.totalScore,
      baseScore: debugInfo.baseScore,
      penaltyMuted: debugInfo.penaltyMuted,
      penaltyLightDeep: debugInfo.penaltyLightDeep,
      penaltyTemperature: debugInfo.penaltyTemperature,
      penaltyEarthy: debugInfo.penaltyEarthy,
      penaltyDusty: debugInfo.penaltyDusty,
      penaltyClarityMismatch: debugInfo.penaltyClarityMismatch,
      penaltyMutedGate: debugInfo.penaltyMutedGate,
      penaltyMutedness: debugInfo.penaltyMutedness,
      penaltySpringBrightness: debugInfo.penaltySpringBrightness,
      flags: featureFlags,
    }));
  
  // Legacy fields for backward compatibility
  const primarySeason = primaryMatch.season;
  const secondarySeason = finalSecondaryMatch?.season ?? null;
  const confidence = primaryMatch.confidence;
  const isAmbiguous = isBorderline; // Map isBorderline to isAmbiguous for compatibility
  
  // Derive temperature from primary season and color neutrality
  const baseTemperature = getBaseTemperatureFromSeason(primaryMatch.season);
  const isNeutral = isNeutralColor({ a: lab.a, b: lab.b });
  const finalTemperatureLabel = getTemperatureLabelFromSeasonAndColor(
    primaryMatch.season,
    { a: lab.a, b: lab.b }
  );
  
  // Calculate raw temperature for debug (using LAB-based calculation)
  // Convert lab format {L, a, b} to LAB format {l, a, b} for labToLch
  const labForLch: LAB = { l: lab.L, a: lab.a, b: lab.b };
  const lchForTemp = labToLch(labForLch);
  // getTemperatureCategoryFromLab expects {L, a, b} format
  const rawTemperature = getTemperatureCategoryFromLab(
    { L: lab.L, a: lab.a, b: lab.b },
    lchForTemp
  );
  
  return {
    primaryMatch,
    secondaryMatch: finalSecondaryMatch,
    isBorderline,
    gaps: {
      scoreGap: finalSecondaryMatch ? scoreGap : 0,
      confidenceGap: finalSecondaryMatch ? confidenceGap : 0,
    },
    breakdown,
    debugInfo: {
      isEarthyBrownish,
      isVividYellow,
      seasonScores: seasonDebugInfo,
      topCandidates,
      autumnCentroids: {
        'autumn-soft': SEASON_METADATA['autumn-soft'].centroidLab,
        'autumn-true': SEASON_METADATA['autumn-true'].centroidLab,
        'autumn-deep': SEASON_METADATA['autumn-deep'].centroidLab,
      },
      baseTemperature,
      isNeutral,
      finalTemperatureLabel,
      rawTemperature,
      chroma: C,
      isVerySoft,
      isSoft,
      isClear: isClearClarity,
      isVeryClear,
    },
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
    return 'winter-true'; // True Winter (Standard Grey)
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
  // Pass HSL saturation for vividness calculation
  const seasonMatch = calculateSeasonMatchBreakdown(labDecision, { s: color.hsl.s });

  // Derive temperature from primary season and color neutrality (ensures UI consistency: no Winter + Warm conflicts)
  // Use finalTemperatureLabel from seasonMatch if available, otherwise calculate from season12
  const finalTemperature = seasonMatch?.debugInfo?.finalTemperatureLabel 
    ?? getTemperatureLabelFromSeasonAndColor(
        seasonMatch?.primaryMatch?.season ?? season12,
        { a: color.lab.a, b: color.lab.b }
      );

  return {
    lightness: Math.round(color.lab.l),
    saturation: color.hsl.s,
    temperature: finalTemperature, // Derived from season + color neutrality, ensures no conflicts
    seasonalTendency,
    season12,
    seasonMatch,
  };
}

/**
 * Dev-only test function for Spring vs Autumn boundary validation
 * Tests three acceptance criteria colors and prints results
 */
export function testSpringAutumnBoundary(): void {
  if (typeof window === 'undefined') return; // Only run in browser
  
  const testCases = [
    { hex: '#B37256', name: 'Warm earthy brown (should be Autumn)' },
    { hex: '#FF0801', name: 'Very high chroma warm red (should be Bright Spring)' },
    { hex: '#FEA176', name: 'Light warm peach (should be Spring)' },
  ];
  
  console.group('SPRING_AUTUMN_BOUNDARY_TEST');
  
  for (const testCase of testCases) {
    const rgb = {
      r: parseInt(testCase.hex.slice(1, 3), 16),
      g: parseInt(testCase.hex.slice(3, 5), 16),
      b: parseInt(testCase.hex.slice(5, 7), 16),
    };
    
    const color = getColorValues(rgb.r, rgb.g, rgb.b);
    const metrics = getColorMetrics(color);
    
    const top1 = metrics.seasonMatch?.primaryMatch;
    const top2 = metrics.seasonMatch?.secondaryMatch;
    const top3 = metrics.seasonMatch?.debugInfo?.seasonScores
      .sort((a, b) => a.totalScore - b.totalScore)
      .slice(0, 3);
    
    console.log(testCase.name, {
      hex: testCase.hex,
      lab: { L: color.lab.l, a: color.lab.a, b: color.lab.b },
      top1: top1 ? { season: top1.season, confidence: top1.confidence } : null,
      top2: top2 ? { season: top2.season, confidence: top2.confidence } : null,
      top3: top3?.map(s => ({ season: s.season, confidence: s.confidence, totalScore: s.totalScore })),
    });
  }
  
  console.groupEnd();
}

// Expose test function globally for easy access
if (typeof window !== 'undefined') {
  (window as any).testSpringAutumnBoundary = testSpringAutumnBoundary;
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

/**
 * Dev-only test function for Spring vs Autumn boundary validation
 * Tests three acceptance criteria colors and prints results
 * Call from browser console: window.testSpringAutumnBoundary()
 */
export function testSpringAutumnBoundary(): void {
  if (typeof window === 'undefined') return; // Only run in browser
  
  const testCases = [
    { hex: '#B37256', name: 'Warm earthy brown (should be Autumn)' },
    { hex: '#FF0801', name: 'Very high chroma warm red (should be Bright Spring)' },
    { hex: '#FEA176', name: 'Light warm peach (should be Spring)' },
  ];
  
  console.group('SPRING_AUTUMN_BOUNDARY_TEST');
  
  for (const testCase of testCases) {
    const rgb = {
      r: parseInt(testCase.hex.slice(1, 3), 16),
      g: parseInt(testCase.hex.slice(3, 5), 16),
      b: parseInt(testCase.hex.slice(5, 7), 16),
    };
    
    const color = getColorValues(rgb.r, rgb.g, rgb.b);
    const metrics = getColorMetrics(color);
    
    const top1 = metrics.seasonMatch?.primaryMatch;
    const top2 = metrics.seasonMatch?.secondaryMatch;
    const top3 = metrics.seasonMatch?.debugInfo?.seasonScores
      .sort((a, b) => a.totalScore - b.totalScore)
      .slice(0, 3);
    
    console.log(testCase.name, {
      hex: testCase.hex,
      lab: { L: color.lab.l, a: color.lab.a, b: color.lab.b },
      chroma: Math.sqrt(color.lab.a * color.lab.a + color.lab.b * color.lab.b),
      top1: top1 ? { season: top1.season, confidence: top1.confidence } : null,
      top2: top2 ? { season: top2.season, confidence: top2.confidence } : null,
      top3: top3?.map(s => ({ season: s.season, confidence: s.confidence, totalScore: s.totalScore })),
    });
  }
  
  console.groupEnd();
}

// Expose test function globally for easy access
if (typeof window !== 'undefined') {
  (window as any).testSpringAutumnBoundary = testSpringAutumnBoundary;
}

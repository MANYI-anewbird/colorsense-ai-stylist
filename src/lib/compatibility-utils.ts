import type { ColorMetrics } from './color-utils';
import type { SkinToneType, SkinToneInfo } from '@/contexts/SkinToneContext';
import { SKIN_TONES } from '@/contexts/SkinToneContext';

export interface ScoreBreakdown {
  temperature: number;
  season: number;
  brightness: number;
  saturation: number;
}

/**
 * Calculate compatibility score with breakdown
 * Returns both the total score and individual component scores
 */
export function computeMatchScoreWithBreakdown(
  colorMetrics: ColorMetrics,
  skinToneId: SkinToneType
): { score: number; breakdown: ScoreBreakdown } {
  if (!skinToneId) {
    return { score: 0, breakdown: { temperature: 0, season: 0, brightness: 0, saturation: 0 } };
  }

  const skinTone = SKIN_TONES.find(t => t.id === skinToneId);
  if (!skinTone) {
    return { score: 0, breakdown: { temperature: 0, season: 0, brightness: 0, saturation: 0 } };
  }

  let score = 50; // Base score
  const breakdown: ScoreBreakdown = {
    temperature: 0,
    season: 0,
    brightness: 0,
    saturation: 0,
  };

  const { temperature, seasonalTendency, lightness, saturation } = colorMetrics;
  const skinChar = skinTone.characteristics;

  // Temperature match (most important - 30 points)
  let tempScore = 0;
  if (temperature === skinChar.temperature) {
    tempScore = 25;
  } else if (temperature === 'neutral') {
    tempScore = 15; // Neutral works somewhat with both
  } else {
    tempScore = -10; // Opposite temperature
  }
  score += tempScore;
  breakdown.temperature = tempScore;

  // Seasonal tendency match (20 points)
  let seasonScore = 0;
  if (seasonalTendency === skinTone.season) {
    seasonScore = 20;
  } else {
    // Adjacent seasons get partial credit
    const seasonOrder = ['spring', 'summer', 'autumn', 'winter'];
    const colorIdx = seasonOrder.indexOf(seasonalTendency);
    const skinIdx = seasonOrder.indexOf(skinTone.season);
    const distance = Math.min(
      Math.abs(colorIdx - skinIdx),
      4 - Math.abs(colorIdx - skinIdx)
    );
    if (distance === 1) seasonScore = 10;
  }
  score += seasonScore;
  breakdown.season = seasonScore;

  // Depth/lightness compatibility (15 points)
  const skinDepth = skinChar.depth;
  let brightnessScore = 0;
  if (skinDepth === 'light') {
    // Light skin tones work well with light and medium colors
    if (lightness > 60) brightnessScore = 15;
    else if (lightness > 40) brightnessScore = 10;
    else brightnessScore = 5;
  } else if (skinDepth === 'medium') {
    // Medium can wear most lightness levels
    if (lightness > 30 && lightness < 80) brightnessScore = 15;
    else brightnessScore = 10;
  } else {
    // Deep skin tones work well with deeper or very light (contrast) colors
    if (lightness < 50 || lightness > 85) brightnessScore = 15;
    else if (lightness > 40) brightnessScore = 8;
    else brightnessScore = 5;
  }
  score += brightnessScore;
  breakdown.brightness = brightnessScore;

  // Chroma/saturation compatibility (15 points)
  const skinChroma = skinChar.chroma;
  let saturationScore = 0;
  if (skinChroma === 'bright') {
    // Bright skin types look good in saturated colors
    if (saturation > 50) saturationScore = 15;
    else if (saturation > 30) saturationScore = 10;
    else saturationScore = 5;
  } else if (skinChroma === 'soft') {
    // Soft skin types look good in muted colors
    if (saturation < 50) saturationScore = 15;
    else if (saturation < 70) saturationScore = 10;
    else saturationScore = 5;
  } else {
    // True types are balanced
    if (saturation > 30 && saturation < 70) saturationScore = 15;
    else saturationScore = 10;
  }
  score += saturationScore;
  breakdown.saturation = saturationScore;

  // Ensure score is within bounds
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  return { score: finalScore, breakdown };
}

/**
 * Calculate compatibility score between a color and a skin tone type
 * Returns a score from 0-100
 * @deprecated Use computeMatchScoreWithBreakdown for new code
 */
export function calculateCompatibilityScore(
  colorMetrics: ColorMetrics,
  skinToneId: SkinToneType
): number {
  return computeMatchScoreWithBreakdown(colorMetrics, skinToneId).score;
}

/**
 * Get recommendation level based on score
 */
export function getRecommendationLevel(score: number): {
  level: 'excellent' | 'good' | 'fair' | 'poor';
  labelEn: string;
  labelZh: string;
} {
  if (score >= 80) {
    return { level: 'excellent', labelEn: 'Excellent Match', labelZh: '非常推荐' };
  } else if (score >= 60) {
    return { level: 'good', labelEn: 'Good Match', labelZh: '推荐' };
  } else if (score >= 40) {
    return { level: 'fair', labelEn: 'Fair Match', labelZh: '一般' };
  } else {
    return { level: 'poor', labelEn: 'Not Recommended', labelZh: '不推荐' };
  }
}

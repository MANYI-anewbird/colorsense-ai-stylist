import type { ColorMetrics } from './color-utils';
import type { SkinToneType, SkinToneInfo } from '@/contexts/SkinToneContext';
import { SKIN_TONES } from '@/contexts/SkinToneContext';

/**
 * Calculate compatibility score between a color and a skin tone type
 * Returns a score from 0-100
 */
export function calculateCompatibilityScore(
  colorMetrics: ColorMetrics,
  skinToneId: SkinToneType
): number {
  if (!skinToneId) return 0;

  const skinTone = SKIN_TONES.find(t => t.id === skinToneId);
  if (!skinTone) return 0;

  let score = 50; // Base score

  const { temperature, seasonalTendency, lightness, saturation } = colorMetrics;
  const skinChar = skinTone.characteristics;

  // Temperature match (most important - 30 points)
  if (temperature === skinChar.temperature) {
    score += 25;
  } else if (temperature === 'neutral' || temperature === 'neutral-warm' || temperature === 'neutral-cool') {
    // Neutral temperatures work somewhat with both, but lean matters
    if ((temperature === 'neutral-warm' && skinChar.temperature === 'warm') ||
        (temperature === 'neutral-cool' && skinChar.temperature === 'cool')) {
      score += 18; // Better match when lean aligns
    } else {
      score += 15; // Neutral works somewhat with both
    }
  } else {
    score -= 10; // Opposite temperature
  }

  // Seasonal tendency match (20 points)
  if (seasonalTendency === skinTone.season) {
    score += 20;
  } else {
    // Adjacent seasons get partial credit
    const seasonOrder = ['spring', 'summer', 'autumn', 'winter'];
    const colorIdx = seasonOrder.indexOf(seasonalTendency);
    const skinIdx = seasonOrder.indexOf(skinTone.season);
    const distance = Math.min(
      Math.abs(colorIdx - skinIdx),
      4 - Math.abs(colorIdx - skinIdx)
    );
    if (distance === 1) score += 10;
  }

  // Depth/lightness compatibility (15 points)
  const skinDepth = skinChar.depth;
  if (skinDepth === 'light') {
    // Light skin tones work well with light and medium colors
    if (lightness > 60) score += 15;
    else if (lightness > 40) score += 10;
    else score += 5;
  } else if (skinDepth === 'medium') {
    // Medium can wear most lightness levels
    if (lightness > 30 && lightness < 80) score += 15;
    else score += 10;
  } else {
    // Deep skin tones work well with deeper or very light (contrast) colors
    if (lightness < 50 || lightness > 85) score += 15;
    else if (lightness > 40) score += 8;
    else score += 5;
  }

  // Chroma/saturation compatibility (15 points)
  const skinChroma = skinChar.chroma;
  if (skinChroma === 'bright') {
    // Bright skin types look good in saturated colors
    if (saturation > 50) score += 15;
    else if (saturation > 30) score += 10;
    else score += 5;
  } else if (skinChroma === 'soft') {
    // Soft skin types look good in muted colors
    if (saturation < 50) score += 15;
    else if (saturation < 70) score += 10;
    else score += 5;
  } else {
    // True types are balanced
    if (saturation > 30 && saturation < 70) score += 15;
    else score += 10;
  }

  // Ensure score is within bounds
  return Math.min(100, Math.max(0, Math.round(score)));
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

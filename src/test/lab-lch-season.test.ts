import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SEASON_THRESHOLDS,
  determineColorSeasonFromLab,
  determineSeasonFamilyFromLab,
  getColorMetrics,
  getColorValues,
  hexToRgb,
} from '@/lib/color-utils';

describe('LAB/LCH 12-season classification', () => {
  it('enforces hard family constraints (warm/cool × clear/soft)', () => {
    const t = DEFAULT_SEASON_THRESHOLDS;

    const cases: Array<{
      lab: { L: number; a: number; b: number };
      lch: { L: number; C: number; h: number };
      expectedFamily: 'spring' | 'summer' | 'autumn' | 'winter';
    }> = [
      // Warm + Clear => Spring
      { lab: { L: 55, a: 10, b: 20 }, lch: { L: 55, C: 50, h: 60 }, expectedFamily: 'spring' },
      // Warm + Soft => Autumn
      { lab: { L: 55, a: 10, b: 20 }, lch: { L: 55, C: 10, h: 60 }, expectedFamily: 'autumn' },
      // Cool + Clear => Winter
      { lab: { L: 55, a: -10, b: -20 }, lch: { L: 55, C: 50, h: 260 }, expectedFamily: 'winter' },
      // Cool + Soft => Summer
      { lab: { L: 55, a: -10, b: -20 }, lch: { L: 55, C: 10, h: 260 }, expectedFamily: 'summer' },

      // Neutral temperature tie-breaks by hue
      // Neutral (b*=0) + warm hue + clear => Spring
      { lab: { L: 55, a: 0, b: 0 }, lch: { L: 55, C: 50, h: 20 }, expectedFamily: 'spring' },
      // Neutral (b*=0) + cool hue + clear => Winter
      { lab: { L: 55, a: 0, b: 0 }, lch: { L: 55, C: 50, h: 200 }, expectedFamily: 'winter' },

      // Medium chroma resolves to nearest threshold (deterministic tie)
      // C*=30 is exactly equidistant between 22 and 38 -> resolves to clear (midpoint rule)
      { lab: { L: 55, a: 10, b: 20 }, lch: { L: 55, C: 30, h: 60 }, expectedFamily: 'spring' },
      { lab: { L: 55, a: -10, b: -20 }, lch: { L: 55, C: 30, h: 260 }, expectedFamily: 'winter' },
    ];

    for (const c of cases) {
      const family = determineSeasonFamilyFromLab(c.lab, c.lch, t);
      const season12 = determineColorSeasonFromLab(c.lab, c.lch, t);

      expect(family).toBe(c.expectedFamily);
      expect(season12.startsWith(`${c.expectedFamily}-`)).toBe(true);
    }
  });

  it('produces stable 12-season ids for a few sanity hex colors', () => {
    const sanity: Array<{ hex: string; expectedFamily: 'spring' | 'summer' | 'autumn' | 'winter' }> =
      [
        { hex: '#FF6A00', expectedFamily: 'spring' }, // vivid orange
        { hex: '#6D5C4D', expectedFamily: 'autumn' }, // muted warm brown/taupe
        { hex: '#00A2FF', expectedFamily: 'winter' }, // vivid blue
        { hex: '#8FA3B8', expectedFamily: 'summer' }, // dusty blue
      ];

    for (const { hex, expectedFamily } of sanity) {
      const rgb = hexToRgb(hex);
      expect(rgb).not.toBeNull();
      if (!rgb) continue;

      const values = getColorValues(rgb.r, rgb.g, rgb.b);
      const metrics = getColorMetrics(values);

      expect(metrics.seasonalTendency).toBe(expectedFamily);
      expect(metrics.season12.startsWith(`${expectedFamily}-`)).toBe(true);
    }
  });
});


import { describe, it, expect } from 'vitest';
import { rgbToLab } from '@/lib/color-utils';
import type { LabImageData } from '@/lib/dominant-color';
import { computeDominantColorFromLab } from '@/lib/dominant-color';

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '').toUpperCase();
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return { r, g, b };
}

function createLabImageData(
  width: number,
  height: number,
  colorFn: (x: number, y: number) => { r: number; g: number; b: number }
): LabImageData {
  const size = width * height;
  const labL = new Float32Array(size);
  const labA = new Float32Array(size);
  const labB = new Float32Array(size);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { r, g, b } = colorFn(x, y);
      const lab = rgbToLab(r, g, b);
      const idx = y * width + x;
      labL[idx] = lab.l;
      labA[idx] = lab.a;
      labB[idx] = lab.b;
    }
  }

  return {
    width,
    height,
    scale: 1,
    labL,
    labA,
    labB,
  };
}

function deltaE(lab1: { l: number; a: number; b: number }, lab2: { l: number; a: number; b: number }) {
  const dL = lab1.l - lab2.l;
  const dA = lab1.a - lab2.a;
  const dB = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + dA * dA + dB * dB);
}

describe('computeDominantColorFromLab', () => {
  it('returns stable dominant color across nearby seeds', () => {
    const baseRgb = hexToRgb('#775533');
    const data = createLabImageData(30, 30, () => baseRgb);
    const seeds = [
      { x: 10, y: 10 },
      { x: 12, y: 11 },
      { x: 8, y: 9 },
      { x: 15, y: 14 },
      { x: 5, y: 16 },
    ];

    const results = seeds.map((seed) =>
      computeDominantColorFromLab(data, seed, undefined, undefined)
    );

    expect(results.every(Boolean)).toBe(true);

    const first = results[0]!;
    for (let i = 1; i < results.length; i++) {
      const current = results[i]!;
      const distance = deltaE(first.dominant.lab, current.dominant.lab);
      expect(distance).toBeLessThan(6);
      expect(current.stats.truncated).toBe(false);
      expect(current.stats.patternDetected).toBe(false);
      expect(current.stats.largeShift).toBe(false);
    }
  });

  it('flags largeShift when picked color differs from dominant', () => {
    const baseRgb = hexToRgb('#704214'); // warm brown
    const highlightRgb = hexToRgb('#F8E7C9'); // bright highlight
    const data = createLabImageData(20, 20, () => baseRgb);
    const picked = {
      rgb: highlightRgb,
      lab: rgbToLab(highlightRgb.r, highlightRgb.g, highlightRgb.b),
      hex: '#F8E7C9',
    };

    const result = computeDominantColorFromLab(data, { x: 10, y: 10 }, picked);
    expect(result).not.toBeNull();
    expect(result!.stats.largeShift).toBe(true);
    expect(deltaE(result!.dominant.lab, picked.lab)).toBeGreaterThan(18);
  });

  it('detects patterned regions via cluster ratios', () => {
    const colors = [
      hexToRgb('#336699'),
      hexToRgb('#3B6EA3'),
      hexToRgb('#4477AD'),
      hexToRgb('#4F81B7'),
    ];
    const data = createLabImageData(30, 30, (x, y) => colors[(x + y) % colors.length]);

    const result = computeDominantColorFromLab(
      data,
      { x: 9, y: 9 },
      undefined,
      {
        minRegionTarget: 20,
        minRegionAbsolute: 20,
        maxRegionPixels: 1000,
        baseDeltaE: 18,
        expandedDeltaE: 22,
        tightDeltaE: 8,
        gradientThreshold: 120,
        patternThreshold: 0.8,
      }
    );

    expect(result).not.toBeNull();
    expect(result!.stats.patternDetected).toBe(true);
    expect(result!.stats.clusterRatios[0]).toBeLessThan(0.8);
  });

  it('respects maxRegionPixels and reports truncation', () => {
    const baseRgb = hexToRgb('#2E8540');
    const data = createLabImageData(40, 40, () => baseRgb);

    const maxRegionPixels = 50;
    const result = computeDominantColorFromLab(
      data,
      { x: 5, y: 5 },
      undefined,
      {
        minRegionTarget: 20,
        minRegionAbsolute: 20,
        maxRegionPixels,
        baseDeltaE: 10,
        expandedDeltaE: 14,
        tightDeltaE: 8,
      }
    );

    expect(result).not.toBeNull();
    expect(result!.stats.truncated).toBe(true);
    expect(result!.stats.regionSize).toBeLessThanOrEqual(maxRegionPixels);
  });
});

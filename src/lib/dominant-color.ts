import { rgbToHex, rgbToLab, type LAB, type RGB } from '@/lib/color-utils';

export interface DominantColorStats {
  regionSize: number;
  filteredSize: number;
  retainedRatio: number;
  filteredOutRatio: number;
  truncated: boolean;
  sampleCount: number;
  k: number;
  clusterRatios: number[];
  patternDetected: boolean;
  largeShift: boolean;
  variance: number;
  percentiles: {
    L10: number;
    L90: number;
    C30: number;
  };
}

export interface DominantColorResult {
  picked: {
    rgb: RGB;
    lab: LAB;
    hex: string;
  };
  dominant: {
    rgb: RGB;
    lab: LAB;
    hex: string;
  };
  maskDataUrl?: string;
  maskDimensions: {
    width: number;
    height: number;
    scale: number;
  };
  stats: DominantColorStats;
}

export interface DominantColorOptions {
  maxSide?: number;
  sampleSize?: number;
  sampleCount?: number;
  deltaEBase?: number;
  deltaESmallBoost?: number;
  deltaELargeTighten?: number;
  baseDeltaE?: number;
  expandedDeltaE?: number;
  tightDeltaE?: number;
  minRegionTarget?: number;
  minRegionAbsolute?: number;
  maxRegionPixels?: number;
  gradientThreshold?: number;
  largeShiftThreshold?: number;
  patternThreshold?: number;
  lowLightPercentile?: number;
  highLightPercentile?: number;
}

export const DEFAULT_DOMINANT_OPTIONS = {
  maxSide: 512,
  sampleSize: 3000,
  sampleCount: 3000,
  deltaEBase: 10,
  deltaESmallBoost: 4,
  deltaELargeTighten: 2,
  baseDeltaE: 10,
  expandedDeltaE: 14,
  tightDeltaE: 8,
  minRegionTarget: 800,
  minRegionAbsolute: 300,
  maxRegionPixels: 30000,
  gradientThreshold: 26,
  largeShiftThreshold: 18,
  patternThreshold: 0.45,
  lowLightPercentile: 0.1,
  highLightPercentile: 0.9,
} as const satisfies Required<DominantColorOptions>;

function resolveOptions(
  options?: DominantColorOptions
): Required<DominantColorOptions> {
  const resolved: Record<string, unknown> = {
    ...DEFAULT_DOMINANT_OPTIONS,
    ...options,
  };

  const deltaEBase =
    options?.deltaEBase ??
    options?.baseDeltaE ??
    DEFAULT_DOMINANT_OPTIONS.deltaEBase;
  const deltaESmallBoost =
    options?.deltaESmallBoost ?? DEFAULT_DOMINANT_OPTIONS.deltaESmallBoost;
  const deltaELargeTighten =
    options?.deltaELargeTighten ?? DEFAULT_DOMINANT_OPTIONS.deltaELargeTighten;

  resolved.deltaEBase = deltaEBase;
  resolved.deltaESmallBoost = deltaESmallBoost;
  resolved.deltaELargeTighten = deltaELargeTighten;
  resolved.baseDeltaE = options?.baseDeltaE ?? deltaEBase;
  resolved.expandedDeltaE =
    options?.expandedDeltaE ?? deltaEBase + deltaESmallBoost;
  resolved.tightDeltaE =
    options?.tightDeltaE ??
    Math.max(1, deltaEBase - deltaELargeTighten);

  const sample =
    options?.sampleSize ??
    options?.sampleCount ??
    DEFAULT_DOMINANT_OPTIONS.sampleSize;
  resolved.sampleSize = sample;
  resolved.sampleCount = sample;

  resolved.lowLightPercentile =
    options?.lowLightPercentile ?? DEFAULT_DOMINANT_OPTIONS.lowLightPercentile;
  resolved.highLightPercentile =
    options?.highLightPercentile ?? DEFAULT_DOMINANT_OPTIONS.highLightPercentile;

  resolved.patternThreshold =
    options?.patternThreshold ?? DEFAULT_DOMINANT_OPTIONS.patternThreshold;
  resolved.maxSide = options?.maxSide ?? DEFAULT_DOMINANT_OPTIONS.maxSide;
  resolved.maxRegionPixels =
    options?.maxRegionPixels ?? DEFAULT_DOMINANT_OPTIONS.maxRegionPixels;
  resolved.minRegionTarget =
    options?.minRegionTarget ?? DEFAULT_DOMINANT_OPTIONS.minRegionTarget;
  resolved.minRegionAbsolute =
    options?.minRegionAbsolute ?? DEFAULT_DOMINANT_OPTIONS.minRegionAbsolute;
  resolved.gradientThreshold =
    options?.gradientThreshold ?? DEFAULT_DOMINANT_OPTIONS.gradientThreshold;
  resolved.largeShiftThreshold =
    options?.largeShiftThreshold ?? DEFAULT_DOMINANT_OPTIONS.largeShiftThreshold;

  return resolved as Required<DominantColorOptions>;
}

export interface LabImageData {
  width: number;
  height: number;
  scale: number;
  labL: Float32Array;
  labA: Float32Array;
  labB: Float32Array;
}

interface PreparedImage extends LabImageData {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData;
}

interface RegionResult {
  indices: number[];
  truncated: boolean;
}

interface FilterResult {
  indices: number[];
  L10: number;
  L90: number;
  C30: number;
}

interface ClusterResult {
  centroids: Array<{ L: number; a: number; b: number }>;
  assignments: Uint16Array;
  counts: number[];
  samples: number[];
  k: number;
}

const tmpCanvas = document.createElement('canvas');

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function deltaE(l1: number, a1: number, b1: number, l2: number, a2: number, b2: number): number {
  const dL = l1 - l2;
  const dA = a1 - a2;
  const dB = b1 - b2;
  return Math.sqrt(dL * dL + dA * dA + dB * dB);
}

function prepareImage(canvas: HTMLCanvasElement, options: Required<DominantColorOptions>): PreparedImage | null {
  const sourceCtx = canvas.getContext('2d');
  if (!sourceCtx) return null;

  const srcWidth = canvas.width;
  const srcHeight = canvas.height;
  if (!srcWidth || !srcHeight) return null;

  const maxDim = Math.max(srcWidth, srcHeight);
  const scale = maxDim > options.maxSide ? options.maxSide / maxDim : 1;
  const width = Math.max(1, Math.round(srcWidth * scale));
  const height = Math.max(1, Math.round(srcHeight * scale));

  tmpCanvas.width = width;
  tmpCanvas.height = height;
  const ctx = tmpCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(canvas, 0, 0, srcWidth, srcHeight, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  const pixelCount = width * height;
  const labL = new Float32Array(pixelCount);
  const labA = new Float32Array(pixelCount);
  const labB = new Float32Array(pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const lab = rgbToLab(data[idx], data[idx + 1], data[idx + 2]);
    labL[i] = lab.l;
    labA[i] = lab.a;
    labB[i] = lab.b;
  }

  return {
    canvas: tmpCanvas,
    ctx,
    width,
    height,
    scale,
    imageData,
    labL,
    labA,
    labB,
  };
}

function regionGrowing(
  prepared: LabImageData,
  seedX: number,
  seedY: number,
  threshold: number,
  options: Required<DominantColorOptions>
): RegionResult {
  const { width, height, labL, labA, labB } = prepared;
  const idxSeed = seedY * width + seedX;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  const indices: number[] = [];

  const baseL = labL[idxSeed];
  const baseA = labA[idxSeed];
  const baseB = labB[idxSeed];

  queue.push(idxSeed);
  visited[idxSeed] = 1;
  indices.push(idxSeed);
  let truncated = false;

  const neighbors = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (queue.length > 0) {
    const idx = queue.shift()!;
    const x = idx % width;
    const y = Math.floor(idx / width);

    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const nIdx = ny * width + nx;
      if (visited[nIdx]) continue;

      const nL = labL[nIdx];
      const nA = labA[nIdx];
      const nB = labB[nIdx];

      const dist = deltaE(nL, nA, nB, baseL, baseA, baseB);
      if (dist > threshold) continue;

      const grad =
        Math.abs(labL[idx] - nL) +
        Math.abs(labA[idx] - nA) +
        Math.abs(labB[idx] - nB);
      if (grad > options.gradientThreshold) continue;

      visited[nIdx] = 1;
      queue.push(nIdx);
      indices.push(nIdx);

      if (indices.length >= options.maxRegionPixels) {
        truncated = true;
        return { indices, truncated };
      }
    }
  }

  return { indices, truncated };
}

function ensureRegion(
  prepared: LabImageData,
  seed: { x: number; y: number },
  options: Required<DominantColorOptions>
): RegionResult {
  const thresholds = [options.baseDeltaE, options.expandedDeltaE, options.tightDeltaE];
  for (const threshold of thresholds) {
    const region = regionGrowing(prepared, seed.x, seed.y, threshold, options);
    if (region.indices.length >= options.minRegionTarget) {
      return region;
    }
  }
  return regionGrowing(prepared, seed.x, seed.y, options.expandedDeltaE, options);
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = clamp((sorted.length - 1) * p, 0, sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(sorted.length - 1, lo + 1);
  const t = idx - lo;
  return sorted[lo] * (1 - t) + sorted[hi] * t;
}

function filterRegion(
  prepared: LabImageData,
  region: RegionResult,
  options: Required<DominantColorOptions>
): FilterResult {
  const { labL, labA, labB } = prepared;
  const { indices } = region;
  if (!indices.length) {
    return { indices: [], L10: 0, L90: 0, C30: 0 };
  }

  const Lvals: number[] = new Array(indices.length);
  const Cvals: number[] = new Array(indices.length);

  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    const L = labL[idx];
    const a = labA[idx];
    const b = labB[idx];
    Lvals[i] = L;
    Cvals[i] = Math.sqrt(a * a + b * b);
  }

  const requestedLow = clamp(options.lowLightPercentile, 0, 0.49);
  const requestedHigh = clamp(options.highLightPercentile, 0.5, 0.999);
  const highPercent = Math.min(
    0.999,
    Math.max(requestedLow + 0.01, requestedHigh)
  );
  const lowPercent = Math.min(requestedLow, highPercent - 0.01);

  const L10 = percentile(Lvals, lowPercent);
  const L90 = percentile(Lvals, highPercent);
  const C30 = percentile(Cvals, 0.3);

  const filtered: number[] = [];
  for (let i = 0; i < indices.length; i++) {
    const idx = indices[i];
    const L = Lvals[i];
    const C = Cvals[i];
    const isHighlight = L > L90 && C < C30;
    if (L >= L10 && L <= L90 && !isHighlight) {
      filtered.push(idx);
    }
  }

  return { indices: filtered.length ? filtered : indices, L10, L90, C30 };
}

function sampleIndices(indices: number[], sampleSize: number): number[] {
  if (indices.length <= sampleSize) return [...indices];
  const result: number[] = [];
  const step = indices.length / sampleSize;
  for (let i = 0; i < sampleSize; i++) {
    const sourceIndex = Math.min(indices.length - 1, Math.floor(i * step));
    result.push(indices[sourceIndex]);
  }
  return result;
}

function runKMeans(
  prepared: LabImageData,
  indices: number[],
  sampleSize: number,
  k: number,
  maxIterations = 10
): ClusterResult {
  const samples = sampleIndices(indices, sampleSize);
  const { labL, labA, labB } = prepared;
  const sampleCount = samples.length;
  const assignments = new Uint16Array(sampleCount);

  const centroids: Array<{ L: number; a: number; b: number }> = [];
  for (let i = 0; i < k; i++) {
    if (sampleCount === 0) {
      centroids.push({ L: 50, a: 0, b: 0 });
      continue;
    }
    const laneRatio = (i + 1) / (k + 1);
    const lane = Math.min(sampleCount - 1, Math.floor(laneRatio * sampleCount));
    const sampleIdx = samples[lane];
    centroids.push({
      L: labL[sampleIdx],
      a: labA[sampleIdx],
      b: labB[sampleIdx],
    });
  }

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let changed = false;

    for (let i = 0; i < sampleCount; i++) {
      const sampleIdx = samples[i];
      const L = labL[sampleIdx];
      const a = labA[sampleIdx];
      const b = labB[sampleIdx];

      let bestCluster = 0;
      let bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const centroid = centroids[c];
        const dist = deltaE(L, a, b, centroid.L, centroid.a, centroid.b);
        if (dist < bestDist) {
          bestDist = dist;
          bestCluster = c;
        }
      }

      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }

    if (!changed && iteration > 0) break;

    const sumL = new Array(k).fill(0);
    const sumA = new Array(k).fill(0);
    const sumB = new Array(k).fill(0);
    const counts = new Array(k).fill(0);

    for (let i = 0; i < sampleCount; i++) {
      const cluster = assignments[i];
      const sampleIdx = samples[i];
      sumL[cluster] += labL[sampleIdx];
      sumA[cluster] += labA[sampleIdx];
      sumB[cluster] += labB[sampleIdx];
      counts[cluster]++;
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) {
        const replacementRatio = (c + 1) / (k + 1);
        const idx = Math.min(sampleCount - 1, Math.floor(replacementRatio * sampleCount));
        const sampleIdx = samples[idx];
        centroids[c] = {
          L: labL[sampleIdx],
          a: labA[sampleIdx],
          b: labB[sampleIdx],
        };
      } else {
        centroids[c] = {
          L: sumL[c] / counts[c],
          a: sumA[c] / counts[c],
          b: sumB[c] / counts[c],
        };
      }
    }
  }

  const counts = new Array(k).fill(0);
  for (let i = 0; i < sampleCount; i++) {
    counts[assignments[i]]++;
  }

  return {
    centroids,
    assignments,
    counts,
    samples,
    k,
  };
}

function labToRgb(lab: LAB): RGB {
  const y = (lab.l + 16) / 116;
  const x = lab.a / 500 + y;
  const z = y - lab.b / 200;

  const pow = (t: number) =>
    t > 0.206893034 ? t * t * t : (t - 16 / 116) / 7.787;

  let X = pow(x) * 0.95047;
  let Y = pow(y) * 1.0;
  let Z = pow(z) * 1.08883;

  let r = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
  let g = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
  let b = X * 0.0557 + Y * -0.2040 + Z * 1.0570;

  const linearToSrgb = (u: number) =>
    u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055;

  r = clamp(Math.round(linearToSrgb(r) * 255), 0, 255);
  g = clamp(Math.round(linearToSrgb(g) * 255), 0, 255);
  b = clamp(Math.round(linearToSrgb(b) * 255), 0, 255);

  return { r, g, b };
}

function computeMedianLab(prepared: LabImageData, members: number[]): LAB {
  if (!members.length) {
    return { l: 50, a: 0, b: 0 };
  }
  const { labL, labA, labB } = prepared;
  const Lvals = members.map((idx) => labL[idx]);
  const Avals = members.map((idx) => labA[idx]);
  const Bvals = members.map((idx) => labB[idx]);

  return {
    l: percentile(Lvals, 0.5),
    a: percentile(Avals, 0.5),
    b: percentile(Bvals, 0.5),
  };
}

function computeVariance(prepared: LabImageData, members: number[]): number {
  if (!members.length) return 0;
  const { labL, labA, labB } = prepared;
  let sum = 0;
  let sumSq = 0;
  for (const idx of members) {
    const L = labL[idx];
    const a = labA[idx];
    const b = labB[idx];
    const mag = Math.sqrt(L * L + a * a + b * b);
    sum += mag;
    sumSq += mag * mag;
  }
  const mean = sum / members.length;
  const variance = sumSq / members.length - mean * mean;
  return Math.sqrt(Math.max(variance, 0));
}

function createMaskDataUrl(
  prepared: PreparedImage,
  regionIndices: number[],
  filteredIndices: number[]
): { dataUrl: string; width: number; height: number } {
  const { width, height } = prepared;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const ctx = maskCanvas.getContext('2d');
  if (!ctx) return { dataUrl: '', width, height };

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  const filteredSet = new Set(filteredIndices);

  for (const idx of regionIndices) {
    const base = idx * 4;
    data[base] = 255;
    data[base + 1] = 255;
    data[base + 2] = 255;
    data[base + 3] = filteredSet.has(idx) ? 90 : 45;
  }

  ctx.putImageData(imageData, 0, 0);
  return { dataUrl: maskCanvas.toDataURL('image/png'), width, height };
}

function fallbackMedianColor(
  canvas: HTMLCanvasElement,
  seed: { x: number; y: number }
): { rgb: RGB; lab: LAB; hex: string } {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const fallback = { r: 128, g: 128, b: 128 };
    return { rgb: fallback, lab: rgbToLab(128, 128, 128), hex: rgbToHex(128, 128, 128) };
  }

  const radius = 12;
  const size = radius * 2 + 1;
  const left = clamp(seed.x - radius, 0, canvas.width - 1);
  const top = clamp(seed.y - radius, 0, canvas.height - 1);
  const width = Math.min(size, canvas.width - left);
  const height = Math.min(size, canvas.height - top);

  const imageData = ctx.getImageData(left, top, width, height);
  const { data } = imageData;
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    rs.push(data[i]);
    gs.push(data[i + 1]);
    bs.push(data[i + 2]);
  }

  const median = (arr: number[]) => {
    const sorted = arr.sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };

  const rgb: RGB = {
    r: median(rs),
    g: median(gs),
    b: median(bs),
  };

  return {
    rgb,
    lab: rgbToLab(rgb.r, rgb.g, rgb.b),
    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
  };
}

function resolvePickedColor(
  data: LabImageData,
  seed: { x: number; y: number },
  fallbackRgb?: RGB
): { rgb: RGB; lab: LAB; hex: string } {
  const clampedX = clamp(seed.x, 0, data.width - 1);
  const clampedY = clamp(seed.y, 0, data.height - 1);
  const idx = clampedY * data.width + clampedX;
  const lab: LAB = {
    l: data.labL[idx],
    a: data.labA[idx],
    b: data.labB[idx],
  };
  const rgb = fallbackRgb ?? labToRgb(lab);
  return {
    rgb,
    lab,
    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
  };
}

export function computeDominantColorFromLab(
  data: LabImageData,
  seed: { x: number; y: number },
  pickedColor?: { rgb: RGB; lab: LAB; hex: string },
  options?: DominantColorOptions,
  maskFactory?: MaskFactory,
  fallbackDominant?: { rgb: RGB; lab: LAB; hex: string }
): DominantColorResult | null {
  const opts = resolveOptions(options);
  const region = ensureRegion(data, seed, opts);
  const filtered = filterRegion(data, region, opts);
  const indices = filtered.indices;

  const picked = pickedColor ?? resolvePickedColor(data, seed);

  if (indices.length < opts.minRegionAbsolute) {
    const retainedRatio = indices.length / Math.max(1, region.indices.length);
    const mask = maskFactory?.({ regionIndices: region.indices, filteredIndices: indices }) ?? null;
    const dominant = fallbackDominant ?? picked;

    return {
      picked,
      dominant,
      maskDataUrl: mask?.dataUrl ?? undefined,
      maskDimensions: mask
        ? { width: mask.width, height: mask.height, scale: data.scale }
        : undefined,
      stats: {
        regionSize: region.indices.length,
        filteredSize: indices.length,
        retainedRatio,
        filteredOutRatio: 1 - retainedRatio,
        truncated: region.truncated,
        sampleCount: 0,
        k: 1,
        clusterRatios: [1],
        patternDetected: false,
        largeShift: false,
        variance: 0,
        percentiles: {
          L10: filtered.L10,
          L90: filtered.L90,
          C30: filtered.C30,
        },
      },
    };
  }

  const k = region.indices.length > 15000 ? 4 : 3;
  const cluster = runKMeans(data, indices, opts.sampleSize, k);

  const buckets: number[][] = Array.from({ length: cluster.k }, () => []);
  for (let i = 0; i < cluster.samples.length; i++) {
    const assignment = cluster.assignments[i];
    const originalIdx = cluster.samples[i];
    buckets[assignment].push(originalIdx);
  }

  const clusterRatios = buckets.map(
    (bucket) => bucket.length / Math.max(1, cluster.samples.length)
  );

  const orderedBuckets = buckets
    .map((bucket, idx) => ({ bucket, ratio: clusterRatios[idx] }))
    .sort((a, b) => b.ratio - a.ratio);

  const primaryBucket = orderedBuckets[0];
  const patternDetected = primaryBucket.ratio < opts.patternThreshold;

  let dominantLab = computeMedianLab(data, primaryBucket.bucket);
  let dominantRgb = labToRgb(dominantLab);

  const variance = computeVariance(data, primaryBucket.bucket);
  const shift = deltaE(
    dominantLab.l,
    dominantLab.a,
    dominantLab.b,
    picked.lab.l,
    picked.lab.a,
    picked.lab.b
  );
  const largeShift = shift > opts.largeShiftThreshold;

  if ((patternDetected || largeShift) && orderedBuckets.length > 1) {
    const secondaryBucket = orderedBuckets[1];
    const blended = primaryBucket.bucket.concat(secondaryBucket.bucket);
    if (blended.length) {
      dominantLab = computeMedianLab(data, blended);
      dominantRgb = labToRgb(dominantLab);
    }
  }

  const mask = maskFactory?.({ regionIndices: region.indices, filteredIndices: indices }) ?? null;
  const retainedRatio = indices.length / Math.max(1, region.indices.length);

  return {
    picked,
    dominant: {
      rgb: dominantRgb,
      lab: dominantLab,
      hex: rgbToHex(dominantRgb.r, dominantRgb.g, dominantRgb.b),
    },
    maskDataUrl: mask?.dataUrl ?? undefined,
    maskDimensions: mask
      ? { width: mask.width, height: mask.height, scale: data.scale }
      : undefined,
    stats: {
      regionSize: region.indices.length,
      filteredSize: indices.length,
      retainedRatio,
      filteredOutRatio: 1 - retainedRatio,
      truncated: region.truncated,
      sampleCount: cluster.samples.length,
      k: cluster.k,
      clusterRatios,
      patternDetected,
      largeShift,
      variance,
      percentiles: {
        L10: filtered.L10,
        L90: filtered.L90,
        C30: filtered.C30,
      },
    },
  };
}

export function extractDominantColor(
  sourceCanvas: HTMLCanvasElement,
  seed: { x: number; y: number },
  options?: DominantColorOptions
): DominantColorResult | null {
  const resolved = resolveOptions(options);
  const prepared = prepareImage(sourceCanvas, resolved);
  if (!prepared) return null;

  const seedSmallX = clamp(Math.round(seed.x * prepared.scale), 0, prepared.width - 1);
  const seedSmallY = clamp(Math.round(seed.y * prepared.scale), 0, prepared.height - 1);

  const ctx = sourceCanvas.getContext('2d');
  const pickedRgb = (() => {
    if (!ctx) return { r: 128, g: 128, b: 128 };
    const data = ctx.getImageData(seed.x, seed.y, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  })();
  const picked = {
    rgb: pickedRgb,
    lab: rgbToLab(pickedRgb.r, pickedRgb.g, pickedRgb.b),
    hex: rgbToHex(pickedRgb.r, pickedRgb.g, pickedRgb.b),
  };

  const fallbackDominant = fallbackMedianColor(sourceCanvas, seed);

  const maskFactory: MaskFactory = ({ regionIndices, filteredIndices }) =>
    createMaskDataUrl(prepared, regionIndices, filteredIndices);

  return computeDominantColorFromLab(
    prepared,
    { x: seedSmallX, y: seedSmallY },
    picked,
    resolved,
    maskFactory,
    fallbackDominant
  );
}

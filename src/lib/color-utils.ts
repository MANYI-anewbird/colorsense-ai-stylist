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

export interface ColorValues {
  rgb: RGB;
  hex: string;
  hsl: HSL;
  lab: LAB;
}

export interface ColorMetrics {
  lightness: number;
  saturation: number;
  temperature: 'warm' | 'cool' | 'neutral';
  seasonalTendency: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface ColorAnalysis {
  color: ColorValues;
  metrics: ColorMetrics;
  confidence: 'high' | 'medium' | 'low';
  confidenceNote?: string;
}

export interface AIAnalysis {
  delta: number;
  insight: string;
  advice: string;
  fallback?: boolean;
}

export interface AnalysisResult {
  analysis: ColorAnalysis;
  ruleScore: number;
  breakdown?: {
    temperature: number;
    season: number;
    brightness: number;
    saturation: number;
  };
  aiAnalysis?: AIAnalysis;
  finalScore?: number;
}

// RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
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
  // Convert to sRGB
  let rr = r / 255;
  let gg = g / 255;
  let bb = b / 255;

  // Apply gamma correction
  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;

  // Convert to XYZ (D65 illuminant)
  let x = (rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375) / 0.95047;
  let y = rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750;
  let z = (rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041) / 1.08883;

  // Convert to LAB
  const epsilon = 0.008856;
  const kappa = 903.3;

  x = x > epsilon ? Math.pow(x, 1 / 3) : (kappa * x + 16) / 116;
  y = y > epsilon ? Math.pow(y, 1 / 3) : (kappa * y + 16) / 116;
  z = z > epsilon ? Math.pow(z, 1 / 3) : (kappa * z + 16) / 116;

  return {
    l: Math.round((116 * y - 16) * 100) / 100,
    a: Math.round((500 * (x - y)) * 100) / 100,
    b: Math.round((200 * (y - z)) * 100) / 100,
  };
}

// Get all color values from RGB
export function getColorValues(r: number, g: number, b: number): ColorValues {
  return {
    rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
    hex: rgbToHex(r, g, b),
    hsl: rgbToHsl(r, g, b),
    lab: rgbToLab(r, g, b),
  };
}

// Determine color temperature
export function getTemperature(hsl: HSL): 'warm' | 'cool' | 'neutral' {
  const h = hsl.h;
  const s = hsl.s;

  // Low saturation = neutral
  if (s < 15) return 'neutral';

  // Warm colors: reds, oranges, yellows (0-60, 300-360)
  if ((h >= 0 && h <= 60) || (h >= 300 && h <= 360)) {
    return 'warm';
  }

  // Cool colors: blues, purples (180-300)
  if (h >= 180 && h < 300) {
    return 'cool';
  }

  // Greens (60-180): depends on yellow vs blue bias
  if (h >= 60 && h < 180) {
    if (h < 100) return 'warm'; // Yellow-green
    if (h > 150) return 'cool'; // Blue-green
    return 'neutral'; // True green
  }

  return 'neutral';
}

// Determine seasonal tendency
export function getSeasonalTendency(
  hsl: HSL,
  lab: LAB
): 'spring' | 'summer' | 'autumn' | 'winter' {
  const temperature = getTemperature(hsl);
  const lightness = lab.l;
  const saturation = hsl.s;

  // Calculate chroma from LAB
  const chroma = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  const highChroma = chroma > 40 || saturation > 50;

  const isWarm = temperature === 'warm' || temperature === 'neutral';
  const isCool = temperature === 'cool';
  const isLight = lightness > 55;
  const isDark = lightness <= 55;

  // Spring: warm + light + high saturation
  if (isWarm && isLight && highChroma) {
    return 'spring';
  }

  // Summer: cool + light + low saturation
  if (isCool && isLight && !highChroma) {
    return 'summer';
  }

  // Autumn: warm + dark + low saturation
  if (isWarm && isDark && !highChroma) {
    return 'autumn';
  }

  // Winter: cool + dark + high saturation
  if (isCool && isDark && highChroma) {
    return 'winter';
  }

  // Fallback logic for neutral or edge cases
  if (isLight) {
    return highChroma ? 'spring' : 'summer';
  } else {
    return highChroma ? 'winter' : 'autumn';
  }
}

// Get color metrics
export function getColorMetrics(color: ColorValues): ColorMetrics {
  return {
    lightness: Math.round(color.lab.l),
    saturation: color.hsl.s,
    temperature: getTemperature(color.hsl),
    seasonalTendency: getSeasonalTendency(color.hsl, color.lab),
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

import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, X, Minus } from 'lucide-react';

interface SkinTone {
  id: string;
  nameEn: string;
  nameZh: string;
  color: string;
  undertone: 'warm' | 'cool' | 'neutral';
}

const skinTones: SkinTone[] = [
  { id: 'fair-cool', nameEn: 'Fair Cool', nameZh: '白皙冷调', color: '#F5E6DC', undertone: 'cool' },
  { id: 'fair-warm', nameEn: 'Fair Warm', nameZh: '白皙暖调', color: '#F7E0C9', undertone: 'warm' },
  { id: 'light-cool', nameEn: 'Light Cool', nameZh: '浅肤冷调', color: '#E8D4C4', undertone: 'cool' },
  { id: 'light-warm', nameEn: 'Light Warm', nameZh: '浅肤暖调', color: '#E5C9AB', undertone: 'warm' },
  { id: 'medium-cool', nameEn: 'Medium Cool', nameZh: '中等冷调', color: '#C9A882', undertone: 'cool' },
  { id: 'medium-warm', nameEn: 'Medium Warm', nameZh: '中等暖调', color: '#C4996B', undertone: 'warm' },
  { id: 'tan-cool', nameEn: 'Tan Cool', nameZh: '蜜色冷调', color: '#A67C52', undertone: 'cool' },
  { id: 'tan-warm', nameEn: 'Tan Warm', nameZh: '蜜色暖调', color: '#9F7044', undertone: 'warm' },
  { id: 'deep-cool', nameEn: 'Deep Cool', nameZh: '深肤冷调', color: '#6B4423', undertone: 'cool' },
  { id: 'deep-warm', nameEn: 'Deep Warm', nameZh: '深肤暖调', color: '#5C3D2E', undertone: 'warm' },
];

type MatchLevel = 'excellent' | 'good' | 'neutral' | 'poor';

interface SkinToneMatchProps {
  colorTemperature: 'warm' | 'cool' | 'neutral';
  colorLightness: number;
  colorSaturation: number;
}

function calculateMatch(
  skinTone: SkinTone,
  colorTemp: 'warm' | 'cool' | 'neutral',
  lightness: number,
  saturation: number
): MatchLevel {
  let score = 50;

  // Temperature harmony (complementary or matching)
  if (colorTemp === 'neutral') {
    score += 20; // Neutrals work with everyone
  } else if (colorTemp === skinTone.undertone) {
    score += 30; // Same undertone = harmonious
  } else {
    score += 10; // Opposite can create contrast (still ok)
  }

  // Lightness contrast consideration
  const skinLightness = skinTone.id.includes('fair') ? 90 :
    skinTone.id.includes('light') ? 75 :
    skinTone.id.includes('medium') ? 55 :
    skinTone.id.includes('tan') ? 40 : 25;

  const contrast = Math.abs(lightness - skinLightness);
  if (contrast > 30 && contrast < 60) {
    score += 20; // Good contrast
  } else if (contrast >= 60) {
    score += 10; // Very high contrast
  }

  // Saturation consideration
  if (saturation > 60 && skinTone.id.includes('deep')) {
    score += 15; // Vibrant colors on deep skin
  } else if (saturation < 40 && skinTone.id.includes('fair')) {
    score += 10; // Muted colors on fair skin
  }

  if (score >= 70) return 'excellent';
  if (score >= 55) return 'good';
  if (score >= 40) return 'neutral';
  return 'poor';
}

const matchConfig: Record<MatchLevel, { icon: typeof Check; className: string; labelEn: string; labelZh: string }> = {
  excellent: {
    icon: Check,
    className: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
    labelEn: 'Perfect',
    labelZh: '非常适合',
  },
  good: {
    icon: Check,
    className: 'bg-sky-500/20 text-sky-600 border-sky-500/30',
    labelEn: 'Good',
    labelZh: '适合',
  },
  neutral: {
    icon: Minus,
    className: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
    labelEn: 'OK',
    labelZh: '一般',
  },
  poor: {
    icon: X,
    className: 'bg-rose-500/20 text-rose-600 border-rose-500/30',
    labelEn: 'Avoid',
    labelZh: '慎选',
  },
};

export function SkinToneMatch({ colorTemperature, colorLightness, colorSaturation }: SkinToneMatchProps) {
  const { language, t } = useLanguage();

  const matchResults = skinTones.map((tone) => ({
    tone,
    match: calculateMatch(tone, colorTemperature, colorLightness, colorSaturation),
  }));

  // Group by match level
  const excellent = matchResults.filter((r) => r.match === 'excellent');
  const good = matchResults.filter((r) => r.match === 'good');

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">{t.skinToneMatch}</h2>

      {/* Best matches highlight */}
      {excellent.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-emerald-700">{t.bestMatch}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {excellent.map(({ tone }) => (
              <div
                key={tone.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-emerald-200"
              >
                <div
                  className="w-5 h-5 rounded-full border border-neutral-300 shadow-sm"
                  style={{ backgroundColor: tone.color }}
                />
                <span className="text-xs font-medium text-emerald-800">
                  {language === 'zh' ? tone.nameZh : tone.nameEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full skin tone grid */}
      <div className="grid grid-cols-2 gap-2">
        {matchResults.map(({ tone, match }) => {
          const config = matchConfig[match];
          const Icon = config.icon;
          return (
            <div
              key={tone.id}
              className={cn(
                'flex items-center gap-2.5 p-2.5 rounded-xl border transition-all',
                config.className
              )}
            >
              <div
                className="w-8 h-8 rounded-lg border border-neutral-300/50 shadow-sm flex-shrink-0"
                style={{ backgroundColor: tone.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {language === 'zh' ? tone.nameZh : tone.nameEn}
                </p>
                <p className="text-[10px] opacity-80">
                  {language === 'zh' ? config.labelZh : config.labelEn}
                </p>
              </div>
              <Icon className="w-4 h-4 flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {(['excellent', 'good', 'neutral', 'poor'] as MatchLevel[]).map((level) => {
          const config = matchConfig[level];
          const Icon = config.icon;
          return (
            <div key={level} className="flex items-center gap-1.5">
              <div className={cn('w-5 h-5 rounded-full flex items-center justify-center', config.className)}>
                <Icon className="w-3 h-3" />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {language === 'zh' ? config.labelZh : config.labelEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

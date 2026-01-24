import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw, Share2, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { ColorSwatch, CopyableColor } from '@/components/ColorSwatch';
import { MetricBar } from '@/components/MetricBar';
import { SeasonCard } from '@/components/SeasonBadge';
import { TemperatureBadge } from '@/components/TemperatureBadge';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
import { SkinToneMatch } from '@/components/SkinToneMatch';
import { ColorButton } from '@/components/ui/color-button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ColorAnalysis } from '@/lib/color-utils';

interface ResultState {
  analysis: ColorAnalysis;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const state = location.state as ResultState | undefined;

  if (!state?.analysis) {
    navigate('/');
    return null;
  }

  const { analysis } = state;
  const { color, metrics, confidence, confidenceNote } = analysis;

  const formatRgb = (rgb: { r: number; g: number; b: number }) =>
    `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  const formatHsl = (hsl: { h: number; s: number; l: number }) =>
    `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Header title={t.colorAnalysis} showBack />

      <main className="container px-4 py-4 pb-24">
        {/* Hero Color Display */}
        <div className="relative flex flex-col items-center animate-scale-in">
          {/* Glow effect behind swatch */}
          <div 
            className="absolute w-40 h-40 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: color.hex }}
          />
          <ColorSwatch hex={color.hex} size="xl" className="relative z-10" />
          <div className="mt-4 flex items-center gap-2">
            <p className="text-2xl font-bold text-foreground tracking-wide">{color.hex}</p>
          </div>
        </div>

        {/* Color Values Grid */}
        <div className="mt-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t.colorValues}</h2>
          <div className="grid grid-cols-2 gap-2">
            <CopyableColor label="HEX" value={color.hex} />
            <CopyableColor label="RGB" value={formatRgb(color.rgb)} displayValue={`${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`} />
            <CopyableColor label="HSL" value={formatHsl(color.hsl)} displayValue={`${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`} />
            <CopyableColor label="LAB" value={`lab(${color.lab.l}, ${color.lab.a}, ${color.lab.b})`} displayValue={`${color.lab.l}, ${color.lab.a}, ${color.lab.b}`} />
          </div>
        </div>

        {/* Confidence Indicator */}
        {(confidence !== 'high' || confidenceNote) && (
          <div className="mt-5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <ConfidenceIndicator confidence={confidence} note={confidenceNote} />
          </div>
        )}

        {/* Skin Tone Matching - NEW FEATURE */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border/50 shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <SkinToneMatch
            colorTemperature={metrics.temperature}
            colorLightness={metrics.lightness}
            colorSaturation={metrics.saturation}
          />
        </div>

        {/* Color Metrics */}
        <div className="mt-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-base font-semibold text-foreground">{t.colorMetrics}</h2>
          
          <div className="space-y-3">
            <MetricBar
              label={t.lightness}
              value={metrics.lightness}
              variant="lightness"
            />
            <MetricBar
              label={t.saturation}
              value={metrics.saturation}
              variant="saturation"
            />
          </div>
        </div>

        {/* Temperature & Season */}
        <div className="mt-6 space-y-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-base font-semibold text-foreground">{t.colorClassification}</h2>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.temperature}:</span>
            <TemperatureBadge temperature={metrics.temperature} size="sm" />
          </div>

          <div>
            <span className="text-sm text-muted-foreground block mb-2">{t.seasonalTendency}:</span>
            <SeasonCard season={metrics.seasonalTendency} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <ColorButton
            variant="outline"
            size="lg"
            className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 text-white border-transparent hover:from-neutral-800 hover:to-neutral-700 shadow-lg"
            onClick={() => navigate('/')}
          >
            <RotateCcw className="w-5 h-5" />
            {t.analyzeAnother}
          </ColorButton>
        </div>
      </main>
    </div>
  );
}

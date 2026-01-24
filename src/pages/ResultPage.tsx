import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Header } from '@/components/Header';
import { ColorSwatch, CopyableColor } from '@/components/ColorSwatch';
import { MetricBar } from '@/components/MetricBar';
import { SeasonBadge } from '@/components/SeasonBadge';
import { TemperatureBadge } from '@/components/TemperatureBadge';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
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
    <div className="min-h-screen bg-background">
      <Header title={t.colorAnalysis} showBack />

      <main className="container px-4 py-4 pb-20">
        {/* Color Swatch - More compact with compatibility */}
        <div className="flex flex-col items-center animate-scale-in">
          <ColorSwatch 
            hex={color.hex} 
            size="lg" 
            showCompatibility={true}
            colorMetrics={metrics}
          />
          <p className="mt-3 text-xl font-bold text-foreground">{color.hex}</p>
        </div>

        {/* Copyable Values - Tighter grid */}
        <div className="mt-5 grid grid-cols-2 gap-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CopyableColor label="HEX" value={color.hex} />
          <CopyableColor label="RGB" value={formatRgb(color.rgb)} displayValue={`${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`} />
          <CopyableColor label="HSL" value={formatHsl(color.hsl)} displayValue={`${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`} />
          <CopyableColor label="LAB" value={`lab(${color.lab.l}, ${color.lab.a}, ${color.lab.b})`} displayValue={`${color.lab.l}, ${color.lab.a}, ${color.lab.b}`} />
        </div>

        {/* Confidence Indicator */}
        {(confidence !== 'high' || confidenceNote) && (
          <div className="mt-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <ConfidenceIndicator confidence={confidence} note={confidenceNote} />
          </div>
        )}

        {/* Metrics - Compact */}
        <div className="mt-5 space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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

        {/* Temperature & Season - Compact */}
        <div className="mt-5 space-y-3 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-base font-semibold text-foreground">{t.colorClassification}</h2>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.temperature}:</span>
            <TemperatureBadge temperature={metrics.temperature} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.seasonalTendency}:</span>
            <SeasonBadge season={metrics.seasonalTendency} size="sm" />
          </div>
        </div>

        {/* Action Button - Black/White style */}
        <div className="mt-6 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <ColorButton
            variant="outline"
            size="lg"
            className="w-full bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800 hover:border-neutral-800"
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

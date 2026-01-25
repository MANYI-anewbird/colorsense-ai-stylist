import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Header } from '@/components/Header';
import { ColorSwatch, ColorValueCard } from '@/components/ColorSwatch';
import { MetricBar } from '@/components/MetricBar';
import { SeasonBadge } from '@/components/SeasonBadge';
import { TemperatureBadge } from '@/components/TemperatureBadge';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
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

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Color Stripe - Top accent */}
      <div className="color-stripe h-1.5" />
      
      <Header title={t.colorAnalysis} showBack backTo="/picker" />

      <main className="container px-4 py-4 pb-24">
        {/* Color Swatch - Editorial hero */}
        <div className="flex flex-col items-center animate-scale-in">
          <div className="relative">
            <ColorSwatch 
              hex={color.hex} 
              size="xl" 
              showCompatibility={true}
              colorMetrics={metrics}
            />
            {/* Decorative color dots */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-2 h-2 rounded-full bg-editorial-magenta" />
              <div className="w-2 h-2 rounded-full bg-editorial-coral" />
              <div className="w-2 h-2 rounded-full bg-editorial-yellow" />
              <div className="w-2 h-2 rounded-full bg-editorial-cyan" />
              <div className="w-2 h-2 rounded-full bg-editorial-violet" />
            </div>
          </div>
          <p className="mt-5 text-2xl font-bold text-foreground tracking-tight">{color.hex}</p>
        </div>

        {/* Color Values - Editorial grid, equal height, fixed layout */}
        <div className="mt-6 grid grid-cols-2 gap-3 animate-slide-up-color" style={{ animationDelay: '0.1s' }}>
          <ColorValueCard label="HEX" value={color.hex} />
          <ColorValueCard label="RGB" value={`${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`} />
          <ColorValueCard label="HSL" value={`${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`} />
          <ColorValueCard label="LAB" value={`${color.lab.l}, ${color.lab.a}, ${color.lab.b}`} />
        </div>

        {/* Confidence Indicator */}
        {(confidence !== 'high' || confidenceNote) && (
          <div className="mt-4 animate-slide-up-color" style={{ animationDelay: '0.15s' }}>
            <ConfidenceIndicator confidence={confidence} note={confidenceNote} />
          </div>
        )}

        {/* Metrics Section - Editorial card */}
        <div className="mt-6 p-4 bg-secondary rounded-2xl border border-border animate-slide-up-color" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">{t.colorMetrics}</h2>
          
          <div className="space-y-4">
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

        {/* Classification Section - Editorial badges in card */}
        <div className="mt-4 p-4 bg-secondary rounded-2xl border border-border animate-slide-up-color" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">{t.colorClassification}</h2>
          
          <div className="flex flex-wrap gap-2">
            <TemperatureBadge temperature={metrics.temperature} size="md" />
            <SeasonBadge season={metrics.seasonalTendency} size="md" />
          </div>
        </div>

        {/* Action Button - Editorial style */}
        <div className="mt-6 animate-slide-up-color" style={{ animationDelay: '0.35s' }}>
          <button
            onClick={() => navigate('/')}
            className="group w-full relative flex items-center justify-center gap-2.5 py-4 bg-foreground text-background rounded-2xl font-semibold overflow-hidden active:scale-[0.98] transition-all"
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-editorial-cyan via-editorial-violet to-editorial-magenta opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <RotateCcw className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{t.analyzeAnother}</span>
          </button>
        </div>
      </main>

      {/* Bottom color stripe */}
      <div className="fixed bottom-0 left-0 right-0 color-stripe h-1 safe-area-bottom" />
    </div>
  );
}

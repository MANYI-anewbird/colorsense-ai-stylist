import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Header } from '@/components/Header';
import { ColorSwatch, ColorValueCard } from '@/components/ColorSwatch';
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


  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Color Stripe - Top accent */}
      <div className="color-stripe h-1" />
      
      <Header title={t.colorAnalysis} showBack backTo="/picker" />

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

        {/* Color Values - Editorial cards */}
        <div className="mt-5 grid grid-cols-2 gap-2 animate-slide-up-color" style={{ animationDelay: '0.1s' }}>
          <ColorValueCard label="HSL" displayValue={`${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`} />
          <ColorValueCard label="RGB" displayValue={`${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`} />
          <ColorValueCard label="LAB" displayValue={`${color.lab.l.toFixed(1)}, ${color.lab.a.toFixed(1)}, ${color.lab.b.toFixed(1)}`} fullWidth />
        </div>

        {/* Confidence Indicator */}
        {(confidence !== 'high' || confidenceNote) && (
          <div className="mt-4 animate-slide-up-color" style={{ animationDelay: '0.15s' }}>
            <ConfidenceIndicator confidence={confidence} note={confidenceNote} />
          </div>
        )}

        {/* Metrics - Editorial style */}
        <div className="mt-5 space-y-4 animate-slide-up-color" style={{ animationDelay: '0.2s' }}>
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

        {/* Temperature & Season - Editorial badges */}
        <div className="mt-5 space-y-3 animate-slide-up-color" style={{ animationDelay: '0.25s' }}>
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

        {/* Action Button - Editorial style */}
        <div className="mt-6 animate-slide-up-color" style={{ animationDelay: '0.35s' }}>
          <button
            onClick={() => navigate('/')}
            className="group w-full relative flex items-center justify-center gap-2 py-4 bg-foreground text-background rounded-2xl font-semibold overflow-hidden active:scale-[0.98] transition-all"
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-editorial-cyan via-editorial-violet to-editorial-magenta opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <RotateCcw className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{t.analyzeAnother}</span>
          </button>
        </div>
      </main>
    </div>
  );
}

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { Header } from '@/components/Header';
import { ColorSwatch, CopyableColor } from '@/components/ColorSwatch';
import { MetricBar } from '@/components/MetricBar';
import { SeasonCard } from '@/components/SeasonBadge';
import { TemperatureBadge } from '@/components/TemperatureBadge';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
import { ColorButton } from '@/components/ui/color-button';
import type { ColorAnalysis } from '@/lib/color-utils';

interface ResultState {
  analysis: ColorAnalysis;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
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
      <Header title="Color Analysis" showBack />

      <main className="container px-4 py-6 pb-24">
        {/* Color Swatch */}
        <div className="flex flex-col items-center animate-scale-in">
          <ColorSwatch hex={color.hex} size="xl" />
          <p className="mt-4 text-2xl font-bold text-foreground">{color.hex}</p>
        </div>

        {/* Copyable Values */}
        <div className="mt-8 grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CopyableColor label="HEX" value={color.hex} />
          <CopyableColor label="RGB" value={formatRgb(color.rgb)} displayValue={`${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`} />
          <CopyableColor label="HSL" value={formatHsl(color.hsl)} displayValue={`${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`} />
          <CopyableColor label="LAB" value={`lab(${color.lab.l}, ${color.lab.a}, ${color.lab.b})`} displayValue={`${color.lab.l}, ${color.lab.a}, ${color.lab.b}`} />
        </div>

        {/* Confidence Indicator */}
        {(confidence !== 'high' || confidenceNote) && (
          <div className="mt-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <ConfidenceIndicator confidence={confidence} note={confidenceNote} />
          </div>
        )}

        {/* Metrics */}
        <div className="mt-8 space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-semibold text-foreground">Color Metrics</h2>
          
          <div className="space-y-4">
            <MetricBar
              label="Lightness"
              value={metrics.lightness}
              colorClass="bg-gradient-to-r from-gray-800 to-white"
            />
            <MetricBar
              label="Saturation"
              value={metrics.saturation}
              colorClass="bg-gradient-to-r from-muted to-primary"
            />
          </div>
        </div>

        {/* Temperature & Season */}
        <div className="mt-8 space-y-4 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-lg font-semibold text-foreground">Color Classification</h2>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Temperature:</span>
            <TemperatureBadge temperature={metrics.temperature} />
          </div>

          <div>
            <span className="text-sm text-muted-foreground block mb-3">Seasonal Tendency:</span>
            <SeasonCard season={metrics.seasonalTendency} />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <ColorButton
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/')}
          >
            <RotateCcw className="w-5 h-5" />
            Analyze Another Color
          </ColorButton>
        </div>
      </main>
    </div>
  );
}

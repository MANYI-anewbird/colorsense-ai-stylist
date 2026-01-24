import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw, Copy, Check } from 'lucide-react';
import { Header } from '@/components/Header';
import { MetricBar } from '@/components/MetricBar';
import { SeasonCard } from '@/components/SeasonBadge';
import { TemperatureBadge } from '@/components/TemperatureBadge';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
import { ColorButton } from '@/components/ui/color-button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import type { ColorAnalysis } from '@/lib/color-utils';

interface ResultState {
  analysis: ColorAnalysis;
}

function ColorValueRow({ label, value, copyValue }: { label: string; value: string; copyValue?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue || value);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div 
      className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0 cursor-pointer hover:bg-neutral-50 -mx-1 px-1 rounded transition-colors"
      onClick={handleCopy}
    >
      <span className="text-sm text-neutral-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-neutral-900">{value}</span>
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-neutral-400" />
        )}
      </div>
    </div>
  );
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
    `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  const formatHsl = (hsl: { h: number; s: number; l: number }) =>
    `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;

  return (
    <div className="min-h-screen bg-white">
      <Header title={t.colorAnalysis} showBack />

      <main className="container px-5 py-6 pb-24">
        {/* Hero Color Display */}
        <div className="flex flex-col items-center animate-scale-in">
          <div 
            className="w-24 h-24 rounded-2xl shadow-lg border border-neutral-200"
            style={{ backgroundColor: color.hex }}
          />
          <p className="mt-4 text-2xl font-bold text-neutral-900 tracking-tight">{color.hex}</p>
        </div>

        {/* Color Values - Clean list style */}
        <div className="mt-8 bg-neutral-50 rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <ColorValueRow label="HEX" value={color.hex} />
          <ColorValueRow label="RGB" value={formatRgb(color.rgb)} copyValue={`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`} />
          <ColorValueRow label="HSL" value={formatHsl(color.hsl)} copyValue={`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`} />
          <ColorValueRow label="LAB" value={`${color.lab.l.toFixed(1)}, ${color.lab.a.toFixed(1)}, ${color.lab.b.toFixed(1)}`} />
        </div>

        {/* Confidence Indicator */}
        {(confidence !== 'high' || confidenceNote) && (
          <div className="mt-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <ConfidenceIndicator confidence={confidence} note={confidenceNote} />
          </div>
        )}

        {/* Metrics - Minimal style */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">{t.colorMetrics}</h2>
          
          <div className="space-y-5">
            <MetricBar label={t.lightness} value={metrics.lightness} />
            <MetricBar label={t.saturation} value={metrics.saturation} />
          </div>
        </div>

        {/* Classification - Unified neutral style */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">{t.colorClassification}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">{t.temperature}</span>
              <TemperatureBadge temperature={metrics.temperature} />
            </div>

            <div>
              <span className="text-sm text-neutral-600 block mb-3">{t.seasonalTendency}</span>
              <SeasonCard season={metrics.seasonalTendency} />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-10 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <ColorButton
            variant="outline"
            size="lg"
            className="w-full bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800 hover:border-neutral-800 rounded-xl"
            onClick={() => navigate('/')}
          >
            <RotateCcw className="w-4 h-4" />
            {t.analyzeAnother}
          </ColorButton>
        </div>
      </main>
    </div>
  );
}

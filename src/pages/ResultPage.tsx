import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCcw, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { ColorSwatch, CopyableColor } from '@/components/ColorSwatch';
import { MetricBar } from '@/components/MetricBar';
import { SeasonBadge } from '@/components/SeasonBadge';
import { TemperatureBadge } from '@/components/TemperatureBadge';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
import { ColorButton } from '@/components/ui/color-button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { AnalysisResult } from '@/lib/color-utils';

interface ResultState {
  result: AnalysisResult;
  // Legacy support for old format
  analysis?: AnalysisResult['analysis'];
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const state = location.state as ResultState | undefined;

  // Support both new and legacy formats
  const result: AnalysisResult | null = state?.result || (state?.analysis ? {
    analysis: state.analysis,
    ruleScore: 0,
    finalScore: 0,
  } : null);

  if (!result?.analysis) {
    navigate('/');
    return null;
  }

  const { analysis, ruleScore, breakdown, aiAnalysis, finalScore } = result;
  const { color, metrics, confidence, confidenceNote } = analysis;
  const displayScore = finalScore !== undefined ? finalScore : ruleScore;
  const hasAI = aiAnalysis && !aiAnalysis.fallback;

  const formatRgb = (rgb: { r: number; g: number; b: number }) =>
    `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  const formatHsl = (hsl: { h: number; s: number; l: number }) =>
    `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <div className="min-h-screen bg-background">
      <Header title={t.colorAnalysis} showBack backTo="/picker" />

      <main className="container px-4 py-4 pb-20">
        {/* Color Swatch - More compact with compatibility */}
        <div className="flex flex-col items-center animate-scale-in">
          <ColorSwatch 
            hex={color.hex} 
            size="lg" 
            showCompatibility={true}
            colorMetrics={metrics}
            customScore={displayScore}
            scoreLabel={hasAI ? t.aiMatchScore : t.matchScore}
          />
          <p className="mt-3 text-xl font-bold text-foreground">{color.hex}</p>
        </div>

        {/* AI Analysis Section */}
        {hasAI && (
          <div className="mt-5 space-y-3 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-semibold text-foreground">{t.aiMatchScore}</h3>
              </div>
              
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.baseScore}:</span>
                  <span className="font-medium text-foreground">
                    {ruleScore} ({t.ruleEngine})
                  </span>
                </div>
                
                {aiAnalysis.delta !== 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.aiAdjustment}:</span>
                    <span className={`font-medium ${aiAnalysis.delta > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {aiAnalysis.delta > 0 ? '+' : ''}{aiAnalysis.delta}
                    </span>
                  </div>
                )}
                
                <div className="pt-2 border-t border-purple-200/50 dark:border-purple-800/50">
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t.insight}:
                      </span>
                      <p className="text-sm text-foreground mt-0.5">{aiAnalysis.insight}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t.suggestion}:
                      </span>
                      <p className="text-sm text-foreground mt-0.5">{aiAnalysis.advice}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rule-only breakdown (compact) */}
        {!hasAI && breakdown && (
          <div className="mt-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span className="font-medium">{breakdown.temperature > 0 ? '+' : ''}{breakdown.temperature}</span>
              </div>
              <div className="flex justify-between">
                <span>Season:</span>
                <span className="font-medium">{breakdown.season > 0 ? '+' : ''}{breakdown.season}</span>
              </div>
              <div className="flex justify-between">
                <span>Brightness:</span>
                <span className="font-medium">{breakdown.brightness > 0 ? '+' : ''}{breakdown.brightness}</span>
              </div>
              <div className="flex justify-between">
                <span>Saturation:</span>
                <span className="font-medium">{breakdown.saturation > 0 ? '+' : ''}{breakdown.saturation}</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Unavailable Note */}
        {aiAnalysis?.fallback && (
          <div className="mt-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800/50">
              <p className="text-xs text-amber-800 dark:text-amber-300">{t.aiUnavailable}</p>
            </div>
          </div>
        )}

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

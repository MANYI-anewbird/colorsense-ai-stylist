import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { ColorSwatch, ColorValueCard } from '@/components/ColorSwatch';
import { MetricBar } from '@/components/MetricBar';
import { TemperatureBadge } from '@/components/TemperatureBadge';
import { SeasonBadge } from '@/components/SeasonBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ColorAnalysis } from '@/lib/color-utils';
import { getSeasonDisplayName } from '@/lib/color-utils';
import type { Season12 } from '@/lib/color-utils';
import type { PickerSelection } from '@/components/ColorPicker';

function colorSwatchToDataUrl(hex: string, size = 128): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const fill = hex.startsWith('#') ? hex : `#${hex}`;
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, size, size);
  return canvas.toDataURL('image/png');
}

export interface AgentResult {
  primarySeason: string;
  secondarySeason?: string;
  confidencePct: number;
  temperature: string;
  engineeringResult?: { season12: string; temperature: string };
  reportToHumanCount?: number;
}

interface ResultState {
  analysis: ColorAnalysis;
  selection?: PickerSelection;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, openLoginDialog } = useAuth();
  const state = location.state as ResultState | undefined;
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportedToHuman, setReportedToHuman] = useState(false);
  const fetchedRef = useRef(false);

  if (!state?.analysis) {
    navigate('/');
    return null;
  }

  const { analysis } = state;
  const { color, metrics } = analysis;

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    supabase.functions
      .invoke('color-agent', {
        body: {
          color,
          metrics: {
            lightness: metrics.lightness,
            saturation: metrics.saturation,
            temperature: metrics.temperature,
            seasonalTendency: metrics.seasonalTendency,
            season12: metrics.season12,
            seasonMatch: metrics.seasonMatch
              ? {
                  primaryMatch: metrics.seasonMatch.primaryMatch,
                  secondaryMatch: metrics.seasonMatch.secondaryMatch,
                }
              : undefined,
          },
          colorSwatchImage: colorSwatchToDataUrl(color.hex),
        },
      })
      .then(({ data, error: invokeError }) => {
        clearTimeout(timeoutId);
        if (invokeError) {
          setError(invokeError.message || 'Failed to analyze');
          setLoading(false);
          return;
        }
        if (data?.error) {
          setError(typeof data.error === 'string' ? data.error : 'Unknown error');
          setLoading(false);
          return;
        }
        const result = data as AgentResult;
        if (result?.primarySeason) {
          setAgentResult(result);
        } else {
          setError('No result from agent');
        }
        setLoading(false);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err?.name === 'AbortError') {
          setError('Request timeout. Please try again.');
        } else {
          setError(err?.message || 'Failed to analyze');
        }
        setLoading(false);
      });
  }, [color, metrics]);

  const handleReportError = async () => {
    if (!user) {
      openLoginDialog();
      return;
    }
    if (reportedToHuman) return;
    try {
      const { data: resData, error: invokeError } = await supabase.functions.invoke('report-to-human', {
        body: { color: { hex: color.hex } },
      });
      const errMsg =
        (typeof resData?.error === 'string' ? resData.error : null) ??
        (invokeError as { message?: string })?.message;
      if (invokeError || resData?.error) {
        toast.error(errMsg || 'Failed to submit. Please try again.');
        return;
      }
      setReportedToHuman(true);
      setAgentResult((prev) =>
        prev ? { ...prev, reportToHumanCount: (prev.reportToHumanCount ?? 0) + 1 } : null
      );
      toast.success("Thanks — we've flagged this for human review.");
    } catch {
      toast.error('Failed to submit. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="color-stripe h-1" />
      <Header title={t.colorAnalysis} showBack backTo="/picker" />

      <main className="container px-4 py-4 pb-20">
        <div className="flex flex-col items-center animate-scale-in">
          <ColorSwatch
            hex={color.hex}
            size="lg"
            showCompatibility={true}
            colorMetrics={{
              ...metrics,
              temperature: (agentResult?.temperature as any) ?? metrics.temperature,
            }}
          />
          <p className="mt-3 text-xl font-bold text-foreground">{color.hex}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 animate-slide-up-color" style={{ animationDelay: '0.1s' }}>
          <ColorValueCard label="HSL" displayValue={`${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`} copyValue={`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`} />
          <ColorValueCard label="RGB" displayValue={`${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`} copyValue={`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`} />
          <ColorValueCard label="LAB" displayValue={`${color.lab.l.toFixed(1)}, ${color.lab.a.toFixed(1)}, ${color.lab.b.toFixed(1)}`} copyValue={`lab(${color.lab.l.toFixed(1)}, ${color.lab.a.toFixed(1)}, ${color.lab.b.toFixed(1)})`} fullWidth />
        </div>

        <div className="mt-5 space-y-4 animate-slide-up-color" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-base font-semibold text-foreground">{t.colorMetrics}</h2>
          <div className="space-y-3">
            <MetricBar label={t.lightness} value={metrics.lightness} variant="lightness" />
            <MetricBar label={t.saturation} value={metrics.saturation} variant="saturation" />
          </div>
        </div>

        <div className="mt-5 space-y-3 animate-slide-up-color" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-base font-semibold text-foreground">{t.colorClassification}</h2>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Analyzing color...</span>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-2">You can still view the color metrics above.</p>
            </div>
          ) : agentResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">{t.temperature}</span>
                  <TemperatureBadge temperature={agentResult.temperature as any} size="md" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground">{t.seasonalTendency}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <SeasonBadge season={agentResult.primarySeason as Season12} size="md" />
                    {agentResult.secondarySeason && (
                      <>
                        <span className="text-xs text-muted-foreground">or</span>
                        <SeasonBadge season={agentResult.secondarySeason as Season12} size="md" />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Confidence</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    agentResult.confidencePct >= 80
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : agentResult.confidencePct >= 60
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}
                >
                  {agentResult.confidencePct >= 95 ? '>95%' : `${agentResult.confidencePct}%`}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 animate-slide-up-color" style={{ animationDelay: '0.35s' }}>
          <button
            onClick={handleReportError}
            disabled={loading || reportedToHuman}
            className="group w-full relative flex items-center justify-center gap-2 py-4 bg-foreground text-background rounded-2xl font-semibold overflow-hidden active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {reportedToHuman ? (
              <span className="relative z-10">Thanks for your feedback</span>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{t.thisLooksWrong}</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

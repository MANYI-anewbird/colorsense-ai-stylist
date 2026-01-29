import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { ColorSwatch, ColorValueCard } from '@/components/ColorSwatch';
import { MetricBar } from '@/components/MetricBar';
import { TemperatureBadge } from '@/components/TemperatureBadge';
import { ConfidenceIndicator } from '@/components/ConfidenceIndicator';
import { ColorClassification } from '@/components/ColorClassification';
import { ColorButton } from '@/components/ui/color-button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import type { ColorAnalysis } from '@/lib/color-utils';

/** Generate a PNG data URL of a pure solid color swatch for AI vision (no UI: no border, shadow, or labels). */
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

export interface AIReanalysisResult {
  primarySeason: string;
  similarSeasons: string[];
  shortExplanation: string;
}

interface ResultState {
  analysis: ColorAnalysis;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const state = location.state as ResultState | undefined;
  const [isRequestingAI, setIsRequestingAI] = useState(false);

  if (!state?.analysis) {
    navigate('/');
    return null;
  }

  const { analysis } = state;
  const { color, metrics, confidence, confidenceNote } = analysis;
  
  const [aiAnalysis, setAiAnalysis] = useState<string | AIReanalysisResult | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  // Use useRef for immediate updates to prevent race conditions
  const lastRequestTimeRef = useRef<number>(0);
  const isRequestingRef = useRef<boolean>(false);

  const handleThisLooksWrong = async () => {
    // Prevent double-click while a request is in flight
    if (isRequestingRef.current || isRequestingAI) {
      return;
    }
    // No cooldown at click time: same color returns from cache (no API), so user can click again immediately
    isRequestingRef.current = true;
    
    // Then update state
    setIsRequestingAI(true);
    setShowAIDialog(true);
    setAiAnalysis(null);
    
    try {
      console.log('Calling analyze-wrong function...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Function URL:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-wrong`);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      let functionResponse;
      try {
        functionResponse = await supabase.functions.invoke('analyze-wrong', {
          body: {
            color,
            metrics: {
              ...metrics,
              season12: metrics.season12,
              confidence: metrics.seasonMatch?.primaryMatch?.confidence,
            },
            colorSwatchImage: colorSwatchToDataUrl(color.hex),
          },
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          },
        });
        clearTimeout(timeoutId);
      } catch (invokeError) {
        clearTimeout(timeoutId);
        console.error('Function invoke error:', invokeError);
        throw invokeError;
      }
      
      const { data, error } = functionResponse;

      console.log('Function response:', { data, error });

      if (error) {
        console.error('AI Analysis Error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error type:', error.constructor.name);
        console.error('Error keys:', Object.keys(error));
        
        // More detailed error message based on status code
        let errorMessage = 'Failed to send a request to the Edge Function';
        const errorAny = error as any;
        const statusCode = errorAny?.status || errorAny?.context?.status || errorAny?.statusCode;
        const errorName = errorAny?.name || error.constructor.name;
        const errorMsg = errorAny?.message || errorAny?.error?.message || '';
        
        console.log('Extracted error info:', { statusCode, errorName, errorMsg });
        
        if (statusCode === 429 || errorMsg.includes('429') || errorMsg.includes('rate limit') || errorMsg.includes('Too Many Requests')) {
          errorMessage = language === 'zh' 
            ? '请求过于频繁，请稍后再试。这可能是由于速率限制导致的。'
            : 'Too many requests. Please wait a moment and try again. This may be due to rate limiting.';
        } else if (statusCode === 401 || errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
          errorMessage = language === 'zh'
            ? '认证失败。请检查 Supabase 配置。'
            : 'Authentication failed. Please check Supabase configuration.';
        } else if (statusCode === 404 || errorMsg.includes('404') || errorMsg.includes('not found')) {
          errorMessage = language === 'zh'
            ? 'Edge Function 未找到。请确认函数已正确部署。'
            : 'Edge Function not found. Please ensure the function is deployed correctly.';
        } else if (errorMsg) {
          errorMessage = errorMsg;
        } else if (statusCode) {
          errorMessage = `Request failed with status ${statusCode}`;
        } else if (errorName) {
          errorMessage = `Error: ${errorName}${errorMsg ? ` - ${errorMsg}` : ''}`;
        }
        
        setAiAnalysis(`Error: ${errorMessage}`);
        toast.error(errorMessage);
        return;
      }

      // Only start 30s cooldown when we actually called the API; cache hits don't trigger cooldown
      if (data?.fromCache === true) {
        lastRequestTimeRef.current = 0;
      } else if (data?.fromCache === false) {
        lastRequestTimeRef.current = Date.now();
      }

      // Show AI response in dialog (structured or legacy text)
      if (data?.aiReanalysis?.primarySeason) {
        setAiAnalysis(data.aiReanalysis as AIReanalysisResult);
      } else if (data?.correctedAnalysis) {
        setAiAnalysis(data.correctedAnalysis);
      } else if (data?.error) {
        setAiAnalysis(`Error: ${data.error}`);
        toast.error(data.error);
      } else {
        setAiAnalysis('No analysis received from AI. Please try again.');
        toast.error('No analysis received from AI.');
      }
    } catch (error) {
      console.error('Error requesting AI analysis:', error);
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error details:', error);
      
      let errorMessage = 'Failed to request AI analysis. Please try again.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = language === 'zh'
            ? '请求超时。Supabase 服务可能正在维护中，请稍后再试。'
            : 'Request timeout. Supabase service may be under maintenance. Please try again later.';
        } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          errorMessage = language === 'zh'
            ? '网络错误。请检查网络连接，或 Supabase 服务可能正在维护中。'
            : 'Network error. Please check your connection, or Supabase service may be under maintenance.';
        } else {
          errorMessage = `${error.message} (${error.name})`;
        }
      }
      
      setAiAnalysis(`Error: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      // Reset both state and ref
      setIsRequestingAI(false);
      isRequestingRef.current = false;
    }
  };


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
          <ColorValueCard label="HSL" displayValue={`${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`} copyValue={`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`} />
          <ColorValueCard label="RGB" displayValue={`${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`} copyValue={`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`} />
          <ColorValueCard label="LAB" displayValue={`${color.lab.l.toFixed(1)}, ${color.lab.a.toFixed(1)}, ${color.lab.b.toFixed(1)}`} copyValue={`lab(${color.lab.l.toFixed(1)}, ${color.lab.a.toFixed(1)}, ${color.lab.b.toFixed(1)})`} fullWidth />
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

        {/* Temperature & Season - Editorial badges side by side */}
        <div className="mt-5 space-y-3 animate-slide-up-color" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-base font-semibold text-foreground">{t.colorClassification}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{t.temperature}</span>
              <TemperatureBadge temperature={metrics.temperature} size="md" />
            </div>
            <div className="flex flex-col gap-1">
              <ColorClassification 
                seasonMatch={metrics.seasonMatch} 
                season12={metrics.season12}
                hex={color.hex}
                inputLab={color.lab}
              />
            </div>
          </div>
        </div>

        {/* Action Button - This looks wrong */}
        <div className="mt-6 animate-slide-up-color" style={{ animationDelay: '0.35s' }}>
          <button
            onClick={handleThisLooksWrong}
            disabled={isRequestingAI}
            className="group w-full relative flex items-center justify-center gap-2 py-4 bg-foreground text-background rounded-2xl font-semibold overflow-hidden active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {isRequestingAI ? (
              <Loader2 className="w-5 h-5 relative z-10 animate-spin" />
            ) : (
              <AlertCircle className="w-5 h-5 relative z-10" />
            )}
            <span className="relative z-10">
              {isRequestingAI ? t.requestingAI : t.thisLooksWrong}
            </span>
          </button>
        </div>
      </main>

      {/* AI Analysis Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border-border/50 shadow-xl">
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {language === 'zh' ? 'AI 重新分析' : 'AI Re-analysis'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {language === 'zh' 
                ? '基于颜色数据的独立分类结果'
                : 'Independent classification from color data'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2">
            {isRequestingAI ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {language === 'zh' ? '正在分析...' : 'Analyzing...'}
                </p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-5">
                {typeof aiAnalysis === 'object' ? (
                  <>
                    {/* Primary season — clear hierarchy */}
                    <div className="rounded-xl bg-primary/10 px-4 py-3 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-black mb-1">
                        {language === 'zh' ? '主色季' : 'Primary season'}
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {aiAnalysis.primarySeason}
                      </p>
                    </div>
                    {/* Similar — compact row */}
                    {aiAnalysis.similarSeasons?.length ? (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-black">
                          {language === 'zh' ? '相似色季' : 'Similar seasons'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {aiAnalysis.similarSeasons.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs font-normal rounded-md px-2.5 py-1 bg-muted text-muted-foreground border-0">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {/* Details — collapsible, lighter style */}
                    {aiAnalysis.shortExplanation ? (
                      <Collapsible className="group rounded-xl border border-border/50 overflow-hidden">
                        <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold text-black hover:bg-muted/40 transition-colors">
                          {language === 'zh' ? '查看说明' : 'View explanation'}
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <p className="px-3 pb-3 pt-0 text-sm leading-relaxed text-foreground/90">
                            {aiAnalysis.shortExplanation}
                          </p>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {aiAnalysis}
                    </p>
                  </div>
                )}
                {/* Note — minimal footer */}
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed pt-1 border-t border-border/30">
                  {language === 'zh' 
                    ? '分析仅基于颜色属性，个人色季还受肤色、发色与对比度影响。'
                    : 'Analysis is based on color only; personal season also depends on skin tone, hair, and contrast.'}
                </p>
              </div>
            ) : (
              <div className="text-center py-10 text-sm text-muted-foreground">
                {language === 'zh' ? '等待分析...' : 'Waiting for analysis...'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

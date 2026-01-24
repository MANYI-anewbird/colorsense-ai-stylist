import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSkinTone } from '@/contexts/SkinToneContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateCompatibilityScore, getRecommendationLevel } from '@/lib/compatibility-utils';
import type { ColorMetrics } from '@/lib/color-utils';

interface ColorSwatchProps {
  hex: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCompatibility?: boolean;
  colorMetrics?: ColorMetrics;
}

export function ColorSwatch({ hex, size = 'lg', className, showCompatibility = false, colorMetrics }: ColorSwatchProps) {
  const { skinTone } = useSkinTone();
  const { language } = useLanguage();
  
  const sizeClasses = {
    sm: 'w-16 h-16 rounded-xl',
    md: 'w-24 h-24 rounded-2xl',
    lg: 'w-32 h-32 rounded-2xl',
    xl: 'w-40 h-40 rounded-3xl',
  };

  // Calculate compatibility if enabled and we have the necessary data
  const score = showCompatibility && skinTone && colorMetrics 
    ? calculateCompatibilityScore(colorMetrics, skinTone) 
    : null;
  
  const recommendation = score !== null ? getRecommendationLevel(score) : null;

  // Get color for score display based on level
  const getScoreColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-emerald-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-amber-600';
      case 'poor': return 'text-red-500';
      default: return 'text-neutral-600';
    }
  };

  return (
    <div
      className={cn('color-swatch relative flex flex-col items-center justify-center', sizeClasses[size], className)}
      style={{ backgroundColor: hex }}
    >
      {/* Compatibility Score Overlay */}
      {score !== null && recommendation && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-inherit">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg text-center">
            <div className={cn('text-2xl font-bold', getScoreColor(recommendation.level))}>
              {score}
            </div>
            <div className="text-[9px] text-neutral-500 font-medium mt-0.5">
              {language === 'zh' ? '推荐指数' : 'Match Score'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CopyableColorProps {
  label: string;
  value: string;
  displayValue?: string;
}

export function CopyableColor({ label, value, displayValue }: CopyableColorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-between w-full p-2.5 rounded-xl bg-muted/40 hover:bg-muted/60 border border-border/50 transition-colors group"
    >
      <div className="text-left">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xs font-mono font-semibold text-foreground mt-0.5">
          {displayValue || value}
        </p>
      </div>
      <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-background/60 group-hover:bg-background transition-colors">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-success" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}

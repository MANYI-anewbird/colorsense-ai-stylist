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
      {/* Compatibility Score Overlay - Clean text only */}
      {score !== null && recommendation && (
        <div className="flex flex-col items-center justify-center text-center">
          <div className={cn('text-4xl font-bold drop-shadow-lg', 'text-white')}>
            {score}
          </div>
          <div className="text-xs text-white/90 font-medium mt-1 drop-shadow-md">
            Match Score
          </div>
        </div>
      )}
    </div>
  );
}

interface ColorValueCardProps {
  label: string;
  displayValue: string;
  copyValue: string;
  fullWidth?: boolean;
}

export function ColorValueCard({ label, displayValue, copyValue, fullWidth = false }: ColorValueCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors text-left w-full group",
        fullWidth && "col-span-2"
      )}
    >
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xs font-mono font-semibold text-foreground mt-0.5">
          {displayValue}
        </p>
      </div>
      <div className="text-muted-foreground group-hover:text-foreground transition-colors">
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      </div>
    </button>
  );
}

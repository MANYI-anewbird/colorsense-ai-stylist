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
            {language === 'zh' ? '推荐指数' : 'Match Score'}
          </div>
        </div>
      )}
    </div>
  );
}

interface ColorValueCardProps {
  label: string;
  value: string;
}

export function ColorValueCard({ label, value }: ColorValueCardProps) {
  return (
    <div className="flex flex-col justify-center p-3 rounded-xl bg-secondary border border-border h-full">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      <p className="text-sm font-mono font-bold text-foreground mt-1 truncate">
        {value}
      </p>
    </div>
  );
}

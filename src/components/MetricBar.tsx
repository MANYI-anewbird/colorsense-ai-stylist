import React from 'react';
import { cn } from '@/lib/utils';

type BarVariant = 'default' | 'lightness' | 'saturation';

interface MetricBarProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  variant?: BarVariant;
  showPercentage?: boolean;
}

const variantStyles: Record<BarVariant, { gradient: string; accent: string }> = {
  default: { 
    gradient: 'bg-primary', 
    accent: 'from-editorial-cyan to-editorial-violet' 
  },
  lightness: { 
    gradient: 'bg-gradient-to-r from-neutral-900 via-amber-400 to-neutral-100', 
    accent: 'from-editorial-yellow to-editorial-coral' 
  },
  saturation: { 
    gradient: 'bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-900', 
    accent: 'from-editorial-magenta to-editorial-violet' 
  },
};

export function MetricBar({
  label,
  value,
  max = 100,
  unit = '%',
  variant = 'default',
  showPercentage = true,
}: MetricBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const styles = variantStyles[variant];

  return (
    <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-3">
      {/* Header with large number */}
      <div className="flex items-end justify-between">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
            styles.accent
          )}>
            {Math.round(value)}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Full gradient background */}
        <div className={cn('absolute inset-0', styles.gradient)} />
        {/* Gray overlay for unfilled portion */}
        <div 
          className="absolute top-0 right-0 h-full bg-muted/90 transition-all duration-700 ease-out"
          style={{ width: `${100 - percentage}%` }}
        />
        {/* Indicator dot with glow */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-foreground shadow-lg transition-all duration-700 ease-out"
          style={{ 
            left: `calc(${percentage}% - 8px)`,
            boxShadow: '0 0 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
      </div>
    </div>
  );
}

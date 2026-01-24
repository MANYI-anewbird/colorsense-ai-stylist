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

const variantStyles: Record<BarVariant, string> = {
  default: 'bg-primary',
  lightness: 'bg-gradient-to-r from-neutral-800 via-amber-400 to-neutral-100',
  saturation: 'bg-gradient-to-r from-rose-400 via-fuchsia-500 to-violet-400',
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

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {showPercentage ? `${Math.round(value)}${unit}` : value}
        </span>
      </div>
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        {/* Full gradient background */}
        <div className={cn('absolute inset-0', variantStyles[variant])} />
        {/* Gray overlay for unfilled portion */}
        <div 
          className="absolute top-0 right-0 h-full bg-muted/80"
          style={{ width: `${100 - percentage}%` }}
        />
        {/* Indicator dot */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-neutral-700 shadow-sm transition-all duration-500"
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
    </div>
  );
}

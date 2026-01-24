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
  saturation: 'bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-800',
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
  
  // Calculate left position for the circular indicator
  // w-3 = 12px (0.75rem), so radius = 6px
  // Ensure the circle is fully visible at 0% and 100%
  const circleWidth = 12; // w-3 = 12px
  const circleRadius = 6; // half of circleWidth
  let leftPosition: string;
  
  if (percentage === 0) {
    // At 0%, position circle so left edge is at 0
    leftPosition = '0px';
  } else if (percentage === 100) {
    // At 100%, position circle so right edge is at 100%
    leftPosition = `calc(100% - ${circleWidth}px)`;
  } else {
    // For other values, center the circle at the percentage position
    leftPosition = `calc(${percentage}% - ${circleRadius}px)`;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {showPercentage ? `${Math.round(value)}${unit}` : value}
        </span>
      </div>
      <div className="relative h-2.5 overflow-visible">
        {/* Background track with rounded corners */}
        <div className="absolute inset-0 bg-muted rounded-full overflow-hidden">
          {/* Full gradient background */}
          <div className={cn('absolute inset-0', variantStyles[variant])} />
          {/* Gray overlay for unfilled portion */}
          <div 
            className="absolute top-0 right-0 h-full bg-muted/80"
            style={{ width: `${100 - percentage}%` }}
          />
        </div>
        {/* Indicator dot - positioned outside to allow full visibility */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-neutral-700 shadow-sm transition-all duration-500 z-10"
          style={{ left: leftPosition }}
        />
      </div>
    </div>
  );
}

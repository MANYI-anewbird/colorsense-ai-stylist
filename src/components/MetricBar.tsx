import React, { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div 
      className="space-y-1.5 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={cn(
          "text-sm font-semibold transition-colors duration-200",
          isHovered ? "text-foreground" : "text-muted-foreground"
        )}>
          {showPercentage ? `${Math.round(value)}${unit}` : value}
        </span>
      </div>
      {/* Bar container with padding for indicator overflow */}
      <div className="relative px-2.5">
        <div className={cn(
          "relative h-3 bg-muted rounded-full overflow-hidden transition-all duration-300",
          isHovered && "shadow-md"
        )}>
          {/* Full gradient background */}
          <div className={cn('absolute inset-0', variantStyles[variant])} />
          {/* Gray overlay for unfilled portion */}
          <div 
            className="absolute top-0 right-0 h-full bg-muted/80 transition-all duration-500"
            style={{ width: `${100 - percentage}%` }}
          />
        </div>
        {/* Indicator dot - positioned outside overflow:hidden container */}
        <div 
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-[3px] border-neutral-800 shadow-lg transition-all duration-300",
            isHovered && "scale-110 border-neutral-900 shadow-xl"
          )}
          style={{ left: `calc(${percentage}% - 10px + 10px)` }}
        />
      </div>
    </div>
  );
}

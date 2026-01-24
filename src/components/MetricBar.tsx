import React from 'react';
import { cn } from '@/lib/utils';

interface MetricBarProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  showPercentage?: boolean;
}

export function MetricBar({
  label,
  value,
  max = 100,
  unit = '%',
  showPercentage = true,
}: MetricBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">
          {showPercentage ? `${Math.round(value)}${unit}` : value}
        </span>
      </div>
      <div className="relative h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        {/* Filled portion - simple neutral color */}
        <div 
          className="absolute top-0 left-0 h-full bg-neutral-800 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

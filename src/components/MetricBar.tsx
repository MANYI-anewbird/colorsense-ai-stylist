import React from 'react';
import { cn } from '@/lib/utils';

interface MetricBarProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  colorClass?: string;
  showPercentage?: boolean;
}

export function MetricBar({
  label,
  value,
  max = 100,
  unit = '%',
  colorClass = 'bg-primary',
  showPercentage = true,
}: MetricBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {showPercentage ? `${Math.round(value)}${unit}` : value}
        </span>
      </div>
      <div className="metric-bar-container">
        <div
          className={cn('metric-bar-fill', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

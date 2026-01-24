import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

type Confidence = 'high' | 'medium' | 'low';

interface ConfidenceIndicatorProps {
  confidence: Confidence;
  note?: string;
}

const confidenceConfig = {
  high: {
    label: 'High confidence',
    icon: CheckCircle,
    className: 'bg-success/10 text-green-700 border-success/20',
    iconClass: 'text-success',
  },
  medium: {
    label: 'Medium confidence',
    icon: AlertTriangle,
    className: 'bg-warning/10 text-amber-700 border-warning/20',
    iconClass: 'text-warning',
  },
  low: {
    label: 'Low confidence',
    icon: AlertCircle,
    className: 'bg-destructive/10 text-red-700 border-destructive/20',
    iconClass: 'text-destructive',
  },
};

export function ConfidenceIndicator({ confidence, note }: ConfidenceIndicatorProps) {
  const config = confidenceConfig[confidence];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-xl border p-4', config.className)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconClass)} />
        <div>
          <p className="font-medium text-sm">{config.label}</p>
          {note && (
            <p className="text-sm mt-1 opacity-80">{note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';
import { Flame, Snowflake, CircleDot } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type Temperature = 'warm' | 'cool' | 'neutral';

interface TemperatureBadgeProps {
  temperature: Temperature;
}

const temperatureConfig = {
  warm: {
    icon: Flame,
  },
  cool: {
    icon: Snowflake,
  },
  neutral: {
    icon: CircleDot,
  },
};

export function TemperatureBadge({ temperature }: TemperatureBadgeProps) {
  const { t } = useLanguage();
  const config = temperatureConfig[temperature];
  const Icon = config.icon;
  const label = t[temperature];

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200">
      <Icon className="w-3.5 h-3.5 text-neutral-600" />
      <span className="text-xs font-medium text-neutral-700">{label}</span>
    </div>
  );
}

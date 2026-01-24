import React from 'react';
import { cn } from '@/lib/utils';
import { Flame, Snowflake, CircleDot } from 'lucide-react';

type Temperature = 'warm' | 'cool' | 'neutral';

interface TemperatureBadgeProps {
  temperature: Temperature;
  size?: 'sm' | 'md' | 'lg';
}

const temperatureConfig = {
  warm: {
    label: 'Warm',
    icon: Flame,
    className: 'bg-gradient-to-r from-beauty-coral/20 to-beauty-peach/30 text-beauty-coral border-beauty-coral/30',
    iconClass: 'text-beauty-coral',
  },
  cool: {
    label: 'Cool',
    icon: Snowflake,
    className: 'bg-gradient-to-r from-beauty-lavender/20 to-beauty-blush/30 text-beauty-lavender border-beauty-lavender/30',
    iconClass: 'text-beauty-lavender',
  },
  neutral: {
    label: 'Neutral',
    icon: CircleDot,
    className: 'bg-gradient-to-r from-beauty-blush/20 to-muted/30 text-muted-foreground border-beauty-blush/30',
    iconClass: 'text-muted-foreground',
  },
};

const sizeClasses = {
  sm: {
    container: 'px-3 py-1.5 gap-1.5',
    icon: 'w-4 h-4',
    text: 'text-xs',
  },
  md: {
    container: 'px-4 py-2 gap-2',
    icon: 'w-5 h-5',
    text: 'text-sm',
  },
  lg: {
    container: 'px-5 py-3 gap-3',
    icon: 'w-6 h-6',
    text: 'text-base',
  },
};

export function TemperatureBadge({ temperature, size = 'md' }: TemperatureBadgeProps) {
  const config = temperatureConfig[temperature];
  const sizes = sizeClasses[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        sizes.container
      )}
    >
      <Icon className={cn(sizes.icon, config.iconClass)} />
      <span className={sizes.text}>{config.label}</span>
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';
import { Flame, Snowflake, CircleDot } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type Temperature = 'warm' | 'cool' | 'neutral' | 'neutral-warm' | 'neutral-cool';

interface TemperatureBadgeProps {
  temperature: Temperature;
  size?: 'sm' | 'md' | 'lg';
}

const temperatureConfig = {
  warm: {
    icon: Flame,
    className: 'bg-gradient-to-r from-beauty-coral/20 to-beauty-peach/30 text-beauty-coral border-beauty-coral/30',
    iconClass: 'text-beauty-coral',
  },
  cool: {
    icon: Snowflake,
    className: 'bg-gradient-to-r from-beauty-lavender/20 to-beauty-blush/30 text-beauty-lavender border-beauty-lavender/30',
    iconClass: 'text-beauty-lavender',
  },
  neutral: {
    icon: CircleDot,
    className: 'bg-gradient-to-r from-beauty-blush/20 to-muted/30 text-muted-foreground border-beauty-blush/30',
    iconClass: 'text-muted-foreground',
  },
  'neutral-warm': {
    icon: CircleDot,
    className: 'bg-gradient-to-r from-beauty-coral/15 to-beauty-peach/20 text-beauty-coral/80 border-beauty-coral/20',
    iconClass: 'text-beauty-coral/80',
  },
  'neutral-cool': {
    icon: CircleDot,
    className: 'bg-gradient-to-r from-beauty-lavender/15 to-beauty-blush/20 text-beauty-lavender/80 border-beauty-lavender/20',
    iconClass: 'text-beauty-lavender/80',
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
  const { t } = useLanguage();
  const config = temperatureConfig[temperature];
  const sizes = sizeClasses[size];
  const Icon = config.icon;
  // Handle new neutral-warm/neutral-cool values
  const label = 
    temperature === 'neutral-warm' ? t.neutralWarm :
    temperature === 'neutral-cool' ? t.neutralCool :
    t[temperature as 'warm' | 'cool' | 'neutral'];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        sizes.container
      )}
    >
      <Icon className={cn(sizes.icon, config.iconClass)} />
      <span className={sizes.text}>{label}</span>
    </div>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';
import { Flower2, Sun, Leaf, Snowflake } from 'lucide-react';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonBadgeProps {
  season: Season;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const seasonConfig = {
  spring: {
    label: 'Spring',
    description: 'Warm & Light',
    icon: Flower2,
    className: 'bg-gradient-to-br from-beauty-rose/15 to-beauty-coral/15 text-beauty-rose border-beauty-rose/30',
    iconClass: 'text-beauty-rose',
    cardBg: 'bg-gradient-to-br from-beauty-rose/10 to-beauty-peach/20',
  },
  summer: {
    label: 'Summer',
    description: 'Cool & Light',
    icon: Sun,
    className: 'bg-gradient-to-br from-beauty-lavender/15 to-beauty-blush/15 text-beauty-lavender border-beauty-lavender/30',
    iconClass: 'text-beauty-lavender',
    cardBg: 'bg-gradient-to-br from-beauty-lavender/10 to-beauty-blush/20',
  },
  autumn: {
    label: 'Autumn',
    description: 'Warm & Deep',
    icon: Leaf,
    className: 'bg-gradient-to-br from-beauty-coral/15 to-beauty-gold/15 text-beauty-coral border-beauty-coral/30',
    iconClass: 'text-beauty-coral',
    cardBg: 'bg-gradient-to-br from-beauty-coral/10 to-beauty-gold/20',
  },
  winter: {
    label: 'Winter',
    description: 'Cool & Deep',
    icon: Snowflake,
    className: 'bg-gradient-to-br from-beauty-lavender/20 to-beauty-rose/15 text-beauty-lavender border-beauty-lavender/30',
    iconClass: 'text-beauty-lavender',
    cardBg: 'bg-gradient-to-br from-beauty-lavender/15 to-beauty-rose/10',
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

export function SeasonBadge({ season, size = 'md', showLabel = true }: SeasonBadgeProps) {
  const config = seasonConfig[season];
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
      {showLabel && (
        <span className={sizes.text}>{config.label}</span>
      )}
    </div>
  );
}

interface SeasonCardProps {
  season: Season;
}

export function SeasonCard({ season }: SeasonCardProps) {
  const config = seasonConfig[season];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-2xl border-2 p-4 shadow-card', config.className, config.cardBg)}>
      <div className="flex items-center gap-3">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center bg-white/50 backdrop-blur-sm')}>
          <Icon className={cn('w-6 h-6', config.iconClass)} />
        </div>
        <div>
          <p className="font-semibold text-lg">{config.label}</p>
          <p className="text-sm opacity-80">{config.description}</p>
        </div>
      </div>
    </div>
  );
}

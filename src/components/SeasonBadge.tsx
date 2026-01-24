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
    className: 'bg-season-spring/20 text-amber-700 border-season-spring/30',
    iconClass: 'text-season-spring',
  },
  summer: {
    label: 'Summer',
    description: 'Cool & Light',
    icon: Sun,
    className: 'bg-season-summer/20 text-sky-700 border-season-summer/30',
    iconClass: 'text-season-summer',
  },
  autumn: {
    label: 'Autumn',
    description: 'Warm & Deep',
    icon: Leaf,
    className: 'bg-season-autumn/20 text-orange-800 border-season-autumn/30',
    iconClass: 'text-season-autumn',
  },
  winter: {
    label: 'Winter',
    description: 'Cool & Deep',
    icon: Snowflake,
    className: 'bg-season-winter/20 text-blue-800 border-season-winter/30',
    iconClass: 'text-season-winter',
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
    <div className={cn('rounded-2xl border-2 p-4', config.className)}>
      <div className="flex items-center gap-3">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.className)}>
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

import React from 'react';
import { cn } from '@/lib/utils';
import { Flower2, Sun, Leaf, Snowflake } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonBadgeProps {
  season: Season;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const seasonConfig = {
  spring: {
    descriptionEn: 'Warm & Light',
    descriptionZh: '暖调浅色',
    icon: Flower2,
  },
  summer: {
    descriptionEn: 'Cool & Light',
    descriptionZh: '冷调浅色',
    icon: Sun,
  },
  autumn: {
    descriptionEn: 'Warm & Deep',
    descriptionZh: '暖调深色',
    icon: Leaf,
  },
  winter: {
    descriptionEn: 'Cool & Deep',
    descriptionZh: '冷调深色',
    icon: Snowflake,
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
  const { t } = useLanguage();
  const config = seasonConfig[season];
  const sizes = sizeClasses[size];
  const Icon = config.icon;
  const label = t[season];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 text-neutral-700',
        sizes.container
      )}
    >
      <Icon className={cn(sizes.icon, 'text-neutral-600')} />
      {showLabel && (
        <span className={cn(sizes.text, 'font-medium')}>{label}</span>
      )}
    </div>
  );
}

interface SeasonCardProps {
  season: Season;
}

export function SeasonCard({ season }: SeasonCardProps) {
  const { t, language } = useLanguage();
  const config = seasonConfig[season];
  const Icon = config.icon;
  const label = t[season];
  const description = language === 'zh' ? config.descriptionZh : config.descriptionEn;

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-neutral-200">
          <Icon className="w-5 h-5 text-neutral-700" />
        </div>
        <div>
          <p className="font-semibold text-neutral-900">{label}</p>
          <p className="text-xs text-neutral-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

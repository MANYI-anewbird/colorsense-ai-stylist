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
    className: 'bg-editorial-lime/15 text-foreground border-editorial-lime/50',
    iconClass: 'text-editorial-lime',
    cardBg: 'bg-editorial-lime/10',
  },
  summer: {
    descriptionEn: 'Cool & Light',
    descriptionZh: '冷调浅色',
    icon: Sun,
    className: 'bg-editorial-cyan/15 text-foreground border-editorial-cyan/50',
    iconClass: 'text-editorial-cyan',
    cardBg: 'bg-editorial-cyan/10',
  },
  autumn: {
    descriptionEn: 'Warm & Deep',
    descriptionZh: '暖调深色',
    icon: Leaf,
    className: 'bg-editorial-orange/15 text-foreground border-editorial-orange/50',
    iconClass: 'text-editorial-orange',
    cardBg: 'bg-editorial-orange/10',
  },
  winter: {
    descriptionEn: 'Cool & Deep',
    descriptionZh: '冷调深色',
    icon: Snowflake,
    className: 'bg-editorial-violet/15 text-foreground border-editorial-violet/50',
    iconClass: 'text-editorial-violet',
    cardBg: 'bg-editorial-violet/10',
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
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        sizes.container
      )}
    >
      <Icon className={cn(sizes.icon, config.iconClass)} />
      {showLabel && (
        <span className={sizes.text}>{label}</span>
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
    <div className={cn('rounded-2xl border-2 p-4 shadow-card', config.className, config.cardBg)}>
      <div className="flex items-center gap-3">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center bg-white/50 backdrop-blur-sm')}>
          <Icon className={cn('w-6 h-6', config.iconClass)} />
        </div>
        <div>
          <p className="font-semibold text-lg">{label}</p>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
    </div>
  );
}

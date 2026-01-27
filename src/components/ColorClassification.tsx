import React from 'react';
import { cn } from '@/lib/utils';
import { SeasonBadge } from '@/components/SeasonBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { SKIN_TONES } from '@/contexts/SkinToneContext';
import type { SeasonMatchBreakdown, Season12 } from '@/lib/color-utils';

interface ColorClassificationProps {
  seasonMatch?: SeasonMatchBreakdown;
  season12: Season12; // Fallback to main season
}

/**
 * Map season to color classes for progress bar visualization
 */
const getSeasonColorClasses = (season: Season12): string => {
  const family = season.split('-')[0];
  switch (family) {
    case 'spring':
      return 'bg-gradient-to-r from-green-400 to-emerald-500'; // Pastel green
    case 'summer':
      return 'bg-gradient-to-r from-blue-300 to-cyan-400'; // Cool blue
    case 'autumn':
      return 'bg-gradient-to-r from-orange-400 to-amber-500'; // Warm orange
    case 'winter':
      return 'bg-gradient-to-r from-purple-400 to-indigo-500'; // Cool purple
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-500';
  }
};

/**
 * Map season to color for small indicator dots
 */
const getSeasonDotColor = (season: Season12): string => {
  const family = season.split('-')[0];
  switch (family) {
    case 'spring':
      return 'bg-green-400'; // Pastel green
    case 'summer':
      return 'bg-blue-300'; // Cool blue
    case 'autumn':
      return 'bg-orange-400'; // Warm orange
    case 'winter':
      return 'bg-purple-400'; // Cool purple
    default:
      return 'bg-gray-400';
  }
};

/**
 * Get season display name
 */
const getSeasonName = (season: Season12, language: 'en' | 'zh'): string => {
  const info = SKIN_TONES.find(s => s.id === season);
  return language === 'zh' ? (info?.nameZh ?? season) : (info?.nameEn ?? season);
};

export function ColorClassification({ seasonMatch, season12 }: ColorClassificationProps) {
  const { t, language } = useLanguage();
  
  // If no match breakdown, show simple season badge
  if (!seasonMatch) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{t.seasonalTendency}</span>
        <SeasonBadge season={season12} size="md" />
      </div>
    );
  }

  const { primarySeason, secondarySeason, confidence, isAmbiguous } = seasonMatch;
  
  // Get scores for primary and secondary
  const primaryScore = seasonMatch.breakdown.find(b => b.season === primarySeason)?.score ?? 0;
  const secondaryScore = secondarySeason 
    ? seasonMatch.breakdown.find(b => b.season === secondarySeason)?.score ?? 0
    : 0;

  // Handle confident matches (no secondary season or high confidence)
  if (!secondarySeason || confidence > 85) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{t.seasonalTendency}</span>
          <SeasonBadge season={primarySeason} size="md" />
        </div>
        
        {/* Confidence badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {language === 'zh' ? '置信度' : 'Confidence'}
          </span>
          <span className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium',
            confidence >= 80 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : confidence >= 60
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
          )}>
            {confidence}%
          </span>
        </div>
      </div>
    );
  }

  // Handle hybrid/ambiguous matches
  return (
    <div className="space-y-3">
      {/* Primary Season */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{t.seasonalTendency}</span>
        <SeasonBadge season={primarySeason} size="md" />
      </div>

      {/* Hybrid Match Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">
            {language === 'zh' ? '混合匹配' : 'Hybrid Match'}
          </span>
          <span className="text-xs text-muted-foreground">
            {language === 'zh' ? '模糊结果' : 'Ambiguous Result'}
          </span>
        </div>

        {/* Dual-Colored Progress Bar */}
        <div className="relative w-full h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-inner">
          {/* Primary segment */}
          <div
            className={cn(
              'absolute left-0 top-0 h-full flex items-center justify-start pl-3 transition-all duration-500 z-10',
              getSeasonColorClasses(primarySeason)
            )}
            style={{ width: `${primaryScore}%` }}
          >
            {primaryScore >= 20 && (
              <span className="text-xs font-bold text-white drop-shadow-md">
                {primaryScore}%
              </span>
            )}
          </div>

          {/* Secondary segment */}
          {secondarySeason && (
            <div
              className={cn(
                'absolute right-0 top-0 h-full flex items-center justify-end pr-3 transition-all duration-500 z-10',
                getSeasonColorClasses(secondarySeason).replace('to-r', 'to-l')
              )}
              style={{ width: `${secondaryScore}%` }}
            >
              {secondaryScore >= 20 && (
                <span className="text-xs font-bold text-white drop-shadow-md">
                  {secondaryScore}%
                </span>
              )}
            </div>
          )}

          {/* Center divider (if both segments are visible and meet) */}
          {primaryScore > 0 && secondaryScore > 0 && Math.abs(primaryScore - secondaryScore) < 30 && (
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/60 shadow-sm -translate-x-1/2 z-20" />
          )}
        </div>

        {/* Season labels below the bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded-full', getSeasonDotColor(primarySeason))} />
            <span className="text-muted-foreground">
              {getSeasonName(primarySeason, language)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {secondarySeason && (
              <>
                <span className="text-muted-foreground">
                  {getSeasonName(secondarySeason, language)}
                </span>
                <div className={cn('w-3 h-3 rounded-full', getSeasonDotColor(secondarySeason))} />
              </>
            )}
          </div>
        </div>

        {/* Helpful message */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {language === 'zh' 
            ? `此颜色位于 ${getSeasonName(primarySeason, language)} 和 ${secondarySeason ? getSeasonName(secondarySeason, language) : ''} 的边界之间。`
            : `This color is on the border between ${getSeasonName(primarySeason, language)} and ${secondarySeason ? getSeasonName(secondarySeason, language) : ''}.`
          }
        </p>
      </div>
    </div>
  );
}

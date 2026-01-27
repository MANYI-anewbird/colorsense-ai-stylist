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

  const { primarySeason, secondarySeason, confidence } = seasonMatch;
  
  // Get scores for primary and secondary
  const primaryScore = seasonMatch.breakdown.find(b => b.season === primarySeason)?.score ?? 0;
  const secondaryScore = secondarySeason 
    ? seasonMatch.breakdown.find(b => b.season === secondarySeason)?.score ?? 0
    : 0;

  const CONFIDENCE_THRESHOLD = 60;

  // Mode A: High Confidence (>= 60%)
  if (confidence >= CONFIDENCE_THRESHOLD) {
    return (
      <div className="space-y-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{t.seasonalTendency}</span>
          <SeasonBadge season={primarySeason} size="md" />
        </div>
        
        {/* High Confidence badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {language === 'zh' ? '置信度' : 'Confidence'}
          </span>
          <span className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium',
            confidence >= 80 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : confidence >= 60
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          )}>
            {language === 'zh' ? '高置信度' : 'High Confidence'} {confidence}%
          </span>
        </div>
      </div>
    );
  }

  // Mode B: Low Confidence / Ambiguous (< 60%)
  // Hide the large SeasonBadge, show ONLY the Hybrid Match section
  return (
    <div className="space-y-3">
      {/* Heading for ambiguous result */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {language === 'zh' ? '模糊结果' : 'Close Match'}
        </h3>
        <span className="text-xs text-muted-foreground">
          {confidence}% {language === 'zh' ? '置信度' : 'confidence'}
        </span>
      </div>

      {/* Primary Season - Emphasized as the winner */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className={cn('w-4 h-4 rounded-full', getSeasonDotColor(primarySeason))} />
          <span className="text-base font-bold text-foreground">
            {getSeasonName(primarySeason, language)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({primaryScore}%)
          </span>
        </div>
        {secondarySeason && (
          <div className="flex items-center gap-2 pl-6">
            <span className="text-xs text-muted-foreground">
              {language === 'zh' ? '次要匹配' : 'Secondary match'}:
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {getSeasonName(secondarySeason, language)} ({secondaryScore}%)
            </span>
          </div>
        )}
      </div>

      {/* Dual-Colored Progress Bar - Main visualization */}
      <div className="relative w-full h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-inner">
        {/* Primary segment */}
        <div
          className={cn(
            'absolute left-0 top-0 h-full flex items-center justify-start pl-4 transition-all duration-500 z-10',
            getSeasonColorClasses(primarySeason)
          )}
          style={{ width: `${primaryScore}%` }}
        >
          {primaryScore >= 15 && (
            <span className="text-sm font-bold text-white drop-shadow-lg">
              {primaryScore}%
            </span>
          )}
        </div>

        {/* Secondary segment */}
        {secondarySeason && (
          <div
            className={cn(
              'absolute right-0 top-0 h-full flex items-center justify-end pr-4 transition-all duration-500 z-10',
              getSeasonColorClasses(secondarySeason).replace('to-r', 'to-l')
            )}
            style={{ width: `${secondaryScore}%` }}
          >
            {secondaryScore >= 15 && (
              <span className="text-sm font-bold text-white drop-shadow-lg">
                {secondaryScore}%
              </span>
            )}
          </div>
        )}

        {/* Center divider (if both segments are visible and meet) */}
        {primaryScore > 0 && secondaryScore > 0 && Math.abs(primaryScore - secondaryScore) < 30 && (
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/70 shadow-lg -translate-x-1/2 z-20" />
        )}
      </div>

      {/* Helpful message */}
      <p className="text-xs text-muted-foreground leading-relaxed italic">
        {language === 'zh' 
          ? `此颜色可能属于 ${getSeasonName(primarySeason, language)}，但具有 ${secondarySeason ? getSeasonName(secondarySeason, language) : ''} 的强烈特征。`
          : `This color likely belongs to ${getSeasonName(primarySeason, language)}, but with strong traits of ${secondarySeason ? getSeasonName(secondarySeason, language) : ''}.`
        }
      </p>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { SeasonBadge } from '@/components/SeasonBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { SKIN_TONES } from '@/contexts/SkinToneContext';
import type { SeasonMatchBreakdown, Season12, LAB } from '@/lib/color-utils';

interface ColorClassificationProps {
  seasonMatch?: SeasonMatchBreakdown;
  season12: Season12; // Fallback to main season
  hex?: string; // Optional hex for debug logging
  inputLab?: LAB; // Optional LAB values for debug logging
}

/**
 * Map season to color classes for progress bar visualization
 * Spring=green, Summer=yellow, Autumn=red, Winter=blue
 */
const getSeasonColorClasses = (season: Season12): string => {
  const family = season.split('-')[0];
  switch (family) {
    case 'spring':
      return 'bg-gradient-to-r from-green-400 to-green-500'; // Green
    case 'summer':
      return 'bg-gradient-to-r from-yellow-400 to-yellow-500'; // Yellow
    case 'autumn':
      return 'bg-gradient-to-r from-red-400 to-red-500'; // Red
    case 'winter':
      return 'bg-gradient-to-r from-blue-400 to-blue-500'; // Blue
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-500';
  }
};

/**
 * Map season to color for small indicator dots
 * Spring=green, Summer=yellow, Autumn=red, Winter=blue
 */
const getSeasonDotColor = (season: Season12): string => {
  const family = season.split('-')[0];
  switch (family) {
    case 'spring':
      return 'bg-green-400'; // Green
    case 'summer':
      return 'bg-yellow-400'; // Yellow
    case 'autumn':
      return 'bg-red-400'; // Red
    case 'winter':
      return 'bg-blue-400'; // Blue
    default:
      return 'bg-gray-400';
  }
};

/**
 * Get season display name
 */
const getSeasonName = (season: Season12): string => {
  const info = SKIN_TONES.find(s => s.id === season);
  return info?.nameEn ?? season;
};

/**
 * Format confidence for display
 * - Do NOT display "100%"
 * - If confidence >= 95, display ">95%"
 * - Else display rounded percentage
 */
const formatConfidence = (confidence: number): string => {
  if (confidence >= 100) {
    return '>95%';
  }
  if (confidence >= 95) {
    return '>95%';
  }
  return `${Math.round(confidence)}%`;
};

export function ColorClassification({ seasonMatch, season12, hex, inputLab }: ColorClassificationProps) {
  const { t, language } = useLanguage();
  
  // Track last logged values to prevent duplicate logs
  const lastLoggedRef = useRef<{ hex?: string; breakdownId?: string }>({});
  
  // Log debug info only once per analysis using useEffect
  useEffect(() => {
    if (!seasonMatch?.debugInfo?.topCandidates) return;
    
    // Create a unique identifier for this breakdown
    const breakdownId = JSON.stringify({
      primary: seasonMatch.primaryMatch?.season,
      confidence: seasonMatch.primaryMatch?.confidence,
      secondary: seasonMatch.secondaryMatch?.season,
    });
    
    // Only log if this is a new analysis (different hex or different breakdown)
    if (hex && (lastLoggedRef.current.hex !== hex || lastLoggedRef.current.breakdownId !== breakdownId)) {
      console.groupCollapsed(`COLOR_DEBUG ${hex}`);
      console.log({
        hex,
        inputLab: inputLab ? { L: inputLab.l, a: inputLab.a, b: inputLab.b } : undefined,
        topCandidates: seasonMatch.debugInfo.topCandidates,
      });
      
      // Optional: Log Autumn centroids only if DEBUG flag is set
      if (typeof window !== 'undefined' && (window as any).DEBUG_COLOR_ANALYSIS && seasonMatch.debugInfo.autumnCentroids) {
        console.log('AUTUMN CENTROIDS:', seasonMatch.debugInfo.autumnCentroids);
      }
      
      console.groupEnd();
      
      // Update ref to track what we've logged
      lastLoggedRef.current = { hex, breakdownId };
    }
  }, [hex, inputLab, seasonMatch]);
  
  // If no match breakdown, show simple season badge
  if (!seasonMatch) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{t.seasonalTendency}</span>
        <SeasonBadge season={season12} size="md" />
      </div>
    );
  }

  const { primaryMatch, secondaryMatch, isBorderline, confidence, breakdown, debugInfo } = seasonMatch;
  
  // UI-side debug logging: print the exact 12-element array used by UI
  useEffect(() => {
    if (hex && breakdown && debugInfo?.seasonScores) {
      const full12Array = debugInfo.seasonScores
        .sort((a, b) => a.totalScore - b.totalScore) // Sort by totalScore ascending (lower is better)
        .map(s => ({
          season: s.season,
          confidence: s.confidence,
          totalScore: s.totalScore,
        }));
      
      const top3 = full12Array.slice(0, 3);
      
      console.log('UI_SEASON_ARRAY:', {
        hex,
        full12Array,
        top3,
        primaryMatch: primaryMatch ? { season: primaryMatch.season, confidence: primaryMatch.confidence } : null,
        secondaryMatch: secondaryMatch ? { season: secondaryMatch.season, confidence: secondaryMatch.confidence } : null,
      });
    }
  }, [hex, breakdown, debugInfo, primaryMatch, secondaryMatch]);
  
  // Guard against undefined primaryMatch
  if (!primaryMatch) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{t.seasonalTendency}</span>
        <SeasonBadge season={season12} size="md" />
      </div>
    );
  }
  
  const primarySeason = primaryMatch.season;
  const secondarySeason = secondaryMatch?.season ?? null;
  
  // Get scores for primary and secondary
  let primaryScore = primaryMatch.confidence;
  let secondaryScore = secondaryMatch?.confidence ?? 0;
  
  // For low confidence cases (< 60%), use relative confidence within top3
  // This makes percentages more meaningful: "37% of top3" vs "22% of all 12 seasons"
  // Users understand "37% chance it's one of these top options" better than "22% chance it's correct"
  const confidenceDisplay = seasonMatch.confidenceDisplay;
  if (confidenceDisplay?.useRelative && confidenceDisplay.top1Relative) {
    // Use relative probabilities within top3 for display
    primaryScore = Math.round(confidenceDisplay.top1Relative * 100);
    if (secondaryMatch && confidenceDisplay.top2Relative) {
      secondaryScore = Math.round(confidenceDisplay.top2Relative * 100);
    }
  } else {
    // Normalize to ensure they sum to 100% for the progress bar
    // If we have both seasons, normalize them to total 100%
    if (secondaryMatch && primaryScore > 0 && secondaryScore > 0) {
      const total = primaryScore + secondaryScore;
      if (total > 0) {
        primaryScore = Math.round((primaryScore / total) * 100);
        secondaryScore = 100 - primaryScore; // Ensure exact 100%
      }
    }
  }

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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            Confidence
          </span>
          <span className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium',
            confidence >= 80 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : confidence >= 60
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          )}>
            High Confidence {formatConfidence(confidence)}
          </span>
          {isBorderline && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              Borderline
            </span>
          )}
        </div>
        
        {/* Secondary match (if exists) */}
        {secondaryMatch && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              Secondary match:
            </span>
            <span className="font-medium text-foreground">
              {getSeasonName(secondaryMatch.season)} ({formatConfidence(secondaryMatch.confidence)})
            </span>
          </div>
        )}
      </div>
    );
  }

  // Mode B: Low Confidence / Ambiguous (< 60%)
  // Hide the large SeasonBadge, show ONLY the Hybrid Match section
  return (
    <div className="space-y-3">
      {/* Heading for ambiguous result */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Close Match
          </h3>
          {isBorderline && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              Borderline
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs text-muted-foreground">
            {formatConfidence(confidence)} confidence
          </span>
          {seasonMatch.confidenceDisplay?.useRelative && seasonMatch.confidenceDisplay.top3Cumulative > 0 && (
            <span className="text-[10px] text-muted-foreground/70">
              {`Top 3: ${Math.round(seasonMatch.confidenceDisplay.top3Cumulative * 100)}%`}
            </span>
          )}
        </div>
      </div>

      {/* Primary Season - Emphasized as the winner */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className={cn('w-4 h-4 rounded-full', getSeasonDotColor(primarySeason))} />
          <span className="text-base font-bold text-foreground">
            {getSeasonName(primarySeason)}
          </span>
          <span className="text-sm text-muted-foreground">
            ({primaryScore}%)
          </span>
        </div>
        {secondaryMatch && (
          <div className="flex items-center gap-2 pl-6">
            <span className="text-xs text-muted-foreground">
              Secondary match:
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {getSeasonName(secondaryMatch.season)} ({formatConfidence(secondaryMatch.confidence)})
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar - Main visualization */}
      {/* Primary season highlighted, remaining part in gray */}
      <div className="relative w-full h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-inner">
        {/* Primary segment - Left side - Highlighted with season color */}
        <div
          className={cn(
            'absolute left-0 top-0 h-full flex items-center justify-start pl-4 transition-all duration-500 z-10',
            getSeasonColorClasses(primarySeason)
          )}
          style={{ width: `${primaryScore}%` }}
        >
          {primaryScore >= 20 && (
            <span className="text-sm font-bold text-white drop-shadow-lg">
              {primaryScore}%
            </span>
          )}
        </div>

        {/* Remaining segment - Right side - Gray background, no percentage text */}
        {primaryScore < 100 && (
          <div
            className="absolute top-0 h-full bg-gray-300 dark:bg-gray-600 transition-all duration-500 z-10"
            style={{ 
              left: `${primaryScore}%`,
              width: `${100 - primaryScore}%`,
            }}
          />
        )}
      </div>

      {/* Helpful message */}
      <p className="text-xs text-muted-foreground leading-relaxed italic">
        {`This color likely belongs to ${getSeasonName(primarySeason)}, but with strong traits of ${secondarySeason ? getSeasonName(secondarySeason) : ''}.`}
      </p>
    </div>
  );
}

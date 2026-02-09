import React from 'react';
import { useSkinTone } from '@/contexts/SkinToneContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface SkinToneBadgeProps {
  showLabel?: boolean;
  size?: 'sm' | 'md';
  variant?: 'light' | 'dark';
}

export function SkinToneBadge({ showLabel = true, size = 'sm', variant = 'dark' }: SkinToneBadgeProps) {
  const { skinTone, getSkinToneInfo } = useSkinTone();
  const { language } = useLanguage();

  if (!skinTone) return null;

  const info = getSkinToneInfo(skinTone);
  if (!info) return null;

  const dotSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  // Dark variant for dark backgrounds, light variant for light backgrounds
  const containerStyles = variant === 'dark' 
    ? 'bg-white/10 border-white/20 hover:bg-white/15' 
    : 'bg-white/90 border-neutral-200';
  
  const textStyles = variant === 'dark'
    ? 'text-white/90'
    : 'text-neutral-700';

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 backdrop-blur-sm rounded-full border transition-colors ${containerStyles}`}>
      <div 
        className={`${dotSize} rounded-full ring-2 ring-white/30 flex-shrink-0`}
        style={{ backgroundColor: info.color }}
      />
      {showLabel && (
        <span className={`text-xs font-medium tracking-wide ${textStyles}`}>
          {info.nameEn}
        </span>
      )}
    </div>
  );
}

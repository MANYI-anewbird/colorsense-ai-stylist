import React from 'react';
import { useSkinTone } from '@/contexts/SkinToneContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface SkinToneBadgeProps {
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function SkinToneBadge({ showLabel = true, size = 'sm' }: SkinToneBadgeProps) {
  const { skinTone, getSkinToneInfo } = useSkinTone();
  const { language } = useLanguage();

  if (!skinTone) return null;

  const info = getSkinToneInfo(skinTone);
  if (!info) return null;

  const sizeClasses = size === 'sm' 
    ? 'w-5 h-5 text-[9px]' 
    : 'w-6 h-6 text-[10px]';

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-neutral-200 shadow-sm">
      <div 
        className={`${sizeClasses} rounded-full shadow-inner flex-shrink-0`}
        style={{ backgroundColor: info.color }}
      />
      {showLabel && (
        <span className="text-[10px] font-medium text-neutral-700 truncate max-w-20">
          {language === 'zh' ? info.nameZh : info.nameEn}
        </span>
      )}
    </div>
  );
}

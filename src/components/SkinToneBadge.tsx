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

  const dotSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-neutral-200 shadow-sm">
      <div 
        className={`${dotSize} rounded-full shadow-sm flex-shrink-0`}
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

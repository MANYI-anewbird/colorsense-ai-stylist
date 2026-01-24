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

  const dotSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-neutral-200 shadow-sm">
      {/* Mini palette strip showing 4 colors */}
      <div className="flex items-center -space-x-0.5">
        {info.palette.slice(0, 4).map((color, idx) => (
          <div 
            key={idx}
            className={`${dotSize} rounded-full border border-white/50 shadow-sm`}
            style={{ 
              backgroundColor: color,
              zIndex: 4 - idx
            }}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-[10px] font-medium text-neutral-700 truncate max-w-20">
          {language === 'zh' ? info.nameZh : info.nameEn}
        </span>
      )}
    </div>
  );
}

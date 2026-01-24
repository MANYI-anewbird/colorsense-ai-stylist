import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useSkinTone, SKIN_TONES, SkinToneType } from '@/contexts/SkinToneContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function SkinToneSelector() {
  const { skinTone, setSkinTone, getSkinToneInfo } = useSkinTone();
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = (toneId: SkinToneType) => {
    if (skinTone === toneId) {
      setSkinTone(null);
    } else {
      setSkinTone(toneId);
    }
  };

  const currentToneInfo = skinTone ? getSkinToneInfo(skinTone) : null;

  // Group by season
  const springTones = SKIN_TONES.filter(t => t.season === 'spring');
  const summerTones = SKIN_TONES.filter(t => t.season === 'summer');
  const autumnTones = SKIN_TONES.filter(t => t.season === 'autumn');
  const winterTones = SKIN_TONES.filter(t => t.season === 'winter');

  const seasonGroups = [
    { key: 'spring', tones: springTones, labelEn: 'Spring', labelZh: '春季型' },
    { key: 'summer', tones: summerTones, labelEn: 'Summer', labelZh: '夏季型' },
    { key: 'autumn', tones: autumnTones, labelEn: 'Autumn', labelZh: '秋季型' },
    { key: 'winter', tones: winterTones, labelEn: 'Winter', labelZh: '冬季型' },
  ];

  // Get a diverse set of preview colors from all seasons
  const previewColors = SKIN_TONES.flatMap(tone => tone.palette.slice(0, 1)).slice(0, 8);

  return (
    <div className="w-full">
      {/* Collapsed Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 px-1 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Preview color circles from various palettes */}
          <div className="flex items-center -space-x-1.5">
            {previewColors.map((color, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ 
                  backgroundColor: color,
                  zIndex: 8 - idx
                }}
              />
            ))}
            <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm bg-neutral-200 flex items-center justify-center" style={{ zIndex: 0 }}>
              <span className="text-[7px] font-bold text-neutral-500">+</span>
            </div>
          </div>
          
          {currentToneInfo ? (
            <span className="text-sm font-medium text-foreground">
              {language === 'zh' ? currentToneInfo.nameZh : currentToneInfo.nameEn}
            </span>
          ) : (
            <span className="text-sm font-medium text-foreground">
              {language === 'zh' ? '选择你的色季' : 'Select Your Color Season'}
            </span>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expandable Content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[600px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-xs text-muted-foreground text-center mb-3">
          {language === 'zh' ? '基于12色季理论' : 'Based on 12-season color theory'}
        </p>

        <div className="space-y-4">
          {seasonGroups.map((group) => (
            <div key={group.key} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground px-1">
                {language === 'zh' ? group.labelZh : group.labelEn}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {group.tones.map((tone) => {
                  const isSelected = skinTone === tone.id;
                  return (
                    <button
                      key={tone.id}
                      onClick={() => handleSelect(tone.id)}
                      className={`
                        relative flex flex-col items-center gap-2 p-2.5 rounded-xl 
                        border-2 transition-all duration-200
                        ${isSelected 
                          ? 'border-neutral-900 bg-neutral-50' 
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }
                      `}
                    >
                      {/* Palette strip - 5 color dots */}
                      <div className="flex items-center gap-0.5">
                        {tone.palette.map((color, idx) => (
                          <div 
                            key={idx}
                            className={`
                              w-4 h-4 rounded-full shadow-sm
                              ${isSelected && idx === 2 ? 'ring-1 ring-neutral-900 ring-offset-1' : ''}
                            `}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      
                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-neutral-900 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      
                      {/* Label */}
                      <span className="text-[10px] font-medium text-center leading-tight text-foreground">
                        {language === 'zh' ? tone.nameZh : tone.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

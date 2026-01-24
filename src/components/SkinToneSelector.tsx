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

  return (
    <div className="w-full">
      {/* Collapsed Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 px-1 transition-colors"
      >
        <div className="flex items-center gap-2">
          {currentToneInfo ? (
            <>
              <div 
                className="w-5 h-5 rounded-full shadow-sm"
                style={{ backgroundColor: currentToneInfo.color }}
              />
              <span className="text-sm font-medium text-foreground">
                {language === 'zh' ? currentToneInfo.nameZh : currentToneInfo.nameEn}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-foreground">
              {language === 'zh' ? '选择你的肤色类型' : 'Select Your Skin Tone'}
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
          isExpanded ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-xs text-muted-foreground text-center mb-3">
          {language === 'zh' ? '基于12色季理论' : 'Based on 12-season color theory'}
        </p>

        <div className="space-y-3">
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
                        relative flex flex-col items-center gap-1.5 p-2 rounded-xl 
                        border-2 transition-all duration-200
                        ${isSelected 
                          ? 'border-neutral-900 bg-neutral-50' 
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }
                      `}
                    >
                      {/* Color swatch */}
                      <div 
                        className={`
                          w-8 h-8 rounded-lg shadow-sm flex items-center justify-center
                          ${isSelected ? 'ring-2 ring-neutral-900 ring-offset-1' : ''}
                        `}
                        style={{ backgroundColor: tone.color }}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-neutral-700" />
                        )}
                      </div>
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

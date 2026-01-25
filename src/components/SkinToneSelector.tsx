import React, { useState } from 'react';
import { Check, ChevronDown, HelpCircle } from 'lucide-react';
import { useSkinTone, SKIN_TONES, SkinToneType } from '@/contexts/SkinToneContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ColorSeasonTest } from '@/components/ColorSeasonTest';

export function SkinToneSelector() {
  const { skinTone, setSkinTone, getSkinToneInfo } = useSkinTone();
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTest, setShowTest] = useState(false);

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
    { key: 'spring', tones: springTones, labelEn: 'Spring', labelZh: '春季型', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { key: 'summer', tones: summerTones, labelEn: 'Summer', labelZh: '夏季型', color: 'bg-violet-100 text-violet-700 border-violet-200' },
    { key: 'autumn', tones: autumnTones, labelEn: 'Autumn', labelZh: '秋季型', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { key: 'winter', tones: winterTones, labelEn: 'Winter', labelZh: '冬季型', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  ];

  const handleTestComplete = () => {
    setShowTest(false);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Color Season Test Modal */}
      {showTest && (
        <ColorSeasonTest
          onClose={() => setShowTest(false)}
          onComplete={handleTestComplete}
        />
      )}

      <div className="w-full">
        {/* Collapsed Header - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-2 px-1 transition-colors"
        >
        <div className="flex items-center gap-3">
          {/* Preview color circles */}
          <div className="flex items-center -space-x-1.5">
            {SKIN_TONES.slice(0, 8).map((tone, idx) => (
              <div
                key={tone.id}
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ 
                  backgroundColor: tone.color,
                  zIndex: 8 - idx
                }}
              />
            ))}
            <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm bg-neutral-200 flex items-center justify-center" style={{ zIndex: 0 }}>
              <span className="text-[7px] font-bold text-neutral-500">+4</span>
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
          isExpanded ? 'max-h-[700px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-xs text-muted-foreground text-center mb-3">
          {language === 'zh' ? '基于12色季理论' : 'Based on 12-season color theory'}
        </p>

        {/* "I don't know" Button - Editorial style */}
        <button
          onClick={() => setShowTest(true)}
          className="group w-full relative flex items-center justify-center gap-2 py-3.5 mb-4 bg-foreground text-background rounded-xl overflow-hidden text-sm font-semibold tap-color-feedback"
        >
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-editorial-magenta via-editorial-coral to-editorial-yellow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <HelpCircle className="w-4 h-4 relative z-10" />
          <span className="relative z-10">{language === 'zh' ? '我不知道我的色季' : "I don't know my color season"}</span>
        </button>

        <div className="space-y-3">
          {seasonGroups.map((group) => (
            <div key={group.key} className="space-y-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${group.color}`}>
                {language === 'zh' ? group.labelZh : group.labelEn}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {group.tones.map((tone) => {
                  const isSelected = skinTone === tone.id;
                  return (
                    <button
                      key={tone.id}
                      onClick={() => handleSelect(tone.id)}
                      className={`
                        relative flex flex-col items-center gap-1.5 p-2 rounded-xl 
                        border-2 transition-all duration-200 tap-color-feedback
                        ${isSelected 
                          ? 'border-foreground bg-secondary' 
                          : 'border-border bg-card hover:border-foreground/30'
                        }
                      `}
                    >
                      {/* Single solid color circle */}
                      <div 
                        className={`
                          w-8 h-8 rounded-full shadow-sm flex items-center justify-center
                          ${isSelected ? 'ring-2 ring-neutral-900 ring-offset-1' : ''}
                        `}
                        style={{ backgroundColor: tone.color }}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white drop-shadow-sm" />
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
    </>
  );
}

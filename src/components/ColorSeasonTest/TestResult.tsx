import React from 'react';
import { Check, MessageCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSkinTone, SKIN_TONES, SkinToneType } from '@/contexts/SkinToneContext';

interface TestResultProps {
  seasonId: string;
  confidence: 'high' | 'medium' | 'low';
  onUseResult: () => void;
  onConsultant: () => void;
}

export function TestResult({ seasonId, confidence, onUseResult, onConsultant }: TestResultProps) {
  const { language } = useLanguage();
  const { setSkinTone } = useSkinTone();

  const seasonInfo = SKIN_TONES.find(t => t.id === seasonId);

  const handleUseResult = () => {
    if (seasonInfo) {
      setSkinTone(seasonInfo.id as SkinToneType);
    }
    onUseResult();
  };

  const confidenceText = {
    high: { en: 'High confidence', zh: '高置信度' },
    medium: { en: 'Medium confidence', zh: '中等置信度' },
    low: { en: 'Low confidence', zh: '低置信度' },
  };

  if (!seasonInfo) {
    return <div>Error: Season not found</div>;
  }

  return (
    <div className="flex flex-col h-full px-5 py-6">
      {/* Title */}
      <h2 className="text-xl font-semibold text-center text-foreground mb-8">
        {language === 'zh' ? '你的可能色季' : 'Your Likely Color Season'}
      </h2>

      {/* Result Card */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Color Badge */}
        <div
          className="w-24 h-24 rounded-full shadow-lg mb-4"
          style={{ backgroundColor: seasonInfo.color }}
        />

        {/* Season Name */}
        <h3 className="text-2xl font-bold text-foreground mb-2">
          {language === 'zh' ? seasonInfo.nameZh : seasonInfo.nameEn}
        </h3>

        {/* Confidence Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-6 ${
          confidence === 'high' 
            ? 'bg-green-100 text-green-700' 
            : confidence === 'medium'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-neutral-100 text-neutral-600'
        }`}>
          {confidence === 'low' && <AlertCircle className="w-3 h-3" />}
          {language === 'zh' ? confidenceText[confidence].zh : confidenceText[confidence].en}
        </div>

        {/* Disclaimer */}
        <div className="bg-neutral-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {language === 'zh' 
              ? '这是一个快速自测结果。光线和屏幕设置可能会影响准确性。' 
              : 'This is a quick self-assessment. Lighting and screen settings may affect the result.'}
          </p>
        </div>
      </div>

      {/* Action Buttons - Editorial style */}
      <div className="space-y-2.5">
        {/* Secondary button - outline */}
        <button
          onClick={handleUseResult}
          className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground rounded-xl font-medium border-2 border-border hover:text-foreground hover:border-foreground/50 active:scale-[0.98] transition-all"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm">{language === 'zh' ? '使用此估算' : 'Use this estimate'}</span>
        </button>

        {/* Primary button - Editorial gradient */}
        <button
          onClick={onConsultant}
          className="group w-full relative flex items-center justify-center gap-2 py-3.5 bg-foreground text-background rounded-xl font-semibold overflow-hidden active:scale-[0.98] transition-all"
        >
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-editorial-magenta via-editorial-coral to-editorial-yellow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <MessageCircle className="w-4 h-4 relative z-10" />
          <span className="text-sm relative z-10">{language === 'zh' ? '获取专业色彩报告' : 'Get a professional color report'}</span>
        </button>
      </div>
    </div>
  );
}

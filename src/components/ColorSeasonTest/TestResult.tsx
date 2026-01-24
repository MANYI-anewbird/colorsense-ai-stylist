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

      {/* Action Buttons */}
      <div className="space-y-2.5">
        {/* Secondary button - subtle */}
        <button
          onClick={handleUseResult}
          className="w-full flex items-center justify-center gap-2 py-3 text-neutral-500 rounded-xl font-medium hover:text-neutral-700 hover:bg-neutral-100 active:scale-[0.98] transition-all"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm">{language === 'zh' ? '使用此估算' : 'Use this estimate'}</span>
        </button>

        {/* Primary button - highlighted with glow */}
        <button
          onClick={onConsultant}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-900 text-white rounded-xl font-medium shadow-lg shadow-neutral-900/25 hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/30 active:scale-[0.98] transition-all ring-1 ring-neutral-800"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{language === 'zh' ? '获取专业色彩报告' : 'Get a professional color report'}</span>
        </button>
      </div>
    </div>
  );
}

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
      <div className="space-y-3">
        <button
          onClick={handleUseResult}
          className="w-full flex items-center justify-center gap-2 py-4 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all"
        >
          <Check className="w-5 h-5" />
          {language === 'zh' ? '使用此结果' : 'Use this result'}
        </button>

        <button
          onClick={onConsultant}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white text-neutral-700 rounded-xl font-medium border border-neutral-200 hover:bg-neutral-50 active:scale-[0.98] transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          {language === 'zh' ? '咨询色彩顾问' : 'Ask a Color Consultant'}
        </button>
      </div>
    </div>
  );
}

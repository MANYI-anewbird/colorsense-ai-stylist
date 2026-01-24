import React from 'react';
import { ArrowLeft, Sparkles, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FindSeasonScreenProps {
  onBack: () => void;
  onStartTest: () => void;
  onConsultant: () => void;
}

export function FindSeasonScreen({ onBack, onStartTest, onConsultant }: FindSeasonScreenProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 py-4">
        {/* Title */}
        <h2 className="text-xl font-semibold text-center text-foreground mb-2">
          {language === 'zh' ? '找到你的色季' : 'Find Your Color Season'}
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          {language === 'zh' ? '选择一种方式来确定你的个人色彩类型' : 'Choose a way to discover your personal color type'}
        </p>

        {/* Options */}
        <div className="space-y-4">
          {/* Option 1: Quick Test */}
          <button
            onClick={onStartTest}
            className="w-full p-5 bg-neutral-900 text-white rounded-2xl text-left hover:bg-neutral-800 active:scale-[0.98] transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  {language === 'zh' ? '快速测试 (3步)' : 'Quick Test (3 steps)'}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {language === 'zh' 
                    ? '回答几个简单的视觉问题，获取你可能的色季类型。' 
                    : 'Answer a few simple visual questions to get your likely color season.'}
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Consultant */}
          <button
            onClick={onConsultant}
            className="w-full p-5 bg-white border border-neutral-200 rounded-2xl text-left hover:bg-neutral-50 active:scale-[0.98] transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-neutral-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">
                    {language === 'zh' ? '咨询色彩顾问' : 'Ask a Color Consultant'}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {language === 'zh' 
                    ? '找到附近的专业色彩顾问，进行面对面诊断。' 
                    : 'Find a professional color consultant near you for an in-person analysis.'}
                </p>
                <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-500 text-xs rounded-full">
                  {language === 'zh' ? '付费服务 · 即将推出' : 'Paid service · Coming soon'}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

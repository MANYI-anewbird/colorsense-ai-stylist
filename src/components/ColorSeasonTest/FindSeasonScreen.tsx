import React from 'react';
import { ArrowLeft, Sparkles, Users, Crown, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FindSeasonScreenProps {
  onBack: () => void;
  onStartTest: () => void;
  onConsultant: () => void;
}

export function FindSeasonScreen({ onBack, onStartTest, onConsultant }: FindSeasonScreenProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-neutral-50/50 to-white relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-rose-200/40 to-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-48 h-48 bg-gradient-to-br from-violet-200/30 to-blue-200/25 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-gradient-to-tr from-amber-200/25 to-rose-200/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center px-4 py-3 relative z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 py-4 relative z-10">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {language === 'zh' ? '找到你的色季' : 'Find Your Color Season'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'zh' ? '选择一种方式来确定你的个人色彩类型' : 'Choose a way to discover your personal color type'}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-5">
          {/* Option 1: Quick Test - Simple card */}
          <button
            onClick={onStartTest}
            className="w-full p-5 bg-neutral-900 text-white rounded-2xl text-left hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {language === 'zh' ? '快速测试' : 'Quick Test'}
                  <span className="ml-2 text-sm font-normal text-white/60">3 {language === 'zh' ? '步' : 'steps'}</span>
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  {language === 'zh' 
                    ? '回答视觉问题，快速获取色季结果' 
                    : 'Answer visual questions for quick results'}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/50" />
            </div>
          </button>

          {/* Divider with "or" */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
            <span className="text-xs text-muted-foreground font-medium">
              {language === 'zh' ? '或者' : 'or'}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
          </div>

          {/* Option 2: Consultant - Premium highlighted card */}
          <button
            onClick={onConsultant}
            className="w-full relative overflow-hidden rounded-2xl text-left active:scale-[0.98] transition-all group"
          >
            {/* Premium gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-rose-400 to-violet-400 rounded-2xl" />
            <div className="absolute inset-[2px] bg-white rounded-[14px]" />
            
            {/* Content */}
            <div className="relative p-5">
              {/* Premium badge */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-100 to-rose-100 rounded-full">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span className="text-[10px] font-semibold text-amber-700">
                    {language === 'zh' ? '专业推荐' : 'PRO'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                {/* Icon with gradient background */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 via-rose-100 to-violet-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Users className="w-7 h-7 text-rose-500" />
                </div>
                
                <div className="flex-1 pt-1">
                  <h3 className="font-bold text-lg text-foreground mb-1.5">
                    {language === 'zh' ? '咨询色彩顾问' : 'Ask a Color Consultant'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {language === 'zh' 
                      ? '由专业色彩顾问进行面对面诊断，获得最精准的个人色彩分析。' 
                      : 'Get the most accurate personal color analysis from a professional consultant in-person.'}
                  </p>
                  
                  {/* Coming soon tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-medium text-neutral-600">
                      {language === 'zh' ? '付费服务 · 即将推出' : 'Paid service · Coming soon'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Bottom info */}
        <div className="mt-auto pt-8">
          <p className="text-[11px] text-center text-muted-foreground/60 leading-relaxed">
            {language === 'zh' 
              ? '色季测试帮助你找到最适合的服装和妆容色彩' 
              : 'Color season testing helps you find the most flattering colors for your wardrobe and makeup'}
          </p>
        </div>
      </div>
    </div>
  );
}

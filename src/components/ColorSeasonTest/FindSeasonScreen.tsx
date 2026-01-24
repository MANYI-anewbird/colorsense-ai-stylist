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
      {/* Decorative gradient orbs with animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-rose-200/40 to-orange-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/3 -left-20 w-48 h-48 bg-gradient-to-br from-violet-200/30 to-blue-200/25 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-gradient-to-tr from-amber-200/25 to-rose-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
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
        {/* Title with fade-in animation */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {language === 'zh' ? '找到你的色季' : 'Find Your Color Season'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'zh' ? '选择一种方式' : 'Choose a way'}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-5">
          {/* Option 1: Quick Test - Clean minimal card */}
          <button
            onClick={onStartTest}
            className="w-full p-6 bg-neutral-900 text-white rounded-2xl text-left hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-xl animate-fade-in hover:shadow-2xl group"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {language === 'zh' ? '快速测试' : 'Quick Test'}
                    <span className="ml-2 text-sm font-normal text-white/50">3 {language === 'zh' ? '步' : 'steps'}</span>
                  </h3>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 group-hover:text-white/70 transition-all" />
            </div>
          </button>

          {/* Divider with "or" */}
          <div className="flex items-center gap-4 py-1 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
            <span className="text-xs text-muted-foreground/60 font-medium">
              {language === 'zh' ? '或者' : 'or'}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
          </div>

          {/* Option 2: Consultant - Premium highlighted card */}
          <button
            onClick={onConsultant}
            className="w-full relative overflow-hidden rounded-2xl text-left active:scale-[0.98] transition-all group animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-rose-400 to-violet-400 rounded-2xl animate-gradient-shift" />
            <div className="absolute inset-[2px] bg-white rounded-[14px]" />
            
            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Icon with gradient background */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 via-rose-100 to-violet-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                    <Users className="w-6 h-6 text-rose-500" />
                  </div>
                  
                  <h3 className="font-bold text-lg text-foreground">
                    {language === 'zh' ? '咨询色彩顾问' : 'Ask a Consultant'}
                  </h3>
                </div>

                {/* Premium badge */}
                <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-100 to-rose-100 rounded-full group-hover:scale-105 transition-transform">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span className="text-[10px] font-semibold text-amber-700">PRO</span>
                </div>
              </div>
              
              {/* Coming soon tag */}
              <div className="mt-3 ml-16">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11px] font-medium text-neutral-500">
                    {language === 'zh' ? '即将推出' : 'Coming soon'}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Custom CSS for gradient animation */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

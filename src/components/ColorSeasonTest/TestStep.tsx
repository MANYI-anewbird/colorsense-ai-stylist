import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TestOption {
  id: string;
  color: string;
  labelEn: string;
  labelZh: string;
}

interface TestStepProps {
  step: number;
  totalSteps: number;
  titleEn: string;
  titleZh: string;
  instructionEn: string;
  instructionZh: string;
  options: TestOption[];
  onSelect: (value: string) => void;
  onBack: () => void;
}

export function TestStep({
  step,
  totalSteps,
  titleEn,
  titleZh,
  instructionEn,
  instructionZh,
  options,
  onSelect,
  onBack,
}: TestStepProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < step ? 'bg-neutral-900' : i === step ? 'bg-neutral-400' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 py-4">
        {/* Title */}
        <h2 className="text-lg font-semibold text-center text-foreground mb-2">
          {language === 'zh' ? titleZh : titleEn}
        </h2>

        {/* Instruction */}
        <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
          {language === 'zh' ? instructionZh : instructionEn}
        </p>

        {/* Color Cards */}
        <div className={`grid gap-3 ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className="w-full aspect-[3/4] rounded-2xl shadow-md border border-neutral-200 transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-lg group-active:scale-[0.98]"
                style={{ backgroundColor: option.color }}
              />
              <span className="text-xs font-medium text-foreground">
                {language === 'zh' ? option.labelZh : option.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

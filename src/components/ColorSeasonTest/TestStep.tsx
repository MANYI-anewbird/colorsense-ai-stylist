import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Camera, CameraOff, Check } from 'lucide-react';
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
  options: TestOption[];
  onSelect: (value: string) => void;
  onBack: () => void;
}

const CRITERIA = [
  { en: 'Brighter skin', zh: '肤色更明亮' },
  { en: 'Less yellow / less dull', zh: '更少黄调 / 更少暗沉' },
  { en: 'Clearer and more defined features', zh: '五官更清晰立体' },
];

export function TestStep({
  step,
  totalSteps,
  titleEn,
  titleZh,
  options,
  onSelect,
  onBack,
}: TestStepProps) {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Only show camera view for 2-option steps (not 3-option like light/medium/deep)
  const isTwoOptionStep = options.length === 2;

  useEffect(() => {
    if (!isTwoOptionStep) return;

    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 300, height: 300 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setCameraError(false);
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraError(true);
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isTwoOptionStep]);

  // 2-option camera view layout
  if (isTwoOptionStep) {
    const leftOption = options[0];
    const rightOption = options[1];

    return (
      <div className="flex flex-col h-full bg-neutral-50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
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
          <div className="w-9" />
        </div>

        {/* Title */}
        <div className="px-5 pt-4 pb-2">
          <h2 className="text-lg font-semibold text-center text-foreground">
            {language === 'zh' ? titleZh : titleEn}
          </h2>
        </div>

        {/* Camera comparison area */}
        <div className="flex-1 flex flex-col px-4 pb-4">
          {/* Two cards with camera cutout */}
          <div className="relative flex-1 flex rounded-3xl overflow-hidden shadow-lg">
            {/* Left color card */}
            <div 
              className="flex-1 relative"
              style={{ backgroundColor: leftOption.color }}
            />
            
            {/* Right color card */}
            <div 
              className="flex-1 relative"
              style={{ backgroundColor: rightOption.color }}
            />

            {/* Center camera cutout - overlaid on top */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Circular mask/cutout effect */}
                <div 
                  className="w-36 h-44 rounded-[50%] overflow-hidden border-4 border-white shadow-xl"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 0 0 2px rgba(255,255,255,0.5)'
                  }}
                >
                  {/* Video element always rendered so ref can attach */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover scale-x-[-1] ${cameraActive ? 'block' : 'hidden'}`}
                  />
                  {cameraError && (
                    <div className="w-full h-full bg-neutral-200 flex flex-col items-center justify-center text-neutral-400">
                      <CameraOff className="w-8 h-8 mb-1" />
                      <span className="text-xs">
                        {language === 'zh' ? '无法访问相机' : 'Camera unavailable'}
                      </span>
                    </div>
                  )}
                  {!cameraActive && !cameraError && (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-neutral-300 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Selection criteria */}
          <div className="mt-4 mb-4 px-2">
            <div className="flex flex-col gap-1.5">
              {CRITERIA.map((criterion, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Check className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                  <span>{language === 'zh' ? criterion.zh : criterion.en}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selection buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSelect(leftOption.id)}
              className="py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2 border-neutral-200 bg-white hover:border-neutral-900 hover:bg-neutral-50 active:scale-[0.98]"
            >
              <span className="text-sm text-foreground">
                {language === 'zh' ? leftOption.labelZh : leftOption.labelEn}
              </span>
            </button>
            <button
              onClick={() => onSelect(rightOption.id)}
              className="py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2 border-neutral-200 bg-white hover:border-neutral-900 hover:bg-neutral-50 active:scale-[0.98]"
            >
              <span className="text-sm text-foreground">
                {language === 'zh' ? rightOption.labelZh : rightOption.labelEn}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3-option layout (for light/medium/deep step) - original card-based layout
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
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 py-4">
        {/* Title */}
        <h2 className="text-lg font-semibold text-center text-foreground mb-2">
          {language === 'zh' ? titleZh : titleEn}
        </h2>

        {/* Selection criteria for 3-option */}
        <div className="mb-4 flex flex-col gap-1">
          {CRITERIA.map((criterion, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-xs text-muted-foreground justify-center"
            >
              <Check className="w-3 h-3 text-neutral-400 flex-shrink-0" />
              <span>{language === 'zh' ? criterion.zh : criterion.en}</span>
            </div>
          ))}
        </div>

        {/* Color Cards */}
        <div className="grid gap-3 grid-cols-3">
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

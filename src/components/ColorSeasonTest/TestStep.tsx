import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Camera, CameraOff, Sparkles } from 'lucide-react';
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
  const streamRef = useRef<MediaStream | null>(null);

  // For 3-option steps, we do pairwise comparison
  const isThreeOptionStep = options.length === 3;
  // Track which pair we're comparing (0 = first two, 1 = second two, etc.)
  const [comparisonPair, setComparisonPair] = useState(0);
  // Track selected option for final confirmation
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // For 3 options: pairs are [0,1] then [1,2] then [0,2] - or simpler: tournament style
  // Let's do: compare 0 vs 1, then winner vs 2
  const [roundOneWinner, setRoundOneWinner] = useState<string | null>(null);

  // Get current comparison pair for 3-option mode
  const getCurrentPair = () => {
    if (!isThreeOptionStep) return options;
    if (roundOneWinner === null) {
      // Round 1: compare first two options
      return [options[0], options[1]];
    } else {
      // Round 2: compare winner with third option
      const winner = options.find(o => o.id === roundOneWinner)!;
      return [winner, options[2]];
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 300, height: 300 }
        });
        streamRef.current = stream;
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle selection for 3-option pairwise comparison
  const handleThreeOptionSelect = (optionId: string) => {
    if (roundOneWinner === null) {
      // Round 1 complete, store winner and move to round 2
      setRoundOneWinner(optionId);
    } else {
      // Round 2 complete, this is the final selection
      onSelect(optionId);
    }
  };

  // Handle back in 3-option mode
  const handleThreeOptionBack = () => {
    if (roundOneWinner !== null) {
      // Go back to round 1
      setRoundOneWinner(null);
    } else {
      onBack();
    }
  };

  // Get current pair to display
  const currentPair = getCurrentPair();
  const leftOption = currentPair[0];
  const rightOption = currentPair[1];

  // Camera comparison layout (used for both 2-option and 3-option steps)
  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
        <button
          onClick={isThreeOptionStep ? handleThreeOptionBack : onBack}
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

      {/* Title with round indicator for 3-option */}
      <div className="px-5 pt-4 pb-2">
        <h2 className="text-lg font-semibold text-center text-foreground">
          {language === 'zh' ? titleZh : titleEn}
        </h2>
        {isThreeOptionStep && (
          <p className="text-xs text-center text-muted-foreground mt-1">
            {roundOneWinner === null 
              ? (language === 'zh' ? '第 1/2 轮比较' : 'Round 1/2')
              : (language === 'zh' ? '第 2/2 轮比较' : 'Round 2/2')
            }
          </p>
        )}
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

        {/* Selection criteria - enhanced */}
        <div className="mt-4 mb-4">
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-4 shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
                {language === 'zh' ? '选择更好一侧的标准' : 'Pick the Better Side'}
              </span>
            </div>
            
            {/* Criteria list */}
            <div className="flex flex-col gap-2.5">
              {CRITERIA.map((criterion, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {language === 'zh' ? criterion.zh : criterion.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selection buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => isThreeOptionStep ? handleThreeOptionSelect(leftOption.id) : onSelect(leftOption.id)}
            className="py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2 border-neutral-200 bg-white hover:border-neutral-900 hover:bg-neutral-50 active:scale-[0.98]"
          >
            <span className="text-sm text-foreground">
              {language === 'zh' ? leftOption.labelZh : leftOption.labelEn}
            </span>
          </button>
          <button
            onClick={() => isThreeOptionStep ? handleThreeOptionSelect(rightOption.id) : onSelect(rightOption.id)}
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

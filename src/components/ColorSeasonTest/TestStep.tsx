import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Camera, CameraOff } from 'lucide-react';
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

// Helper to determine if a color is light (for text contrast)
function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

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
    <div className="flex flex-col h-full bg-background">
      {/* Editorial Color Stripe - Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-editorial-magenta via-editorial-coral via-editorial-yellow via-editorial-cyan to-editorial-violet" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={isThreeOptionStep ? handleThreeOptionBack : onBack}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < step 
                  ? 'w-6 bg-foreground' 
                  : i === step 
                    ? 'w-4 bg-foreground/50' 
                    : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <div className="w-9" />
      </div>

      {/* Title with round indicator for 3-option */}
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-xl font-bold text-center text-foreground tracking-tight">
          {language === 'zh' ? titleZh : titleEn}
        </h2>
        {isThreeOptionStep && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              roundOneWinner === null 
                ? 'bg-foreground text-background' 
                : 'bg-muted text-muted-foreground'
            }`}>
              1
            </span>
            <div className="w-4 h-px bg-border" />
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              roundOneWinner !== null 
                ? 'bg-foreground text-background' 
                : 'bg-muted text-muted-foreground'
            }`}>
              2
            </span>
          </div>
        )}
      </div>

      {/* Camera comparison area - takes priority */}
      <div className="flex-1 flex flex-col px-4 pb-4 min-h-0">
        {/* Two cards with camera cutout - flex-1 to take most space */}
        <div className="relative flex-1 flex rounded-2xl overflow-hidden shadow-xl border-2 border-foreground/10 min-h-[260px]">
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
                className="w-28 h-36 rounded-[50%] overflow-hidden border-[3px] border-white"
                style={{
                  boxShadow: '0 8px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)'
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
                  <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground">
                    <CameraOff className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-medium">
                      {language === 'zh' ? '无法访问相机' : 'Camera unavailable'}
                    </span>
                  </div>
                )}
                {!cameraActive && !cameraError && (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Camera className="w-5 h-5 text-muted-foreground animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selection criteria - editorial style */}
        <div className="mt-3 mb-3">
          <p className="text-center text-[10px] text-muted-foreground mb-2 uppercase tracking-widest font-medium">
            {language === 'zh' ? '哪一侧让你看起来...' : 'Which side makes you look...'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {CRITERIA.map((criterion, index) => (
              <div 
                key={index}
                className="px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-semibold shadow-sm"
              >
                {language === 'zh' ? criterion.zh : criterion.en}
              </div>
            ))}
          </div>
        </div>

        {/* Selection buttons - with color indicators */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => isThreeOptionStep ? handleThreeOptionSelect(leftOption.id) : onSelect(leftOption.id)}
            className="py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 border-2 hover:scale-[1.02] active:scale-[0.98] shadow-md"
            style={{ 
              backgroundColor: leftOption.color,
              borderColor: isLightColor(leftOption.color) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
              color: isLightColor(leftOption.color) ? '#1a1a1a' : '#ffffff'
            }}
          >
            <span className="text-sm">
              {language === 'zh' ? leftOption.labelZh : leftOption.labelEn}
            </span>
          </button>
          <button
            onClick={() => isThreeOptionStep ? handleThreeOptionSelect(rightOption.id) : onSelect(rightOption.id)}
            className="py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 border-2 hover:scale-[1.02] active:scale-[0.98] shadow-md"
            style={{ 
              backgroundColor: rightOption.color,
              borderColor: isLightColor(rightOption.color) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
              color: isLightColor(rightOption.color) ? '#1a1a1a' : '#ffffff'
            }}
          >
            <span className="text-sm">
              {language === 'zh' ? rightOption.labelZh : rightOption.labelEn}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

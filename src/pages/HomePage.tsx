import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, Lightbulb } from 'lucide-react';
import colorsenseLogo from '@/assets/colorsense-logo.png';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        navigate('/picker', { state: { imageData } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50/50 to-white flex flex-col relative overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-20 safe-area-top">
        <LanguageSwitcher />
      </div>

      {/* Subtle decorative color accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-48 h-48 bg-gradient-to-bl from-violet-200/25 to-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-1/4 w-56 h-56 bg-gradient-to-tr from-amber-200/20 to-rose-200/15 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 relative z-10">
        {/* Logo & Tagline Group */}
        <div className="animate-fade-in mb-10 text-center">
          <img 
            src={colorsenseLogo} 
            alt="Color Sense Studio" 
            className="w-72 h-auto mx-auto drop-shadow-sm"
          />
          <p className="mt-4 text-base text-neutral-500 font-light tracking-wide">
            {t.tagline}
          </p>
        </div>

        {/* Main CTA Buttons - Side by Side */}
        <div className="w-full max-w-sm animate-slide-up">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCameraClick}
              className="flex flex-col items-center justify-center gap-2 py-5 px-4 bg-neutral-900 text-white rounded-2xl shadow-lg hover:bg-neutral-800 active:scale-[0.98] transition-all duration-200"
            >
              <Camera className="w-6 h-6" />
              <span className="text-sm font-medium">{t.takePhoto}</span>
            </button>

            <button
              onClick={handleGalleryClick}
              className="flex flex-col items-center justify-center gap-2 py-5 px-4 bg-white text-neutral-900 rounded-2xl shadow-lg border border-neutral-200 hover:bg-neutral-50 active:scale-[0.98] transition-all duration-200"
            >
              <Image className="w-6 h-6" />
              <span className="text-sm font-medium">{t.gallery}</span>
            </button>
          </div>
        </div>

        {/* Compact Tip */}
        <div className="mt-8 w-full max-w-sm animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-neutral-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.tip}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 px-6 safe-area-bottom relative z-10">
        <p className="text-center text-[10px] text-muted-foreground/70">
          {t.footer}
        </p>
      </footer>
    </div>
  );
}

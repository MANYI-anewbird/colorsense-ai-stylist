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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 flex flex-col relative overflow-hidden">
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

      {/* Elegant decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-gradient-to-br from-rose-200/40 to-pink-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-24 w-64 h-64 bg-gradient-to-bl from-violet-200/35 to-indigo-300/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-gradient-to-tr from-amber-200/30 to-orange-200/20 rounded-full blur-3xl" />
        
        {/* Skin tone gradient strip - subtle branding */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F5E6DC] via-[#C9A882] to-[#5C3D2E] opacity-40" />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10">
        {/* Logo & Hero Text */}
        <div className="animate-fade-in mb-8 text-center max-w-sm">
          <img 
            src={colorsenseLogo} 
            alt="Color Sense Studio" 
            className="w-64 h-auto mx-auto drop-shadow-md"
          />
          <h1 className="mt-6 text-xl font-semibold text-foreground tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Feature highlights - Visual preview of what the app does */}
        <div className="w-full max-w-xs mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-center gap-1">
            {/* Skin tone preview dots */}
            {['#F5E6DC', '#E5C9AB', '#C9A882', '#A67C52', '#6B4423'].map((color, i) => (
              <div
                key={color}
                className="w-6 h-6 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110"
                style={{ backgroundColor: color, marginLeft: i > 0 ? '-8px' : 0, zIndex: 5 - i }}
              />
            ))}
            <span className="ml-3 text-xs text-muted-foreground">10+ {t.skinToneMatch?.split(' ')[0] || 'Skin Tones'}</span>
          </div>
        </div>

        {/* Main CTA Buttons */}
        <div className="w-full max-w-sm animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCameraClick}
              className="group flex flex-col items-center justify-center gap-3 py-6 px-4 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:from-neutral-800 hover:to-neutral-700 active:scale-[0.98] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold tracking-wide">{t.takePhoto}</span>
            </button>

            <button
              onClick={handleGalleryClick}
              className="group flex flex-col items-center justify-center gap-3 py-6 px-4 bg-white text-neutral-900 rounded-2xl shadow-xl border border-neutral-200/80 hover:shadow-2xl hover:border-neutral-300 active:scale-[0.98] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-50 to-violet-50 flex items-center justify-center group-hover:from-rose-100 group-hover:to-violet-100 transition-colors">
                <Image className="w-6 h-6 text-neutral-700" />
              </div>
              <span className="text-sm font-semibold tracking-wide">{t.gallery}</span>
            </button>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="mt-8 w-full max-w-sm animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-amber-50/80 to-orange-50/60 backdrop-blur-sm rounded-xl border border-amber-200/50">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Lightbulb className="w-4.5 h-4.5 text-white" />
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed font-medium">
              {t.tip}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-5 px-6 safe-area-bottom relative z-10">
        <p className="text-center text-[11px] text-muted-foreground/60 font-medium tracking-wide">
          {t.footer}
        </p>
      </footer>
    </div>
  );
}

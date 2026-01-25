import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, Lightbulb, Palette, Sparkles } from 'lucide-react';
import taglineImage from '@/assets/tagline.png';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { SkinToneSelector } from '@/components/SkinToneSelector';
import { SkinToneBadge } from '@/components/SkinToneBadge';
import { useSkinTone } from '@/contexts/SkinToneContext';

export default function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useLanguage();
  const { skinTone } = useSkinTone();

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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Top Navigation Bar */}
      <div className="bg-foreground safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Skin Tone Badge - Left */}
          <div className="flex items-center">
            {skinTone ? (
              <SkinToneBadge showLabel={true} size="sm" variant="dark" />
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Palette className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs text-white/60 font-medium">
                  {language === 'zh' ? '选择肤色' : 'Set skin tone'}
                </span>
              </div>
            )}
          </div>
          
          {/* Language Switcher - Right */}
          <LanguageSwitcher variant="dark" />
        </div>
        {/* Subtle bottom accent line */}
        <div className="h-0.5 bg-gradient-to-r from-editorial-magenta via-editorial-yellow to-editorial-cyan opacity-60" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-5 py-2 relative z-10 min-h-0">
        {/* Logo */}
        <div className="animate-fade-in text-center flex-shrink-0">
          <img 
            src="/brand/logo-source.png" 
            alt="Color Sense Studio" 
            className="block w-72 max-w-full h-auto mx-auto drop-shadow-sm object-contain"
          />
        </div>

        {/* Tagline */}
        <div className="mb-2 animate-slide-up-color">
          <img 
            src={taglineImage} 
            alt={t.tagline}
            className="w-60 h-auto mx-auto"
          />
        </div>

        {/* Color Bar */}
        <div className="w-full max-w-xs mb-3 animate-slide-up-color">
          <div className="grid grid-cols-5 h-2 rounded-full overflow-hidden shadow-sm">
            <div className="bg-editorial-magenta" />
            <div className="bg-editorial-coral" />
            <div className="bg-editorial-yellow" />
            <div className="bg-editorial-cyan" />
            <div className="bg-editorial-violet" />
          </div>
        </div>

        {/* Main CTA Buttons */}
        <div className="w-full max-w-sm animate-slide-up-color" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCameraClick}
              className="group relative flex flex-col items-center justify-center gap-2 py-10 px-3 bg-foreground text-background rounded-xl overflow-hidden tap-color-feedback"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-editorial-magenta via-editorial-coral to-editorial-yellow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Camera className="w-7 h-7 relative z-10" />
              <span className="text-base font-semibold relative z-10">{t.takePhoto}</span>
            </button>

            <button
              onClick={handleGalleryClick}
              className="group relative flex flex-col items-center justify-center gap-2 py-10 px-3 bg-background text-foreground rounded-xl border-2 border-foreground overflow-hidden tap-color-feedback"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-editorial-cyan via-editorial-violet to-editorial-magenta opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image className="w-6 h-6 relative z-10 group-hover:text-white transition-colors duration-300" />
              <span className="text-sm font-semibold relative z-10 group-hover:text-white transition-colors duration-300">{t.gallery}</span>
            </button>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-3 w-full max-w-sm animate-slide-up-color" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-editorial-yellow/10 rounded-lg border border-editorial-yellow/20">
            <div className="w-5 h-5 rounded-md bg-editorial-yellow flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-3 h-3 text-foreground" />
            </div>
            <p className="text-[10px] text-foreground/70 leading-snug font-medium">
              {t.tip}
            </p>
          </div>
        </div>

        {/* Skin Tone Selector */}
        <div className="mt-2 w-full max-w-sm animate-slide-up-color" style={{ animationDelay: '0.3s' }}>
          <div className="bg-card rounded-xl border border-border p-4 shadow-card hover-glow">
            <SkinToneSelector />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-1.5 px-6 safe-area-bottom relative z-10">
        <div className="h-0.5 mb-1.5 bg-gradient-to-r from-editorial-magenta via-editorial-yellow to-editorial-cyan opacity-40 rounded-full" />
        <p className="text-center text-[10px] text-muted-foreground">
          {t.footer}
        </p>
      </footer>
    </div>
  );
}

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

      {/* Top accent removed per user request */}

      {/* Top Bar - Skin Tone Badge (Left) & Language Switcher (Right) */}
      <div className="absolute top-6 left-4 right-4 z-20 safe-area-top flex items-center justify-between">
        {/* Skin Tone Badge - Left */}
        <div className="flex items-center">
          {skinTone ? (
            <SkinToneBadge showLabel={true} size="sm" />
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/5 backdrop-blur-sm rounded-full">
              <Palette className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium">
                {language === 'zh' ? '未设置肤色' : 'No skin tone'}
              </span>
            </div>
          )}
        </div>
        
        {/* Language Switcher - Right */}
        <LanguageSwitcher />
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col items-center px-5 py-8 pt-24 relative z-10 overflow-y-auto min-h-0">
        {/* Logo & Tagline Group - flex-shrink-0 so logo is never clipped */}
        <div className="animate-fade-in mb-4 text-center flex-shrink-0 overflow-visible">
          <img 
            src="/brand/logo-source.png" 
            alt="Color Sense Studio" 
            className="block w-80 max-w-full h-auto mx-auto drop-shadow-sm object-contain"
          />
        </div>

        {/* Tagline - above color bar */}
        <div className="mb-1 animate-slide-up-color">
          <img 
            src={taglineImage} 
            alt={t.tagline}
            className="w-72 h-auto mx-auto"
          />
        </div>

        {/* Editorial Hero Section - Color Blocks */}
        <div className="w-full max-w-sm mb-5 animate-slide-up-color">
          <div className="grid grid-cols-5 h-3 rounded-full overflow-hidden shadow-sm">
            <div className="bg-editorial-magenta" />
            <div className="bg-editorial-coral" />
            <div className="bg-editorial-yellow" />
            <div className="bg-editorial-cyan" />
            <div className="bg-editorial-violet" />
          </div>
        </div>

        {/* Main CTA Buttons - Editorial Style */}
        <div className="w-full max-w-sm animate-slide-up-color" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCameraClick}
              className="group relative flex flex-col items-center justify-center gap-3 py-10 px-4 bg-foreground text-background rounded-2xl overflow-hidden tap-color-feedback"
            >
              {/* Hover color overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-editorial-magenta via-editorial-coral to-editorial-yellow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Camera className="w-8 h-8 relative z-10" />
              <span className="text-base font-semibold relative z-10">{t.takePhoto}</span>
            </button>

            <button
              onClick={handleGalleryClick}
              className="group relative flex flex-col items-center justify-center gap-3 py-10 px-4 bg-background text-foreground rounded-2xl border-2 border-foreground overflow-hidden tap-color-feedback"
            >
              {/* Hover color overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-editorial-cyan via-editorial-violet to-editorial-magenta opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="absolute inset-0 text-white" />
              </div>
              <Image className="w-8 h-8 relative z-10 group-hover:text-white transition-colors duration-300" />
              <span className="text-base font-semibold relative z-10 group-hover:text-white transition-colors duration-300">{t.gallery}</span>
            </button>
          </div>
        </div>

        {/* Skin Tone Selector Section - Editorial Card */}
        <div className="mt-5 w-full max-w-sm animate-slide-up-color" style={{ animationDelay: '0.2s' }}>
          <div className="bg-card rounded-2xl border border-border p-4 shadow-card hover-glow">
            <SkinToneSelector />
          </div>
        </div>

        {/* Compact Tip - Editorial accent */}
        <div className="mt-3 w-full max-w-sm animate-slide-up-color" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2.5 px-3 py-2 bg-editorial-yellow/10 rounded-lg border border-editorial-yellow/20">
            <div className="w-6 h-6 rounded-md bg-editorial-yellow flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-foreground" />
            </div>
            <p className="text-[11px] text-foreground/70 leading-snug font-medium">
              {t.tip}
            </p>
          </div>
        </div>
      </div>

      {/* Footer with color accent */}
      <footer className="py-4 px-6 safe-area-bottom relative z-10">
        <div className="color-stripe mb-3 h-0.5 opacity-50" />
        <p className="text-center text-[10px] text-muted-foreground">
          {t.footer}
        </p>
      </footer>
    </div>
  );
}

import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, Sparkles, Sun, Heart } from 'lucide-react';
import { ColorButton } from '@/components/ui/color-button';

export default function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Decorative gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-beauty-rose/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-5 w-40 h-40 bg-beauty-lavender/15 rounded-full blur-3xl" />
          <div className="absolute bottom-32 left-20 w-28 h-28 bg-beauty-coral/20 rounded-full blur-3xl" />
        </div>

        {/* Logo / Brand */}
        <div className="animate-fade-in mb-8 relative z-10">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-beauty-rose via-beauty-coral to-beauty-lavender flex items-center justify-center shadow-elevated mb-6 mx-auto">
            <Heart className="w-12 h-12 text-white fill-white/30" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-beauty-rose via-beauty-coral to-beauty-lavender bg-clip-text text-transparent text-center tracking-tight">
            ColorSense
          </h1>
          <p className="text-muted-foreground text-center mt-2 text-lg">
            Discover your perfect palette
          </p>
        </div>

        {/* Main CTA Buttons - Black/White Style */}
        <div className="w-full max-w-sm space-y-4 animate-slide-up relative z-10">
          <ColorButton
            variant="camera"
            size="xl"
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800 border-0 shadow-elevated"
            onClick={handleCameraClick}
          >
            <Camera className="w-6 h-6" />
            Take Photo
          </ColorButton>

          <ColorButton
            variant="gallery"
            size="lg"
            className="w-full bg-white border-2 border-neutral-200 text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300"
            onClick={handleGalleryClick}
          >
            <Image className="w-5 h-5" />
            Upload from Gallery
          </ColorButton>
        </div>

        {/* Tip Card */}
        <div className="mt-12 w-full max-w-sm animate-fade-in relative z-10" style={{ animationDelay: '0.2s' }}>
          <div className="glass-card rounded-2xl p-5 border border-beauty-blush/50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-beauty-peach to-beauty-coral/40 flex items-center justify-center flex-shrink-0">
                <Sun className="w-5 h-5 text-beauty-coral" />
              </div>
              <div>
                <p className="font-medium text-foreground">Beauty Tip</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  For best results, use natural daylight and avoid harsh shadows on your clothing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-6 safe-area-bottom relative z-10">
        <p className="text-center text-xs text-muted-foreground">
          ✨ AI-powered beauty color analysis
        </p>
      </footer>
    </div>
  );
}

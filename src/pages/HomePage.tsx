import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, Lightbulb } from 'lucide-react';
import { ColorButton } from '@/components/ui/color-button';
import colorsenseLogo from '@/assets/colorsense-logo.png';

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
        {/* Logo */}
        <div className="animate-fade-in mb-8 relative z-10">
          <img 
            src={colorsenseLogo} 
            alt="Color Sense Studio" 
            className="w-64 h-auto mx-auto"
          />
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
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Pro Tip</p>
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

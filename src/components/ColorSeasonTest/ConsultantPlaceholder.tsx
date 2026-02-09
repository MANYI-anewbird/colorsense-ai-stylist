import React, { useState } from 'react';
import { ArrowLeft, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookCallForm } from './BookCallForm';
import { FindNearbyPlaceholder } from './FindNearbyPlaceholder';

interface ConsultantPlaceholderProps {
  onBack: () => void;
}

type Screen = 'options' | 'book-call' | 'find-nearby';

export function ConsultantPlaceholder({ onBack }: ConsultantPlaceholderProps) {
  const { language } = useLanguage();
  const [screen, setScreen] = useState<Screen>('options');

  if (screen === 'book-call') {
    return <BookCallForm onBack={() => setScreen('options')} />;
  }

  if (screen === 'find-nearby') {
    return <FindNearbyPlaceholder onBack={() => setScreen('options')} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <h1 className="ml-2 text-lg font-semibold text-foreground">
          Color Consultant
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pt-4">
        <p className="text-sm text-muted-foreground text-center mb-6">
          Choose how you would like to connect with a professional color consultant
        </p>

        {/* Options */}
        <div className="space-y-3">
          {/* Book a Call */}
          <button
            onClick={() => setScreen('book-call')}
            className="w-full flex items-center gap-4 p-4 bg-white border-2 border-neutral-200 rounded-2xl hover:border-neutral-400 hover:bg-neutral-50 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-0.5">
                Book a Call
              </h3>
              <p className="text-xs text-muted-foreground">
                Fill in your available time and we will call you back
              </p>
            </div>
          </button>

          {/* Find Nearby */}
          <button
            onClick={() => setScreen('find-nearby')}
            className="w-full flex items-center gap-4 p-4 bg-white border-2 border-neutral-200 rounded-2xl hover:border-neutral-400 hover:bg-neutral-50 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-0.5">
                Find Nearby
              </h3>
              <p className="text-xs text-muted-foreground">
                Discover professional consultants near you
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Spacer */}
      <div className="h-8" />
    </div>
  );
}

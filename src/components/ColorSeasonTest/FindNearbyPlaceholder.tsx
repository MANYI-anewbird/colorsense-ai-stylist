import React from 'react';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FindNearbyPlaceholderProps {
  onBack: () => void;
}

export function FindNearbyPlaceholder({ onBack }: FindNearbyPlaceholderProps) {
  const { language } = useLanguage();

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
          Find Nearby
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-neutral-400" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-foreground mb-3 text-center">
          Color Consultant
        </h2>

        {/* Coming Soon Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium mb-6">
          <Clock className="w-3.5 h-3.5" />
          Coming Soon
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-xs">
          We are building local consultant connections. Stay tuned!
        </p>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-neutral-50 rounded-xl">
          <p className="text-xs text-muted-foreground text-center">
            Professional consultants provide the most accurate personal color analysis through in-person sessions.
          </p>
        </div>
      </div>

      {/* Footer Spacer */}
      <div className="h-8" />
    </div>
  );
}

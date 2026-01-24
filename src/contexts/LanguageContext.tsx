import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface Translations {
  tagline: string;
  takePhoto: string;
  gallery: string;
  tip: string;
  footer: string;
  language: string;
}

const translations: Record<Language, Translations> = {
  en: {
    tagline: 'Snap a photo. Understand your colors.',
    takePhoto: 'Take Photo',
    gallery: 'Gallery',
    tip: 'Use natural daylight for best color accuracy',
    footer: 'AI-powered professional color analysis',
    language: 'Language',
  },
  zh: {
    tagline: '拍张照片，了解你的色彩',
    takePhoto: '拍照',
    gallery: '相册',
    tip: '使用自然光以获得最佳色彩准确度',
    footer: 'AI驱动的专业色彩分析',
    language: '语言',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

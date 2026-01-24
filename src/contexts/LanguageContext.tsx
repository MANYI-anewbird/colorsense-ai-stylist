import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'zh';

interface Translations {
  // HomePage
  tagline: string;
  takePhoto: string;
  gallery: string;
  tip: string;
  footer: string;
  heroTitle: string;
  heroSubtitle: string;
  
  // PickerPage
  selectColor: string;
  analyzing: string;
  analyzeColor: string;
  imageNotReady: string;
  analyzeFailed: string;
  pickerInstruction: string;
  selectedColor: string;
  
  // ResultPage
  colorAnalysis: string;
  colorMetrics: string;
  lightness: string;
  saturation: string;
  colorClassification: string;
  temperature: string;
  seasonalTendency: string;
  analyzeAnother: string;
  skinToneMatch: string;
  bestMatch: string;
  colorValues: string;
  
  // Seasons
  spring: string;
  summer: string;
  autumn: string;
  winter: string;
  
  // Temperature
  warm: string;
  cool: string;
  neutral: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // HomePage
    tagline: 'Clothing Color Analysis & Skin Tone Matching',
    takePhoto: 'Take Photo',
    gallery: 'Gallery',
    tip: 'Use natural daylight for best color accuracy',
    footer: 'AI-powered professional color analysis',
    heroTitle: 'Find Your Perfect Colors',
    heroSubtitle: 'Analyze clothing colors and discover which skin tones they complement best',
    
    // PickerPage
    selectColor: 'Select Color',
    analyzing: 'Analyzing...',
    analyzeColor: 'Analyze Color',
    imageNotReady: 'Image not ready. Please try again.',
    analyzeFailed: 'Failed to analyze color. Please try again.',
    pickerInstruction: 'Drag the picker to select a color from your clothing',
    selectedColor: 'Selected Color',
    
    // ResultPage
    colorAnalysis: 'Color Analysis',
    colorMetrics: 'Color Metrics',
    lightness: 'Lightness',
    saturation: 'Saturation',
    colorClassification: 'Color Classification',
    temperature: 'Temperature',
    seasonalTendency: 'Seasonal Tendency',
    analyzeAnother: 'Analyze Another Color',
    skinToneMatch: 'Skin Tone Compatibility',
    bestMatch: 'Best Matches',
    colorValues: 'Color Values',
    
    // Seasons
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    winter: 'Winter',
    
    // Temperature
    warm: 'Warm',
    cool: 'Cool',
    neutral: 'Neutral',
  },
  zh: {
    // HomePage
    tagline: '服装颜色分析 & 肤色匹配',
    takePhoto: '拍照',
    gallery: '相册',
    tip: '使用自然光以获得最佳色彩准确度',
    footer: 'AI驱动的专业色彩分析',
    heroTitle: '找到你的完美色彩',
    heroSubtitle: '分析服装颜色，发现最适合的肤色搭配',
    
    // PickerPage
    selectColor: '选择颜色',
    analyzing: '分析中...',
    analyzeColor: '分析颜色',
    imageNotReady: '图片未准备好，请重试',
    analyzeFailed: '颜色分析失败，请重试',
    pickerInstruction: '拖动选择器从服装上选取颜色',
    selectedColor: '已选颜色',
    
    // ResultPage
    colorAnalysis: '颜色分析',
    colorMetrics: '颜色指标',
    lightness: '明度',
    saturation: '饱和度',
    colorClassification: '颜色分类',
    temperature: '色温',
    seasonalTendency: '季节倾向',
    analyzeAnother: '分析另一个颜色',
    skinToneMatch: '肤色匹配度',
    bestMatch: '最佳匹配',
    colorValues: '颜色数值',
    
    // Seasons
    spring: '春季型',
    summer: '夏季型',
    autumn: '秋季型',
    winter: '冬季型',
    
    // Temperature
    warm: '暖色调',
    cool: '冷色调',
    neutral: '中性色调',
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

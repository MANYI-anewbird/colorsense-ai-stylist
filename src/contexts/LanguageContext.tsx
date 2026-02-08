import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface Translations {
  // HomePage
  tagline: string;
  takePhoto: string;
  gallery: string;
  tip: string;
  footer: string;
  
  // PickerPage
  selectColor: string;
  pickerInstruction: string;
  analyzing: string;
  analyzeColor: string;
  imageNotReady: string;
  analyzeFailed: string;
  
  // ResultPage
  colorAnalysis: string;
  colorMetrics: string;
  lightness: string;
  saturation: string;
  colorClassification: string;
  temperature: string;
  seasonalTendency: string;
  analyzeAnother: string;
  thisLooksWrong: string;
  requestingAI: string;
  
  // Seasons
  spring: string;
  summer: string;
  autumn: string;
  winter: string;
  
  // Temperature
  warm: string;
  cool: string;
  neutral: string;
  neutralWarm: string;
  neutralCool: string;

  // Auth / Account
  account: string;
  login: string;
  signOut: string;
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  confirmPassword: string;
  passwordTooShort: string;
  passwordMismatch: string;
  loginRequired: string;
  loginToUnlock: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // HomePage
    tagline: 'Snap a photo. Understand your colors.',
    takePhoto: 'Take Photo',
    gallery: 'Gallery',
    tip: 'Use natural daylight for best color accuracy',
    footer: 'AI-powered professional color analysis',
    
    // PickerPage
    selectColor: 'Select Color',
    pickerInstruction: 'Click or drag on the image to pick a color from any part (e.g. shirt, scarf)',
    analyzing: 'Analyzing...',
    analyzeColor: 'Analyze Color',
    imageNotReady: 'Image not ready. Please try again.',
    analyzeFailed: 'Failed to analyze color. Please try again.',
    
    // ResultPage
    colorAnalysis: 'Color Analysis',
    colorMetrics: 'Color Metrics',
    lightness: 'Lightness',
    saturation: 'Saturation',
    colorClassification: 'Color Classification',
    temperature: 'Temperature',
    seasonalTendency: 'Seasonal Tendency',
    analyzeAnother: 'Analyze Another Color',
    thisLooksWrong: 'This looks wrong',
    requestingAI: 'Requesting AI analysis...',
    
    // Seasons
    spring: 'Spring',
    summer: 'Summer',
    autumn: 'Autumn',
    winter: 'Winter',
    
    // Temperature
    warm: 'Warm',
    cool: 'Cool',
    neutral: 'Neutral',
    neutralWarm: 'Neutral-Warm',
    neutralCool: 'Neutral-Cool',

    account: 'Account',
    login: 'Login',
    signOut: 'Sign out',
    signIn: 'Sign in',
    signUp: 'Sign up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    loginRequired: 'Login required',
    loginToUnlock: 'Please log in or sign up to use the color analysis features.',
  },
  zh: {
    // HomePage
    tagline: '拍张照片，了解你的色彩',
    takePhoto: '拍照',
    gallery: '相册',
    tip: '使用自然光以获得最佳色彩准确度',
    footer: 'AI驱动的专业色彩分析',
    
    // PickerPage
    selectColor: '选择颜色',
    pickerInstruction: '在图片上点击或拖动，从任意部位（如上衣、围巾）取色',
    analyzing: '分析中...',
    analyzeColor: '分析颜色',
    imageNotReady: '图片未准备好，请重试',
    analyzeFailed: '颜色分析失败，请重试',
    
    // ResultPage
    colorAnalysis: '颜色分析',
    colorMetrics: '颜色指标',
    lightness: '明度',
    saturation: '饱和度',
    colorClassification: '颜色分类',
    temperature: '色温',
    seasonalTendency: '季节倾向',
    analyzeAnother: '分析另一个颜色',
    thisLooksWrong: '这个看起来不对',
    requestingAI: '正在请求AI分析...',
    
    // Seasons
    spring: '春季型',
    summer: '夏季型',
    autumn: '秋季型',
    winter: '冬季型',
    
    // Temperature
    warm: '暖色调',
    cool: '冷色调',
    neutral: '中性色调',
    neutralWarm: '中性偏暖',
    neutralCool: '中性偏冷',

    account: '账号',
    login: '登录',
    signOut: '退出登录',
    signIn: '登录',
    signUp: '注册',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    passwordTooShort: '密码至少需要6个字符',
    passwordMismatch: '两次输入的密码不一致',
    loginRequired: '需要登录',
    loginToUnlock: '请登录或注册以使用色彩分析功能。',
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

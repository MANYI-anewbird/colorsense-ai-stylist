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
  freeLimitReached: string;
  welcomeBack: string;
  createAccountSubtitle: string;
  signupSuccessTitle: string;
  signupSuccessMessage: string;
  gotIt: string;
  forgotPassword: string;
  forgotPasswordSubtitle: string;
  sendResetLink: string;
  resetEmailSentTitle: string;
  resetEmailSentMessage: string;
  backToSignIn: string;
  setNewPassword: string;
  setNewPasswordSubtitle: string;
  updatePassword: string;
  resetLinkInvalid: string;
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
    freeLimitReached: "You've used your 3 free analyses. Sign in to continue.",
    welcomeBack: 'Welcome back! Please sign in to continue.',
    createAccountSubtitle: 'Create an account to get started.',
    signupSuccessTitle: "You're almost there!",
    signupSuccessMessage: "We've sent a confirmation link to your email. Please check your inbox and click the link to activate your account, then you can sign in.",
    gotIt: 'Got it',
    forgotPassword: 'Forgot password?',
    forgotPasswordSubtitle: "Enter your email and we'll send you a link to reset your password.",
    sendResetLink: 'Send reset link',
    resetEmailSentTitle: 'Check your email',
    resetEmailSentMessage: "We've sent a password reset link to your email. Click the link to set a new password.",
    backToSignIn: 'Back to sign in',
    setNewPassword: 'Set new password',
    setNewPasswordSubtitle: 'Enter your new password below.',
    updatePassword: 'Update password',
    resetLinkInvalid: 'This link is invalid or has expired. Please request a new password reset.',
  },
  zh: {
    // HomePage (English for all)
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
    freeLimitReached: "You've used your 3 free analyses. Sign in to continue.",
    welcomeBack: 'Welcome back! Please sign in to continue.',
    createAccountSubtitle: 'Create an account to get started.',
    signupSuccessTitle: "You're almost there!",
    signupSuccessMessage: "We've sent a confirmation link to your email. Please check your inbox and click the link to activate your account, then you can sign in.",
    gotIt: 'Got it',
    forgotPassword: 'Forgot password?',
    forgotPasswordSubtitle: "Enter your email and we'll send you a link to reset your password.",
    sendResetLink: 'Send reset link',
    resetEmailSentTitle: 'Check your email',
    resetEmailSentMessage: "We've sent a password reset link to your email. Click the link to set a new password.",
    backToSignIn: 'Back to sign in',
    setNewPassword: 'Set new password',
    setNewPasswordSubtitle: 'Enter your new password below.',
    updatePassword: 'Update password',
    resetLinkInvalid: 'This link is invalid or has expired. Please request a new password reset.',
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

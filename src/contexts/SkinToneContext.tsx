import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SkinToneType = 
  | 'spring-light' 
  | 'spring-true' 
  | 'spring-bright'
  | 'summer-light' 
  | 'summer-true' 
  | 'summer-soft'
  | 'autumn-soft' 
  | 'autumn-true' 
  | 'autumn-deep'
  | 'winter-bright' 
  | 'winter-true' 
  | 'winter-deep'
  | null;

export interface SkinToneInfo {
  id: SkinToneType;
  nameEn: string;
  nameZh: string;
  color: string; // hex color representing this skin tone type
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  characteristics: {
    temperature: 'warm' | 'cool';
    depth: 'light' | 'medium' | 'deep';
    chroma: 'bright' | 'soft' | 'true';
  };
}

export const SKIN_TONES: SkinToneInfo[] = [
  // Spring types (Warm)
  {
    id: 'spring-light',
    nameEn: 'Light Spring',
    nameZh: '浅春型',
    color: '#FFE5B4',
    season: 'spring',
    characteristics: { temperature: 'warm', depth: 'light', chroma: 'bright' }
  },
  {
    id: 'spring-true',
    nameEn: 'True Spring',
    nameZh: '正春型',
    color: '#FFDAB9',
    season: 'spring',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'spring-bright',
    nameEn: 'Bright Spring',
    nameZh: '亮春型',
    color: '#FFD27F',
    season: 'spring',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'bright' }
  },
  // Summer types (Cool)
  {
    id: 'summer-light',
    nameEn: 'Light Summer',
    nameZh: '浅夏型',
    color: '#E8D4D4',
    season: 'summer',
    characteristics: { temperature: 'cool', depth: 'light', chroma: 'soft' }
  },
  {
    id: 'summer-true',
    nameEn: 'True Summer',
    nameZh: '正夏型',
    color: '#D4C4C4',
    season: 'summer',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'summer-soft',
    nameEn: 'Soft Summer',
    nameZh: '柔夏型',
    color: '#C9B8B8',
    season: 'summer',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'soft' }
  },
  // Autumn types (Warm)
  {
    id: 'autumn-soft',
    nameEn: 'Soft Autumn',
    nameZh: '柔秋型',
    color: '#D4B896',
    season: 'autumn',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'soft' }
  },
  {
    id: 'autumn-true',
    nameEn: 'True Autumn',
    nameZh: '正秋型',
    color: '#C4A882',
    season: 'autumn',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'autumn-deep',
    nameEn: 'Deep Autumn',
    nameZh: '深秋型',
    color: '#A68B5B',
    season: 'autumn',
    characteristics: { temperature: 'warm', depth: 'deep', chroma: 'true' }
  },
  // Winter types (Cool)
  {
    id: 'winter-bright',
    nameEn: 'Bright Winter',
    nameZh: '亮冬型',
    color: '#D4C4D4',
    season: 'winter',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'bright' }
  },
  {
    id: 'winter-true',
    nameEn: 'True Winter',
    nameZh: '正冬型',
    color: '#B4A4B4',
    season: 'winter',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'winter-deep',
    nameEn: 'Deep Winter',
    nameZh: '深冬型',
    color: '#8B7355',
    season: 'winter',
    characteristics: { temperature: 'cool', depth: 'deep', chroma: 'true' }
  },
];

interface SkinToneContextType {
  skinTone: SkinToneType;
  setSkinTone: (tone: SkinToneType) => void;
  getSkinToneInfo: (tone: SkinToneType) => SkinToneInfo | undefined;
}

const SkinToneContext = createContext<SkinToneContextType | undefined>(undefined);

const STORAGE_KEY = 'colorsense-skin-tone';

export function SkinToneProvider({ children }: { children: ReactNode }) {
  const [skinTone, setSkinToneState] = useState<SkinToneType>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (stored as SkinToneType) : null;
  });

  const setSkinTone = (tone: SkinToneType) => {
    setSkinToneState(tone);
    if (tone) {
      localStorage.setItem(STORAGE_KEY, tone);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const getSkinToneInfo = (tone: SkinToneType): SkinToneInfo | undefined => {
    return SKIN_TONES.find(t => t.id === tone);
  };

  return (
    <SkinToneContext.Provider value={{ skinTone, setSkinTone, getSkinToneInfo }}>
      {children}
    </SkinToneContext.Provider>
  );
}

export function useSkinTone() {
  const context = useContext(SkinToneContext);
  if (context === undefined) {
    throw new Error('useSkinTone must be used within a SkinToneProvider');
  }
  return context;
}

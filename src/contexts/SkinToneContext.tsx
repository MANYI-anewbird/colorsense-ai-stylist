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
  color: string; // single representative color from reference chart
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  characteristics: {
    temperature: 'warm' | 'cool';
    depth: 'light' | 'medium' | 'deep';
    chroma: 'bright' | 'soft' | 'true';
  };
}

export const SKIN_TONES: SkinToneInfo[] = [
  // Spring types - colors from user-provided swatches
  {
    id: 'spring-light',
    nameEn: 'Light Spring',
    nameZh: '浅春型',
    color: '#979996', // 图一
    season: 'spring',
    characteristics: { temperature: 'warm', depth: 'light', chroma: 'bright' }
  },
  {
    id: 'spring-true',
    nameEn: 'Warm Spring',
    nameZh: '暖春型',
    color: '#C8B090', // warm tan/beige from image 2
    season: 'spring',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'spring-bright',
    nameEn: 'Clear Spring',
    nameZh: '净春型',
    color: '#D4B870', // golden yellow from image 3
    season: 'spring',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'bright' }
  },
  // Summer types - colors from reference chart circles
  {
    id: 'summer-light',
    nameEn: 'Light Summer',
    nameZh: '浅夏型',
    color: '#99A4B8', // 图二
    season: 'summer',
    characteristics: { temperature: 'cool', depth: 'light', chroma: 'soft' }
  },
  {
    id: 'summer-true',
    nameEn: 'Cool Summer',
    nameZh: '冷夏型',
    color: '#99A4B8', // 图四
    season: 'summer',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'summer-soft',
    nameEn: 'Soft Summer',
    nameZh: '柔夏型',
    color: '#BFC3C2', // 图三
    season: 'summer',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'soft' }
  },
  // Autumn types - colors from reference chart circles
  {
    id: 'autumn-soft',
    nameEn: 'Soft Autumn',
    nameZh: '柔秋型',
    color: '#A5A09C', // 图一
    season: 'autumn',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'soft' }
  },
  {
    id: 'autumn-true',
    nameEn: 'Warm Autumn',
    nameZh: '暖秋型',
    color: '#8D6960', // 图二
    season: 'autumn',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'autumn-deep',
    nameEn: 'Deep Autumn',
    nameZh: '深秋型',
    color: '#5E4C4C', // 图三
    season: 'autumn',
    characteristics: { temperature: 'warm', depth: 'deep', chroma: 'true' }
  },
  // Winter types
  {
    id: 'winter-bright',
    nameEn: 'Clear Winter',
    nameZh: '净冬型',
    color: '#98A1E0', // 图一
    season: 'winter',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'bright' }
  },
  {
    id: 'winter-true',
    nameEn: 'Cool Winter',
    nameZh: '冷冬型',
    color: '#7381A1', // 图二
    season: 'winter',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'winter-deep',
    nameEn: 'Deep Winter',
    nameZh: '深冬型',
    color: '#534D59', // 图三
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
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (stored as SkinToneType) : null;
    } catch {
      return null;
    }
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

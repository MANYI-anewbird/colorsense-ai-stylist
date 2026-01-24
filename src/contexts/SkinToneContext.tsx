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
  palette: string[]; // array of 4-5 hex colors representing this color season
  primaryColor: string; // main representative color for badges/indicators
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  characteristics: {
    temperature: 'warm' | 'cool';
    depth: 'light' | 'medium' | 'deep';
    chroma: 'bright' | 'soft' | 'true';
  };
}

export const SKIN_TONES: SkinToneInfo[] = [
  // Spring types (Warm, fresh, light to bright)
  {
    id: 'spring-light',
    nameEn: 'Light Spring',
    nameZh: '浅春型',
    palette: ['#F5EED6', '#E8E4C9', '#D4E2C8', '#F2D9C4', '#C9D9B8'], // creamy, pale yellow-green, soft peach, sage
    primaryColor: '#D4E2C8',
    season: 'spring',
    characteristics: { temperature: 'warm', depth: 'light', chroma: 'bright' }
  },
  {
    id: 'spring-true',
    nameEn: 'Warm Spring',
    nameZh: '暖春型',
    palette: ['#F5C842', '#E8A832', '#F2B056', '#D4A843', '#E89838'], // warm yellow, golden, coral orange
    primaryColor: '#F5C842',
    season: 'spring',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'spring-bright',
    nameEn: 'Clear Spring',
    nameZh: '净春型',
    palette: ['#F5D062', '#E8B84A', '#F08850', '#5EB86A', '#E25C48'], // bright golden, clear coral, fresh green
    primaryColor: '#E8B84A',
    season: 'spring',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'bright' }
  },
  // Summer types (Cool, muted, soft)
  {
    id: 'summer-light',
    nameEn: 'Light Summer',
    nameZh: '浅夏型',
    palette: ['#B8D4E8', '#C8D8E8', '#D4E0F0', '#E0E8F0', '#A8C8E0'], // light cool blue, soft lavender, pale grey-blue
    primaryColor: '#B8D4E8',
    season: 'summer',
    characteristics: { temperature: 'cool', depth: 'light', chroma: 'soft' }
  },
  {
    id: 'summer-true',
    nameEn: 'Cool Summer',
    nameZh: '冷夏型',
    palette: ['#9B8EC2', '#A8A0C8', '#8888B0', '#B0A0C0', '#7888A8'], // cool dusty blue, lavender, muted purple
    primaryColor: '#9B8EC2',
    season: 'summer',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'summer-soft',
    nameEn: 'Soft Summer',
    nameZh: '柔夏型',
    palette: ['#B8C8B0', '#A8B8A8', '#C0C8B8', '#98A898', '#D0D8C8'], // very muted sage, dusty olive-grey, greyed tones
    primaryColor: '#B8C8B0',
    season: 'summer',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'soft' }
  },
  // Autumn types (Warm, earthy, muted to deep)
  {
    id: 'autumn-soft',
    nameEn: 'Soft Autumn',
    nameZh: '柔秋型',
    palette: ['#D4C4A8', '#C8B898', '#B8A888', '#C0B090', '#A89878'], // muted beige, taupe, soft olive, dusty warm
    primaryColor: '#D4C4A8',
    season: 'autumn',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'soft' }
  },
  {
    id: 'autumn-true',
    nameEn: 'Warm Autumn',
    nameZh: '暖秋型',
    palette: ['#D87848', '#C86838', '#E08850', '#B85828', '#D06030'], // burnt orange, terracotta, caramel, rust
    primaryColor: '#D87848',
    season: 'autumn',
    characteristics: { temperature: 'warm', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'autumn-deep',
    nameEn: 'Deep Autumn',
    nameZh: '深秋型',
    palette: ['#6B4832', '#5A3828', '#483020', '#785040', '#3A2818'], // deep brown, chocolate, dark olive
    primaryColor: '#6B4832',
    season: 'autumn',
    characteristics: { temperature: 'warm', depth: 'deep', chroma: 'true' }
  },
  // Winter types (Cool, clear, high contrast)
  {
    id: 'winter-bright',
    nameEn: 'Clear Winter',
    nameZh: '净冬型',
    palette: ['#E040A0', '#4080E0', '#00A878', '#F0E040', '#8040C0'], // hot pink, royal blue, emerald, bright jewel tones
    primaryColor: '#C8A0D0',
    season: 'winter',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'bright' }
  },
  {
    id: 'winter-true',
    nameEn: 'Cool Winter',
    nameZh: '冷冬型',
    palette: ['#186848', '#2868A0', '#E03868', '#1858A8', '#087858'], // emerald green, icy blue, cool clear tones
    primaryColor: '#D0A8B8',
    season: 'winter',
    characteristics: { temperature: 'cool', depth: 'medium', chroma: 'true' }
  },
  {
    id: 'winter-deep',
    nameEn: 'Deep Winter',
    nameZh: '深冬型',
    palette: ['#6A1832', '#401028', '#2A0818', '#881838', '#501028'], // deep wine, burgundy, dark dramatic, near-black
    primaryColor: '#6A1832',
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

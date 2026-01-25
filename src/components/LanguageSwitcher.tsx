import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en' as const, label: 'EN', fullLabel: 'English', flag: '🇺🇸' },
    { code: 'zh' as const, label: '中', fullLabel: '中文', flag: '🇨🇳' },
  ];

  const currentLang = languages.find(l => l.code === language);

  // Dark variant for dark backgrounds
  const buttonStyles = variant === 'dark'
    ? 'bg-white/10 border-white/20 text-white/90 hover:bg-white/15'
    : 'bg-white/80 border-neutral-200 text-neutral-700 hover:bg-white';

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm border transition-colors ${buttonStyles}`}
      >
        <span className="text-base">{currentLang?.flag}</span>
        <span className="text-xs font-medium">{currentLang?.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-foreground rounded-xl shadow-lg border border-white/10 overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                language === lang.code 
                  ? 'bg-white/15 text-white font-medium' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.fullLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

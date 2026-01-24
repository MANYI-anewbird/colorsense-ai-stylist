import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
}

export function Header({ title, showBack = false, transparent = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={`sticky top-0 z-50 safe-area-top ${
        transparent
          ? 'bg-transparent'
          : 'bg-background/80 backdrop-blur-xl border-b border-border/50'
      }`}
    >
      <div className="container flex items-center h-14 px-4">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        {title && (
          <h1 className="font-semibold text-foreground text-lg ml-2">{title}</h1>
        )}
      </div>
    </header>
  );
}

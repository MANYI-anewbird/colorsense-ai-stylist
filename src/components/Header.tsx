import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  /** 点击返回箭头时跳转的路由，不传则使用浏览器后退 navigate(-1) */
  backTo?: string;
  transparent?: boolean;
}

export function Header({ title, showBack = false, backTo, transparent = false }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

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
            type="button"
            onClick={handleBack}
            aria-label="返回"
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

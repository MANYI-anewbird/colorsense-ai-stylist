import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorSwatchProps {
  hex: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ColorSwatch({ hex, size = 'lg', className }: ColorSwatchProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 rounded-xl',
    md: 'w-24 h-24 rounded-2xl',
    lg: 'w-32 h-32 rounded-2xl',
    xl: 'w-40 h-40 rounded-3xl',
  };

  return (
    <div
      className={cn('color-swatch', sizeClasses[size], className)}
      style={{ backgroundColor: hex }}
    />
  );
}

interface CopyableColorProps {
  label: string;
  value: string;
  displayValue?: string;
}

export function CopyableColor({ label, value, displayValue }: CopyableColorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-between w-full p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
    >
      <div className="text-left">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-mono font-semibold text-foreground mt-0.5">
          {displayValue || value}
        </p>
      </div>
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-background/50 group-hover:bg-background transition-colors">
        {copied ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}

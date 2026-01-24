import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIExplanationCardProps {
  explanation: string;
  isLoading?: boolean;
}

export function AIExplanationCard({ explanation, isLoading = false }: AIExplanationCardProps) {
  return (
    <div className="elevated-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Stylist Insights</h3>
            <p className="text-xs text-muted-foreground">Powered by ColorSense AI</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Analyzing your color...</span>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {explanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="px-5 py-3 bg-muted/30 border-t border-border/30">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Note:</strong> This analysis is based on clothing color only. Personal seasonal 
          color type depends on skin tone, hair color, and contrast levels.
        </p>
      </div>
    </div>
  );
}

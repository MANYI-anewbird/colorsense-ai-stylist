import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Wand2, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { ColorPicker } from '@/components/ColorPicker';
import { ColorButton } from '@/components/ui/color-button';
import { analyzeColor, type ColorAnalysis, type AnalysisResult } from '@/lib/color-utils';
import { computeMatchScoreWithBreakdown } from '@/lib/compatibility-utils';
import { clamp } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSkinTone } from '@/contexts/SkinToneContext';

export default function PickerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { skinTone, getSkinToneInfo } = useSkinTone();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const imageData = location.state?.imageData as string | undefined;

  useEffect(() => {
    if (!imageData) {
      navigate('/');
      return;
    }

    // Preload image and canvas for analysis
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      canvasRef.current = canvas;
    };
    img.src = imageData;
  }, [imageData, navigate]);

  const handlePositionChange = useCallback((x: number, y: number) => {
    setPosition({ x, y });
  }, []);

  const performAnalysis = async (useAI: boolean) => {
    if (!canvasRef.current) {
      toast.error(t.imageNotReady);
      return;
    }

    if (!skinTone) {
      toast.error('Please select your color season first');
      return;
    }

    if (useAI) {
      setIsAnalyzingAI(true);
    } else {
      setIsAnalyzing(true);
    }

    try {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Get image data for analysis
      const imgData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Analyze color locally
      const radius = 20; // Sampling radius in pixels
      const localAnalysis: ColorAnalysis = analyzeColor(imgData, position.x, position.y, radius);

      // Calculate rule-based score with breakdown
      const { score: ruleScore, breakdown } = computeMatchScoreWithBreakdown(
        localAnalysis.metrics,
        skinTone
      );

      const skinToneInfo = getSkinToneInfo(skinTone);
      if (!skinToneInfo) {
        throw new Error('Skin tone info not found');
      }

      const result: AnalysisResult = {
        analysis: localAnalysis,
        ruleScore,
        breakdown,
      };

      if (useAI) {
        // Call AI analysis endpoint
        try {
          const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-ai', {
            body: {
              user_season: skinToneInfo.nameEn,
              color_hex: localAnalysis.color.hex,
              color_hsl: localAnalysis.color.hsl,
              rule_score: ruleScore,
              breakdown,
            },
          });

          if (aiError || !aiData) {
            console.error('AI API Error:', aiError);
            // Fallback to rule-only
            result.aiAnalysis = {
              delta: 0,
              insight: t.aiUnavailable,
              advice: 'Consider the rule-based score as a general guideline.',
              fallback: true,
            };
            result.finalScore = ruleScore;
          } else {
            // Validate AI response
            const delta = typeof aiData.delta === 'number' ? aiData.delta : 0;
            const clampedDelta = clamp(delta, -15, 15);
            const finalScore = clamp(ruleScore + clampedDelta, 0, 100);

            result.aiAnalysis = {
              delta: clampedDelta,
              insight: aiData.insight || 'AI analysis completed.',
              advice: aiData.advice || 'Consider this color for your wardrobe.',
              fallback: aiData.fallback || false,
            };
            result.finalScore = finalScore;
          }
        } catch (aiError) {
          console.error('AI analysis error:', aiError);
          // Fallback to rule-only
          result.aiAnalysis = {
            delta: 0,
            insight: t.aiUnavailable,
            advice: 'Consider the rule-based score as a general guideline.',
            fallback: true,
          };
          result.finalScore = ruleScore;
        }
      } else {
        // Rule-only analysis
        result.finalScore = ruleScore;
      }

      // Navigate to result
      navigate('/result', {
        state: { result },
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t.analyzeFailed);
    } finally {
      setIsAnalyzing(false);
      setIsAnalyzingAI(false);
    }
  };

  const handleAnalyze = () => performAnalysis(false);
  const handleAnalyzeWithAI = () => performAnalysis(true);

  if (!imageData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title={t.selectColor} showBack backTo="/" />

      <main className="flex-1 container px-4 py-6 flex flex-col">
        <div className="flex-1">
          <ColorPicker
            imageSrc={imageData}
            onPositionChange={handlePositionChange}
          />
        </div>

        {/* Analyze Buttons */}
        <div className="mt-6 space-y-3 safe-area-bottom">
          <ColorButton
            variant="analyze"
            size="lg"
            className="w-full"
            onClick={handleAnalyze}
            disabled={isAnalyzing || isAnalyzingAI}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.analyzing}
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                {t.analyzeColor}
              </>
            )}
          </ColorButton>

          <div>
            <ColorButton
              variant="outline"
              size="lg"
              className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              onClick={handleAnalyzeWithAI}
              disabled={isAnalyzing || isAnalyzingAI}
            >
              {isAnalyzingAI ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {t.analyzeWithAI}
                </>
              )}
            </ColorButton>
            <p className="text-xs text-muted-foreground text-center mt-1.5">
              {t.aiAnalysisCaption}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Wand2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { ColorPicker } from '@/components/ColorPicker';
import { ColorButton } from '@/components/ui/color-button';
import { analyzeColor, extractAverageColor, rgbToHex, type ColorAnalysis } from '@/lib/color-utils';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/** Normalize hex for DB key (e.g. #111A23). */
function normalizeHex(hex: string): string {
  return '#' + (hex || '').replace(/^#/, '').toUpperCase();
}

/** Strip heavy debug fields so cache save is smaller; keeps full algorithm result (season12, breakdown, etc.). */
function analysisForCache(a: ColorAnalysis): ColorAnalysis {
  const match = a.metrics.seasonMatch;
  if (!match) return a;
  const { debugInfo: _, ...restMatch } = match;
  return {
    ...a,
    metrics: { ...a.metrics, seasonMatch: { ...restMatch } },
  };
}

export default function PickerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, openLoginDialog } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const handleAnalyze = async () => {
    if (!user) {
      openLoginDialog();
      return;
    }
    if (!canvasRef.current) {
      toast.error(t.imageNotReady);
      return;
    }

    setIsAnalyzing(true);

    try {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const imgData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const radius = 20;

      // Get hex at picker position; optionally use cached analysis for faster navigation
      const { rgb } = extractAverageColor(imgData, position.x, position.y, radius);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      const cacheKey = normalizeHex(hex);

      let analysis: ColorAnalysis;
      let isNewColor: boolean;

      // Read cache: 若该颜色已有记录则只用缓存，不写表
      const { data: cached } = await supabase
        .from('color_analysis_cache')
        .select('result')
        .eq('color_hex', cacheKey)
        .maybeSingle();
      if (cached?.result) {
        analysis = cached.result as ColorAnalysis;
        isNewColor = false;
      } else {
        analysis = analyzeColor(imgData, position.x, position.y, radius);
        isNewColor = true;
      }

      // 仅当从未出现过的颜色时才写入 color_analysis_cache，触发 color_master 同步
      if (isNewColor) {
        const { error: saveErr } = await supabase
          .from('color_analysis_cache')
          .upsert(
            { color_hex: cacheKey, result: analysisForCache(analysis) },
            { onConflict: 'color_hex' }
          );
        if (saveErr) {
          console.error('color_analysis_cache save error:', saveErr);
          toast.error(t.analyzeFailed + ' (cache save failed)');
        }
      }

      navigate('/result', { state: { analysis } });
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t.analyzeFailed);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!imageData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Editorial Color Stripe - Top accent */}
      <div className="color-stripe h-1" />
      
      <Header title={t.selectColor} showBack backTo="/" />

      <main className="flex-1 container px-4 py-6 flex flex-col">
        <div className="flex-1">
          <ColorPicker
            imageSrc={imageData}
            onPositionChange={handlePositionChange}
          />
        </div>

        {/* Analyze Button - Editorial style */}
        <div className="mt-6 safe-area-bottom">
          <ColorButton
            variant="analyze"
            size="lg"
            className="w-full group relative overflow-hidden"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                <span className="relative z-10">{t.analyzing}</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{t.analyzeColor}</span>
              </>
            )}
          </ColorButton>
        </div>
      </main>
    </div>
  );
}

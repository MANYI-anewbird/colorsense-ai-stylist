import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Wand2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { ColorPicker, type PickerSelection, type ColorMode } from '@/components/ColorPicker';
import { ColorButton } from '@/components/ui/color-button';
import { createColorAnalysis, getColorValues, type ColorAnalysis } from '@/lib/color-utils';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getFreeAnalysesUsed, incrementFreeAnalysesUsed, FREE_ANALYSIS_LIMIT } from '@/lib/free-analysis';
import { DevTuningPanel, type DevTuningPanelState } from '@/components/DevTuningPanel';
import { DEFAULT_DOMINANT_OPTIONS, type DominantColorOptions } from '@/lib/dominant-color';

const DEV_STORAGE_KEY = 'dominantColor.devOptions';
const COLOR_MODE_KEY = 'picker.colorMode';

const DEFAULT_DEV_STATE: DevTuningPanelState = {
  maxSide: DEFAULT_DOMINANT_OPTIONS.maxSide,
  deltaEBase: DEFAULT_DOMINANT_OPTIONS.deltaEBase,
  deltaESmallBoost: DEFAULT_DOMINANT_OPTIONS.deltaESmallBoost,
  deltaELargeTighten: DEFAULT_DOMINANT_OPTIONS.deltaELargeTighten,
  maxRegionPixels: DEFAULT_DOMINANT_OPTIONS.maxRegionPixels,
  sampleCount: DEFAULT_DOMINANT_OPTIONS.sampleSize,
  lowLightPercentile: DEFAULT_DOMINANT_OPTIONS.lowLightPercentile,
  highLightPercentile: DEFAULT_DOMINANT_OPTIONS.highLightPercentile,
  patternThreshold: DEFAULT_DOMINANT_OPTIONS.patternThreshold,
  debugOverlay: false,
};

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sanitizeDevState(state: Partial<DevTuningPanelState> | undefined): DevTuningPanelState {
  const merged = {
    ...DEFAULT_DEV_STATE,
    ...state,
  };

  merged.maxSide = merged.maxSide >= 640 ? 640 : 512;
  merged.deltaEBase = clampNumber(Math.round(merged.deltaEBase), 6, 16);
  merged.deltaESmallBoost = clampNumber(Math.round(merged.deltaESmallBoost), 0, 6);
  merged.deltaELargeTighten = clampNumber(Math.round(merged.deltaELargeTighten), 0, 6);
  merged.maxRegionPixels = clampNumber(Math.round(merged.maxRegionPixels), 10000, 50000);
  merged.sampleCount = clampNumber(Math.round(merged.sampleCount), 500, 5000);

  const low = clampNumber(merged.lowLightPercentile, 0, 0.49);
  const high = clampNumber(
    Math.max(low + 0.05, merged.highLightPercentile),
    0.5,
    0.99
  );
  merged.lowLightPercentile = low;
  merged.highLightPercentile = high;

  merged.patternThreshold = clampNumber(merged.patternThreshold, 0.3, 0.6);
  merged.debugOverlay = Boolean(merged.debugOverlay);

  return merged;
}

export default function PickerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, openLoginDialog } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selection, setSelection] = useState<PickerSelection | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window === 'undefined') return 'auto';
    const stored = window.localStorage.getItem(COLOR_MODE_KEY);
    return stored === 'spot' || stored === 'dominant' || stored === 'auto'
      ? (stored as ColorMode)
      : 'auto';
  });

  const forceDev = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('dev') === '1';
  }, [location.search]);
  const isProduction = import.meta.env.PROD;

  const [devState, setDevState] = useState<DevTuningPanelState>(() => {
    if (typeof window === 'undefined') return DEFAULT_DEV_STATE;
    try {
      const raw = window.localStorage.getItem(DEV_STORAGE_KEY);
      if (!raw) return DEFAULT_DEV_STATE;
      const parsed = JSON.parse(raw);
      return sanitizeDevState(parsed);
    } catch {
      return DEFAULT_DEV_STATE;
    }
  });
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(devState));
    } catch {
      // no-op
    }
  }, [devState]);

  const [devToggle, setDevToggle] = useState<boolean>(() => forceDev);

  useEffect(() => {
    if (forceDev) {
      setDevToggle(true);
    }
  }, [forceDev]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || !event.shiftKey) return;
      if (event.key.toLowerCase() !== 'd') return;
      if (isProduction && !forceDev) return;
      event.preventDefault();
      setDevToggle((prev) => !prev);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [forceDev, isProduction]);

  const showDevPanel = forceDev || (!isProduction && devToggle);

  const activeDevOptions: DominantColorOptions | undefined = useMemo(() => {
    if (!showDevPanel) return undefined;
    return {
      maxSide: devState.maxSide,
      deltaEBase: devState.deltaEBase,
      deltaESmallBoost: devState.deltaESmallBoost,
      deltaELargeTighten: devState.deltaELargeTighten,
      maxRegionPixels: devState.maxRegionPixels,
      sampleCount: devState.sampleCount,
      sampleSize: devState.sampleCount,
      lowLightPercentile: devState.lowLightPercentile,
      highLightPercentile: devState.highLightPercentile,
      patternThreshold: devState.patternThreshold,
    };
  }, [showDevPanel, devState]);

  const debugOverlayActive = showDevPanel && devState.debugOverlay;

  const imageData = location.state?.imageData as string | undefined;

  useEffect(() => {
    if (!imageData) {
      navigate('/');
    }
  }, [imageData, navigate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(COLOR_MODE_KEY, colorMode);
    } catch {
      // ignore persistence errors
    }
  }, [colorMode]);

  const handleSelectionChange = useCallback((nextSelection: PickerSelection) => {
    setSelection(nextSelection);
  }, []);

  const handleModeChange = useCallback((nextMode: ColorMode) => {
    setColorMode((prev) => (prev === nextMode ? prev : nextMode));
  }, []);

  const handleAnalyze = async () => {
    if (!selection) {
      toast.error('Please pick a color before analyzing.');
      return;
    }

    // Guest limit: 3 free analyses, then require login
    if (!user) {
      const used = getFreeAnalysesUsed();
      if (used >= FREE_ANALYSIS_LIMIT) {
        toast.error(t.freeLimitReached);
        openLoginDialog();
        return;
      }
      incrementFreeAnalysesUsed();
    }

    setIsAnalyzing(true);

    try {
      const { rgb } = selection.activeColor;
      const colorValues = getColorValues(rgb.r, rgb.g, rgb.b);
      const analysis = createColorAnalysis(colorValues, selection.stats.variance);

      navigate('/result', { state: { analysis, selection } });
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
            onSelectionChange={handleSelectionChange}
            devOptions={activeDevOptions}
            debugOverlay={debugOverlayActive}
            mode={colorMode}
            onModeChange={handleModeChange}
          />
        </div>

        {/* Analyze Button - Editorial style */}
        <div className="mt-6 safe-area-bottom">
          <ColorButton
            variant="analyze"
            size="lg"
            className="w-full group relative overflow-hidden"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selection}
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
      {showDevPanel ? (
        <DevTuningPanel
          state={devState}
          onStateChange={(next) => setDevState(sanitizeDevState(next))}
          onReset={() => setDevState({ ...DEFAULT_DEV_STATE })}
        />
      ) : null}
    </div>
  );
}

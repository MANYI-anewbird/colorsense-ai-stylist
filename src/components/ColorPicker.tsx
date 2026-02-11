import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { rgbToHex } from '@/lib/color-utils';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  extractDominantColor,
  type DominantColorResult,
  type DominantColorOptions,
} from '@/lib/dominant-color';

const ZOOM_LEVELS = [1, 1.5, 2, 2.5, 3] as const;
const DRAG_THRESHOLD = 8;

export type ColorMode = 'spot' | 'dominant' | 'auto';

export interface PickerSelection {
  pixel: { x: number; y: number };
  picked: DominantColorResult['picked'];
  dominant: DominantColorResult['dominant'];
  mode: ColorMode;
  activeColorType: 'picked' | 'dominant';
  activeColor: DominantColorResult['picked'];
  stats: DominantColorResult['stats'];
  mask?: {
    dataUrl?: string;
    width: number;
    height: number;
    scale: number;
  };
  options?: DominantColorOptions;
}

interface ColorPickerProps {
  imageSrc: string;
  onSelectionChange: (selection: PickerSelection) => void;
  pickerSize?: number;
  devOptions?: DominantColorOptions;
  debugOverlay?: boolean;
  mode: ColorMode;
  onModeChange: (mode: ColorMode) => void;
}

export function ColorPicker({
  imageSrc,
  onSelectionChange,
  pickerSize = 32,
  devOptions,
  debugOverlay = false,
  mode,
  onModeChange,
}: ColorPickerProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage
  const [zoomImageData, setZoomImageData] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'none' | 'pan' | 'picker'>('none');
  const pointerStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const zoom = ZOOM_LEVELS[zoomIndex];
  const pixelRef = useRef({ x: 0, y: 0 });
  const [pickedHex, setPickedHex] = useState('#888888');
  const [dominantHex, setDominantHex] = useState<string | null>(null);
  const [maskOverlay, setMaskOverlay] = useState<string | null>(null);
  const [selection, setSelection] = useState<PickerSelection | null>(null);
  const lastResultRef = useRef<DominantColorResult | null>(null);

  // Load and draw image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Reset pan when zoom changes
  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [zoomIndex]);

  // Update color and zoom preview when position changes
  const devOptionsKey = useMemo(
    () => JSON.stringify(devOptions ?? {}),
    [devOptions]
  );

  const buildSelection = useCallback(
    (result: DominantColorResult, currentMode: ColorMode): PickerSelection => {
      const { x, y } = pixelRef.current;
      const activeColorType =
        currentMode === 'spot'
          ? 'picked'
          : currentMode === 'dominant'
            ? 'dominant'
            : result.stats.largeShift
              ? 'picked'
              : 'dominant';
      const activeColor =
        activeColorType === 'picked' ? result.picked : result.dominant;

      return {
        pixel: { x, y },
        picked: result.picked,
        dominant: result.dominant,
        mode: currentMode,
        activeColorType,
        activeColor,
        stats: result.stats,
        options: devOptions,
        mask: result.maskDimensions
          ? {
              dataUrl: result.maskDataUrl,
              width: result.maskDimensions.width,
              height: result.maskDimensions.height,
              scale: result.maskDimensions.scale,
            }
          : undefined,
      };
    },
    [devOptionsKey, devOptions]
  );

  const updateSelection = useCallback(
    (result: DominantColorResult) => {
      lastResultRef.current = result;
      const selectionPayload = buildSelection(result, mode);
      setSelection(selectionPayload);
      onSelectionChange(selectionPayload);
    },
    [buildSelection, mode, onSelectionChange]
  );

  useEffect(() => {
    if (!lastResultRef.current) return;
    const selectionPayload = buildSelection(lastResultRef.current, mode);
    setSelection(selectionPayload);
    onSelectionChange(selectionPayload);
  }, [mode, buildSelection, onSelectionChange]);

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const px = Math.max(0, Math.min(canvas.width - 1, Math.floor((position.x / 100) * canvas.width)));
    const py = Math.max(0, Math.min(canvas.height - 1, Math.floor((position.y / 100) * canvas.height)));
    pixelRef.current = { x: px, y: py };

    try {
      const pixelData = ctx.getImageData(px, py, 1, 1).data;
      const r = pixelData[0];
      const g = pixelData[1];
      const b = pixelData[2];
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
        setPickedHex(rgbToHex(r, g, b));
      }

      const zoomRadius = 40;
      const zoomSize = zoomRadius * 2;
      const zoomCanvas = document.createElement('canvas');
      zoomCanvas.width = zoomSize;
      zoomCanvas.height = zoomSize;
      const zoomCtx = zoomCanvas.getContext('2d');
      if (zoomCtx) {
        const sx = Math.max(0, px - zoomRadius / 4);
        const sy = Math.max(0, py - zoomRadius / 4);
        const sw = Math.min(zoomRadius / 2, canvas.width - sx);
        const sh = Math.min(zoomRadius / 2, canvas.height - sy);
        zoomCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, zoomSize, zoomSize);
        setZoomImageData(zoomCanvas.toDataURL());
      }
    } catch {
      // Handle cross-origin issues silently
    }
  }, [position, imageLoaded]);

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;
    if (isDragging && dragMode === 'picker') return;

    let cancelled = false;

    const run = () => {
      if (!canvasRef.current || cancelled) return;
      const { x: px, y: py } = pixelRef.current;
      const result = extractDominantColor(canvasRef.current, { x: px, y: py }, devOptions);
      if (!result || cancelled) return;

      setPickedHex(result.picked.hex);
      setDominantHex(result.dominant.hex);
      setMaskOverlay(result.maskDataUrl ?? null);

      updateSelection(result);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(run);
      return () => {
        cancelled = true;
        (window as any).cancelIdleCallback(handle);
      };
    }

    const timeout = window.setTimeout(run, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [imageLoaded, isDragging, dragMode, position, devOptionsKey, updateSelection]);

  // Convert container coords to image percentage (accounts for zoom and pan)
  const containerToPosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height || !Number.isFinite(zoom) || zoom <= 0) return null;
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    const percX = ((cx - pan.x) / zoom / rect.width) * 100;
    const percY = ((cy - pan.y) / zoom / rect.height) * 100;
    const x = Math.max(0, Math.min(100, percX));
    const y = Math.max(0, Math.min(100, percY));
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y };
  }, [zoom, pan.x, pan.y]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      setDragMode('none');
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      pointerStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [pan.x, pan.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;

      const { x: startX, y: startY, panX: startPanX, panY: startPanY } = pointerStartRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const distance = Math.hypot(dx, dy);

      if (dragMode === 'none' && distance > DRAG_THRESHOLD) {
        setDragMode(zoom > 1 ? 'pan' : 'picker');
      }

      if (dragMode === 'pan') {
        const rect = containerRef.current.getBoundingClientRect();
        const maxX = Math.max(0, rect.width * (1 - zoom));
        const maxY = Math.max(0, rect.height * (1 - zoom));
        setPan({
          x: Math.max(-maxX, Math.min(0, startPanX + dx)),
          y: Math.max(-maxY, Math.min(0, startPanY + dy)),
        });
      } else if (dragMode === 'picker') {
        const next = containerToPosition(e.clientX, e.clientY);
        if (next) setPosition(next);
      }
    },
    [isDragging, dragMode, zoom, containerToPosition]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging && dragMode === 'none') {
        const next = containerToPosition(e.clientX, e.clientY);
        if (next) setPosition(next);
      }
      setIsDragging(false);
      setDragMode('none');
    },
    [isDragging, dragMode, containerToPosition]
  );

  const handleZoomIn = useCallback(() => {
    setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomIndex((i) => Math.max(i - 1, 0));
  }, []);

  const activeColorType = selection?.activeColorType ?? 'dominant';
  const displayedHex =
    selection?.activeColor.hex ??
    (activeColorType === 'dominant'
      ? dominantHex ?? pickedHex
      : pickedHex);
  const pickedHexDisplay = selection?.picked.hex ?? pickedHex;
  const dominantHexDisplay =
    selection?.dominant.hex ?? dominantHex ?? pickedHexDisplay;
  const isAutoUsingSpot =
    selection?.mode === 'auto' && selection?.activeColorType === 'picked';

  const handleModeButtonClick = useCallback(
    (nextMode: ColorMode) => {
      if (mode === nextMode) return;
      onModeChange(nextMode);
    },
    [mode, onModeChange]
  );

  const modeOptions = useMemo<
    Array<{ id: ColorMode; label: string }>
  >(
    () => [
      { id: 'spot', label: 'Spot' },
      { id: 'dominant', label: 'Dominant' },
      { id: 'auto', label: 'Auto' },
    ],
    []
  );

  const renderSwatch = useCallback(
    (hex: string | null, label: string, isActive: boolean, helper?: string) => (
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl shadow-card border-2 ${
            isActive ? 'border-primary shadow-primary/50' : 'border-white'
          }`}
          style={{ backgroundColor: hex ?? '#888888' }}
        />
        <div>
          <p className="text-sm font-medium text-foreground">
            {label}
            {isActive ? (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                Active
              </span>
            ) : null}
          </p>
          <p className="text-xs text-muted-foreground">{hex ?? '—'}</p>
          {helper ? (
            <p className="text-[11px] text-muted-foreground/80">{helper}</p>
          ) : null}
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="relative w-full">
      {/* Zoom controls */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoomIndex === 0}
          className="p-2 rounded-full border border-border bg-background shadow-sm hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
          {zoom * 100}%
        </span>
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoomIndex === ZOOM_LEVELS.length - 1}
          className="p-2 rounded-full border border-border bg-background shadow-sm hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* Main image container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Zoom + pan layer: image and picker move together */}
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <img
            src={imageSrc}
            alt="Selected clothing"
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {maskOverlay && (
            <img
              src={maskOverlay}
              alt="Selected region mask"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none mix-blend-screen opacity-60"
            />
          )}

          {/* Picker circle */}
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: pickerSize,
              height: pickerSize,
            }}
          >
            <div
              className="absolute inset-0 rounded-full border-2 border-white shadow-picker"
              style={{ backgroundColor: displayedHex }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-px h-3 bg-white/80" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-px bg-white/80" />
            </div>
          </div>
        </div>

        {/* Hidden canvas for color extraction */}
        <canvas ref={canvasRef} className="hidden" />

        {isDragging && dragMode === 'pan' && (
          <div className="absolute inset-0 ring-2 ring-primary/40 rounded-2xl pointer-events-none" />
        )}
      </div>

      {/* Zoom preview and color info */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {zoomImageData && (
          <div className="zoom-preview relative self-start">
            <img
              src={zoomImageData}
              alt="Zoom preview"
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-px h-full bg-white/50" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-white/50" />
            </div>
          </div>
        )}
      {debugOverlay && selection && (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm space-y-1 rounded-lg border border-border bg-background/95 p-3 text-[11px] leading-relaxed shadow-lg backdrop-blur">
          <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
            Dominant Color Debug
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="text-muted-foreground">Region size</span>
            <span>{selection.stats.regionSize}</span>
            <span className="text-muted-foreground">Retained</span>
            <span>{(selection.stats.retainedRatio * 100).toFixed(1)}%</span>
            <span className="text-muted-foreground">Filtered out</span>
            <span>{(selection.stats.filteredOutRatio * 100).toFixed(1)}%</span>
            <span className="text-muted-foreground">Truncated</span>
            <span>{selection.stats.truncated ? 'Yes' : 'No'}</span>
            <span className="text-muted-foreground">k</span>
            <span>{selection.stats.k}</span>
            <span className="text-muted-foreground">Sample count</span>
            <span>{selection.stats.sampleCount}</span>
            <span className="text-muted-foreground">Pattern</span>
            <span>{selection.stats.patternDetected ? 'Yes' : 'No'}</span>
            <span className="text-muted-foreground">Large shift</span>
            <span>{selection.stats.largeShift ? 'Yes' : 'No'}</span>
            <span className="text-muted-foreground">Variance</span>
            <span>{selection.stats.variance.toFixed(3)}</span>
          </div>
          <div className="space-y-1 text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Cluster ratios:</span>{' '}
              {selection.stats.clusterRatios.map((r) => r.toFixed(2)).join(', ')}
            </div>
            <div>
              <span className="font-medium text-foreground">Percentiles:</span>{' '}
              L10 {selection.stats.percentiles.L10.toFixed(1)} · L90{' '}
              {selection.stats.percentiles.L90.toFixed(1)} · C30{' '}
              {selection.stats.percentiles.C30.toFixed(2)}
            </div>
          </div>
        </div>
      )}

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Color extraction mode
            </p>
            <div className="mt-1 inline-flex overflow-hidden rounded-full border border-border bg-background shadow-sm">
              {modeOptions.map((option) => {
                const isActive = mode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                    onClick={() => handleModeButtonClick(option.id)}
                    aria-pressed={isActive}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {mode === 'auto'
                ? selection
                  ? selection.activeColorType === 'picked'
                    ? 'Auto selected Spot (large shift detected).'
                    : 'Auto selected Dominant.'
                  : 'Auto uses Dominant unless a large shift is detected.'
                : mode === 'spot'
                ? 'Spot uses the exact picked pixel.'
                : 'Dominant uses the region-representative color.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
            {renderSwatch(
              dominantHexDisplay,
              'Dominant color',
              activeColorType === 'dominant',
              selection?.stats.patternDetected
                ? 'Pattern detected — multiple clusters present.'
                : undefined
            )}
            {renderSwatch(
              pickedHexDisplay,
              'Spot (picked pixel)',
              activeColorType === 'picked',
              selection?.stats.largeShift
                ? 'Large shift relative to dominant.'
                : undefined
            )}
          </div>

          <div className="space-y-1">
            {selection?.stats.largeShift && mode !== 'spot' && (
              <p className="text-xs text-amber-600">
                Large shift detected — Spot mode captures the exact pixel.
              </p>
            )}
            {selection?.stats.patternDetected && (
              <p className="text-xs text-amber-600">
                Pattern detected — dominant color may blend multiple regions.
              </p>
            )}
            {mode === 'auto' && isAutoUsingSpot && (
              <p className="text-[11px] text-muted-foreground">
                Auto switched to Spot mode because of the large shift.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t.pickerInstruction}
      </p>
    </div>
  );
}

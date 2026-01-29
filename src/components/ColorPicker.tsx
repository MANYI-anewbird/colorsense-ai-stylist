import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { rgbToHex } from '@/lib/color-utils';
import { useLanguage } from '@/contexts/LanguageContext';

const ZOOM_LEVELS = [1, 1.5, 2, 2.5, 3] as const;
const DRAG_THRESHOLD = 8;

interface ColorPickerProps {
  imageSrc: string;
  onPositionChange: (x: number, y: number) => void;
  pickerSize?: number;
}

export function ColorPicker({ imageSrc, onPositionChange, pickerSize = 32 }: ColorPickerProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage
  const [currentColor, setCurrentColor] = useState('#888888');
  const [zoomImageData, setZoomImageData] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'none' | 'pan' | 'picker'>('none');
  const pointerStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const zoom = ZOOM_LEVELS[zoomIndex];

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
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clamp to valid pixel range so getImageData never goes out of bounds
    const px = Math.max(0, Math.min(canvas.width - 1, Math.floor((position.x / 100) * canvas.width)));
    const py = Math.max(0, Math.min(canvas.height - 1, Math.floor((position.y / 100) * canvas.height)));

    try {
      const pixelData = ctx.getImageData(px, py, 1, 1).data;
      const r = pixelData[0];
      const g = pixelData[1];
      const b = pixelData[2];
      if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
        setCurrentColor(rgbToHex(r, g, b));
      }

      // Create zoom preview
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

    onPositionChange(px, py);
  }, [position, imageLoaded, onPositionChange]);

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
              style={{ backgroundColor: currentColor }}
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
      <div className="mt-4 flex items-center gap-4">
        {/* Zoom preview */}
        {zoomImageData && (
          <div className="zoom-preview relative">
            <img
              src={zoomImageData}
              alt="Zoom preview"
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
            {/* Crosshair overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-px h-full bg-white/50" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-white/50" />
            </div>
          </div>
        )}

        {/* Current color preview */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl shadow-card border-2 border-white"
            style={{ backgroundColor: currentColor }}
          />
          <div>
            <p className="text-sm font-medium text-foreground">{currentColor}</p>
            <p className="text-xs text-muted-foreground">Selected color</p>
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

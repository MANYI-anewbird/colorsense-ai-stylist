import React, { useRef, useState, useEffect, useCallback } from 'react';
import { rgbToHex } from '@/lib/color-utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ColorPickerProps {
  imageSrc: string;
  onPositionChange: (x: number, y: number) => void;
  pickerSize?: number;
}

export function ColorPicker({ imageSrc, onPositionChange, pickerSize = 48 }: ColorPickerProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage
  const [currentColor, setCurrentColor] = useState('#888888');
  const [zoomImageData, setZoomImageData] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const instructionText = t.pickerInstruction;
  const selectedColorText = t.selectedColor;

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

  // Update color and zoom preview when position changes
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = (position.x / 100) * canvas.width;
    const y = (position.y / 100) * canvas.height;

    // Get pixel color at position
    try {
      const pixelData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      setCurrentColor(rgbToHex(pixelData[0], pixelData[1], pixelData[2]));

      // Create zoom preview
      const zoomRadius = 40;
      const zoomSize = zoomRadius * 2;
      const zoomCanvas = document.createElement('canvas');
      zoomCanvas.width = zoomSize;
      zoomCanvas.height = zoomSize;
      const zoomCtx = zoomCanvas.getContext('2d');
      if (zoomCtx) {
        zoomCtx.drawImage(
          canvas,
          x - zoomRadius / 4,
          y - zoomRadius / 4,
          zoomRadius / 2,
          zoomRadius / 2,
          0,
          0,
          zoomSize,
          zoomSize
        );
        setZoomImageData(zoomCanvas.toDataURL());
      }
    } catch {
      // Handle cross-origin issues silently
    }

    // Notify parent
    onPositionChange(x, y);
  }, [position, imageLoaded, onPositionChange]);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

      setPosition({ x, y });
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handleMove(e.clientX, e.clientY);
    },
    [handleMove]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    },
    [isDragging, handleMove]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative w-full">
      {/* Main image container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <img
          src={imageSrc}
          alt="Selected clothing"
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Hidden canvas for color extraction */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Picker circle */}
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            width: pickerSize,
            height: pickerSize,
          }}
        >
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-white shadow-picker"
            style={{
              backgroundColor: currentColor,
            }}
          />
          {/* Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-px h-4 bg-white/80" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-px bg-white/80" />
          </div>
        </div>

        {/* Drag indicator */}
        {isDragging && (
          <div className="absolute inset-0 ring-4 ring-primary/30 rounded-2xl pointer-events-none" />
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
            <p className="text-sm font-bold text-foreground tracking-wide">{currentColor}</p>
            <p className="text-xs text-muted-foreground">{selectedColorText}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {instructionText}
      </p>
    </div>
  );
}

import { forwardRef, useImperativeHandle, useRef, useEffect, useCallback } from 'react';
import { useDrawing } from '../hooks/useDrawing';

export interface DrawCanvasHandle {
  get28x28: () => ImageData | null;
  clear: () => void;
}

interface Props {
  onStroke: () => void;
}

export const DrawCanvas = forwardRef<DrawCanvasHandle, Props>(({ onStroke }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offRef = useRef<HTMLCanvasElement>(null);
  const { clear, hasContent } = useDrawing(canvasRef);

  useImperativeHandle(ref, () => ({
    get28x28: () => {
      const src = canvasRef.current;
      const off = offRef.current;
      if (!src || !off) return null;
      const ctx = off.getContext('2d')!;
      ctx.drawImage(src, 0, 0, 28, 28);
      return ctx.getImageData(0, 0, 28, 28);
    },
    clear: () => {
      clear();
      onStroke();
    },
  }));

  // Trigger onStroke after pointer up
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = () => onStroke();
    canvas.addEventListener('pointerup', handler);
    return () => canvas.removeEventListener('pointerup', handler);
  }, [onStroke]);

  const handleClear = useCallback(() => {
    clear();
    onStroke();
  }, [clear, onStroke]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="w-[560px] h-[560px] rounded-2xl border-2 border-slate-700 cursor-crosshair touch-none"
        style={{ imageRendering: 'pixelated' }}
      />
      <canvas ref={offRef} width={28} height={28} className="hidden" />
      {!hasContent && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-600 text-xl select-none">Draw a digit</p>
        </div>
      )}
      <button
        onClick={handleClear}
        className="mt-3 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
      >
        Clear
      </button>
    </div>
  );
});

DrawCanvas.displayName = 'DrawCanvas';

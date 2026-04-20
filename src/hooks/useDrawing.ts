import { useRef, useCallback, useEffect, useState } from 'react';

export function useDrawing(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasContent, setHasContent] = useState(false);

  const getPos = useCallback((e: PointerEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      drawing.current = true;
      lastPos.current = getPos(e, canvas);
      // Draw dot
      ctx.beginPath();
      ctx.arc(lastPos.current.x, lastPos.current.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      setHasContent(true);
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing.current || !lastPos.current) return;
      e.preventDefault();
      const pos = getPos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    };
    const onUp = () => {
      drawing.current = false;
      lastPos.current = null;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onUp);
    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onUp);
    };
  }, [canvasRef, getPos]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
  }, [canvasRef]);

  return { clear, hasContent };
}

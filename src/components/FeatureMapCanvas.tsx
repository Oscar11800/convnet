import { useEffect, useRef, useState } from 'react';

interface Props {
  data: number[][];      // [H, W] float activations
  filter?: number[][][]; // [kH, kW, inC] filter weights (optional)
  size?: number;         // display size in px, default 56
  label?: string;
}

function normalize(data: number[][]): number[][] {
  let min = Infinity, max = -Infinity;
  data.forEach(row => row.forEach(v => {
    if (v < min) min = v;
    if (v > max) max = v;
  }));
  if (max === min) return data.map(row => row.map(() => 0));
  return data.map(row => row.map(v => (v - min) / (max - min)));
}

export function FeatureMapCanvas({ data, filter, size = 56, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d')!;
    const H = data.length, W = data[0].length;
    canvas.width = W;
    canvas.height = H;
    const norm = normalize(data);
    const imgData = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const v = Math.round(norm[y][x] * 255);
        const i = (y * W + x) * 4;
        // Blue-teal colormap: low=dark, high=bright cyan
        imgData.data[i] = 0;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = Math.round(v * 0.8 + 50);
        imgData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [data]);

  useEffect(() => {
    if (!showFilter || !filter || !filterRef.current) return;
    const canvas = filterRef.current;
    const ctx = canvas.getContext('2d')!;
    const kH = filter.length, kW = filter[0].length;
    // Use first input channel for display
    const ch = filter.map(row => row.map(col => col[0]));
    canvas.width = kW;
    canvas.height = kH;
    let mn = Infinity, mx = -Infinity;
    ch.forEach(r => r.forEach(v => {
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }));
    const imgData = ctx.createImageData(kW, kH);
    for (let y = 0; y < kH; y++) {
      for (let x = 0; x < kW; x++) {
        const v = mx === mn ? 128 : Math.round(((ch[y][x] - mn) / (mx - mn)) * 255);
        const i = (y * kW + x) * 4;
        // Red-blue diverging colormap
        imgData.data[i] = v < 128 ? 0 : (v - 128) * 2;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = v < 128 ? (128 - v) * 2 : 0;
        imgData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [showFilter, filter]);

  return (
    <div className="relative group">
      <canvas
        ref={canvasRef}
        className="rounded cursor-pointer border border-slate-700 group-hover:border-cyan-500 transition-colors"
        style={{ width: size, height: size, imageRendering: 'pixelated' }}
        onClick={() => filter && setShowFilter(s => !s)}
        title={filter ? 'Click to inspect learned filter' : undefined}
      />
      {label && (
        <div className="text-[9px] text-slate-500 text-center mt-0.5">{label}</div>
      )}
      {showFilter && filter && (
        <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-xl min-w-[140px]">
          <div className="text-xs text-slate-400 mb-2 text-center">Learned filter</div>
          <canvas
            ref={filterRef}
            className="mx-auto rounded"
            style={{ width: 60, height: 60, imageRendering: 'pixelated', display: 'block' }}
          />
          <div className="text-[10px] text-slate-500 mt-2 text-center">
            3×3 kernel weights<br />(red=positive, blue=negative)
          </div>
          <button
            onClick={e => { e.stopPropagation(); setShowFilter(false); }}
            className="absolute top-1 right-1 text-slate-500 hover:text-slate-300 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

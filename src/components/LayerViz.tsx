import { useState } from 'react';
import { FeatureMapCanvas } from './FeatureMapCanvas';

interface Props {
  name: string;
  label: string;
  shape: string;
  description: string;
  activations: number[][][][] | null; // [1, H, W, C]
  filters?: number[][][][] | null;    // [kH, kW, inC, outC]
  quote?: { title: string; quote: string; page: string };
}

export function LayerViz({ name: _name, label, shape, description, activations, filters, quote }: Props) {
  const [showQuote, setShowQuote] = useState(false);

  // activations[0] gives [H, W, C] — H rows, each row is W cols, each col is C values
  const maps = activations ? activations[0] : null;
  const numFilters = maps ? maps[0][0].length : 0;

  // Extract channel c as a 2D [H][W] array
  function getChannel(c: number): number[][] {
    if (!maps) return [];
    const H = maps.length;
    const W = maps[0].length;
    return Array.from({ length: H }, (_, h) =>
      Array.from({ length: W }, (_, w) => maps[h][w][c])
    );
  }

  // Extract filter for output channel c: filters[kH][kW][inC][outC] → [kH][kW][inC]
  function getFilterForChannel(c: number): number[][][] | undefined {
    if (!filters) return undefined;
    return filters.map(row =>
      row.map(col =>
        col.map(inCArr => inCArr[c])
      )
    );
  }

  const mapSize = numFilters <= 16 ? 64 : 52;

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-cyan-400 text-sm font-bold">{label}</span>
        <span className="text-slate-500 text-xs">{shape}</span>
        {quote && (
          <button
            onClick={() => setShowQuote(s => !s)}
            className="ml-auto text-xs px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
            title="Paper annotation"
          >
            📄 paper
          </button>
        )}
      </div>

      <p className="text-slate-400 text-xs mb-3 leading-relaxed">{description}</p>

      {showQuote && quote && (
        <div className="mb-3 p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg text-xs">
          <div className="font-semibold text-amber-400 mb-1">{quote.title}</div>
          <div className="text-amber-200/80 italic leading-relaxed">{quote.quote}</div>
          <div className="text-amber-600 mt-1">{quote.page}</div>
        </div>
      )}

      {!maps ? (
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: numFilters || 16 }).map((_, i) => (
            <div
              key={i}
              className="rounded bg-slate-800 animate-pulse"
              style={{ width: mapSize, height: mapSize }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: numFilters }).map((_, c) => (
            <FeatureMapCanvas
              key={c}
              data={getChannel(c)}
              filter={getFilterForChannel(c)}
              size={mapSize}
              label={`f${c}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

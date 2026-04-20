import { useRef, useCallback, useState } from 'react';
import { DrawCanvas } from './components/DrawCanvas';
import type { DrawCanvasHandle } from './components/DrawCanvas';
import { LayerViz } from './components/LayerViz';
import { ProbabilityBars } from './components/ProbabilityBars';
import { useModel } from './hooks/useModel';
import type { LayerActivations } from './hooks/useModel';
import { QUOTES } from './data/quotes';

export default function App() {
  const canvasRef = useRef<DrawCanvasHandle>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activations, setActivations] = useState<LayerActivations | null>(null);
  const { status, infer, filters } = useModel();

  const runInference = useCallback(async () => {
    const imgData = canvasRef.current?.get28x28();
    if (!imgData || status !== 'ready') return;
    const result = await infer(imgData);
    if (result) setActivations(result);
  }, [infer, status]);

  const onStroke = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runInference, 60);
  }, [runInference]);

  const quoteFor = (layerId: string) => QUOTES.find(q => q.layer === layerId);

  // Filter weights: [kH, kW, inC, outC]
  const conv1Filters = filters.current?.conv2d ?? null;   // [3, 3, 1, 16]
  const conv2Filters = filters.current?.conv2d_1 ?? null; // [3, 3, 16, 32]

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Draw-a-Digit ConvNet
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              LeCun, Bengio &amp; Hinton, <em>Nature</em> 2015 — made interactive
            </p>
          </div>
          {status === 'loading' && (
            <div className="flex items-center gap-2 text-slate-400 text-sm pt-1">
              <div className="w-4 h-4 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
              Loading model…
            </div>
          )}
          {status === 'error' && (
            <div className="text-red-400 text-sm pt-1">
              ⚠ Model not found. Run{' '}
              <code className="text-red-300 bg-red-950/30 px-1 rounded">
                python training/train.py
              </code>{' '}
              first.
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-8 items-start">
          {/* Left: Drawing canvas */}
          <div className="flex-shrink-0">
            <p className="text-slate-400 text-xs mb-2 uppercase tracking-widest">
              Input (560×560 → 28×28)
            </p>
            <DrawCanvas ref={canvasRef} onStroke={onStroke} />
          </div>

          {/* Right: Visualizations */}
          <div className="flex-1 space-y-4 min-w-0">
            <ProbabilityBars probs={activations?.probs ?? null} />

            <LayerViz
              name="conv2d"
              label="Conv2D Layer 1"
              shape="26×26 × 16 filters"
              activations={activations?.conv2d ?? null}
              filters={conv1Filters}
              quote={quoteFor('conv2d')}
            />
            <LayerViz
              name="pool1"
              label="MaxPool Layer 1"
              shape="13×13 × 16"
              activations={activations?.pool1 ?? null}
              quote={quoteFor('pool1')}
            />
            <LayerViz
              name="conv2d_1"
              label="Conv2D Layer 2"
              shape="11×11 × 32 filters"
              activations={activations?.conv2d_1 ?? null}
              filters={conv2Filters}
              quote={quoteFor('conv2d_1')}
            />
            <LayerViz
              name="pool2"
              label="MaxPool Layer 2"
              shape="5×5 × 32"
              activations={activations?.pool2 ?? null}
              quote={quoteFor('pool2')}
            />
          </div>
        </div>

        {/* Footer annotation */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
          Hover any feature map and click to inspect the learned filter kernel.
          Click "📄 paper" on each layer to see the relevant passage from the 2015 Nature paper.
        </div>
      </main>
    </div>
  );
}

interface Props {
  probs: number[] | null; // length 10
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function ProbabilityBars({ probs }: Props) {
  const prediction = probs ? probs.indexOf(Math.max(...probs)) : -1;

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-cyan-400 text-sm font-bold">Softmax Output</span>
        <span className="text-slate-500 text-xs">[10 classes]</span>
        {prediction >= 0 && probs && probs[prediction] > 0.5 && (
          <span className="ml-auto text-2xl font-bold text-white">{prediction}</span>
        )}
      </div>
      <div className="space-y-1.5">
        {DIGITS.map((d, i) => {
          const p = probs ? probs[i] : 0;
          const isTop = i === prediction;
          return (
            <div key={d} className="flex items-center gap-2">
              <span className={`w-4 text-xs font-mono ${isTop ? 'text-white font-bold' : 'text-slate-500'}`}>
                {d}
              </span>
              <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    isTop ? 'bg-cyan-400' : 'bg-slate-600'
                  }`}
                  style={{ width: `${(p * 100).toFixed(1)}%` }}
                />
              </div>
              <span className={`text-xs font-mono w-12 text-right ${isTop ? 'text-cyan-400' : 'text-slate-500'}`}>
                {(p * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

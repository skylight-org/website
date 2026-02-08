import { useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { InlineMath } from 'react-katex';

export function VAttentionSchematic() {
  const chartRef = useRef<HTMLDivElement | null>(null);

  // Vertical column data (12 tokens displayed as a column)
  const TOKEN_MASK: Array<'none' | 'det' | 'sample'> = [
    'det', 'det', 'none', 'sample',
    'det', 'none', 'sample', 'det',
    'none', 'det', 'sample', 'none',
  ];
  const TOKEN_PROB: string[] = [
    '1.0', '1.0', '', '1/5',
    '1.0', '', '1/3', '1.0',
    '', '1.0', '1/5', '',
  ];

  const maskCellClass = (m: 'none' | 'det' | 'sample') => {
    switch (m) {
      case 'det':
        return 'bg-accent-gold/40 border-accent-gold/70';
      case 'sample':
        return 'bg-orange-500/35 border-orange-400/60';
      default:
        return 'bg-gray-900/80 border-gray-700/50';
    }
  };

  const probCellClass = (p: string) => {
    if (p === '1.0') return 'bg-accent-gold/40 border-accent-gold/70 text-accent-gold font-semibold';
    if (p === '1/3') return 'bg-orange-500/45 border-orange-400/70 text-orange-200';
    if (p === '1/5') return 'bg-orange-500/30 border-orange-400/50 text-orange-300';
    return 'bg-gray-900/80 border-gray-700/50 text-gray-600';
  };

  const downloadChart = () => {
    if (chartRef.current) {
      htmlToImage.toPng(chartRef.current, { 
        backgroundColor: '#020617',
        filter: (node) => {
          if (node instanceof HTMLElement && node.getAttribute('data-export-ignore')) {
            return false;
          }
          return true;
        }
      })
        .then(dataUrl => {
          const link = document.createElement('a');
          link.download = 'vattention_schematic.png';
          link.href = dataUrl;
          link.click();
        });
    }
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 md:p-8 shadow-lg w-full overflow-x-auto" ref={chartRef}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-semibold text-white">vAttention Architecture</h3>
        <button 
          onClick={downloadChart}
          className="text-xs text-gray-400 hover:text-white border border-dark-border rounded px-3 py-1.5 transition-colors whitespace-nowrap"
          data-export-ignore="true"
        >
          Export PNG
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-2 md:gap-3 min-w-[600px]">

        {/* Input Block */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-32 h-12 bg-dark-bg border border-gray-600 rounded-lg flex items-center justify-center text-gray-300 font-mono text-sm">
            Q, K, V
          </div>
          <div className="w-32 px-2 py-1.5 bg-dark-bg/60 border border-gray-700 rounded text-center">
            <div className="text-gray-500 font-mono text-[9px] uppercase tracking-wider mb-0.5">Inputs</div>
            <div className="text-gray-300 font-mono text-[11px]">
              <InlineMath math="(\epsilon, \delta, \mathcal{X})" />
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden lg:block text-gray-500 text-base">→</div>
        <div className="block lg:hidden text-gray-500 text-base rotate-90">→</div>

        {/* Selection Policy */}
        <div className="border border-dashed border-gray-600 rounded-lg p-3 relative">
          <div className="absolute -top-2.5 left-3 bg-dark-surface px-1.5 text-[10px] text-gray-400 uppercase tracking-wider">Selection Policy</div>

          <div className="flex flex-col gap-3 mt-0.5">
            {/* Top-K Path */}
            <div className="flex items-center gap-2">
              <div className="w-28 p-2 bg-dark-bg border border-accent-gold/50 rounded text-center">
                <div className="text-accent-gold font-bold text-xs">Top-K</div>
                <div className="text-[8px] text-gray-400 mt-0.5">Heavy Hitters</div>
              </div>
              <div className="text-gray-500 text-xs">→</div>
              <div className="w-20 p-1.5 bg-accent-gold/10 border border-accent-gold/30 rounded text-center">
                <div className="text-gray-300 text-[10px] font-mono"><InlineMath math="\mathcal{I}_f" /></div>
              </div>
            </div>

            {/* Sampling Path */}
            <div className="flex items-center gap-2">
              <div className="w-28 p-2 bg-dark-bg border border-orange-500/50 rounded text-center">
                <div className="text-orange-400 font-bold text-xs">Sampling</div>
                <div className="text-[8px] text-gray-400 mt-0.5">Residual Mass</div>
              </div>
              <div className="text-gray-500 text-xs">→</div>
              <div className="w-20 p-1.5 bg-orange-500/10 border border-orange-500/30 rounded text-center">
                <div className="text-gray-300 text-[10px] font-mono"><InlineMath math="\mathcal{I}_{dyn}" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden lg:block text-gray-500 text-base">→</div>
        <div className="block lg:hidden text-gray-500 text-base rotate-90">→</div>

        {/* Two Vertical Columns: Selected Indices + Sampling Probability */}
        <div className="flex gap-2">
          {/* Selected Indices Column */}
          <div className="bg-dark-bg/50 border border-dark-border rounded-lg p-2 w-14">
            <div className="text-gray-400 font-mono text-[8px] uppercase tracking-wider text-center mb-1.5">Idx</div>
            <div className="flex flex-col gap-0.5">
              {TOKEN_MASK.map((m, idx) => (
                <div
                  key={idx}
                  className={`h-3.5 rounded border ${maskCellClass(m)}`}
                  title={m === 'det' ? 'deterministic' : m === 'sample' ? 'sampled' : 'not selected'}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="mt-2 flex flex-col gap-0.5 text-[7px] text-gray-500 font-mono">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded bg-accent-gold/40 border border-accent-gold/70" />
                <span>det</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded bg-orange-500/35 border border-orange-400/60" />
                <span>samp</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded bg-gray-900/80 border border-gray-700/50" />
                <span>skip</span>
              </div>
            </div>
          </div>

          {/* Sampling Probability Column */}
          <div className="bg-dark-bg/50 border border-dark-border rounded-lg p-2 w-14">
            <div className="text-gray-400 font-mono text-[8px] uppercase tracking-wider text-center mb-1.5">Prob</div>
            <div className="flex flex-col gap-0.5">
              {TOKEN_PROB.map((p, idx) => (
                <div
                  key={idx}
                  className={`h-3.5 rounded border flex items-center justify-center font-mono text-[7px] ${probCellClass(p)}`}
                  title={p ? `p=${p}` : 'p=0'}
                >
                  {p}
                </div>
              ))}
            </div>
            <div className="mt-2 text-[7px] text-gray-500 font-mono text-center leading-tight">
              <span className="text-accent-gold">1.0</span>=exact
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden lg:block text-gray-500 text-base">→</div>
        <div className="block lg:hidden text-gray-500 text-base rotate-90">→</div>

        {/* Output */}
        <div className="flex flex-col items-center">
          <div className="w-32 p-3 bg-dark-bg border-2 border-accent-gold rounded-lg text-center shadow-[0_0_12px_rgba(252,215,84,0.15)]">
            <div className="text-white font-bold text-xs mb-0.5">Weighted Sum</div>
            <div className="text-[8px] text-gray-400 font-mono mb-1.5">Exact + Scaled Est.</div>
            <div className="text-accent-gold font-mono text-[11px]">
              <InlineMath math="\approx \text{SDPA}" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

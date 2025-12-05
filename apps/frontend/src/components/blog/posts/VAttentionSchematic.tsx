import { InlineMath } from 'react-katex';

export function VAttentionSchematic() {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-8 shadow-lg w-full overflow-x-auto">
      <h3 className="text-xl font-semibold text-white mb-8 text-center">vAttention Architecture</h3>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 min-w-[600px]">
        
        {/* Input */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-16 bg-dark-bg border border-gray-600 rounded flex items-center justify-center text-gray-300 font-mono text-sm mb-2">
            Q, K, V
          </div>
          <div className="h-8 w-0.5 bg-gray-600"></div>
          <div className="w-32 h-12 bg-dark-surface-hover border border-gray-500 rounded flex items-center justify-center text-white font-mono text-xs text-center px-2">
            Compute Scores (Q·Kᵀ)
          </div>
        </div>

        <div className="hidden md:block w-8 h-0.5 bg-gray-600"></div>
        <div className="block md:hidden h-8 w-0.5 bg-gray-600"></div>

        {/* Split */}
        <div className="flex flex-col gap-4 relative">
          {/* Brackets or Lines logic could be complex, using simple boxes for now */}
          
          <div className="border border-dashed border-gray-600 rounded p-4 relative">
            <div className="absolute -top-3 left-4 bg-dark-surface px-2 text-xs text-gray-400 uppercase tracking-wider">Selection Policy</div>
            
            <div className="flex flex-col gap-6">
              {/* Top Path */}
              <div className="flex items-center gap-4">
                 <div className="w-40 p-3 bg-dark-bg border border-stone-500 rounded text-center">
                    <div className="text-accent-gold font-bold text-sm mb-1">Top-K</div>
                    <div className="text-[10px] text-gray-400">Identify Heavy Hitters</div>
                 </div>
                 <div className="text-gray-500">→</div>
                 <div className="w-32 p-3 bg-stone-900/50 border border-stone-700 rounded text-center">
                    <div className="text-gray-300 text-xs font-mono">Deterministic Indices <InlineMath math="\mathcal{I}_f" /></div>
                 </div>
              </div>

              {/* Bottom Path */}
              <div className="flex items-center gap-4">
                 <div className="w-40 p-3 bg-dark-bg border border-orange-500/50 rounded text-center">
                    <div className="text-orange-400 font-bold text-sm mb-1">Sampling</div>
                    <div className="text-[10px] text-gray-400">Estimate Residual Mass</div>
                 </div>
                 <div className="text-gray-500">→</div>
                 <div className="w-32 p-3 bg-orange-900/20 border border-orange-800/50 rounded text-center">
                    <div className="text-gray-300 text-xs font-mono">Sampled Indices <InlineMath math="\mathcal{I}_{dyn}" /></div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block w-8 h-0.5 bg-gray-600"></div>
        <div className="block md:hidden h-8 w-0.5 bg-gray-600"></div>

        {/* Output */}
        <div className="flex flex-col items-center">
          <div className="w-40 p-4 bg-dark-bg border-2 border-accent-gold rounded-lg text-center shadow-[0_0_15px_rgba(252,215,84,0.1)]">
            <div className="text-white font-bold text-sm mb-1">Weighted Sum</div>
            <div className="text-[10px] text-gray-400 font-mono mb-2">Exact + Scaled Estimate</div>
            <div className="text-accent-gold font-mono text-xs">
              <InlineMath math="\approx \text{SDPA}(Q,K,V)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



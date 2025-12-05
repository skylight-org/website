import { useMemo } from 'react';
import { useCombinedViewBoth } from '../../../hooks/useCombinedView';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { SparsityFrontierPlot } from './SparsityFrontierPlot';
import { AttentionErrorPlot } from './AttentionErrorPlot';
import { VAttentionSchematic } from './VAttentionSchematic';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export const VAttentionEntry = () => {
  const { data: combinedViewData, isLoading } = useCombinedViewBoth();

  // Show only 50x (2%), 10x (10%), and 5x (20%) sparsity levels
  const filteredSparsities = useMemo(() => {
    if (!combinedViewData?.sparsities) return [];
    // Filter for specific percentage values: 2%, 10%, 20%
    return combinedViewData.sparsities.filter(s => [2, 10, 20].includes(s));
  }, [combinedViewData?.sparsities]);

  return (
    <div className="space-y-10 text-lg text-gray-300 leading-relaxed font-light">
      {/* Introduction */}
      <div className="space-y-6">
        <p>
          We have updated the Tier-1A leaderboard with <strong>vAttention</strong> baselines, and the results are unambiguous: vAttention dominates the sparsity-quality frontier. At <strong>50x sparsity</strong>, it elevates relative accuracy from 92% (Oracle Top-P) to <strong>97%</strong>, while delivering &gt;99% accuracy at 5x and 10x compression.
        </p>
        <p>
          This performance exposes the structural limitations of standard "Oracle" methods. Oracle Top-K fails when attention distributions are flat (high entropy), while Oracle Top-P cannot guarantee fixed memory budgets. 
        </p>
        <p>
          vAttention is the complementary solution. It treats sparse attention not just as a selection problem, but as an estimation problem. By combining deterministic Top-K selection with a verified sampling estimator for the residual tail, vAttention ensures robustness across all distribution shapes—fixing the blind spots of oracle baselines.
        </p>
      </div>

      {/* Results Section */}
      <section>
        <h2 id="latest-results" className="text-3xl font-bold text-white mt-12 mb-6 tracking-tight">
          Performance: Redefining the Frontier
        </h2>
        
        <p className="mb-6">
          Our evaluation on the Tier-1A leaderboard demonstrates that vAttention delivers near-lossless performance at high compression ratios. The method achieves <strong>&gt;99% relative accuracy</strong> at both 5x (99.8%) and 10x (99.3%) sparsity.
        </p>

        <p className="mb-6">
          Crucially, vAttention remains robust in extreme sparsity regimes. At <strong>50x sparsity</strong> (2% KV Cache Reads), it boosts relative accuracy from 92% (Oracle Top-P) to <strong>97%</strong>.
        </p>

        <p className="mb-8">
          The practical implications are significant. <strong>vAttention (PQCache)</strong>—a fully practical implementation using Product Quantization—outperforms the theoretical Oracle Top-K baseline at 5x and 10x sparsities. This result indicates that practical, system-optimized sparse attention can now exceed the theoretical bounds of standard oracle approximations.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : combinedViewData ? (
          <div className="my-12">
            <SparsityFrontierPlot
              sparsities={filteredSparsities}
              gapResults={combinedViewData.overallScore.results}
              errorResults={combinedViewData.localError.results}
            />
            <p className="text-sm text-gray-500 text-center mt-4 font-mono">
              Figure 1: Sparsity-Quality Frontier. vAttention (solid lines) strictly dominates standard baselines (dashed).
            </p>
          </div>
        ) : null}
      </section>
      
      <hr className="border-dark-border opacity-50" />

      {/* Technical Deep Dive */}
      <section>
        <h2 id="methodology" className="text-3xl font-bold text-white mt-12 mb-6 tracking-tight">
          Methodology: Hybrid Deterministic-Probabilistic Attention
        </h2>

        <p className="mb-6">
          The primary failure mode of existing Top-K methods is the handling of <strong>flat attention distributions</strong>. When attention scores are uniform, deterministic Top-K selection incurs large approximation errors, while adaptive Top-P approaches select an excessive number of tokens, reducing sparsity benefits.
        </p>
        
        <p className="mb-8">
          vAttention resolves this by introducing a hybrid estimator. It employs a deterministic Top-K pass to capture heavy hitters and a complementary sampling-based estimator to approximate the residual mass. This combination ensures low variance across the full spectrum of attention distributions (Figure 2).
        </p>
        
        <div className="grid grid-cols-1 gap-12 my-12">
          <div>
             <AttentionErrorPlot />
             <p className="text-center text-gray-500 mt-3 font-mono text-xs">
               Figure 2: Error vs. Distribution Flatness. vAttention maintains low error even where Top-K fails.
             </p>
          </div>
          <div>
             <VAttentionSchematic />
             <p className="text-center text-gray-500 mt-3 font-mono text-xs">
               Figure 3: The vAttention Architecture.
             </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mb-4">Algorithm Formulation</h3>
        <p className="mb-4">
          The attention computation is decomposed into a deterministic component (over indices <InlineMath math="\mathcal{I}_f" />) and a stochastic estimate of the residual (over sampled indices <InlineMath math="\mathcal{I}_{dyn}" />):
        </p>

        <div className="bg-dark-surface/50 border border-dark-border rounded p-4 overflow-x-auto mb-6">
          <BlockMath math={`
            \\begin{aligned}
             N &= \\underbrace{\\sum_{i \\in \\mathcal{I}_f} e^{\\langle K_i, q\\rangle } V_i}_{\\text{Deterministic}} + \\underbrace{\\frac{n_s}{|\\mathcal{I}_{dyn}|}\\sum_{j \\in \\mathcal{I}_{dyn}} e^{\\langle K_j, q\\rangle }V_j}_{\\text{Stochastic Estimate}} \\\\
             D &= \\sum_{i \\in \\mathcal{I}_f} e^{\\langle K_i, q\\rangle } + \\frac{n_s}{|\\mathcal{I}_{dyn}|} \\sum_{j \\in \\mathcal{I}_{dyn}} e^{\\langle K_j, q\\rangle } \\\\
             \\text{SDPA} &= \\frac{N}{D}
            \\end{aligned}
          `} />
        </div>
      </section>

      {/* Theory Section */}
      <section>
        <h2 id="theoretical-guarantees" className="text-3xl font-bold text-white mt-12 mb-6 tracking-tight">
          Theoretical Framework: Verified-X
        </h2>

        <p className="mb-6">
          Unlike heuristic approaches, vAttention offers explicit theoretical guarantees. We formalize this as the <strong>Verified-X</strong> property: an algorithm is <InlineMath math="(\epsilon, \delta)" />-verified if it approximates a target computation <InlineMath math="\mathcal{X}" /> within relative error <InlineMath math="\epsilon" /> with probability at least <InlineMath math="1 - \delta" />.
        </p>

        <div className="border-l-2 border-accent-gold pl-6 py-2 my-8">
           <h4 className="text-white font-mono text-sm uppercase tracking-widest mb-2">Definition</h4>
           <div className="overflow-x-auto">
             <BlockMath math="\mathbf{Pr}\left( \frac{|| \mathcal{X}'(x) - \mathcal{X}(x) ||_2}{|| \mathcal{X}(x) ||_2} > \epsilon \right) < 1 - \delta" />
           </div>
        </div>

        <p className="mb-6">
          For the numerator and denominator (<InlineMath math="\mathcal{X} \in \{N, D\}" />), the residual sums are unbiased estimators. By applying concentration inequalities to the vector-valued sums, we derive a closed-form lower bound for the sampling budget <InlineMath math="b" /> required to satisfy the guarantee:
        </p>

        <div className="border-l-2 border-accent-gold pl-6 py-2 my-8">
           <h4 className="text-white font-mono text-sm uppercase tracking-widest mb-2">Theorem: Sampling Budget Bound</h4>
           <p className="text-sm mb-3">
             For a sample size <InlineMath math="b" />, population covariance <InlineMath math="\Sigma" />, and residual count <InlineMath math="n_s" />:
           </p>
           <div className="overflow-x-auto">
             <BlockMath math={`
               b \\geq \\left(\\Phi^{-1}\\left(1 - \\frac{\\delta}{2}\\right) \\frac{n_s \\sqrt{\\mathbf{Tr}(\\Sigma)}}{\\tau} \\right)^2 \\implies \\mathbf{Pr}(||\\hat{\\mathbf{s}} - \\mathbf{s}||_2 > \\tau) \\leq \\delta
             `} />
           </div>
        </div>

        <p>
          This result allows vAttention to dynamically size <InlineMath math="\mathcal{I}_{dyn}" /> at runtime, minimizing compute while satisfying rigorous user-defined accuracy constraints (<InlineMath math="\epsilon, \delta" />).
        </p>
      </section>

      {/* Conclusion */}
      <section>
        <h2 id="conclusion" className="text-3xl font-bold text-white mt-12 mb-6 tracking-tight">
          Conclusion
        </h2>
        <p>
          vAttention transforms sparse attention from a heuristic optimization into a rigorous system primitive. By formally bounding approximation error through the Verified-X framework and implementing a hybrid top-k/sampling kernel, it simultaneously reduces memory overhead and improves model quality. The results on the SkyLight leaderboard confirm that this paradigm shift enables efficient, long-context reasoning without compromising reliability.
        </p>
      </section>
    </div>
  );
};

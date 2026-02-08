import { useMemo } from 'react';
import { useCombinedViewBoth } from '../../../hooks/useCombinedView';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { ScrollableFormulaContainer } from '../../common/ScrollableFormulaContainer';
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
    return combinedViewData.sparsities.filter(s => [2, 10, 20].includes(s));
  }, [combinedViewData?.sparsities]);

  const configCode = `sparse_attention_config = ResearchAttentionConfig(
    masker_configs=[
        SinkMaskerConfig(
            sink_size=128,
        ),
        LocalMaskerConfig(
            window_size=128,
        ),
        PQCacheConfig(
            heavy_size=0.1,
            pq_group_factor=2,
            pq_bits=6,
            kmeans_iter=10,
            init_offset=128,
            metric="euclidean",
        ),
        AdaptiveSamplingMaskerConfig(
            delta = 0.05,
            epsilon = 0.05,
            init_offset = 128,
            local_offset =  128,
            base_rate_sampling = 0.05
        )
    ]
)`;

  const runCode = `git clone https://github.com/skylight-org/sparse-attention-hub.git
cd sparse-attention-hub && pip install -e . && pip install -e .[dev]
# add your sparse_attention_config to the top of chat.py to replace default
python3 demo/chat.py --model Qwen/Qwen3-30B-A3B-Instruct-2507`;

  return (
    <div className="space-y-12 text-lg text-gray-300 leading-relaxed font-light max-w-[1400px] mx-auto px-4 md:px-8">
      {/* Header / Intro */}
      <div className="space-y-8 border-b border-dark-border/50 pb-12 max-w-4xl mx-auto">
        <div className="flex flex-col gap-4">
          <p className="text-accent-gold font-mono text-sm tracking-widest uppercase">Research • Systems • Oct 2025</p>
          <p className="text-gray-500 text-sm">
            <a
              href="https://arxiv.org/abs/2510.05688"
              className="hover:text-accent-blue transition-colors underline decoration-dark-border hover:decoration-accent-blue underline-offset-4"
            >
              arXiv:2510.05688
            </a>
          </p>
        </div>

        <p className="text-xl text-gray-200 leading-relaxed">
          Sparse attention methods are now essential for decoding long-context language models, but existing approaches break down in regimes that matter in practice. In particular, heavy-hitter methods such as top-k and top-p implicitly assume that attention mass is concentrated on a small set of tokens. This assumption holds for some heads and queries—but not for many others.
        </p>
        <p className="text-xl text-gray-200 leading-relaxed">
          In this post, we introduce <strong>vAttention (Verified Sparse Attention)</strong>, a sparse attention method designed to remain accurate across the full range of attention entropy. vAttention combines deterministic token selection with stochastic estimation and provides explicit, user-controlled error guarantees for the resulting approximation.
        </p>
      </div>

      {/* Section 1: The Context */}
      <section className="space-y-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">1. vAttention: A hybrid deterministic + probabilistic sparse attention</h2>

        <h3 className="text-2xl font-semibold text-white mt-8 mb-4">Stochastic index selection: a paradigm shift</h3>
        <p>
          Heavy-hitter approaches—such as top-k and top-p—which select tokens that dominate attention scores, are a natural choice for sparse attention. When attention is highly concentrated on a small number of tokens, top-k provides a close approximation to full attention. However, recent work shows that attention entropy varies significantly across heads and query vectors, with many instances exhibiting high-entropy distributions. This variability exposes a fundamental limitation of existing heavy-hitter methods.
        </p>
        <p>
          When attention scores are nearly uniform, fixed top-k selection incurs large approximation errors, while adaptive top-p methods must retain an excessive number of tokens to preserve accuracy. Consequently, for high-entropy distributions, heavy-hitter approaches exhibit a poor sparsity–quality trade-off.
        </p>
        <p>
          To address this limitation, vAttention introduces a paradigm shift: stochastic index selection with unbiased estimation of the attention numerator and denominator. The key insight is that sampling-based estimation and top-k approximation are complementary. Consider estimating a sum of <InlineMath math="n" /> terms. A top-k approximation and sampling based estimator compute:
        </p>

        {/* Estimator presentation */}
        <ScrollableFormulaContainer 
          className="my-8" 
          ariaLabel="Estimator comparison formulas"
          minWidth="min-w-[600px]"
        >
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-gray-500 text-xs font-mono uppercase tracking-wider mb-3">Target</div>
                <div className="text-white"><BlockMath math={String.raw`y = \sum_{i=1}^n x_i`} /></div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-mono uppercase tracking-wider mb-3">Top-K</div>
                <div className="text-white"><BlockMath math={String.raw`\hat{y}_{\text{top}} = \sum_{i=1}^k x_{j_i}`} /></div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-mono uppercase tracking-wider mb-3">Sampling</div>
                <div className="text-white"><BlockMath math={String.raw`\hat{y}_{\text{samp}} = \frac{n}{k}\sum_{i=1}^k x_{j_i}`} /></div>
              </div>
            </div>

            <div className="border-t border-dark-border pt-6">
              <div className="text-accent-gold text-xs font-mono uppercase tracking-wider mb-4 text-center">Hybrid Estimator</div>
              <div className="text-white text-center">
                <BlockMath math={String.raw`\hat{y}_{\text{hybrid}} = \underbrace{\sum_{i=1}^{k_1} x_{t_i}}_{\text{head (top-}k\text{)}} + \underbrace{\frac{n-k_1}{k_2}\sum_{i=1}^{k_2} x_{s_i}}_{\text{tail (sampling)}}`} />
              </div>
            </div>
          </div>
        </ScrollableFormulaContainer>

        <p>
          When used in isolation, each method has clear failure modes. In low-entropy settings, where only a few terms contribute meaningfully to <InlineMath math="y" />, top-k performs well, while sampling-based estimation suffers from high variance. Conversely, in high-entropy settings—where contributions are broadly distributed—sampling-based estimation remains accurate, whereas top-k incurs large bias. Recognizing this complementary behavior, vAttention combines the two into a hybrid estimator.
        </p>

        <p>
          This hybrid approach captures dominant contributors deterministically while estimating the remaining mass stochastically. The result is robust performance across the full entropy spectrum, yielding a significantly improved sparsity–quality frontier.
        </p>
      </section>

      {/* Figure 1 */}
      <div className="my-10 p-6 bg-black/20 rounded-xl border border-dark-border max-w-4xl mx-auto">
        <AttentionErrorPlot />
        <p className="text-center text-gray-500 mt-4 font-mono text-xs">
          Figure 1: Error vs. Distribution Flatness. vAttention maintains low error even where Top-K fails.
        </p>
      </div>

      <section className="space-y-6 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold text-white mt-8 mb-4">vAttention algorithm</h3>
        <p>
          Algorithmically, vAttention is parameterized by an off-the-shelf top-k sparse attention method. It uses this top-k predictor—augmented with sink and local tokens—to select a set of deterministic indices. vAttention then samples additional indices uniformly at random from the remaining (residual) tokens and combines both sets to compute the full attention estimate. The resulting computation proceeds as follows:
        </p>

        <ScrollableFormulaContainer 
          className="my-8" 
          ariaLabel="vAttention algorithm equations"
          minWidth="min-w-[500px]"
        >
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="text-accent-gold text-xs font-mono uppercase tracking-wider mb-4">vAttention Algorithm</div>
            <div className="text-white space-y-4">
              <BlockMath math={String.raw`N = \sum_{i \in \mathcal{I}_f} e^{\langle K_i, q\rangle} V_i + \frac{n_s}{|\mathcal{I}_{dyn}|}\sum_{j \in \mathcal{I}_{dyn}} e^{\langle K_j, q\rangle} V_j`} />
              <BlockMath math={String.raw`D = \sum_{i \in \mathcal{I}_f} e^{\langle K_i, q\rangle} + \frac{n_s}{|\mathcal{I}_{dyn}|}\sum_{j \in \mathcal{I}_{dyn}} e^{\langle K_j, q\rangle}`} />
              <BlockMath math={String.raw`\text{SDPA} = \frac{N}{D}`} />
            </div>
            <div className="mt-4 text-gray-500 text-xs font-mono">
              <InlineMath math="\mathcal{I}_f" />: deterministic indices &nbsp;|&nbsp; <InlineMath math="\mathcal{I}_{dyn}" />: sampled indices &nbsp;|&nbsp; <InlineMath math="n_s" />: residual count
            </div>
          </div>
        </ScrollableFormulaContainer>

        <p>
          The budget allocated to stochastic computation is a central contribution of vAttention and the key factor that makes it “verified”. By dynamically selecting this budget, vAttention provides user-controllable quality guarantees for intermediate approximate computations. These intermediates may correspond to the numerator, the denominator of SDPA, or the full SDPA itself. The resulting theoretical guarantees are derived from a statistical analysis of random sampling–based estimators and are briefly outlined below.
        </p>
      </section>

      {/* Schematic Figure */}
      <div className="my-12">
        <VAttentionSchematic />
        <p className="text-center text-gray-500 mt-4 font-mono text-xs">
          Figure 2: vAttention: recipe for verified-<InlineMath math="\mathcal{X}" /> attention.
        </p>
      </div>

      <section className="space-y-6 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold text-white mt-8 mb-4">
          Theoretical framework of Verified-<InlineMath math="\mathcal{X}" /> algorithm
        </h3>
        <p>
          Unlike heuristic approaches, vAttention offers explicit theoretical guarantees. We formalize this as the <strong>Verified-X</strong> property: an algorithm is <InlineMath math="(\epsilon, \delta)" />-verified if it approximates a target computation <InlineMath math="\mathcal{X}" /> within relative error <InlineMath math="\epsilon" /> with probability at least <InlineMath math="1 - \delta" /> for all inputs.
        </p>

        <ScrollableFormulaContainer 
          className="my-8" 
          ariaLabel="Verified-X definition formula"
          minWidth="min-w-[450px]"
        >
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="text-accent-gold text-xs font-mono uppercase tracking-wider mb-4">Definition: Verified-<InlineMath math="\mathcal{X}" /></div>
            <div className="text-white text-center">
              <BlockMath math={String.raw`\Pr\!\left( \frac{\| \mathcal{X}'(x) - \mathcal{X}(x) \|_2}{\| \mathcal{X}(x) \|_2} > \epsilon \right) < \delta \quad \forall\, x`} />
            </div>
          </div>
        </ScrollableFormulaContainer>

        <p>
          For the numerator and denominator (<InlineMath math="\mathcal{X} \in \{N, D\}" />), the residual sums are unbiased estimators. By applying concentration inequalities to the vector-valued sums, we derive a closed-form lower bound for the sampling budget <InlineMath math="b" /> required to satisfy the guarantee:
        </p>

        <ScrollableFormulaContainer 
          className="my-8" 
          ariaLabel="Sampling budget bound theorem"
          minWidth="min-w-[600px]"
        >
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="text-accent-gold text-xs font-mono uppercase tracking-wider mb-4">Theorem: Sampling Budget Bound</div>
            <div className="text-white text-center">
              <BlockMath math={String.raw`b \geq \left( \Phi^{-1}\!\left(1 - \tfrac{\delta}{2}\right) \cdot \frac{n_s \sqrt{\mathrm{Tr}(\Sigma)}}{\tau} \right)^{\!2} \;\Longrightarrow\; \Pr\!\left(\|\hat{s} - s\|_2 > \tau\right) \le \delta`} />
            </div>
            <div className="mt-4 text-gray-500 text-xs font-mono">
              <InlineMath math="b" />: sample size &nbsp;|&nbsp; <InlineMath math="\Sigma" />: population covariance &nbsp;|&nbsp; <InlineMath math="n_s" />: residual count &nbsp;|&nbsp; <InlineMath math="\tau" />: error tolerance
            </div>
          </div>
        </ScrollableFormulaContainer>

        <p>
          The results for numerator and denominator can be combined to obtain budget for guarantees over the entire attention computation. This result allows vAttention to dynamically size <InlineMath math="\mathcal{I}_{dyn}" /> at runtime, minimizing compute while satisfying rigorous user-defined accuracy constraints (<InlineMath math="\epsilon, \delta" />).
        </p>
      </section>

      {/* Section 2: Results */}
      <section className="space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">2. vAttention Results</h2>
          <p>
            We have updated the Tier-1A leaderboard with <strong>vAttention</strong>, and the results are unambiguous: vAttention absolutely dominates the sparsity-quality frontier.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : combinedViewData ? (
          <div className="my-10 p-6 bg-black/20 rounded-xl border border-dark-border">
            <SparsityFrontierPlot
              sparsities={filteredSparsities}
              gapResults={combinedViewData.overallScore.results}
              errorResults={combinedViewData.localError.results}
            />
            <p className="text-center text-gray-500 mt-4 font-mono text-xs">
              Figure 3: Sparsity-Quality Frontier. vAttention (solid lines) maintains &gt;99% relative accuracy even at extreme sparsities.
            </p>
          </div>
        ) : null}

        <div className="max-w-4xl mx-auto space-y-6">
          <h3 className="text-2xl font-semibold text-white mt-8 mb-4">The paradigm shift offers new frontier.</h3>
          <p>
            In the last blog, we highlighted the gaps in oracle-top-k and oracle-top-p based sparse attention and dense attention showing the need for a new paradigm in sparse attention. vAttention(oracle-top-k) provides a new paradigm that fills this gap. At <strong>50x sparsity</strong>, it elevates relative accuracy from 92% (oracle-top-p) to <strong>97%</strong>, while delivering <strong>&gt;99%</strong> relative accuracy at 5x and 10x compression compared to dense attention.
          </p>

          <h3 className="text-2xl font-semibold text-white mt-8 mb-4">A new state-of-the art method that beats oracle-top-k is born.</h3>
          <p>
            The practical implications are significant. <strong>vAttention (PQCache)</strong>—a fully practical implementation parameterizing vAttention with <a href="https://sky-light.eecs.berkeley.edu/#/blog/pqcache" className="text-accent-blue hover:underline">PQCache</a>, a product quantization based top-k predictor, is not only the new state of the art, but it outperforms the theoretical oracle-top-k baseline at 5x and 10x sparsities. This result indicates that a practical sparse attention can now exceed the theoretical bounds of standard oracle approximations.
          </p>
        </div>
      </section>

      {/* Section 3: vAttention in SkyLight */}
      <section className="space-y-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">3. vAttention in SkyLight</h2>
        <p>
          <a href="https://github.com/skylight-org/sparse-attention-hub" className="text-accent-blue hover:underline">SkyLight</a> seamlessly supports composing and running a wide range of sparse attention ideas. Thanks to its modular design, we can experiment with vAttention parameterized with any deterministic index selection method. For instance, we use the following config to run vAttention(PQCache):
        </p>

        <div className="rounded-lg overflow-hidden my-6 border border-dark-border bg-[#282c34]">
          <div className="p-6 bg-[#282c34] text-gray-300 font-mono text-sm whitespace-pre overflow-x-auto">{configCode}</div>
        </div>

        <p>To explore vAttention in chat mode use:</p>

        <div className="rounded-lg overflow-hidden my-6 border border-dark-border bg-[#282c34]">
          <div className="p-6 bg-[#282c34] text-gray-300 font-mono text-sm whitespace-pre overflow-x-auto">{runCode}</div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="space-y-6 pt-12 border-t border-dark-border/50 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">Conclusion</h2>
        <p>
          vAttention introduces a paradigm shift in sparse attention by combining stochastic index selection with existing top-k methods. This approach establishes a new sparsity–quality frontier and achieves state-of-the-art performance among sparse attention mechanisms. The Verified-<InlineMath math="\mathcal{X}" /> recipe provides principled error guarantees for approximate attention computation, enabling more reliable and robust deployment of vAttention in real-world settings. We hope that vAttention will help drive broader practical adoption of inference time sparse attention.
        </p>

        <div className="mt-12 p-6 bg-dark-surface rounded border border-dark-border text-sm text-gray-400 font-mono">
          <p className="mb-2">@article&#123;desai2025vattention,</p>
          <p className="pl-4">title=&#123;vAttention: Verified Sparse Attention&#125;,</p>
          <p className="pl-4">author=&#123;Desai, Aditya and Agrawal, Kumar Krishna and Yang, Shuo and Cuadron, Alejandro and Schroeder, Luis Gaspar and Zaharia, Matei and Gonzalez, Joseph E and Stoica, Ion&#125;,</p>
          <p className="pl-4">journal=&#123;arXiv preprint arXiv:2510.05688&#125;,</p>
          <p className="pl-4">year=&#123;2025&#125;</p>
          <p>&#125;</p>
          <br />
          <p className="mb-2">@article&#123;sky_light_2025,</p>
          <p className="pl-4">author    = &#123;Aditya Desai and Kumar Krishna Agrawal and Luis Schroeder and Prithvi Dixit and Matei Zaharia and Joseph E. Gonzalez and Ion Stoica&#125;,</p>
          <p className="pl-4">title     = &#123;Introducing Sky-Light: Advancing the frontier of sparse attention research&#125;,</p>
          <p className="pl-4">year      = &#123;2025&#125;,</p>
          <p className="pl-4">month     = nov,</p>
          <p className="pl-4">url       = &#123;https://sky-light.eecs.berkeley.edu/&#125;,</p>
          <p className="pl-4">note      = &#123;UC Berkeley&#125;</p>
          <p>&#125;</p>
        </div>
      </section>
    </div>
  );
};

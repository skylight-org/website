import { useEffect } from 'react';

export const VAttentionEntry = () => {
  useEffect(() => {
    // Trigger MathJax to process the page
    if (window.MathJax) {
      window.MathJax.typesetPromise?.().catch((err: any) => console.error('MathJax typeset failed:', err));
    }
  }, []);

  return (
    <div className="space-y-8 text-lg">
      <p className="text-gray-300 leading-relaxed">
        Sparse attention methods are now essential for decoding long-context language models, but existing approaches break down in regimes that matter in practice. In particular, heavy-hitter methods such as top-k and top-p implicitly assume that attention mass is concentrated on a small set of tokens. This assumption holds for some heads and queries—but not for many others.
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        Today, we release an updated version of our leaderboard featuring <strong>vAttention: Verified Sparse Attention</strong>—a sparse attention method designed to remain accurate across the full range of attention entropy while providing explicit, user-controlled error guarantees for the resulting approximation. The results are striking: vAttention decisively dominates the sparsity–quality frontier, delivers a clear breakthrough beyond oracle top-k paradigms, and sets a new state of the art in sparse attention.
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        We begin by explaining why existing sparse attention methods fail, and how vAttention addresses those failure modes.
      </p>

      <h2 id="hybrid-attention" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">vAttention: A hybrid sparse attention</h2>
      
      <h3 id="stochastic-selection" className="text-2xl font-bold text-white mt-12 mb-4 scroll-mt-24 tracking-tight">1. Stochastic index selection: a paradigm shift</h3>
      
      <p className="text-gray-300 leading-relaxed">
        Heavy-hitter approaches—such as top-k and top-p—which select tokens that dominate attention scores, are a natural choice for sparse attention. When attention is highly concentrated on a small number of tokens, top-k provides a close approximation to full attention. However, recent work shows that attention entropy varies significantly across heads and query vectors, with many instances exhibiting high-entropy distributions. This variability exposes a fundamental limitation of existing heavy-hitter methods.
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        When attention scores are nearly uniform, fixed top-k selection incurs large approximation errors, while adaptive top-p methods must retain an excessive number of tokens to preserve accuracy. Consequently, for high-entropy distributions, heavy-hitter approaches exhibit a poor sparsity–quality trade-off.
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        To address this limitation, vAttention introduces a paradigm shift: <strong>stochastic index selection with unbiased estimation</strong> of the attention numerator and denominator. The key insight is that sampling-based estimation and top-k approximation are complementary. Consider estimating a sum of <span dangerouslySetInnerHTML={{__html: '\\(n\\)'}} /> terms. A top-k approximation and sampling based estimator compute:
      </p>

      <div 
        className="my-8 text-center text-gray-300"
        dangerouslySetInnerHTML={{__html: '\\[ y = \\sum_{i=1}^n x_i \\qquad \\hat{y}_{\\text{top}} = \\sum_{i=1}^k x_{j_i} \\qquad \\hat{y}_{\\text{sample}} = \\sum_{i=1}^k \\frac{n}{k} x_{j_i} \\]'}}
      />
      
      <p className="text-gray-300 leading-relaxed">
        When used in isolation, each method has clear failure modes. In low-entropy settings, where only a few terms contribute meaningfully to <span dangerouslySetInnerHTML={{__html: '\\(y\\)'}} />, top-k performs well, while sampling-based estimation suffers from high variance. Conversely, in high-entropy settings—where contributions are broadly distributed—sampling-based estimation remains accurate, whereas top-k incurs large bias. Recognizing this complementary behavior, vAttention combines the two into a hybrid estimator:
      </p>

      <div 
        className="my-8 text-center text-gray-300"
        dangerouslySetInnerHTML={{__html: '\\[ \\hat{y}_t = \\sum_{i=1}^{k_1} x_{t_i} + \\sum_{i=1}^{k_2} \\frac{n-k_1}{k_2} x_{s_i} \\]'}}
      />
      
      <p className="text-gray-300 leading-relaxed">
        which captures dominant contributors deterministically while estimating the remaining mass stochastically. This hybrid approach yields robust performance across the entire entropy spectrum, achieving a significantly improved sparsity–quality frontier.
      </p>

      <figure className="my-10">
        <img 
          src="blogs/vattention/error-vs-flatness.png" 
          alt="Error vs. Distribution Flatness" 
          className="w-full max-w-2xl mx-auto rounded-lg border border-gray-800 shadow-lg"
        />
        <figcaption className="text-center text-gray-500 mt-4 font-mono text-sm">
          <strong>Figure 1:</strong> Error vs. Distribution Flatness. vAttention maintains low error even where Top-K fails.
        </figcaption>
      </figure>

      <h3 id="algorithm" className="text-2xl font-bold text-white mt-12 mb-4 scroll-mt-24 tracking-tight">2. vAttention algorithm</h3>
      
      <p className="text-gray-300 leading-relaxed">
        Algorithmically, vAttention is parameterized by an off-the-shelf top-k sparse attention method. It uses this top-k predictor—augmented with sink and local tokens—to select a set of deterministic indices. vAttention then samples additional indices uniformly at random from the remaining (residual) tokens and combines both sets to compute the full attention estimate. The resulting computation proceeds as follows:
      </p>

      <div 
        className="my-8 text-gray-300"
        dangerouslySetInnerHTML={{__html: `\\[
        \\begin{aligned}
        N &= \\underbrace{\\sum_{i \\in \\mathcal{I}_f} e^{\\langle K_i, q\\rangle} V_i}_{\\text{Deterministic}} + \\underbrace{\\frac{n_s}{|\\mathcal{I}_{dyn}|}\\sum_{j \\in \\mathcal{I}_{dyn}} e^{\\langle K_j, q\\rangle}V_j}_{\\text{Stochastic Estimate}} \\\\
        D &= \\sum_{i \\in \\mathcal{I}_f} e^{\\langle K_i, q\\rangle} + \\frac{n_s}{|\\mathcal{I}_{dyn}|} \\sum_{j \\in \\mathcal{I}_{dyn}} e^{\\langle K_j, q\\rangle} \\\\
        \\text{SDPA} &= \\frac{N}{D}
        \\end{aligned}
        \\]`}}
      />
      
      <p className="text-gray-300 leading-relaxed">
        The budget allocated to stochastic computation is a central contribution of vAttention and the key factor that makes it "verified". By dynamically selecting this budget, vAttention provides user-controllable quality guarantees for intermediate approximate computations. These intermediates may correspond to the numerator, the denominator of SDPA, or the full SDPA itself. The resulting theoretical guarantees are derived from a statistical analysis of random sampling–based estimators and are briefly outlined below.
      </p>

      <h3 id="theoretical-framework" className="text-2xl font-bold text-white mt-12 mb-4 scroll-mt-24 tracking-tight">3. Theoretical framework of Verified-𝓧 algorithm</h3>
      
      <p className="text-gray-300 leading-relaxed">
        Unlike heuristic approaches, vAttention offers explicit theoretical guarantees. We formalize this as the <strong>Verified-X</strong> property: an algorithm is <span dangerouslySetInnerHTML={{__html: '\\((\\varepsilon, \\delta)\\)'}} />-verified if it approximates a target computation <span dangerouslySetInnerHTML={{__html: '\\(\\mathcal{X}\\)'}} /> within relative error <span dangerouslySetInnerHTML={{__html: '\\(\\varepsilon\\)'}} /> with probability at least <span dangerouslySetInnerHTML={{__html: '\\(1 - \\delta\\)'}} /> for all inputs.
      </p>

      <blockquote className="border-l-4 border-accent-gold pl-6 my-8 text-gray-400 bg-dark-surface p-4 rounded-r-lg">
        <p className="font-semibold text-white mb-2">Definition</p>
        <div 
          className="text-gray-300"
          dangerouslySetInnerHTML={{__html: '\\[ \\mathbf{Pr}\\left( \\frac{\\|\\mathcal{X}\'(x) - \\mathcal{X}(x)\\|_2}{\\|\\mathcal{X}(x)\\|_2} > \\varepsilon \\right) < 1 - \\delta \\qquad \\forall x \\]'}}
        />
      </blockquote>
      
      <p className="text-gray-300 leading-relaxed">
        For the numerator and denominator (<span dangerouslySetInnerHTML={{__html: '\\(\\mathcal{X} \\in \\{N, D\\}\\)'}} />), the residual sums are unbiased estimators. By applying concentration inequalities to the vector-valued sums, we derive a closed-form lower bound for the sampling budget <span dangerouslySetInnerHTML={{__html: '\\(b\\)'}} /> required to satisfy the guarantee:
      </p>

      <blockquote className="border-l-4 border-accent-gold pl-6 my-8 text-gray-400 bg-dark-surface p-4 rounded-r-lg">
        <p className="font-semibold text-white mb-2">Theorem: Sampling Budget Bound</p>
        <p className="text-sm mb-2 text-gray-300">
          For a sample size <span dangerouslySetInnerHTML={{__html: '\\(b\\)'}} />, population covariance <span dangerouslySetInnerHTML={{__html: '\\(\\Sigma\\)'}} />, and residual count <span dangerouslySetInnerHTML={{__html: '\\(n_s\\)'}} />:
        </p>
        <div 
          className="text-gray-300"
          dangerouslySetInnerHTML={{__html: '\\[ b \\geq \\left(\\Phi^{-1}\\left(1 - \\frac{\\delta}{2}\\right) \\frac{n_s \\sqrt{\\mathbf{Tr}(\\Sigma)}}{\\tau} \\right)^2 \\implies \\mathbf{Pr}(\\|\\hat{\\mathbf{s}} - \\mathbf{s}\\|_2 > \\tau) \\leq \\delta \\]'}}
        />
      </blockquote>
      
      <p className="text-gray-300 leading-relaxed">
        The results for numerator and denominator can be combined to obtain budget for guarantees over the entire attention computation. This result allows vAttention to dynamically size <span dangerouslySetInnerHTML={{__html: '\\(\\mathcal{I}_{\\text{dyn}}\\)'}} /> at runtime, minimizing compute while satisfying rigorous user-defined accuracy constraints <span dangerouslySetInnerHTML={{__html: '\\((\\varepsilon, \\delta)\\)'}} />.
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        The schematic diagram of vAttention is shown in Figure 2.
      </p>

      <figure className="my-10">
        <img 
          src="blogs/vattention/algorithm.png" 
          alt="vAttention Algorithm" 
          className="w-full max-w-2xl mx-auto rounded-lg border border-gray-800 shadow-lg"
        />
        <figcaption className="text-center text-gray-500 mt-4 font-mono text-sm">
          <strong>Figure 2:</strong> vAttention: recipe for verified-𝓧 attention.
        </figcaption>
      </figure>

      <h2 id="results" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">vAttention results</h2>
      
      <p className="text-gray-300 leading-relaxed">
        We have updated the Tier-1A leaderboard with <strong>vAttention</strong>, and the results are unambiguous: vAttention absolutely dominates the sparsity-quality frontier. We make some observations below:
      </p>

      <figure className="my-10">
        <img 
          src="blogs/vattention/sparsity-quality-frontier.png" 
          alt="Sparsity-Quality Frontier" 
          className="w-full max-w-2xl mx-auto rounded-lg border border-gray-800 shadow-lg"
        />
        <figcaption className="text-center text-gray-500 mt-4 font-mono text-sm">
          <strong>Figure 3:</strong> Sparsity-Quality Frontier
        </figcaption>
      </figure>


      <h3 id="paradigm-shift" className="text-2xl font-bold text-white mt-12 mb-4 scroll-mt-24 tracking-tight">1. The paradigm shift offers new frontier</h3>
      
      <p className="text-gray-300 leading-relaxed">
        In the last blog, we highlighted the gaps in oracle-top-k and oracle-top-p based sparse attention and dense attention showing the need for a new paradigm in sparse attention. vAttention(oracle-top-k) provides a new paradigm that fills this gap. At <strong>50x sparsity</strong>, it elevates relative accuracy from 92% (oracle-top-p) to <strong>97%</strong>, while delivering <strong>&gt;99%</strong> relative accuracy at 5x and 10x compression compared to dense attention.
      </p>

      <h3 id="new-sota" className="text-2xl font-bold text-white mt-12 mb-4 scroll-mt-24 tracking-tight">2. A new state-of-the-art method that beats oracle-top-k is born</h3>
      
      <p className="text-gray-300 leading-relaxed">
        The practical implications are significant. <strong>vAttention (PQCache)</strong>—a fully practical implementation parameterizing vAttention with <a href="/blog/pqcache" className="text-accent-gold hover:text-white transition-colors">PQCache</a>, a product quantization based top-k predictor, is not only the new state of the art, but it outperforms the theoretical oracle-top-k baseline at 5x and 10x sparsities. This result indicates that a practical sparse attention can now exceed the theoretical bounds of standard oracle approximations.
      </p>

      <h2 id="skylight-integration" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">vAttention in SkyLight</h2>
      
      <p className="text-gray-300 leading-relaxed">
        <a href="https://github.com/skylight-org/sparse-attention-hub" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:text-white transition-colors">SkyLight</a> seamlessly supports composing and running a wide range of sparse attention ideas. Thanks to its modular design, we can experiment with vAttention parameterized with any deterministic index selection method. For instance, we use the following config to run vAttention(PQCache):
      </p>

      <div className="my-8 overflow-x-auto">
        <pre className="bg-dark-surface p-6 rounded-lg border border-gray-800 text-sm">
          <code className="text-gray-300">{`sparse_attention_config = ResearchAttentionConfig(
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
            local_offset = 128,
            base_rate_sampling = 0.05
        )
    ]
)`}</code>
        </pre>
      </div>
      
      <p className="text-gray-300 leading-relaxed">
        To explore vAttention in chat mode use:
      </p>

      <div className="my-8 overflow-x-auto">
        <pre className="bg-dark-surface p-6 rounded-lg border border-gray-800 text-sm">
          <code className="text-gray-300">{`git clone https://github.com/skylight-org/sparse-attention-hub.git
cd sparse-attention-hub && pip install -e . && pip install -e .[dev]
# add your sparse_attention_config to the top of chat.py to replace default
python3 demo/chat.py --model Qwen/Qwen3-30B-A3B-Instruct-2507`}</code>
        </pre>
      </div>

      <h2 id="conclusion" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">Conclusion</h2>
      
      <p className="text-gray-300 leading-relaxed">
        vAttention introduces a paradigm shift in sparse attention by combining stochastic index selection with existing top-k methods. This approach establishes a new sparsity–quality frontier and achieves state-of-the-art performance among sparse attention mechanisms. The Verified-𝓧 recipe provides principled error guarantees for approximate attention computation, enabling more reliable and robust deployment of vAttention in real-world settings. We hope that vAttention will help drive broader practical adoption of inference time sparse attention.
      </p>

      <h3 id="citations" className="text-2xl font-bold text-white mt-12 mb-4 scroll-mt-24 tracking-tight">Citations</h3>

      <div className="my-8 overflow-x-auto">
        <pre className="bg-dark-surface p-6 rounded-lg border border-gray-800 text-sm">
          <code className="text-gray-300">{`@article{desai2025vattention,
  title={vAttention: Verified Sparse Attention},
  author={Desai, Aditya and Agrawal, Kumar Krishna and Yang, Shuo and 
          Cuadron, Alejandro and Schroeder, Luis Gaspar and Zaharia, Matei and 
          Gonzalez, Joseph E and Stoica, Ion},
  journal={arXiv preprint arXiv:2510.05688},
  year={2025}
}

@article{sky_light_2025,
  author    = {Aditya Desai and Kumar Krishna Agrawal and Luis Schroeder and 
               Prithvi Dixit and Matei Zaharia and Joseph E. Gonzalez and 
               Ion Stoica},
  title     = {Introducing {Sky-Light}: Advancing the frontier of sparse 
               attention research},
  year      = {2025},
  month     = nov,
  url       = {https://sky-light.eecs.berkeley.edu/},
  note      = {UC Berkeley}
}`}</code>
        </pre>
      </div>
    </div>
  );
};


export const PQCacheEntry = () => {
  return (
    <div className="space-y-8 text-lg">
      <p className="text-gray-300 leading-relaxed">
        The decoding phase of long-context LLM inference being memory bound, contributes significantly to latency, especially as context lengths explode. Sparse-Attention presents a promising approach, where a small subset of tokens is selected for approximating the dense attention computation.
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        Last week, we released the <a href="https://sky-light.eecs.berkeley.edu/#/home" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:text-white transition-colors">SkyLight Tier-1A leaderboard</a> comparing several sparse attention algorithms. Among these, one of the most widely explored families is <em>approximate top-k estimation</em>, which aim to identify the tokens that contribute most to the attention calculation (i.e., finding keys k<sub>i</sub> with maximum similarity to the query q). However, computing exact inner products requires reading all keys, which undermines the goal of reducing memory traffic.
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        With the help of the authors of PQCache, we present an in-depth look at <strong>PQCache</strong>, a product quantization method that establishes a new standard for practical, non-oracle algorithms on the latest Tier-1A leaderboard. Below, the authors explain the core mechanisms of their system, followed by instructions for deploying PQCache within SkyLight.
      </p>

      <h2 id="overview" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">Overview</h2>
      
      <p className="text-gray-300 leading-relaxed">
        Given the observation that attention scores exhibit a power-law distribution, which indicates that contributions of most tokens are negligible, an intuitive solution is to restrict the costly attention computation only to those tokens possessing the highest scores. Drawing inspiration from traditional information retrieval area, we propose PQCache, which integrates product quantization (PQ) to efficiently identify important tokens for attention computation in long-context LLM inference.
      </p>

      <figure className="my-10">
        <img 
          src="blogs/pqcache/workflow.png" 
          alt="PQCache Workflow" 
          className="w-full rounded-lg border border-gray-800 shadow-lg"
        />
        <figcaption className="text-center text-gray-500 mt-4 font-mono text-sm">PQCache Workflow</figcaption>
      </figure>

      <p className="text-gray-300 leading-relaxed">
        The figure above details the PQCache workflow. In the prefilling phase, PQCache offloads the KVCache from GPU High Bandwidth Memory (HBM) to CPU memory and builds the PQ data structures, which consists of centroids and codes. In the decoding phase, the query token uses the PQ structures to quickly identify the top-k tokens. Those tokens are then retrieved from the CPU memory for final attention computation.
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        The core idea of PQCache is built on the inspiration that sparse decoding can be effectively modeled as an information retrieval process. The strict latency requirements of LLM inference demand fast and lightweight retrieval methods. Consequently, we opt for simple PQ over techniques with high index construction overhead, such as graph-based (e.g., HNSW) or complex inverted-index methods, reserving these alternative approaches for future exploration.
      </p>
      
      <blockquote className="border-l-4 border-accent-gold pl-6 my-8 text-gray-400">
        You could find more information about PQ at this <a href="https://www.pinecone.io/learn/series/faiss/product-quantization/" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:text-white transition-colors">link</a>.
      </blockquote>

      <p className="text-gray-300 leading-relaxed">
        In the following paragraphs, we formalize the operation of PQCache in both prefilling and decoding phases, with necessary notations provided in the table below.
      </p>

      <div className="overflow-x-auto my-8">
        <table className="w-full border-collapse border border-dark-border">
          <thead>
            <tr className="bg-dark-surface">
              <th className="border border-dark-border px-4 py-2 text-left text-white">Symbol</th>
              <th className="border border-dark-border px-4 py-2 text-left text-white">Explanation</th>
              <th className="border border-dark-border px-4 py-2 text-left text-white">Symbol</th>
              <th className="border border-dark-border px-4 py-2 text-left text-white">Explanation</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr>
              <td className="border border-dark-border px-4 py-2">n</td>
              <td className="border border-dark-border px-4 py-2">Batch size.</td>
              <td className="border border-dark-border px-4 py-2">d<sub>m</sub></td>
              <td className="border border-dark-border px-4 py-2">Dimension of each partition.</td>
            </tr>
            <tr>
              <td className="border border-dark-border px-4 py-2">s</td>
              <td className="border border-dark-border px-4 py-2">Context length.</td>
              <td className="border border-dark-border px-4 py-2">m</td>
              <td className="border border-dark-border px-4 py-2"># partitions in PQ.</td>
            </tr>
            <tr>
              <td className="border border-dark-border px-4 py-2">h<sub>kv</sub></td>
              <td className="border border-dark-border px-4 py-2">Number of KV heads.</td>
              <td className="border border-dark-border px-4 py-2">b</td>
              <td className="border border-dark-border px-4 py-2"># bits for PQ codes.</td>
            </tr>
            <tr>
              <td className="border border-dark-border px-4 py-2">d<sub>h</sub></td>
              <td className="border border-dark-border px-4 py-2">Dimension of each head.</td>
              <td className="border border-dark-border px-4 py-2">k</td>
              <td className="border border-dark-border px-4 py-2"># tokens selected.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="prefilling" className="text-2xl font-bold text-white mt-12 mb-4 scroll-mt-24 tracking-tight">Prefilling</h3>
      
      <p className="text-gray-300 leading-relaxed">
        In the LLM prefilling phase, the model generates a "key" tensor for all input tokens, with the shape of (n, h<sub>kv</sub>, s, d<sub>h</sub>). We then leverage PQ to compress these token keys and generates the corresponding PQ centroids and codes.
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        Specifically, PQ algorithm first evenly divides each token key into m partitions, essentially decomposing the original embedding space into m separate sub-spaces. This yields n*h<sub>kv</sub>*m distinct sub-spaces, each containing s vectors of dimension d<sub>m</sub>=d<sub>h</sub>/m.
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        Next, PQCache conducts K-Means clustering to group the sub-vectors, yielding 2<sup>b</sup> centroids. Since each sub-vector can be represented by its corresponding cluster centroid, we can approximately reconstruct all token keys with the centroids and the centroid indices for each sub-vector (i.e. PQ codes).
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        While increasing m (# partitions) and b (# bits) would theoretically boost PQCache's precision, we found a highly efficient sweet spot in practice (e.g. m=2 and b=6). The setting of small m and b already provides strong performance while keeping memory and I/O overhead minimal. The memory required for the PQ data structures is calculated as s * m * b/8 + d<sub>h</sub> * 2<sup>b</sup> * 2 bytes per KV head. This equation allows practitioners to quantify the trade-off between the PQ data structure memory footprint (and I/O) and retrieval performance.
      </p>

      <figure className="my-10">
        <img 
          src="blogs/pqcache/construction.png" 
          alt="PQ Construction and Searching" 
          className="w-full rounded-lg border border-gray-800 shadow-lg"
        />
        <figcaption className="text-center text-gray-500 mt-4 font-mono text-sm">PQ Construction and Searching</figcaption>
      </figure>

      <h3 id="decoding" className="text-2xl font-bold text-white mt-12 mb-4 scroll-mt-24 tracking-tight">Decoding</h3>
      
      <p className="text-gray-300 leading-relaxed">
        In the decoding phase, PQCache pre-fetches the necessary PQ structures into HBM, then efficiently estimates the attention scores. Specifically, the token query is first partitioned into m blocks. The corresponding query partitions are multiplied with the respective PQ centroids, and the approximated attention weights are computed by summing up the sub-scores according to the PQ codes. PQCache determines important tokens by applying top-k to the estimated attention weights, then retrieves these tokens for attention computation.
      </p>
      
      <p className="text-gray-300 leading-relaxed">
        To further stabilize the performance of PQCache, we always select a small amount of tokens at the beginning and end of the sequence as important tokens (e.g 128 tokens). These tokens often yield relatively high attention scores, and are crucial for long-context inference.
      </p>

      <h2 id="system-implementation" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">System Implementation</h2>
      
      <p className="text-gray-300 leading-relaxed">
        We also provide a fast system implementation of PQCache with our paper. PQCache offloads KVCache to CPU memory and leverages CPU computing power for PQ construction. It then fetches a subset of KVCache to GPU HBM for attention computation. This design mitigates the memory bottleneck and achieves a lower I/O footprint, but may introduce two additional system challenges:
      </p>

      <ol className="list-decimal pl-6 space-y-2 text-gray-300">
        <li>The K-Means clustering during PQ construction may slow down the prefilling speed;</li>
        <li>The sequential computation-communication chain for retrieving the subset KVCache introduces decoding latency overhead.</li>
      </ol>

      <p className="text-gray-300 leading-relaxed">
        To address these issues, we adopt several system optimization techniques. First, we overlap the CPU-side K-Means computation (using limited steps for speed) with the GPU-side prefilling computation to avoid affecting the Time-To-First-Token (TTFT). Second, we maintain a block-level token buffer on GPU HBM to cache tokens that are consistently important across different decoding steps, thereby minimizing the overhead of KVCache transfer. For more technical details, please refer to our paper.
      </p>

      <div className="space-y-2 text-gray-300 mt-6">
        <p>
          ⭐️ Paper: <a href="https://arxiv.org/abs/2407.12820" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:text-white transition-colors">[Arxiv]</a>
        </p>
        <p>
          ⭐️ Our original Code: <a href="https://github.com/HugoZHL/PQCache" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:text-white transition-colors">[GitHub]</a>
        </p>
      </div>

      <p className="text-gray-300 leading-relaxed mt-6">
        PQCache algorithm is also implemented in SkyLight's sparse-attention-hub.
      </p>
      <p className="text-gray-300 leading-relaxed">
        ⭐️ SkyLight's Code: <a href="https://github.com/skylight-org/sparse-attention-hub/blob/main/docs/baselines/pqcache.md" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:text-white transition-colors">[SkyLight Github]</a>
      </p>

      <h2 id="pqcache-in-skylight" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">PQCache in SkyLight</h2>
      
      <p className="text-gray-300 leading-relaxed">
        <a href="https://sky-light.eecs.berkeley.edu/#/blog/introducing-skylight" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:text-white transition-colors">SkyLight</a> seamlessly supports composing and running a wide range of sparse attention ideas. Thanks to its modular design, you can reproduce the exact behavior of PQCache, i.e. including PQ-based top-k selection, sink tokens, and local tokens, by simply composing the three maskers, shown below.
      </p>

      <div className="my-6 bg-dark-surface border border-dark-border rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-gray-300 whitespace-pre">
{`    sparse_attention_config = ResearchAttentionConfig(
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
        ]
    )`}
        </pre>
      </div>

      <p className="text-gray-300 leading-relaxed">
        The Tier1A results for PQCache and the theoreical upper limit of the top-k paradigm, represented by oracle-top-k is presented below,
      </p>

      <div className="space-y-12 my-10">
        <figure>
          <img
            src="blogs/pqcache/skylight_overall_quality.png"
            alt="Relative model quality chart for PQCache"
            className="w-full h-auto rounded-lg border border-gray-800"
          />
          <figcaption className="text-center text-gray-500 mt-4 font-mono text-sm">Relative model quality</figcaption>
        </figure>
        <figure>
          <img
            src="blogs/pqcache/skylight_attention_error.png"
            alt="Attention error chart for PQCache"
            className="w-full h-auto rounded-lg border border-gray-800"
          />
          <figcaption className="text-center text-gray-500 mt-4 font-mono text-sm">Relative attention approximation error</figcaption>
        </figure>
      </div>

      <p className="text-gray-300 leading-relaxed">
        We make the following observations,
      </p>

      <ol className="list-decimal pl-6 space-y-4 text-gray-300 mt-4">
        <li>
          <strong className="text-white font-semibold">PQCache closely tracks oracle-top-k at moderate sparsities</strong>.
          <br />
          At 5× and 10× sparsity, PQCache achieves benchmark performance very close to oracle-top-k, demonstrating that it is an effective top-k approximation. However, at 50× sparsity, the gap widens—indicating recall degradation at very high sparsity levels. Additionally, PQCache exhibits higher local approximation error than oracle-top-k, suggesting room for further improvement in predicting the top-k set.
        </li>
        <li>
          <strong className="text-white font-semibold">Even oracle methods fall short of dense attention performance</strong>.
          <br />
          Interestingly, both oracle-top-k and a more flexible dynamic-k variant, oracle-top-p, continue to degrade significantly at higher sparsity levels. This highlights a deeper limitation of the top-k paradigm and points to the need for fundamentally new approaches to sparse-attention.
        </li>
      </ol>

      <p className="text-gray-300 leading-relaxed mt-8">
        Explore additional sparse attention variants in the <a href="https://github.com/skylight-org/sparse-attention-hub" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:text-white transition-colors">skylight-org/sparse-attention-hub</a>. You can also experiment with PQCache interactively using the chat interface by loading the configuration shown above.
      </p>

      <div className="my-6 bg-dark-surface border border-dark-border rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-gray-300 whitespace-pre">
{`git clone https://github.com/skylight-org/sparse-attention-hub.git
cd sparse-attention-hub && pip install -e . && pip install -e .[dev]
# add your sparse_attention_config to the top of chat.py to replace default
python3 demo/chat.py --model Qwen/Qwen3-30B-A3B-Instruct-2507`}
        </pre>
      </div>

      <h2 id="conclusion" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">Conclusion</h2>
      
      <p className="text-gray-300 leading-relaxed">
        In this blog post, we've introduced the algorithmic motivation behind PQCache, detailed its workflow, and presented our core system implementation. For complete technical details and comprehensive information, please refer to the paper and GitHub repository. We encourage the community to further explore and apply PQCache in future studies and applications.
      </p>

      <div className="mt-8 bg-dark-surface border border-dark-border rounded-lg p-4">
        <p className="text-sm font-mono text-gray-400 mb-2">Citations</p>
        <pre className="text-xs sm:text-sm font-mono text-gray-300 whitespace-pre overflow-x-auto">
{`@article{DBLP:journals/pacmmod/ZhangJCFMNCC25,
  author    = {Hailin Zhang and Xiaodong Ji and Yilin Chen and Fangcheng Fu and Xupeng Miao and Xiaonan Nie and Weipeng Chen and Bin Cui},
  title     = {{PQCache}: Product Quantization-based {KVCache} for Long Context {LLM} Inference},
  journal   = {Proc. {ACM} Manag. Data},
  volume    = {3},
  number    = {3},
  pages     = {201:1--201:30},
  year      = {2025},
  url       = {https://doi.org/10.1145/3725338},
  doi       = {10.1145/3725338},
  timestamp = {Sat, 09 Aug 2025 12:15:56 +0200},
  biburl    = {https://dblp.org/rec/journals/pacmmod/ZhangJCFMNCC25.bib},
  bibsource = {dblp computer science bibliography, https://dblp.org}
}

@article{sky_light_2025,
  author    = {Aditya Desai and Kumar Krishna Agrawal and Luis Schroeder and Prithvi Dixit and Matei Zaharia and Joseph E. Gonzalez and Ion Stoica},
  title     = {Introducing {Sky-Light}: Advancing the frontier of sparse attention research},
  year      = {2025},
  month     = nov,
  url       = {https://sky-light.eecs.berkeley.edu/},
  note      = {UC Berkeley}
}`}
        </pre>
      </div>
    </div>
  );
};


import { useEffect } from 'react';
import { Breadcrumb } from '../components/common/Breadcrumb';

export function DocumentationSparseAttentionPage() {
  // Trigger MathJax to render LaTeX when component mounts
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise?.().catch((err: any) => console.log('MathJax typeset error:', err));
    }
  }, []);

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      {/* Hero Section */}
      <section>
        <h1 className="text-4xl font-bold text-white mb-4">
          Understanding Sparse Attention
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          A comprehensive guide to sparse attention mechanisms in transformer models, 
          from foundational concepts to advanced implementation strategies.
        </p>
      </section>

      {/* Introduction */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            Transformer models have revolutionized natural language processing, computer vision, 
            and numerous other domains. However, their self-attention mechanism, while powerful, 
            presents a fundamental computational challenge: quadratic complexity with respect to 
            sequence length. This limitation has historically constrained transformers to relatively 
            short contexts, typically ranging from a few hundred to a few thousand tokens.
          </p>
          <p>
            Sparse attention mechanisms address this challenge by selectively computing attention 
            only over a subset of token pairs, rather than exhaustively evaluating all possible 
            relationships. This approach enables transformers to scale to significantly longer 
            sequences while maintaining computational efficiency and memory feasibility.
          </p>
          <div className="bg-accent-gold/5 border border-accent-gold/30 rounded-lg p-5 space-y-2 text-sm text-gray-200">
            <div className="font-semibold text-accent-gold tracking-wide uppercase text-xs">
              Working Definition
            </div>
            <p>
              A sparse attention layer constrains each query token to score at most {'\\(k\\)'} key tokens, with {'\\(k \\ll n\\)'}.
              This drops the compute and memory footprint from {'\\(O(n^2)\\)'} to approximately {'\\(O(n \\times k)\\)'} while keeping the
              expressivity of attention where it matters most.
            </p>
            <p>
              Different sparsity patterns—local windows, dilated strides, learned routing, or block-level masks—define how the {'\\(k\\)'}
              keys are chosen and, ultimately, whether a method favors throughput, accuracy, or simplicity.
            </p>
          </div>
        </div>
      </section>

      {/* The Attention Problem */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">The Quadratic Complexity Problem</h2>
        
        <div className="space-y-4 text-gray-300">
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">Standard Self-Attention</h3>
          <p>
            In the standard transformer architecture, self-attention computes a relevance score 
            between every pair of tokens in a sequence. For a sequence of length {'\\(n\\)'}, 
            this requires computing an {'\\(n \\times n\\)'} attention matrix.
          </p>

          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-6 my-4">
            <div className="overflow-x-auto">
              <div className="text-center text-gray-200 text-base mb-4 min-w-max">
                {'\\['}
                {'\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) \\times V'}
                {'\\]'}
              </div>
            </div>
            <div className="text-sm text-gray-300 space-y-1 border-t border-dark-border/40 pt-4">
              <div><strong className="text-white">where:</strong></div>
              <div className="pl-4">
                <div>{'\\(Q, K, V\\)'} are query, key, and value matrices</div>
                <div>{'\\(d_k\\)'} is the key dimension</div>
                <div>{'\\(QK^T\\)'} produces an {'\\(n \\times n\\)'} attention score matrix</div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">Computational Cost</h3>
          <p>
            The computational and memory requirements scale quadratically with sequence length:
          </p>

          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-4 my-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-accent-gold font-semibold mb-2">Computation</div>
                <div className="space-y-1 font-mono">
                  <div>1,000 tokens → 1M operations</div>
                  <div>10,000 tokens → 100M operations</div>
                  <div>100,000 tokens → 10B operations</div>
                </div>
              </div>
              <div>
                <div className="text-accent-gold font-semibold mb-2">Memory</div>
                <div className="space-y-1 font-mono">
                  <div>1,000 tokens → 4 MB (fp32)</div>
                  <div>10,000 tokens → 400 MB</div>
                  <div>100,000 tokens → 40 GB</div>
                </div>
              </div>
            </div>
          </div>

          <p>
            This quadratic scaling creates a fundamental barrier to processing long-context scenarios 
            such as entire documents, extended conversations, or large codebases. Modern applications 
            increasingly require models that can reason over contexts extending to hundreds of thousands 
            or even millions of tokens—a regime where standard attention becomes computationally prohibitive.
          </p>
        </div>
      </section>

      {/* Core Intuition */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">The Sparse Attention Hypothesis</h2>
        
        <div className="space-y-4 text-gray-300">
          <p>
            Sparse attention is predicated on a key observation: <strong className="text-white">not all 
            token relationships are equally important</strong>. In natural language and many other domains, 
            attention patterns often exhibit strong locality and structure. A token typically attends most 
            strongly to a small subset of other tokens, while the majority of attention weights are negligibly 
            small.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">Mathematical Formulation</h3>
          <p>
            Standard attention computes scores for all token pairs, while sparse attention applies a binary mask 
            {'\\(M\\)'} to restrict computation to a selected subset:
          </p>

          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-6 my-4">
            <div className="overflow-x-auto">
              <div className="text-center text-gray-200 text-base mb-4 min-w-max">
                {'\\['}
                {'\\text{SparseAttention}(Q, K, V) = \\text{softmax}\\left(M \\odot \\frac{QK^T}{\\sqrt{d_k}}\\right) \\times V'}
                {'\\]'}
              </div>
            </div>
            <div className="text-sm text-gray-300 space-y-1 border-t border-dark-border/40 pt-4">
              <div><strong className="text-white">where:</strong></div>
              <div className="pl-4">
                <div>{'\\(M\\)'} is a binary mask indicating which token pairs to attend to</div>
                <div>{'\\(\\odot\\)'} denotes element-wise multiplication (Hadamard product)</div>
                <div>Entries where {'\\(M_{ij} = 0\\)'} are typically set to {'\\(-\\infty\\)'} before softmax</div>
              </div>
            </div>
          </div>

          <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-lg p-6 my-6">
            <h3 className="text-lg font-semibold text-accent-gold mb-3">Central Principle</h3>
            <p className="text-gray-200">
              Rather than computing attention over all {'\\(n^2\\)'} token pairs, sparse attention mechanisms 
              identify and compute only the most relevant subset—typically reducing effective computation 
              to {'\\(O(n \\times k)\\)'} where {'\\(k \\ll n\\)'}, or even sublinear complexity in some cases.
            </p>
            <div className="text-xs text-gray-300 mt-4 space-y-1">
              <div>Coverage budget {'\\(k\\)'} must scale with head dimension and task difficulty.</div>
              <div>Choosing too small a {'\\(k\\)'} risks missing long-range dependencies (under-coverage).</div>
              <div>Choosing too large a {'\\(k\\)'} erodes the speed gains (over-coverage).</div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">The Selection Problem</h3>
          <p>
            The fundamental challenge in sparse attention is determining which token pairs to attend to. 
            Different methods employ various strategies for this selection, each with distinct trade-offs 
            in accuracy, computational efficiency, and memory requirements.
          </p>
        </div>
      </section>

      {/* Taxonomy of Methods */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Taxonomy of Sparse Attention Methods</h2>
        
        <div className="space-y-6 text-gray-300">
          <p>
            Sparse attention mechanisms can be categorized based on their selection strategy. 
            This taxonomy reflects fundamental design choices that shape their performance characteristics.
          </p>

          {/* Fixed Pattern Methods */}
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-accent-gold mb-4">
              1. Fixed Pattern Methods
            </h3>
            <p className="mb-4">
              These methods employ predetermined attention patterns that remain constant regardless 
              of input content. While conceptually simple, they can be highly effective for specific 
              domain characteristics.
            </p>
            
            <div className="pl-4 border-l-2 border-dark-border space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Local Window Attention</h4>
                <p className="text-sm">
                  Each token attends only to tokens within a fixed window radius. This captures 
                  strong locality bias common in natural language.
                </p>
                <div className="text-xs text-gray-400 mt-2">
                  Complexity: {'\\(O(n \\times w)\\)'} where {'\\(w\\)'} is window size
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  Example models: Longformer, Vision Transformers with Swin-like windows
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">StreamingLLM</h4>
                <p className="text-sm">
                  Maintains attention to initial tokens (attention sinks) plus a sliding window 
                  of recent tokens. Particularly effective for streaming or continual inference scenarios.
                </p>
                <div className="text-xs font-mono text-gray-400 mt-2">
                  Auxiliary Memory: 0 bits
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Strided Attention</h4>
                <p className="text-sm">
                  Attends to tokens at regular intervals, capturing long-range dependencies 
                  with linear complexity.
                </p>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  Example models: BigBird global/strided pattern, Star-Transformer
                </div>
              </div>
            </div>
          </div>

          {/* Content-Based Methods */}
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-accent-gold mb-4">
              2. Content-Based Selection Methods
            </h3>
            <p className="mb-4">
              These methods dynamically select tokens based on input content, adapting attention 
              patterns to the specific characteristics of each sequence. They typically achieve 
              higher accuracy but require additional computation or memory for selection.
            </p>
            
            <div className="pl-4 border-l-2 border-dark-border space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Oracle Top-k Selection</h4>
                <p className="text-sm">
                  Computes full attention scores, then selects the top-k highest-scoring tokens 
                  for each query. Serves as an accuracy upper bound for sparse attention methods.
                </p>
                <div className="text-xs text-gray-400 mt-2 overflow-x-auto">
                  <div className="min-w-max">
                    Auxiliary Memory: {'\\(\\text{head_dim} \\times \\text{bits_precision}\\)'} (full KV cache)
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">HashAttention</h4>
                <p className="text-sm">
                  Employs locality-sensitive hashing (LSH) to cluster semantically similar tokens. 
                  Queries attend primarily to keys in the same or nearby hash buckets, enabling 
                  sublinear complexity.
                </p>
                <div className="text-xs text-gray-400 mt-2 overflow-x-auto">
                  <div className="min-w-max">
                    Auxiliary Memory: {'\\(\\text{hat_bits} \\times \\text{group_size}\\)'} per KV head
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  Example models: Reformer, Routing Transformers
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Learned Selection</h4>
                <p className="text-sm">
                  Uses neural networks to predict which tokens should attend to each other, 
                  potentially learning domain-specific attention patterns.
                </p>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  Techniques: Routing networks, k-NN router heads, mixture-of-experts attention
                </div>
              </div>
            </div>
          </div>

          {/* Compression-Based Methods */}
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-accent-gold mb-4">
              3. Compression-Based Methods
            </h3>
            <p className="mb-4">
              These methods maintain compressed representations of the key-value cache, using 
              approximate scoring for token selection followed by precise computation on selected tokens.
            </p>
            
            <div className="pl-4 border-l-2 border-dark-border space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">DoubleSparsity</h4>
                <p className="text-sm">
                  Maintains quantized label caches with configurable bit precision. Uses compressed 
                  representations for initial ranking, then applies full precision attention to 
                  selected tokens.
                </p>
                <div className="text-xs text-gray-400 mt-2 overflow-x-auto">
                  <div className="min-w-max">
                    Auxiliary Memory: {'\\(\\text{label_bits} \\times (\\text{head_dim} / \\text{group_factor}) \\times \\text{group_size}\\)'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Product Quantization (PQCache)</h4>
                <p className="text-sm">
                  Applies product quantization to key vectors, enabling efficient approximate 
                  nearest neighbor search in the compressed space.
                </p>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  Used in: PQ-KV caches for LLM serving, retrieval-augmented sparse layers
                </div>
              </div>
            </div>
          </div>

          {/* Hierarchical Methods */}
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-accent-gold mb-4">
              4. Hierarchical Methods
            </h3>
            <p className="mb-4">
              Hierarchical approaches perform coarse-to-fine selection, first identifying relevant 
              regions at a high level, then refining to individual tokens.
            </p>
            
            <div className="pl-4 border-l-2 border-dark-border space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Quest</h4>
                <p className="text-sm">
                  Organizes the KV cache into fixed-size pages, maintaining summary vectors for 
                  each page. First scores pages, then evaluates individual tokens within high-scoring pages.
                </p>
                <div className="text-xs text-gray-400 mt-2 overflow-x-auto">
                  <div className="min-w-max">
                    Auxiliary Memory: {'\\(2 \\times \\text{head_dim} / \\text{page_size} \\times \\text{bits_precision}\\)'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Block-Sparse Attention</h4>
                <p className="text-sm">
                  Divides the attention matrix into blocks and applies sparsity at the block level, 
                  balancing granularity with computational efficiency.
                </p>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  Hardware-friendly pattern used by Triton block-sparse kernels
                </div>
              </div>
            </div>
          </div>

          {/* Hybrid Methods */}
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-accent-gold mb-4">
              5. Hybrid Approaches
            </h3>
            <p className="mb-4">
              Hybrid methods combine multiple strategies to leverage complementary strengths.
            </p>
            
            <div className="pl-4 border-l-2 border-dark-border space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">vAttention</h4>
                <p className="text-sm">
                  Combines content-based selection (e.g., HashAttention or Oracle) with a guaranteed 
                  uniform sample of the KV cache, ensuring coverage of the entire sequence while 
                  focusing on likely relevant tokens.
                </p>
                <div className="text-xs text-gray-400 mt-2 overflow-x-auto">
                  <div className="min-w-max">
                    Auxiliary Memory: {'\\(\\text{selection_method_bits} + (\\text{sample_rate} \\times \\text{head_dim} \\times \\text{bits})\\)'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  Deployed in: vLLM, FasterTransformer hybrid schedulers
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Architectures */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Real-World Architectures & Use Cases</h2>
        <div className="space-y-5 text-gray-300">
          <p>
            Sparse attention is no longer a purely academic concept; production models rely on it to make long-context reasoning affordable.
            Understanding which architectures use which sparsity patterns helps map research ideas to practical deployments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/30 border border-dark-border/60 rounded-lg p-5 space-y-2">
              <div className="text-accent-gold font-semibold text-lg">Longformer / BigBird</div>
              <p className="text-sm">
                Mix local windows with dilated or random global tokens, enabling 4K–16K token contexts on commodity accelerators.
                BigBird adds theoretical guarantees (universal approximation and Turing completeness) under its sparsity pattern.
              </p>
            </div>
            <div className="bg-black/30 border border-dark-border/60 rounded-lg p-5 space-y-2">
              <div className="text-accent-gold font-semibold text-lg">Reformer & Routing Transformers</div>
              <p className="text-sm">
                Use LSH or learnable routers to bucket similar tokens, approximating nearest-neighbor attention with subquadratic cost.
              </p>
            </div>
            <div className="bg-black/30 border border-dark-border/60 rounded-lg p-5 space-y-2">
              <div className="text-accent-gold font-semibold text-lg">StreamingLLM / Quest / FlashInfer</div>
              <p className="text-sm">
                Inference-time sparsity maintains a digest of prior tokens, pairing sliding windows with memory pages to support million-token streams.
              </p>
            </div>
            <div className="bg-black/30 border border-dark-border/60 rounded-lg p-5 space-y-2">
              <div className="text-accent-gold font-semibold text-lg">Vision & Multimodal Models</div>
              <p className="text-sm">
                Swin Transformers, Perceiver IO, and ViT variants employ block-sparse or hierarchical attention to manage high-resolution patches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Evaluation Metrics and Trade-offs</h2>
        
        <div className="space-y-4 text-gray-300">
          <p>
            Evaluating sparse attention methods requires consideration of multiple dimensions. 
            The Sky Light leaderboard tracks key metrics that capture the fundamental trade-offs 
            inherent in these systems.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-black/30 border border-dark-border/60 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-accent-gold mb-3">Sparsity Level</h3>
              <p className="text-sm mb-3">
                The fraction of attention weights that are computed and retained. Expressed as 
                density (percentage of weights computed) or sparsity (percentage of weights pruned).
              </p>
              <div className="text-xs font-mono text-gray-400 space-y-1">
                <div>100% density = 0% sparsity (full attention)</div>
                <div>5% density = 95% sparsity</div>
                <div>1% density = 99% sparsity</div>
              </div>
            </div>

            <div className="bg-black/30 border border-dark-border/60 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-accent-gold mb-3">Auxiliary Memory</h3>
              <p className="text-sm mb-3">
                Additional memory required beyond the standard KV cache for token selection. 
                Measured in bits per token per KV attention head.
              </p>
              <div className="text-xs font-mono text-gray-400 space-y-1">
                <div>StreamingLLM: 0 bits</div>
                <div>HashAttention: ~100 bits</div>
                <div>Oracle: full precision (e.g., 2048 bits)</div>
              </div>
            </div>

            <div className="bg-black/30 border border-dark-border/60 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-accent-gold mb-3">Task Accuracy</h3>
              <p className="text-sm mb-3">
                Performance on downstream tasks (e.g., question answering, summarization) relative 
                to full attention baselines. The ultimate measure of method effectiveness.
              </p>
              <div className="text-xs text-gray-400 mt-2">
                Evaluated across multiple benchmarks and datasets in Sky Light.
              </div>
            </div>

            <div className="bg-black/30 border border-dark-border/60 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-accent-gold mb-3">Computational Efficiency</h3>
              <p className="text-sm mb-3">
                Theoretical complexity and practical throughput. While Sky Light focuses on 
                algorithmic quality, computational efficiency ultimately determines real-world viability.
              </p>
              <div className="text-xs text-gray-400 mt-2">
                Target: {'\\(O(n)\\)'} or {'\\(O(n \\log n)\\)'} instead of {'\\(O(n^2)\\)'}
              </div>
            </div>
          </div>

          <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-accent-gold mb-3">The Fundamental Trade-off</h3>
            <p className="text-gray-200">
              Sparse attention methods navigate a three-way trade-off between accuracy, computational 
              efficiency, and memory requirements. No single method dominates across all dimensions—the 
              optimal choice depends on application constraints and requirements. Sky Light provides 
              comprehensive evaluations to inform this selection process.
            </p>
          </div>
        </div>
      </section>

      {/* Implementation Considerations */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Implementation Considerations</h2>
        
        <div className="space-y-4 text-gray-300">
          <p>
            Deploying sparse attention in production systems requires careful consideration of 
            multiple factors beyond theoretical performance.
          </p>

          <div className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Hardware Compatibility</h3>
              <p>
                Not all sparse attention patterns map efficiently to modern accelerators. Methods must 
                consider GPU/TPU memory hierarchies, vectorization capabilities, and kernel fusion 
                opportunities. Fixed patterns often have better hardware utilization than highly 
                dynamic selection schemes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Numerical Stability</h3>
              <p>
                Sparse attention can introduce numerical challenges, particularly when attention 
                distributions become highly concentrated. Proper normalization and numerical precision 
                management are essential for stable training and inference.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Training vs. Inference</h3>
              <p>
                Some methods are designed specifically for inference (e.g., StreamingLLM, Quest), 
                while others can be applied during training. Inference-only methods can be applied 
                to existing pretrained models, while training-time sparsity may enable learning 
                attention patterns optimized for sparse computation.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Scalability Characteristics</h3>
              <p>
                Different methods scale differently with sequence length, batch size, and model size. 
                Understanding these scaling properties is crucial for capacity planning and 
                architecture decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}


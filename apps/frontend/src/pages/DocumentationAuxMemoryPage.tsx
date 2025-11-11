import { Breadcrumb } from '../components/common/Breadcrumb';

export function DocumentationAuxMemoryPage() {
  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      {/* Hero Section */}
      <section>
        <h1 className="text-4xl font-bold text-white mb-4">
          Auxiliary Memory
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          Understanding how auxiliary memory is computed for sparse attention methods
        </p>
      </section>

      {/* Rationale Section */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Rationale behind noting auxiliary memory used by sparse attention method
        </h2>
        <div className="space-y-4 text-gray-300">
          <p>
            Most sparse attention methods rely on additional metadata about the KV cache. For instance, 
            Double Sparsity and HashAttention use label caches, while Quest employs page-level vectors. 
            In general, greater memory usage tends to yield higher accuracy. In fact, methods like Quest 
            and Double Sparsity asymptotically approach Oracle Top-k performance when they utilize the 
            entire KV cache for index computation.
          </p>
          <p>
            To distinguish between such configurations, we measure the auxiliary memory used by each 
            method for computing sparse attention indices. Although, in principle, this cost could be 
            captured by latency or throughput in a fully optimized implementation, our Tier 1A leaderboards 
            aim to separate algorithmic quality from implementation efficiency. Therefore, to support fair 
            comparison and enable researchers to work directly in PyTorch, we use auxiliary memory 
            measurements as a discriminating factor among configurations of a given sparse attention method 
            at given sparsity levels.
          </p>
        </div>
      </section>

      {/* Definition Section */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Aux memory definition
        </h2>
        <div className="space-y-4 text-gray-300">
          <p>
            Auxiliary memory used by a sparse attention method is defined as the <strong className="text-white">number 
            of bits per token, per KV attention head</strong> that the method requires for index computation.
          </p>
          <p>
            For example, the Oracle method utilizes the entire KV cache, while HashAttention uses hat_bits 
            per token per <strong className="text-white">query</strong> head — resulting in an overall auxiliary 
            memory of group_size × hat_bits per <strong className="text-white">kv</strong> head. Detailed calculations 
            for each method are provided below.
          </p>
        </div>

        {/* Common Variables */}
        <div className="mt-6 bg-black/30 border border-dark-border/60 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-accent-gold mb-3">Common Variables</h3>
          <pre className="text-xs text-gray-200 space-y-1">
            <code>
{`head_dim = head dimension in model (e.g. 128 for meta-llama/Llama-3.1-8B-Instruct)
group_size = num_attention_heads / num_kv_heads (e.g. 4 for meta-llama/Llama-3.1-8B-Instruct, etc)
bits_precision = bit precision of model (e.g. 16 for bfloat16 etc.)`}
            </code>
          </pre>
        </div>
      </section>

      {/* Methods Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Calculation by Method</h2>

        {/* Oracle Methods */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-accent-gold mb-3">
            Oracle Methods (Oracle-top-k, Oracle-top-p, vAttention(Oracle-top-k))
          </h3>
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-4 mb-3">
            <pre className="text-sm text-gray-200">
              <code>return head_dim * bits_precision</code>
            </pre>
          </div>
          <p className="text-sm text-gray-400 italic">
            Comment: oracle method use all the K embeddings
          </p>
        </div>

        {/* StreamingLLM */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-accent-gold mb-3">
            StreamingLLM
          </h3>
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-4 mb-3">
            <pre className="text-sm text-gray-200">
              <code>return 0</code>
            </pre>
          </div>
          <p className="text-sm text-gray-400 italic">
            Comment: streaming methods do not use any information
          </p>
        </div>

        {/* DoubleSparsity */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-accent-gold mb-3">
            DoubleSparsity
          </h3>
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-4 mb-3">
            <pre className="text-sm text-gray-200 whitespace-pre-wrap">
              <code>{`label_bits = sparse_attention_config["label_bits"]
group_factor = sparse_attention_config["group_factor"]
channel_selection = sparse_attention_config["channel_selection"]
bits_per_q_head = label_bits * head_dim // group_factor

if channel_selection in ["q_proj", "qk_proj"]:
    bits_per_kv_head = bits_per_q_head * group_size
elif channel_selection == "k_proj":
    bits_per_kv_head = bits_per_q_head

return bits_per_kv_head`}</code>
            </pre>
          </div>
          <p className="text-sm text-gray-400 italic">
            Comment: Double sparsity uses (head_dim // group_factor) channels with label_bits for each channel. 
            In case of q based projection, it uses meta data per q head.
          </p>
        </div>

        {/* HashAttention */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-accent-gold mb-3">
            HashAttention
          </h3>
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-4 mb-3">
            <pre className="text-sm text-gray-200">
              <code>{`hat_bits = sparse_attention_config["hat_bits"]
return hat_bits * group_size`}</code>
            </pre>
          </div>
          <p className="text-sm text-gray-400 italic">
            Comment: HashAttention uses label_bits per q-head
          </p>
        </div>

        {/* vAttention(HashAttention) */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-accent-gold mb-3">
            vAttention(HashAttention)
          </h3>
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-4 mb-3">
            <pre className="text-sm text-gray-200">
              <code>{`hat_bits = sparse_attention_config["hat_bits"]
hashattention_bits = hat_bits * group_size
sample_bits = sparse_attention_config["base_rate_sampling"] * head_dim * bits_precision
return hashattention_bits + sample_bits`}</code>
            </pre>
          </div>
          <p className="text-sm text-gray-400 italic">
            Comment: vAttention uses additional sample of KV Cache. we account for its bits used. 
            Ideally this can be reduced further if we store quantized base sample.
          </p>
        </div>

        {/* MagicPig */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-accent-gold mb-3">
            MagicPig
          </h3>
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-4 mb-3">
            <pre className="text-sm text-gray-200">
              <code>{`lsh_l = sparse_attention_config["lsh_l"]
return lsh_l * 32  # int32 for storing indices`}</code>
            </pre>
          </div>
          <p className="text-sm text-gray-400 italic">
            Comment: Magic uses lsh_l LSH tables. We assume 32 bit integers.
          </p>
        </div>

        {/* Quest */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-accent-gold mb-3">
            Quest
          </h3>
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-4 mb-3">
            <pre className="text-sm text-gray-200">
              <code>{`page_size = sparse_attention_config["page_size"]
return 2 * head_dim // page_size * bits_precision`}</code>
            </pre>
          </div>
          <p className="text-sm text-gray-400 italic">
            Comment: Quest stores 2 vectors per page.
          </p>
        </div>

        {/* PQCache */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-accent-gold mb-3">
            PQCache
          </h3>
          <div className="bg-black/30 border border-dark-border/60 rounded-lg p-4">
            <pre className="text-sm text-gray-400 italic">
              <code>To be added</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}

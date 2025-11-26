import { useMemo } from 'react';
import { useCombinedViewBoth } from '../../../hooks/useCombinedView';
import { GapSummaryPlot, ErrorSummaryPlot } from '../../leaderboard/SummaryPlots';
import { LoadingSpinner } from '../../common/LoadingSpinner';

export const IntroductionToSkyLightEntry = () => {
  const { data: combinedViewData, isLoading } = useCombinedViewBoth();

  // Show only 50x (2%), 10x (10%), and 5x (20%) sparsity levels
  const filteredSparsities = useMemo(() => {
    if (!combinedViewData?.sparsities) return [];
    return combinedViewData.sparsities.filter(s => [2, 10, 20].includes(s));
  }, [combinedViewData?.sparsities]);

  return (
  <div className="space-y-8 text-lg">
    <p className="text-gray-300 leading-relaxed">
      The frontier of Large Language Models is shifting from simple text generation to complex reasoning tasks that require maintaining massive state. Whether performing repository-scale software engineering that ingests tens of thousands of files to debug cross-module race conditions, or executing long-horizon agentic workflows that must recall feedback across massive trajectories, the demand for context is insatiable.
    </p>
    <p className="text-gray-300 leading-relaxed">
      However, these capabilities hit a fundamental bottleneck. Standard dense attention scales quadratically with sequence length. As we scale to infinite context windows, the Key-Value cache balloons in size to saturate GPU memory and force costly offloading to CPU RAM. This makes the decoding step inherently memory-bound and causes latency to increase linearly with every new token generated.
    </p>
    <p className="text-gray-300 leading-relaxed">
      Sparse Attention offers the theoretical solution. By selectively attending only to the most relevant tokens (rather than the entire sequence), we can theoretically achieve:
    </p>
    <ul className="list-disc pl-6 space-y-3 text-gray-300 marker:text-gray-500">
      <li>Constant-time decoding steps (breaking the linear dependency) by massive reductions in memory reads</li>
      <li>Faster prefill times for massive prompts.</li>
    </ul>
    <p className="text-gray-300 leading-relaxed">
      If sparse attention is the key to the next generation of AI capabilities, why aren't we using it everywhere yet?
    </p>

    <h2 id="sparsity-problem" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">Sparsity Problem in Research</h2>
    <p className="text-gray-300 leading-relaxed">
      Despite the clear motivation, real-world adoption of sparse attention remains minimal. This isn't due to a lack of effort. Sparse attention has been a prominent topic for more than half a decade, with over 13,382 papers on arXiv (in cs.AI and cs.ML) containing the words “sparse” and “attention.”
    </p>
    <p className="text-gray-300 leading-relaxed">
      Yet, major inference frameworks like vLLM and SGLang still lack widespread, production-ready support for these methods. There is a surprising, widening gap between research enthusiasm and practical deployment.
    </p>
    <p className="text-gray-300 leading-relaxed">
      One of the primary barriers to the practical adoption of sparse attention is what we refer to as the sparsity problem in research—a pattern that obscures our understanding of true state-of-the-art progress. To illustrate this issue, we examine one year of research on inference-time sparse attention (i.e., methods that do not involve training) aimed specifically at accelerating the decoding phase of open-source LLMs. We then analyze the explicit baseline comparisons reported in these papers to understand how each method positions itself relative to prior work. The comparative matrix is presented in Figure 1.
    </p>

    <figure className="my-10 text-center">
      <img 
        src="blogs/blog1/table.png" 
        alt="The sparsity problem in sparse attention research" 
        className="w-5/6 mx-auto rounded-lg border border-gray-800 shadow-lg"
      />
      <figcaption className="text-center text-grey mt-4 font-mono text-sm">Figure 1: The sparsity problem in sparse attention research</figcaption>
    </figure>

    <p className="text-gray-300 leading-relaxed">
      We pose the following questions to the research community in light of this year’s body of work:
    </p>
    <blockquote className="border-l-4 border-accent-gold pl-6 my-8 italic text-gray-400 space-y-4 py-2">
      <p>
        1. “What is the current state of the art in sparse attention? Which method can truly be considered the best?”
      </p>
      <p>
        2. “As a researcher, do you view sparse attention as a solved problem or an open one? If you believe further progress is needed, which baselines would you choose to meaningfully evaluate new methods?”
      </p>
    </blockquote>
    <p className="text-gray-300 leading-relaxed">
      We find it remarkably difficult to answer these questions—and this inability to clearly identify the state of the art is a serious issue with far-reaching consequences.
    </p>

    <div className="space-y-6">
      <p className="text-gray-300 leading-relaxed">
        <strong className="text-white font-semibold">Adoption is severely hindered.</strong> Integrating complex sparse algorithms into high-performance engines is a substantial engineering risk. Without clarity on which algorithms justify the maintenance cost, system developers naturally avoid them.
      </p>

      <p className="text-gray-300 leading-relaxed">
        <strong className="text-white font-semibold">Lack of integration prevents rigorous evaluation.</strong> Because these algorithms aren't in efficient engines (like vLLM), they cannot be evaluated on large models or realistic "wild" workloads. We are left evaluating theoretical efficiency rather than real-world throughput.
      </p>

      <p className="text-gray-300 leading-relaxed">
        <strong className="text-white font-semibold">Even more concerning, knowledge is lost.</strong> Without comparative clarity, promising ideas are unlikely to persist or influence future work. Insights from these papers (regardless of their merit) risk being forgotten simply because they are never placed in a reliable comparative context.
      </p>
    </div>

    <h2 id="introducing-skylight" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">Introducing SkyLight</h2>
    <p className="text-gray-300 leading-relaxed">
      To bridge the gap between research innovation and production inference, we are introducing <strong>SkyLight</strong>.
    </p>
    <p className="text-gray-300 leading-relaxed">
      SkyLight is a comprehensive framework designed to solve the sparsity problem by unifying implementation, evaluation, and optimization.
    </p>

    <div className="space-y-6">
      <p className="text-gray-300 leading-relaxed">
        <strong className="text-white font-semibold">A unified, extensible codebase.</strong> Develop a central framework designed so that new ideas can be implemented with minimal friction and integrated seamlessly with existing approaches. This serves as a shared repository for implementing and comparing sparse-attention methods.
      </p>

      <p className="text-gray-300 leading-relaxed">
        <strong className="text-white font-semibold">Standardized Evaluation & Leaderboards.</strong> SkyLight provides a consistent evaluation pipeline covering broad benchmarks. We are establishing public-facing leaderboards to make performance comparisons transparent and accessible.
      </p>

      <p className="text-gray-300 leading-relaxed">
        <strong className="text-white font-semibold">A tiered research workflow.</strong> Perhaps most importantly, SkyLight introduces a two-tier system to streamline the journey from "Idea" to "Production":
      </p>
    </div>

    <ul className="list-disc pl-6 space-y-3 text-gray-300 marker:text-gray-500">
      <li>
        <strong className="text-white font-semibold">Tier 1: Algorithmic Discovery (PyTorch)</strong>: Allows researchers to rapidly prototype and evaluate hundreds of attention patterns without worrying about writing CUDA kernels.
      </li>
      <li>
        <strong className="text-white font-semibold">Tier 2: System Optimization (Kernel Level)</strong>: Once a method proves itself in Tier 1, it graduates to Tier 2 for rigorous, kernel-level implementation and integration into high-performance engines.
      </li>
    </ul>

    <figure className="my-10">
      <img 
        src="blogs/blog1/tierimage.png" 
        alt="Two tiered research for sparse attention" 
        className="w-full rounded-lg border border-gray-800 shadow-lg"
      />
      <figcaption className="text-center text-gray-500 mt-4 font-mono text-sm">Figure 2: Two tiered research for sparse attention.</figcaption>
    </figure>

    <h2 id="current-rankings" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">Current Rankings</h2>
    <p className="text-gray-300 leading-relaxed mb-8">
      Below are the current rankings from our evaluation framework, comparing sparse attention methods across different sparsity levels on benchmark metrics and attention approximation quality.
    </p>

    {isLoading ? (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    ) : combinedViewData ? (
      <div className="space-y-12">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <GapSummaryPlot
            sparsities={filteredSparsities}
            results={combinedViewData.overallScore.results}
          />
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
          <ErrorSummaryPlot
            sparsities={filteredSparsities}
            results={combinedViewData.localError.results}
          />
        </div>
      </div>
    ) : null}

    <p className="text-gray-300 leading-relaxed mt-8">
      Our first version already offers useful insights into the current state of inference-time sparse attention research for the decoding phase. In particular, it highlights the substantial gap between dense (full) models and the oracle top-p and top-k methods—especially at higher sparsity—underscoring the need for a paradigm shift in sparse attention. Any method that merely approximates these oracle paradigms is unlikely to match the quality of the full model. Moreover, the gap between the oracle methods and their approximate counterparts emphasizes the need for more effective approximation techniques.
    </p>

    <h2 id="get-involved" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">Get Involved</h2>
    <p className="text-gray-300 leading-relaxed">
      We are excited to release the first version of our Tier-1 codebase, supported methods, and accompanying leaderboards:
    </p>
    <ul className="list-none space-y-2 text-gray-300 mt-4">
      <li>
        👉 <strong className="text-white">Leaderboard:</strong>{' '}
        <a href="https://sky-light.eecs.berkeley.edu" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:text-accent-gold transition-colors">sky-light.eecs.berkeley.edu</a>
      </li>
      <li>
        👉 <strong className="text-white">Code:</strong>{' '}
        <a href="https://github.com/skylight-org/sparse-attention-hub" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:text-accent-gold transition-colors">github.com/skylight-org/sparse-attention-hub</a>
      </li>
    </ul>

    <h2 id="acknowledgements" className="text-3xl font-bold text-white mt-16 mb-6 scroll-mt-24 tracking-tight">Acknowledgements</h2>
    <p className="text-gray-300 leading-relaxed">
      This work was made possible through the support, guidance, and infrastructure provided by the UC Berkeley Sky Lab. 
    </p>

    <div className="mt-8 bg-dark-surface border border-dark-border rounded-lg p-4">
      <p className="text-sm font-mono text-gray-400 mb-2">Citation</p>
      <pre className="text-xs sm:text-sm font-mono text-gray-300 whitespace-pre overflow-x-auto">
{`@article{sky_light_2025,
  title        = {Introducing Sky-Light: Advancing the frontier of sparse attention research},
  author       = {
      Desai, Aditya and
      Agrawal, Kumar Krishna and
      Schroeder, Luis and
      Dixit, Prithvi and
      Zaharia, Matei and
      Gonzalez, Joseph E. and
      Stoica, Ion
  },
  affiliation  = {UC Berkeley},
  year         = {2025},
  month        = nov,
  url          = {https://sky-light.eecs.berkeley.edu/}
}`}
      </pre>
    </div>
  </div>
  );
};

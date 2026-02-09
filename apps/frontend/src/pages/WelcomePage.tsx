import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { MethodPreviewCard } from '../components/common/MethodPreviewCard';
import { GapSummaryPlot } from '../components/leaderboard/SummaryPlots';
import { SemanticCacheOverallTable } from '../components/semantic-cache/SemanticCacheOverallTable';
import { useCombinedViewBoth } from '../hooks/useCombinedView';
import { useSemanticCacheOverall } from '../hooks/useSemanticCacheOverall';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function WelcomePage() {
  const { data: combinedViewData, isLoading: sparseAttentionLoading } = useCombinedViewBoth();
  const { data: semanticCacheData, isLoading: semanticCacheLoading } = useSemanticCacheOverall();

  // Show only 50x (2%), 10x (10%), and 5x (20%) sparsity levels for preview
  const filteredSparsities = useMemo(() => {
    if (!combinedViewData?.sparsities) return [];
    return combinedViewData.sparsities.filter(s => [2, 10, 20].includes(s));
  }, [combinedViewData?.sparsities]);

  return (
    <PageLayout spacing="large" maxWidth="full">
      {/* Hero Section */}
      <section className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-accent-gold font-quantico mb-4">
            Sky Light
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-4xl">
            A unified platform to understand, compare, and advance efficiency in AI training and inference. 
            We identify and create an ecosystem to enable research and development across multiple efficiency research areas.
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <a 
            href="https://github.com/skylight-org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-accent-gold transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            GitHub Organization
          </a>
          <span>•</span>
          <a 
            href="https://sky.cs.berkeley.edu/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-accent-gold transition-colors"
          >
            UC Berkeley Sky Lab
          </a>
        </div>
      </section>

      {/* Methods Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Research Methods</h2>
          <p className="text-gray-400">
            Explore our research across different efficiency optimization techniques for large language models.
          </p>
        </div>

        {/* Methods Grid */}
        <div className="space-y-8">
          {/* Sparse Attention Method */}
          <MethodPreviewCard
            id="sparse-attention-decoding"
            title="Sparse Attention / Decoding"
            description="Sparse attention methods reduce computational workload and memory reads during the attention mechanism in transformer models. Explore state-of-the-art sparse attention for decoding phase at inference time without any model finetuning."
            previewContent={
              sparseAttentionLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <LoadingSpinner />
                </div>
              ) : combinedViewData ? (
                <div className="bg-dark-bg/50 rounded-lg p-4 border border-dark-border/50">
                  <GapSummaryPlot
                    sparsities={filteredSparsities}
                    results={combinedViewData.overallScore.results}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Preview: Relative model quality across sparsity levels
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Preview unavailable
                </div>
              )
            }
            route="/home/method/sparse-attention-decoding"
            status="stable"
          />

          {/* Semantic Caching Method */}
          <MethodPreviewCard
            id="semantic-caching"
            title="Semantic Caching"
            description="Semantic caching returns cached responses for semantically similar prompts to reduce LLM inference latency and cost. Explore state-of-the-art semantic caching methods evaluated across multiple datasets."
            previewContent={
              semanticCacheLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <LoadingSpinner />
                </div>
              ) : semanticCacheData && semanticCacheData.length > 0 ? (
                <div className="bg-dark-bg/50 rounded-lg p-4 border border-dark-border/50">
                  <SemanticCacheOverallTable rankings={semanticCacheData} />
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Preview: Overall rankings aggregated across 4 datasets and 4 error budgets
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Preview unavailable
                </div>
              )
            }
            route="/home/method/semantic-caching"
            status="stable"
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-16 p-8 bg-dark-surface border border-dark-border rounded-lg">
        <div className="max-w-3xl">
          <h3 className="text-2xl font-bold text-white mb-3">Contribute to Sky Light</h3>
          <p className="text-gray-400 mb-6">
            Help shape the future of AI efficiency research. We welcome contributions of all kinds—from 
            new methods and benchmarks to discussions about our platform's direction.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/contribute"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-gold text-dark-bg font-semibold rounded-lg hover:bg-accent-gold-hover transition-colors"
            >
              Get Involved
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="https://github.com/skylight-org/sparse-attention-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-dark-bg border-2 border-dark-border text-white font-semibold rounded-lg hover:border-accent-gold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

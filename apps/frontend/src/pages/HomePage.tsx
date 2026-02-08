import { PageLayout } from '../components/layout/PageLayout';
import { SummaryPage } from './SummaryPage';
import { ModelsPage } from './ModelsPage';
import { DatasetsPage } from './DatasetsPage';

export function HomePage() {
  return (
    <PageLayout spacing="normal" maxWidth="full">
      
      <div className="mb-8">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-quantico text-accent-gold break-words">sparse-attention/decoding</h1>
            
            {/* GitHub Link */}
            <a
              href="https://github.com/xAlg-ai/sparse-attention-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-3 px-6 py-4 bg-dark-surface border-2 border-dark-border rounded-xl text-base font-medium text-gray-300 hover:border-accent-gold hover:bg-dark-surface/80 transition-all group mt-2"
              title="Sparse Attention Hub on GitHub"
            >
              <svg className="w-7 h-7 text-gray-400 group-hover:text-accent-gold transition-colors" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span className="whitespace-nowrap">GitHub</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-accent-gold group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <img 
              src="/sparseattention.jpeg" 
              alt="Sparse Attention Visualization" 
              className="max-w-4xl w-full mx-auto rounded-lg shadow-lg"
            />

          <p className="text-2xl text-gray-400 max-w-8xl mb-6">
            <a 
              href="https://arxiv.org/abs/2510.05688" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-gold hover:underline"
            >
              Sparse attention
            </a>{' '}is a technique to reduce the computational workload and memory reads of the attention mechanism in transformer models. This page explores the <span className="text-orange-400">state-of-the-art of sparse attention for decoding phase at inference time</span> without any model finetuning.
            
          </p>

        </div>
      </div>

      {/* Summary Section - Combined View Rankings */}
      <div id="summary-section" className="scroll-mt-24">
        <SummaryPage />
      </div>

      {/* Divider */}
      <div className="mb-6 border-t border-dark-border"></div>

      {/* Models Section */}
      <div id="models-section" className="scroll-mt-24">
        <ModelsPage />
      </div>

      {/* Divider */}
      <div className="mb-6 border-t border-dark-border"></div>

      {/* Datasets Section */}
      <div id="datasets-section" className="scroll-mt-24">
        <DatasetsPage />
      </div>
    </PageLayout>
  );
}


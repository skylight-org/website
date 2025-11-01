import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBaselines } from '../hooks/useBaselines';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Breadcrumb } from '../components/common/Breadcrumb';

export function DocumentationBaselinesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: baselines, isLoading, error } = useBaselines();

  // Fuzzy search implementation
  const filteredBaselines = useMemo(() => {
    if (!baselines) return [];
    if (!searchQuery.trim()) return baselines;

    const query = searchQuery.toLowerCase().trim();
    return baselines.filter((baseline) => 
      baseline.name.toLowerCase().includes(query) ||
      baseline.description.toLowerCase().includes(query) ||
      baseline.version.toLowerCase().includes(query)
    );
  }, [baselines, searchQuery]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load baselines" />;
  if (!baselines) return <ErrorMessage message="No baselines available" />;

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-3">Baseline Methods</h1>
        <p className="text-gray-300 text-lg">
          Comprehensive documentation of sparse attention baseline methods evaluated in the benchmark.
        </p>
      </div>

      {/* About Section */}
      <div className="p-6 bg-dark-surface rounded-lg border border-dark-border">
        <h3 className="text-xl font-bold text-white mb-3">About Sparse Attention</h3>
        <p className="text-gray-300 mb-4">
          Sparse attention mechanisms reduce the computational complexity of transformer models by 
          selectively attending to a subset of tokens rather than all tokens in the sequence. 
          These methods are crucial for scaling transformers to longer context lengths while 
          maintaining efficiency.
        </p>
        <p className="text-gray-300">
          The baselines documented here represent state-of-the-art approaches to sparse attention, 
          each with unique strategies for token selection and attention computation.
        </p>
      </div>

      {/* Baselines Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">All Baselines</h2>
            <p className="text-sm text-gray-400">
              {baselines.length} sparse attention {baselines.length === 1 ? 'implementation' : 'implementations'}
            </p>
          </div>
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search baselines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-gold transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {filteredBaselines.length === 0 ? (
          <div className="text-center py-12 bg-dark-surface rounded-lg border border-dark-border">
            <p className="text-gray-400">No baselines found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBaselines.map((baseline) => (
              <Link
                key={baseline.id}
                to={`/documentation/baselines/${baseline.id}`}
                className="block bg-dark-surface rounded-lg border border-dark-border p-6 hover:border-accent-gold transition-colors group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white group-hover:text-accent-gold transition-colors mb-2">
                      {baseline.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="px-2 py-1 bg-dark-bg rounded text-accent-gold font-mono">
                        v{baseline.version}
                      </span>
                      <span>•</span>
                      <span>Updated {new Date(baseline.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {baseline.description}
                </p>

                {/* Footer with Links */}
                <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                  <div className="flex items-center gap-4">
                    {baseline.paperUrl && (
                      <a
                        href={baseline.paperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-sm text-accent-gold hover:underline"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Read Paper
                      </a>
                    )}
                    {baseline.codeUrl && (
                      <a
                        href={baseline.codeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-sm text-accent-gold hover:underline"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        View Code
                      </a>
                    )}
                  </div>
                  <span className="text-sm text-accent-gold group-hover:underline">
                    View details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { useBaselines } from '../hooks/useBaselines';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Breadcrumb } from '../components/common/Breadcrumb';

export function BaselineDetailPage() {
  const { baselineId } = useParams<{ baselineId: string }>();
  const { data: baselines, isLoading, error } = useBaselines();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !baselines) {
    return <ErrorMessage message="Failed to load baseline" />;
  }

  const baseline = baselines.find((b: any) => b.id === baselineId);

  if (!baseline) {
    return <ErrorMessage message="Baseline not found" />;
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header */}
      <div className="bg-dark-surface rounded-lg border border-dark-border p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-3">{baseline.name}</h1>
            <p className="text-gray-300 text-lg">{baseline.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-dark-bg rounded text-accent-gold font-mono text-sm">
              v{baseline.version}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-dark-border">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Created</h3>
            <p className="text-white">{new Date(baseline.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Last Updated</h3>
            <p className="text-white">{new Date(baseline.updatedAt).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Version</h3>
            <p className="text-white">{baseline.version}</p>
          </div>
        </div>

        {/* Paper Link */}
        {baseline.paperUrl && (
          <div className="mt-6 pt-6 border-t border-dark-border">
            <a
              href={baseline.paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold text-dark-bg font-medium rounded-lg hover:bg-accent-gold-hover transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Read Paper
            </a>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
        <h2 className="text-2xl font-bold text-white mb-4">About This Baseline</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed">
            {baseline.description}
          </p>
        </div>
      </div>

      {/* Performance Note */}
      <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Performance Metrics</h2>
        <p className="text-gray-300">
          To view detailed performance metrics and rankings for this baseline across different 
          datasets, please visit the <a href="/website" className="text-accent-gold hover:underline">Overview page</a>.
        </p>
      </div>
    </div>
  );
}


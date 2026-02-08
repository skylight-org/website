import { PageLayout } from '../components/layout/PageLayout';

export function ContributePage() {
  return (
    <PageLayout spacing="normal" maxWidth="full">
      {/* Hero Section */}
      <section>
        <h1 className="text-4xl font-bold text-accent-gold font-quantico mb-4">
          Contribute
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          Help shape the future of sparse attention research. We welcome contributions of all kinds—from new methods and benchmarks to discussions about the leaderboard's direction.
        </p>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Discussions Card */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-8 flex flex-col">
          <div className="w-12 h-12 rounded-lg bg-accent-gold/10 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Join the Discussion</h2>
          <p className="text-gray-300 mb-8 flex-grow">
            Have an idea for a new sparse attention method? Want to suggest a new benchmark dataset? Or maybe you have thoughts on how we can improve the leaderboard? Start a discussion with the community.
          </p>
          <a
            href="https://github.com/xAlg-ai/sparse-attention-hub/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-gold text-dark-bg font-semibold rounded-lg hover:bg-yellow-400 transition-colors w-full md:w-auto"
          >
            Start a Discussion
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Issues Card */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-8 flex flex-col">
          <div className="w-12 h-12 rounded-lg bg-accent-gold/10 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Help Manage Issues</h2>
          <p className="text-gray-300 mb-8 flex-grow">
            You can help us maintain the repository by tackling outstanding issues. Whether it's fixing a bug, improving documentation, or optimizing performance, your code contributions are valuable.
          </p>
          <a
            href="https://github.com/xAlg-ai/sparse-attention-hub/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-surface border-2 border-dark-border text-white font-semibold rounded-lg hover:border-accent-gold hover:bg-dark-surface/80 transition-all w-full md:w-auto"
          >
            View Issues
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </PageLayout>
  );
}

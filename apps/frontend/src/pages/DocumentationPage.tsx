import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/common/Breadcrumb';

export function DocumentationPage() {
  return (
    <div className="space-y-12">
      <Breadcrumb />
      
      {/* Hero Section */}
      <section>
        <h1 className="text-4xl font-bold text-white mb-4">
          Documentation
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          Comprehensive documentation for all baselines and datasets in the Sky Light 
          benchmark suite. Learn about sparse attention methods and evaluation datasets.
        </p>
      </section>

      {/* About Section */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">About Sky Light</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            Sky Light is a comprehensive leaderboard for evaluating sparse attention mechanisms 
            in transformer models. Our platform provides detailed comparisons of various baseline 
            methods across multiple datasets and metrics.
          </p>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baselines Card */}
        <Link
          to="/documentation/baselines"
          className="group bg-dark-surface border border-dark-border rounded-lg p-8 hover:border-accent-gold transition-colors"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent-gold/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white group-hover:text-accent-gold transition-colors">
              Baseline Methods
            </h2>
          </div>
          <p className="text-gray-300 mb-4">
            Explore the sparse attention baseline methods evaluated in our benchmark. 
            Each baseline represents a unique approach to efficient attention computation.
          </p>
          <div className="flex items-center gap-2 text-accent-gold font-medium">
            <span>View baselines</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Datasets Card */}
        <Link
          to="/documentation/datasets"
          className="group bg-dark-surface border border-dark-border rounded-lg p-8 hover:border-accent-gold transition-colors"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent-gold/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white group-hover:text-accent-gold transition-colors">
              Benchmark Datasets
            </h2>
          </div>
          <p className="text-gray-300 mb-4">
            Detailed information about the evaluation datasets used for benchmarking. 
            Learn about metrics, task types, and evaluation criteria.
          </p>
          <div className="flex items-center gap-2 text-accent-gold font-medium">
            <span>View datasets</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </section>

      {/* Quick Links */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-surface-hover transition-colors"
          >
            <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <div className="text-white font-medium">Leaderboard</div>
              <div className="text-xs text-gray-400">View overall rankings</div>
            </div>
          </Link>
          <Link
            to="/comparison"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-surface-hover transition-colors"
          >
            <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <div className="text-white font-medium">Comparison</div>
              <div className="text-xs text-gray-400">Compare baselines</div>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
}


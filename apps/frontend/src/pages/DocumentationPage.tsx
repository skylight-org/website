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
          Comprehensive documentation for all baseline methods in the Sky Light 
          benchmark suite. Learn about sparse attention implementation details.
        </p>
      </section>

      {/* About Section */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">About Sky Light</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            Sky Light is a comprehensive leaderboard for evaluating sparse attention mechanisms 
            in transformer models. Our platform provides detailed evaluations of various baseline 
            methods across multiple datasets and metrics.
          </p>
        </div>
      </section>

      {/* Featured Documentation */}
      <section>
        <div className="bg-gradient-to-br from-accent-gold/20 to-accent-gold/5 border border-accent-gold/30 rounded-lg p-8 mb-8">
          <Link
            to="/documentation/sparse-attention"
            className="group block"
          >
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-lg bg-accent-gold/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white group-hover:text-accent-gold transition-colors mb-3">
                  Understanding Sparse Attention
                </h2>
                <p className="text-gray-200 mb-4">
                  A comprehensive guide to sparse attention mechanisms—from foundational concepts 
                  and the quadratic complexity problem to advanced implementation strategies and 
                  evaluation metrics. Learn how sparse attention enables transformers to scale to 
                  unprecedented context lengths.
                </p>
                <div className="flex items-center gap-2 text-accent-gold font-medium">
                  <span>Read guide</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Documentation Categories */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {/* Baselines Card */}
          <Link
            to="/documentation/baselines"
            className="group block bg-dark-surface border border-dark-border rounded-lg p-8 hover:border-accent-gold transition-colors"
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
          
          {/* Auxiliary Memory Card */}
          <Link
            to="/documentation/auxiliary-memory"
            className="group block bg-dark-surface border border-dark-border rounded-lg p-8 hover:border-accent-gold transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent-gold/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:text-accent-gold transition-colors">
                Auxiliary Memory
              </h2>
            </div>
            <p className="text-gray-300 mb-4">
              Learn how auxiliary memory is computed for different sparse attention methods. 
              Understand the memory requirements and trade-offs for each approach.
            </p>
            <div className="flex items-center gap-2 text-accent-gold font-medium">
              <span>View guide</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
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
            to="/datasets"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-surface-hover transition-colors"
          >
            <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div>
              <div className="text-white font-medium">Datasets</div>
              <div className="text-xs text-gray-400">Browse evaluation datasets</div>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
}


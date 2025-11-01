import { Breadcrumb } from '../components/common/Breadcrumb';

export function ContributePage() {
  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      {/* Hero Section */}
      <section>
        <h1 className="text-4xl font-bold text-white mb-4">
          Contribute
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          Help make sparse attention research more accessible. Whether you're fixing bugs, 
          adding baselines, or improving docs—your work matters.
        </p>
      </section>

      {/* Why Contribute */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Why Contribute?</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            Transformer attention is a bottleneck. It scales quadratically with sequence length, 
            which means longer contexts = way more compute. Sparse attention is one of the most 
            promising solutions, but the research landscape is fragmented.
          </p>
          <p>
            This project exists to change that. We're building a unified framework where researchers 
            can test new ideas, compare methods fairly, and push the boundaries of what's possible. 
            By contributing, you're helping the entire community move faster.
          </p>
        </div>
      </section>

      {/* What You Can Do */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">What You Can Do</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Baselines */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Add New Baselines</h3>
                <p className="text-sm text-gray-400">
                  Implement your sparse attention method or add existing methods from papers. 
                  We need more techniques in the benchmark.
                </p>
              </div>
            </div>
          </div>

          {/* Fix Bugs */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Fix Bugs</h3>
                <p className="text-sm text-gray-400">
                  Found something broken? PRs welcome. Check the Issues tab for known bugs 
                  or report new ones you discover.
                </p>
              </div>
            </div>
          </div>

          {/* Add Benchmarks */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Add Benchmarks</h3>
                <p className="text-sm text-gray-400">
                  Know of evaluation datasets we're missing? Help us expand benchmark coverage 
                  to test more edge cases.
                </p>
              </div>
            </div>
          </div>

          {/* Improve Docs */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Improve Documentation</h3>
                <p className="text-sm text-gray-400">
                  Clear docs matter. If something confused you, fix it so the next person 
                  doesn't hit the same wall.
                </p>
              </div>
            </div>
          </div>

          {/* Optimize Performance */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Optimize Performance</h3>
                <p className="text-sm text-gray-400">
                  Found a bottleneck? Optimize kernels, improve memory usage, or make the 
                  benchmark runner faster.
                </p>
              </div>
            </div>
          </div>

          {/* Share Results */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Share Results</h3>
                <p className="text-sm text-gray-400">
                  Run experiments and share your findings. Help us understand which methods 
                  work best for different use cases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Contribute */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">How to Get Started</h2>
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-gold text-dark-bg font-bold flex items-center justify-center">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Fork and Clone</h3>
              <p className="text-gray-400 mb-3">
                Head to the{' '}
                <a
                  href="https://github.com/xAlg-ai/sparse-attention-hub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-gold hover:underline"
                >
                  GitHub repo
                </a>
                {' '}and fork it. Then clone your fork locally.
              </p>
              <div className="bg-dark-bg rounded-lg p-4 font-mono text-sm text-gray-300">
                git clone https://github.com/YOUR_USERNAME/sparse-attention-hub.git<br />
                cd sparse-attention-hub
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-gold text-dark-bg font-bold flex items-center justify-center">
              2
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Set Up Your Environment</h3>
              <p className="text-gray-400 mb-3">
                Install dependencies and get everything running. The README has detailed setup instructions.
              </p>
              <div className="bg-dark-bg rounded-lg p-4 font-mono text-sm text-gray-300">
                pip install -e .<br />
                pip install -e ".[dev]"
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-gold text-dark-bg font-bold flex items-center justify-center">
              3
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Make Your Changes</h3>
              <p className="text-gray-400 mb-3">
                Create a new branch, make your changes, and test them. Write tests if you're adding new functionality.
              </p>
              <div className="bg-dark-bg rounded-lg p-4 font-mono text-sm text-gray-300">
                git checkout -b feature/your-feature-name<br />
                # Make your changes<br />
                pytest  # Run tests
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-gold text-dark-bg font-bold flex items-center justify-center">
              4
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Submit a Pull Request</h3>
              <p className="text-gray-400 mb-3">
                Push your branch and open a PR. Explain what you changed and why. Link any relevant issues.
              </p>
              <div className="bg-dark-bg rounded-lg p-4 font-mono text-sm text-gray-300">
                git push origin feature/your-feature-name
              </div>
              <p className="text-gray-400 mt-3">
                Then go to GitHub and click "Compare & pull request". Give it a clear title and description.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guidelines */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Contribution Guidelines</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-accent-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-300">
              <strong className="text-white">Follow the existing code style.</strong> We use Black for Python formatting and run pre-commit hooks.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-accent-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-300">
              <strong className="text-white">Write tests for new features.</strong> We aim for good coverage on critical paths.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-accent-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-300">
              <strong className="text-white">Keep PRs focused.</strong> One feature or fix per PR makes review easier.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-accent-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-300">
              <strong className="text-white">Document your changes.</strong> Update docs if you're changing APIs or adding new features.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-accent-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-300">
              <strong className="text-white">Be respectful.</strong> We're all here to make sparse attention better. Keep discussions constructive.
            </p>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="bg-dark-surface border border-dark-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Useful Resources</h2>
        <div className="space-y-3">
          <a
            href="https://github.com/xAlg-ai/sparse-attention-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-surface-hover transition-colors group"
          >
            <svg className="w-5 h-5 text-accent-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div>
              <div className="text-white font-medium group-hover:text-accent-gold transition-colors">GitHub Repository</div>
              <div className="text-xs text-gray-400">Browse code, issues, and pull requests</div>
            </div>
          </a>
          <a
            href="https://github.com/xAlg-ai/sparse-attention-hub/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-surface-hover transition-colors group"
          >
            <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <div className="text-white font-medium group-hover:text-accent-gold transition-colors">README & Documentation</div>
              <div className="text-xs text-gray-400">Setup instructions and architecture overview</div>
            </div>
          </a>
          <a
            href="https://github.com/xAlg-ai/sparse-attention-hub/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-surface-hover transition-colors group"
          >
            <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <div className="text-white font-medium group-hover:text-accent-gold transition-colors">Issues & Bug Reports</div>
              <div className="text-xs text-gray-400">Find tasks to work on or report problems</div>
            </div>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Ready to Contribute?
        </h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Your contributions—big or small—help push sparse attention research forward. 
          Let's make transformers faster together.
        </p>
        <a
          href="https://github.com/xAlg-ai/sparse-attention-hub"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-gold text-dark-bg font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Visit GitHub Repo
        </a>
      </section>

    </div>
  );
}


export function Footer() {
  return (
    <footer className="mt-16 border-t border-dark-border py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-gray-400">
            Built with love at{' '}
            <a
              href="https://sky.cs.berkeley.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-gold hover:underline transition-colors"
            >
              UC Berkeley's Sky Lab
            </a>
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Sky Light. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}


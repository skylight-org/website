import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useBaselines } from '../../hooks/useBaselines';
import { useDatasets } from '../../hooks/useDatasets';

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDocExpanded, setIsDocExpanded] = useState(false);
  const [isBaselinesExpanded, setIsBaselinesExpanded] = useState(false);
  const [isDatasetsExpanded, setIsDatasetsExpanded] = useState(false);

  const { data: baselines } = useBaselines();
  const { data: datasets } = useDatasets();

  const isDocumentationPath = location.pathname.startsWith('/documentation');
  const isBaselinePath = location.pathname.startsWith('/documentation/baselines');
  const isDatasetPath = location.pathname.startsWith('/documentation/datasets');

  // Auto-expand sections when navigating
  useEffect(() => {
    if (isDocumentationPath) {
      setIsDocExpanded(true);
    }
    if (isBaselinePath) {
      setIsBaselinesExpanded(true);
    }
    if (isDatasetPath) {
      setIsDatasetsExpanded(true);
    }
  }, [isDocumentationPath, isBaselinePath, isDatasetPath]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const isDocActive = (): boolean => {
    return location.pathname.startsWith('/documentation');
  };

  const navItems = [
    { path: '/website', label: 'Overview' },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-dark-surface border-b border-dark-border z-50 flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/website/sky-light-logo-icon.png"
            alt="Sky Light" 
            className="w-8 h-8 object-contain"
          />
          <span className="text-white font-semibold text-lg">Sky Light</span>
        </Link>

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-dark-surface border-l border-dark-border z-50 transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Menu Header */}
        <div className="p-6 border-b border-dark-border flex items-center justify-end">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg mb-2 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-accent-gold text-dark-bg'
                  : 'text-gray-300 hover:bg-dark-surface-hover hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Documentation Section */}
          <div className="mt-2">
            <button
              onClick={() => setIsDocExpanded(!isDocExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isDocActive()
                  ? 'bg-accent-gold text-dark-bg'
                  : 'text-gray-300 hover:bg-dark-surface-hover hover:text-white'
              }`}
            >
              <span className="flex-1 text-left">Documentation</span>
              <svg
                className={`w-4 h-4 transition-transform ${isDocExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDocExpanded && (
              <div className="ml-4 mt-2 space-y-2">
                {/* Baselines Sub-section */}
                <div>
                  <button
                    onClick={() => setIsBaselinesExpanded(!isBaselinesExpanded)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/documentation/baselines'
                        ? 'bg-dark-surface-hover text-accent-gold'
                        : 'text-gray-400 hover:bg-dark-surface-hover hover:text-white'
                    }`}
                  >
                    <span className="flex-1 text-left">Baselines</span>
                    <svg
                      className={`w-3 h-3 transition-transform ${isBaselinesExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isBaselinesExpanded && baselines && (
                    <div className="ml-3 mt-1 space-y-1 max-h-48 overflow-y-auto">
                      {baselines.map((baseline) => (
                        <Link
                          key={baseline.id}
                          to={`/documentation/baselines/${baseline.id}`}
                          className={`block px-3 py-1.5 rounded text-xs transition-colors ${
                            location.pathname === `/documentation/baselines/${baseline.id}`
                              ? 'text-accent-gold font-medium'
                              : 'text-gray-500 hover:bg-dark-surface-hover hover:text-gray-300'
                          }`}
                          title={baseline.description}
                        >
                          <div className="truncate">{baseline.name}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Datasets Sub-section */}
                <div>
                  <button
                    onClick={() => setIsDatasetsExpanded(!isDatasetsExpanded)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/documentation/datasets'
                        ? 'bg-dark-surface-hover text-accent-gold'
                        : 'text-gray-400 hover:bg-dark-surface-hover hover:text-white'
                    }`}
                  >
                    <span className="flex-1 text-left">Datasets</span>
                    <svg
                      className={`w-3 h-3 transition-transform ${isDatasetsExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isDatasetsExpanded && datasets && (
                    <div className="ml-3 mt-1 space-y-1 max-h-48 overflow-y-auto">
                      {datasets.map((dataset) => (
                        <Link
                          key={dataset.id}
                          to={`/documentation/datasets/${dataset.id}`}
                          className={`block px-3 py-1.5 rounded text-xs transition-colors ${
                            location.pathname === `/documentation/datasets/${dataset.id}`
                              ? 'text-accent-gold font-medium'
                              : 'text-gray-500 hover:bg-dark-surface-hover hover:text-gray-300'
                          }`}
                          title={dataset.description}
                        >
                          <div className="truncate">{dataset.name}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contribute Link */}
          <Link
            to="/contribute"
            className={`flex items-center px-4 py-3 rounded-lg mb-2 text-sm font-medium transition-colors ${
              isActive('/contribute')
                ? 'bg-accent-gold text-dark-bg'
                : 'text-gray-300 hover:bg-dark-surface-hover hover:text-white'
            }`}
          >
            Contribute
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border">
          <div className="text-xs text-gray-400 text-center">
            <p>Version 1.0.0</p>
            <p className="mt-1">© 2025 <a href="https://sky.cs.berkeley.edu/" target="_blank" rel="noopener noreferrer" className="text-gray-400 no-underline hover:text-gray-300 transition-colors">Sky Lab</a></p>
          </div>
        </div>
      </aside>
    </>
  );
}

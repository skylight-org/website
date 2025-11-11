import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useBaselines } from '../../hooks/useBaselines';
import { useSidebar } from '../../contexts/SidebarContext';
import { useState } from 'react';

// Bottom section components to ensure full-width divider and separation of concerns
function SidebarVersionInfo() {
  return (
    <div className="text-xs text-gray-400 text-center">
      <p>Version 1.0.0</p>
      <p className="mt-1">
        © 2025{' '}
        <a
          href="https://sky.cs.berkeley.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 no-underline hover:text-gray-300 transition-colors"
        >
          Sky Light
        </a>
      </p>
    </div>
  );
}

function SidebarCollapseControl({ onCollapse }: { onCollapse: () => void }) {
  return (
    <button
      onClick={onCollapse}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-dark-surface-hover hover:text-white transition-colors"
      aria-label="Collapse sidebar"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
      <span>Collapse</span>
    </button>
  );
}

export function Sidebar() {
  const location = useLocation();
  const isDocumentationPath = location.pathname.startsWith('/documentation');
  const isBaselinePath = location.pathname.startsWith('/documentation/baselines');
  
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isDocExpanded, setIsDocExpanded] = useState(isDocumentationPath);
  const [isBaselinesExpanded, setIsBaselinesExpanded] = useState(isBaselinePath);

  const { data: baselines } = useBaselines();
  
  // Auto-expand sections when navigating to their pages
  useEffect(() => {
    if (isDocumentationPath) {
      setIsDocExpanded(true);
    }
    if (isBaselinePath) {
      setIsBaselinesExpanded(true);
    }
  }, [isDocumentationPath, isBaselinePath]);

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const isDocActive = (): boolean => {
    return location.pathname.startsWith('/documentation');
  };

  const navItems = [
    { path: '/website', label: 'Overview' },
    { path: '/datasets', label: 'Datasets' },
  ];


  if (isCollapsed) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-16 bg-dark-surface border-r border-dark-border rounded-tr-2xl rounded-br-2xl flex flex-col items-center py-6 z-50">
        {/* Logo (collapsed) */}
        <Link to="/" className="flex-1 flex items-start pt-2">
          <img 
            src="/website/sky-light-logo-icon.png"
            alt="Sky Light"
            className="w-10 h-10 object-contain"
          />
        </Link>

        {/* Expand control aligned with collapse control design */}
        <div className="mt-auto w-full">
          <div className="border-t border-dark-border" />
          <div className="px-3 py-3">
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-dark-surface-hover hover:text-white transition-colors"
              aria-label="Expand sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              <span className="sr-only">Expand</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-surface border-r border-dark-border rounded-tr-2xl rounded-br-2xl flex flex-col z-50">
      {/* Logo/Title */}
      <div className="p-6 border-b border-dark-border">
        <Link to="/website" className="flex flex-col items-center">
          <img
            src="/website/sky-light-logo.png"
            alt="Sky Light" 
            className="w-full h-auto object-contain mb-2"
          />
          <p className="text-sm text-gray-400 text-center">Sparse Attention Hub</p>
        </Link>
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

        {/* Documentation Section with Nested Baselines and Datasets */}
        <div className="mt-2">
          <button
            onClick={() => setIsDocExpanded(!isDocExpanded)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isDocActive()
                ? 'bg-accent-gold text-dark-bg'
                : 'text-gray-300 hover:bg-dark-surface-hover hover:text-white'
            }`}
          >
            <Link
              to="/documentation"
              className="flex-1 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              Documentation
            </Link>
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
                  <Link
                    to="/documentation/baselines"
                    className="flex-1 text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Baselines
                  </Link>
                  <svg
                    className={`w-3 h-3 transition-transform ${isBaselinesExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isBaselinesExpanded && baselines ? (
                  <div className="ml-3 mt-1 space-y-1 max-h-48 overflow-y-auto">
                    {/* @ts-ignore */}
                    {baselines.map((baseline: any) => (
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
                ) : null}
              </div>

            {/* Auxiliary Memory Sub-section */}
            <Link
                to="/documentation/auxiliary-memory"
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/documentation/auxiliary-memory'
                    ? 'bg-dark-surface-hover text-accent-gold'
                    : 'text-gray-400 hover:bg-dark-surface-hover hover:text-white'
                }`}
              >
                Auxiliary Memory
              </Link>
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

      {/* Footer: Version info + full-width divider + collapse control */}
      <div className="mt-auto">
        <div className="px-4 py-3">
          <SidebarVersionInfo />
        </div>
        <div className="border-t border-dark-border" />
        <div className="px-4 py-3">
          <SidebarCollapseControl onCollapse={() => setIsCollapsed(true)} />
        </div>
      </div>
    </aside>
  );
}

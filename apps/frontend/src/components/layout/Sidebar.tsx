import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';

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
  const navigate = useNavigate();
  
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const scrollToSection = (id: string) => {
    // If not on home page, navigate there first
    if (location.pathname !== '/home') {
      navigate('/home');
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (isCollapsed) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-16 bg-dark-surface border-r border-dark-border rounded-tr-2xl rounded-br-2xl flex flex-col items-center py-6 z-50">
        {/* Logo (collapsed) */}
        <Link to="/home" className="flex-1 flex items-start pt-2">
          <img 
            src="/sky-light-logo-icon.png"
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
        <Link to="/home" className="flex flex-col items-center">
          <img
            src="/sky-light-logo.png"
            alt="Sky Light" 
            className="w-full h-auto object-contain mb-2"
          />
        </Link>
      </div>

      {/* 
        IMPORTANT: Desktop Navigation Structure
        When updating navigation items, also update the mobile Header component (Header.tsx)
        to maintain consistency across desktop and mobile views.
      */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        {/* Main Section */}
        <div className="mb-2">
          <Link
            to="/home"
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive('/home')
                ? 'bg-accent-gold text-dark-bg'
                : 'text-gray-300 hover:bg-dark-surface-hover hover:text-white'
            }`}
          >
            sparse-attention/decoding
          </Link>
          
          {/* Subtabs for sections */}
          {isActive('/home') && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-dark-border pl-2">
              <button
                onClick={() => scrollToSection('summary-section')}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-dark-surface-hover hover:text-white transition-colors"
              >
                Summary
              </button>
              <button
                onClick={() => scrollToSection('models-section')}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-dark-surface-hover hover:text-white transition-colors"
              >
                Models
              </button>
              <button
                onClick={() => scrollToSection('datasets-section')}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-dark-surface-hover hover:text-white transition-colors"
              >
                Datasets
              </button>
            </div>
          )}
        </div>

        {/* Blog Link */}
        <Link
          to="/blog"
          className={`flex items-center px-4 py-3 rounded-lg mb-2 text-sm font-medium transition-colors ${
            isActive('/blog') || location.pathname.startsWith('/blog')
              ? 'bg-accent-gold text-dark-bg'
              : 'text-gray-300 hover:bg-dark-surface-hover hover:text-white'
          }`}
        >
          Blog
        </Link>

        {/* About Link */}
        <Link
          to="/about"
          className={`flex items-center px-4 py-3 rounded-lg mb-2 text-sm font-medium transition-colors ${
            isActive('/about')
              ? 'bg-accent-gold text-dark-bg'
              : 'text-gray-300 hover:bg-dark-surface-hover hover:text-white'
          }`}
        >
          About
        </Link>

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

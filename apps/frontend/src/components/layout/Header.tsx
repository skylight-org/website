import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-dark-surface border-b border-dark-border z-[60] flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <img 
            src="/sky-light-logo-icon.png"
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
          className="fixed inset-0 bg-black/50 z-[55]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 bg-dark-surface border-l border-dark-border z-[60] transform transition-transform duration-300 ${
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

        {/* 
          IMPORTANT: Mobile Navigation Structure
          When updating navigation items, also update the desktop Sidebar component (Sidebar.tsx)
          to maintain consistency across mobile and desktop views.
        */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          {/* Welcome Link */}
          <Link
            to="/home"
            className={`flex items-center px-4 py-3 rounded-lg mb-2 text-sm font-medium transition-colors ${
              isActive('/home')
                ? 'bg-accent-gold text-dark-bg'
                : 'text-gray-300 hover:bg-dark-surface-hover hover:text-white'
            }`}
          >
            Welcome
          </Link>

          {/* Sparse Attention Method Link */}
          <Link
            to="/home/method/sparse-attention-decoding"
            className={`flex items-center px-4 py-3 rounded-lg mb-2 text-sm font-medium transition-colors ${
              location.pathname === '/home/method/sparse-attention-decoding'
                ? 'bg-accent-gold text-dark-bg'
                : 'text-gray-300 hover:bg-dark-surface-hover hover:text-white'
            }`}
          >
            sparse-attention/decoding
          </Link>

          {/* Semantic Caching Method Link */}
          <Link
            to="/home/method/semantic-caching"
            className={`flex items-center px-4 py-3 rounded-lg mb-2 text-sm font-medium transition-colors ${
              location.pathname.startsWith('/home/method/semantic-caching')
                ? 'bg-accent-gold text-dark-bg'
                : 'text-gray-300 hover:bg-dark-surface-hover hover:text-white'
            }`}
          >
            semantic-caching
          </Link>

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

        {/* Footer */}
        <div className="p-4 border-t border-dark-border">
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
        </div>
      </aside>
    </>
  );
}

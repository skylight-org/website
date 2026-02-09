import React from 'react';

interface MethodLayoutProps {
  children: React.ReactNode;
}

/**
 * MethodLayout provides consistent structure for individual method pages.
 * 
 * Single Responsibility: Wraps method content with consistent structure
 * 
 * Features:
 * - Consistent spacing and structure for method pages
 * - Extensible for future enhancements (can add header, breadcrumbs, etc.)
 */
export const MethodLayout: React.FC<MethodLayoutProps> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};

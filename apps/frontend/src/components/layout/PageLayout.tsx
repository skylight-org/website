import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  spacing?: 'none' | 'normal' | 'large';
  maxWidth?: 'none' | 'narrow' | 'wide' | 'full';
  className?: string;
}

/**
 * PageLayout component provides consistent structure and alignment across all pages.
 * 
 * Single Responsibility: Handles page-level layout concerns (spacing, width, padding)
 * 
 * Usage:
 * - spacing: Controls vertical spacing between child sections
 *   - 'none': No spacing (for pages that manage their own spacing)
 *   - 'normal': space-y-8 (default, 2rem between sections)
 *   - 'large': space-y-10 (2.5rem between sections)
 * 
 * - maxWidth: Controls content width constraint
 *   - 'none': No max-width (full width within parent)
 *   - 'narrow': max-w-4xl (768px, good for reading content)
 *   - 'wide': max-w-6xl (1152px, good for tables/charts)
 *   - 'full': max-w-7xl (1280px, default)
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  spacing = 'normal',
  maxWidth = 'full',
  className = ''
}) => {
  // Map spacing prop to Tailwind classes
  const spacingClass = {
    'none': '',
    'normal': 'space-y-8',
    'large': 'space-y-10',
  }[spacing];

  // Map maxWidth prop to Tailwind classes
  const maxWidthClass = {
    'none': '',
    'narrow': 'max-w-4xl',
    'wide': 'max-w-6xl',
    'full': 'max-w-7xl',
  }[maxWidth];

  return (
    <div className={`${spacingClass} ${maxWidthClass} ${className}`.trim()}>
      {children}
    </div>
  );
};

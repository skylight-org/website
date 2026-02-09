import React from 'react';

interface ScrollableFormulaContainerProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  minWidth?: string;
}

/**
 * Wrapper component for mathematical formulas and plots that need horizontal scrolling on mobile.
 * Ensures content doesn't overflow viewport on narrow screens.
 */
export const ScrollableFormulaContainer: React.FC<ScrollableFormulaContainerProps> = ({ 
  children, 
  className = '', 
  ariaLabel = 'Mathematical content',
  minWidth
}) => {
  return (
    <div 
      className={`overflow-x-auto ${className}`}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <div className={minWidth ? minWidth : undefined}>
        {children}
      </div>
    </div>
  );
};

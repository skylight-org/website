import { useState, useRef, useEffect } from 'react';

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className="inline-flex items-center justify-center w-4 h-4 ml-1.5 text-xs border border-gray-500 text-gray-400 rounded-full hover:border-accent-gold hover:text-accent-gold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2 focus:ring-offset-dark-bg"
        aria-label="More information"
        aria-expanded={isVisible}
      >
        i
      </button>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-dark-surface border border-accent-gold/50 rounded-lg shadow-xl text-sm text-gray-300 leading-relaxed"
          role="tooltip"
        >
          {/* Arrow pointing up */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-accent-gold/50" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-0 h-0 border-l-7 border-r-7 border-b-7 border-l-transparent border-r-transparent border-b-dark-surface" />
          
          {content}
        </div>
      )}
    </div>
  );
}


import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface InfoTooltipProps {
  content: string;
}

type TooltipPosition = 'center' | 'left' | 'right';
type TooltipDirection = 'down' | 'up';

interface TooltipCoordinates {
  top: number;
  left: number;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>('center');
  const [direction, setDirection] = useState<TooltipDirection>('down');
  const [coordinates, setCoordinates] = useState<TooltipCoordinates>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const calculateOptimalPosition = useCallback((): void => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 256;
    const tooltipEstimatedHeight = 100;
    const margin = 16;
    const spacing = 8;

    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const optimalDirection: TooltipDirection = spaceBelow < tooltipEstimatedHeight + margin && spaceAbove > spaceBelow ? 'up' : 'down';
    
    const centerPosition = buttonRect.left + buttonRect.width / 2;
    const leftEdge = centerPosition - tooltipWidth / 2;
    const rightEdge = centerPosition + tooltipWidth / 2;

    let optimalPosition: TooltipPosition = 'center';
    let leftCoordinate = centerPosition - tooltipWidth / 2;
    
    if (leftEdge < margin) {
      optimalPosition = 'left';
      leftCoordinate = buttonRect.left;
    } else if (rightEdge > viewportWidth - margin) {
      optimalPosition = 'right';
      leftCoordinate = buttonRect.right - tooltipWidth;
    }

    const topCoordinate = optimalDirection === 'down' 
      ? buttonRect.bottom + spacing
      : buttonRect.top - tooltipEstimatedHeight - spacing;

    setPosition(optimalPosition);
    setDirection(optimalDirection);
    setCoordinates({ top: topCoordinate, left: leftCoordinate });
  }, []);

  useEffect(() => {
    if (isVisible && buttonRef.current) {
      calculateOptimalPosition();
    }
  }, [isVisible, calculateOptimalPosition]);

  useEffect(() => {
    if (isVisible) {
      const handleScroll = (): void => {
        calculateOptimalPosition();
      };
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isVisible, calculateOptimalPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
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

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
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

  const getArrowPosition = (): { left: string } => {
    if (!buttonRef.current) return { left: '50%' };
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const buttonCenter = buttonRect.left + buttonRect.width / 2;
    const arrowLeft = buttonCenter - coordinates.left;
    
    return { left: `${arrowLeft}px` };
  };

  const tooltipContent = isVisible && (
    <div
      ref={tooltipRef}
      className="fixed w-64 p-3 bg-dark-surface border border-accent-gold/50 rounded-lg shadow-xl text-sm text-gray-300 leading-relaxed z-[100]"
      style={{
        top: `${coordinates.top}px`,
        left: `${coordinates.left}px`,
      }}
      role="tooltip"
    >
      {direction === 'down' ? (
        <>
          <div 
            className="absolute -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-accent-gold/50"
            style={{ left: getArrowPosition().left, transform: 'translateX(-50%)' }}
          />
          <div 
            className="absolute -top-1.5 w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-dark-surface"
            style={{ left: getArrowPosition().left, transform: 'translateX(-50%)' }}
          />
        </>
      ) : (
        <>
          <div 
            className="absolute -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-accent-gold/50"
            style={{ left: getArrowPosition().left, transform: 'translateX(-50%)' }}
          />
          <div 
            className="absolute -bottom-1.5 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-dark-surface"
            style={{ left: getArrowPosition().left, transform: 'translateX(-50%)' }}
          />
        </>
      )}
      
      {content}
    </div>
  );

  return (
    <>
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
      
      {isVisible && createPortal(tooltipContent, document.body)}
    </>
  );
}


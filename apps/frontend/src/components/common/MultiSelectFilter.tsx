import { useState, useRef, useEffect } from 'react';

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onChange,
  className = ''
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      const newValues = selectedValues.filter(v => v !== option);
      onChange(newValues.length > 0 ? newValues : [options[0]]);
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const selectAll = () => {
    onChange(options);
  };

  const deselectAll = () => {
    onChange([options[0]]);
  };

  const displayText = selectedValues.length === options.length
    ? 'All'
    : selectedValues.length === 1
    ? selectedValues[0]
    : `${selectedValues.length} selected`;

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={dropdownRef}>
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-white hover:border-accent-gold focus:outline-none focus:border-accent-gold transition-colors text-left flex items-center justify-between"
        >
          <span className="truncate">{displayText}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-dark-surface border border-dark-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="sticky top-0 bg-dark-surface border-b border-dark-border p-2 flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="flex-1 px-2 py-1 text-xs text-gray-300 hover:text-accent-gold transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="flex-1 px-2 py-1 text-xs text-gray-300 hover:text-accent-gold transition-colors"
              >
                Clear
              </button>
            </div>
            
            <div className="p-1">
              {options.map(option => (
                <label
                  key={option}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-dark-surface-hover rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => toggleOption(option)}
                    className="w-4 h-4 rounded border-gray-600 bg-dark-bg text-accent-gold focus:ring-accent-gold focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-white">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


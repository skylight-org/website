import type { NumericRange } from '@sky-light/shared-types';

interface RangeFilterProps {
  label: string;
  value: NumericRange | undefined;
  onChange: (value: NumericRange | undefined) => void;
  options: number[];
  formatValue?: (value: number) => string;
  placeholder?: string;
  isLoading?: boolean;
}

export function RangeFilter({
  label,
  value,
  onChange,
  options,
  formatValue = (v) => v.toString(),
  placeholder = 'All',
  isLoading = false,
}: RangeFilterProps) {
  const handleMinChange = (newMin: string) => {
    const min = newMin === '' ? undefined : parseFloat(newMin);
    const max = value?.max;
    
    // If both min and max are undefined, set value to undefined
    if (min === undefined && max === undefined) {
      onChange(undefined);
    } else {
      onChange({ min, max });
    }
  };

  const handleMaxChange = (newMax: string) => {
    const max = newMax === '' ? undefined : parseFloat(newMax);
    const min = value?.min;
    
    // If both min and max are undefined, set value to undefined
    if (min === undefined && max === undefined) {
      onChange(undefined);
    } else {
      onChange({ min, max });
    }
  };

  // Filter max options to only show values >= min
  const maxOptions = value?.min !== undefined 
    ? options.filter(v => v >= value.min!) 
    : options;

  // Filter min options to only show values <= max
  const minOptions = value?.max !== undefined 
    ? options.filter(v => v <= value.max!) 
    : options;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {/* Min Dropdown */}
        <select
          value={value?.min ?? ''}
          onChange={(e) => handleMinChange(e.target.value)}
          disabled={isLoading}
          className="px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white hover:border-accent-gold focus:outline-none focus:border-accent-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <option value="">Min: {placeholder}</option>
          {minOptions.map((option) => (
            <option key={option} value={option}>
              Min: {formatValue(option)}
            </option>
          ))}
        </select>

        {/* Max Dropdown */}
        <select
          value={value?.max ?? ''}
          onChange={(e) => handleMaxChange(e.target.value)}
          disabled={isLoading}
          className="px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white hover:border-accent-gold focus:outline-none focus:border-accent-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <option value="">Max: {placeholder}</option>
          {maxOptions.map((option) => (
            <option key={option} value={option}>
              Max: {formatValue(option)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}


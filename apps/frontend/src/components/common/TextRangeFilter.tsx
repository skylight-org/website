interface TextRangeFilterProps {
  label: string;
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  minDefault?: number;
  maxDefault?: number;
  unit?: string;
}

export function TextRangeFilter({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minDefault = 0,
  maxDefault = 1.0,
  unit = '',
}: TextRangeFilterProps) {

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {/* Min Input */}
        <div className="relative">
          <input
            type="text"
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
            placeholder={`Min: ${minDefault}`}
            className={`w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white hover:border-accent-gold focus:outline-none focus:border-accent-gold transition-colors text-sm ${unit ? 'pr-8' : ''}`}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
              {unit}
            </span>
          )}
        </div>

        {/* Max Input */}
        <div className="relative">
          <input
            type="text"
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
            placeholder={`Max: ${maxDefault}`}
            className={`w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white hover:border-accent-gold focus:outline-none focus:border-accent-gold transition-colors text-sm ${unit ? 'pr-8' : ''}`}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

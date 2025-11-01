interface FilterDropdownProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  options: number[];
  formatValue?: (value: number) => string;
  placeholder?: string;
  isLoading?: boolean;
}

export function FilterDropdown({
  label,
  value,
  onChange,
  options,
  formatValue = (v) => v.toString(),
  placeholder = 'All',
  isLoading = false,
}: FilterDropdownProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? undefined : parseFloat(val));
        }}
        disabled={isLoading}
        className="px-4 py-2 rounded-lg bg-dark-surface border border-dark-border text-white hover:border-accent-gold focus:outline-none focus:border-accent-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatValue(option)}
          </option>
        ))}
      </select>
    </div>
  );
}


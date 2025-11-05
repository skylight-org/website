import { SortConfig } from '../../hooks/useSortableData';

interface SortableHeaderProps {
  label: string | React.ReactNode;
  sortKey: string;
  sortConfig: SortConfig<any> | null;
  onSort: (key: string) => void;
  align?: 'left' | 'right';
  className?: string;
}

export function SortableHeader({ 
  label, 
  sortKey, 
  sortConfig, 
  onSort, 
  align = 'left',
  className = ''
}: SortableHeaderProps) {
  const isActive = sortConfig?.key === sortKey;
  const direction = isActive ? sortConfig.direction : null;

  return (
    <th 
      className={`px-4 py-3 text-${align} text-sm font-semibold text-gray-400 cursor-pointer hover:text-accent-gold transition-colors select-none ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        <div className="flex flex-col gap-0.5">
          <svg 
            className={`w-3 h-3 transition-colors ${
              direction === 'asc' ? 'text-accent-gold' : 'text-gray-600'
            }`}
            fill="currentColor" 
            viewBox="0 0 12 12"
          >
            <path d="M6 2L10 8H2L6 2Z" />
          </svg>
          <svg 
            className={`w-3 h-3 transition-colors ${
              direction === 'desc' ? 'text-accent-gold' : 'text-gray-600'
            }`}
            fill="currentColor" 
            viewBox="0 0 12 12"
          >
            <path d="M6 10L2 4H10L6 10Z" />
          </svg>
        </div>
      </div>
    </th>
  );
}


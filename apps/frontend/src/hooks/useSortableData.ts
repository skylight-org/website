import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

function compareValues(a: any, b: any, direction: SortDirection): number {
  if (a === b || direction === null) return 0;
  
  const isAscending = direction === 'asc';
  
  if (a === null || a === undefined) return isAscending ? 1 : -1;
  if (b === null || b === undefined) return isAscending ? -1 : 1;
  
  if (typeof a === 'string' && typeof b === 'string') {
    return isAscending 
      ? a.localeCompare(b) 
      : b.localeCompare(a);
  }
  
  return isAscending ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
}

export function useSortableData<T>(data: T[], initialSort?: SortConfig<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialSort || null);

  const sortedData = useMemo(() => {
    if (!sortConfig || sortConfig.direction === null) {
      return data;
    }

    return [...data].sort((a, b) => {
      // Primary sort
      const aValue = getNestedValue(a, sortConfig.key as string);
      const bValue = getNestedValue(b, sortConfig.key as string);
      const primaryComparison = compareValues(aValue, bValue, sortConfig.direction);
      
      // If primary sort values are equal and not sorting by 'score', use score as secondary sort (descending)
      if (primaryComparison === 0 && sortConfig.key !== 'score') {
        const aScore = getNestedValue(a, 'score');
        const bScore = getNestedValue(b, 'score');
        return compareValues(aScore, bScore, 'desc');
      }
      
      return primaryComparison;
    });
  }, [data, sortConfig]);

  const requestSort = (key: keyof T | string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      
      return null;
    });
  };

  return { sortedData, sortConfig, requestSort };
}


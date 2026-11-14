import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  onRowClick,
  isLoading = false,
  emptyMessage = 'No records found',
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection]);

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 space-y-4 animate-pulse">
          <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-lg w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3.5 px-4 select-none ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center space-x-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4 text-primary" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 hover:text-slate-600" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="font-medium text-slate-600">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={row[keyField] || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3.5 px-4 text-slate-700 ${col.className || ''}`}>
                      {col.render ? col.render(row, index) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

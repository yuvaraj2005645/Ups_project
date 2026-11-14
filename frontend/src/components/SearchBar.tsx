import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value: initialValue = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(searchTerm);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [searchTerm, debounceMs, onChange]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => {
            setSearchTerm('');
            onChange('');
          }}
          className="absolute right-3 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

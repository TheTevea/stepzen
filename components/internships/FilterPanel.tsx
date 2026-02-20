'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { FilterState } from '@/types';

interface FilterPanelProps {
  filters: FilterState;
  locations: string[];
  categories: string[];
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
}

interface SelectOption {
  value: string;
  label: string;
}

interface NeoSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const NeoSelect: React.FC<NeoSelectProps> = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 p-2.5 border-2 border-black rounded-lg font-bold text-sm bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all text-left ${open ? 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}`}
      >
        <span className={value ? 'text-black' : 'text-gray-400'}>{selectedLabel}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-left transition-colors ${
                option.value === value
                  ? 'bg-black text-white font-bold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {option.label}
              {option.value === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  locations,
  categories,
  onFilterChange,
  onReset,
}) => {
  const locationOptions: SelectOption[] = [
    { value: '', label: 'All Locations' },
    ...locations.map(l => ({ value: l, label: l })),
  ];

  const typeOptions: SelectOption[] = [
    { value: '', label: 'All Types' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Onsite', label: 'Onsite' },
  ];

  const categoryOptions: SelectOption[] = [
    { value: '', label: 'All Categories' },
    ...categories.map(c => ({ value: c, label: c })),
  ];

  const sortOptions: SelectOption[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'deadline', label: 'Deadline Soon' },
    { value: 'alpha', label: 'Company A-Z' },
  ];

  return (
    <div className="bg-white border-2 border-black rounded-xl p-6 shadow-neo mb-12">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-5 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
             <input 
               type="text" 
               placeholder="Search by role, company, or skill..."
               className="w-full pl-11 pr-4 py-2.5 border-2 border-black rounded-lg bg-gray-50 font-bold text-sm placeholder:font-medium placeholder:text-gray-400 focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
               value={filters.search}
               onChange={(e) => onFilterChange('search', e.target.value)}
             />
          </div>
          
          {/* Custom Dropdowns */}
          <NeoSelect
            options={locationOptions}
            value={filters.location}
            onChange={(v) => onFilterChange('location', v)}
            placeholder="All Locations"
          />

          <NeoSelect
            options={typeOptions}
            value={filters.type}
            onChange={(v) => onFilterChange('type', v)}
            placeholder="All Types"
          />

          <NeoSelect
            options={categoryOptions}
            value={filters.category}
            onChange={(v) => onFilterChange('category', v)}
            placeholder="All Categories"
          />

          <NeoSelect
            options={sortOptions}
            value={filters.sort}
            onChange={(v) => onFilterChange('sort', v)}
            placeholder="Newest First"
          />
          
          <button 
            className="lg:col-span-1 border-2 border-black rounded-lg font-bold text-sm bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none active:translate-y-[2px] transition-all py-2.5"
            onClick={onReset}
          >
            Reset Filters
          </button>
       </div>
    </div>
  );
};

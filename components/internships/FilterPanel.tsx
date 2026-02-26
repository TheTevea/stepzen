'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { FilterState } from '@/types';
import { NeoSelect, SelectOption } from '@/components/NeoSelect';
import { NeoInput } from '@/components/NeoInput';

interface FilterPanelProps {
  filters: FilterState;
  locations: string[];
  categories: string[];
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
}

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
          <NeoInput
            className="lg:col-span-5"
            icon={<Search size={18} />}
            type="text"
            placeholder="Search by role, company, or skill..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
          
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

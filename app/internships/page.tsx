'use client';

import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { INTERNSHIPS } from '@/constants';
import { JobCard } from '@/components/JobCard';
import { Button } from '@/components/Button';
import { FilterState } from '@/types';
import { PageTemplate } from '@/components/PageTemplate';
import { FilterPanel } from '@/components/internships/FilterPanel';

export default function Internships() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    location: '',
    type: '',
    category: '',
    sort: 'newest',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Extract unique options for dropdowns
  const locations = [...new Set(INTERNSHIPS.map(i => i.location.split(', ')[1] || i.location))];
  const categories = [...new Set(INTERNSHIPS.map(i => i.category))];

  const filteredInternships = useMemo(() => {
    let result = [...INTERNSHIPS];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.company.toLowerCase().includes(q) ||
        i.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    // Filters
    if (filters.location) {
      result = result.filter(i => i.location.includes(filters.location));
    }
    if (filters.type) {
      result = result.filter(i => i.type === filters.type);
    }
    if (filters.category) {
      result = result.filter(i => i.category === filters.category);
    }

    // Sort
    if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    } else if (filters.sort === 'deadline') {
      result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (filters.sort === 'alpha') {
      result.sort((a, b) => a.company.localeCompare(b.company));
    }

    return result;
  }, [filters]);

  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);
  const paginatedInternships = filteredInternships.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({ search: '', location: '', type: '', category: '', sort: 'newest' });
    setCurrentPage(1);
  };

  return (
    <PageTemplate>
      <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
        <div className="flex justify-center items-center mb-10 gap-4 mt-4">
        
          <h1 className="text-4xl md:text-5xl font-display font-bold text-center">Find Your Match</h1>
          <div className="inline-block bg-primary text-white border-2 border-black px-4 py-1 rounded-sm font-bold text-xl italic tracking-wide shadow-neo-sm">
             OPPORTUNITIES
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          locations={locations}
          categories={categories}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Grid */}
        {filteredInternships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {paginatedInternships.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl mb-12">
            <Filter size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500">No internships found</h3>
            <p className="text-gray-400">Try adjusting your filters.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Button 
              variant="outline" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <span className="font-bold text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}

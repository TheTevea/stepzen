'use client';

import React, { useState, useMemo } from 'react';
import { Filter, Search } from 'lucide-react';
import { INTERNSHIPS } from '@/constants';
import { JobCard } from '@/components/JobCard';
import { Button } from '@/components/Button';
import { FilterState } from '@/types';
import { PageTemplate } from '@/components/PageTemplate';

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

  return (
    <PageTemplate>
      <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
        <div className="flex flex-col items-center mb-10">
          <div className="inline-block bg-primary text-white border-2 border-black px-4 py-1 rounded-full font-bold text-sm tracking-wide mb-4 shadow-neo-sm">
             OPPORTUNITIES
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-center">Find Your Match</h1>
        </div>

        {/* Filter Panel */}
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-neo mb-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-5 relative">
                 <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                 <input 
                   type="text" 
                   placeholder="Search by role, company, or skill..."
                   className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-0 font-medium transition-colors"
                   value={filters.search}
                   onChange={(e) => handleFilterChange('search', e.target.value)}
                 />
              </div>
              
              {/* Dropdowns */}
              <select 
                className="p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black font-medium bg-white"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                 <option value="">All Locations</option>
                 {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>

              <select 
                className="p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black font-medium bg-white"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                 <option value="">All Types</option>
                 <option value="Remote">Remote</option>
                 <option value="Hybrid">Hybrid</option>
                 <option value="Onsite">Onsite</option>
              </select>

              <select 
                className="p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black font-medium bg-white"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                 <option value="">All Categories</option>
                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

               <select 
                className="p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black font-medium bg-white"
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                 <option value="newest">Newest First</option>
                 <option value="deadline">Deadline Soon</option>
                 <option value="alpha">Company A-Z</option>
              </select>
              
              <button 
                className="lg:col-span-1 bg-gray-100 border-2 border-gray-200 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                onClick={() => setFilters({ search: '', location: '', type: '', category: '', sort: 'newest' })}
              >
                Reset Filters
              </button>
           </div>
        </div>

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

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { JobCard } from '@/components/JobCard';
import { Button } from '@/components/Button';
import { FilterState, Internship } from '@/types';
import { PageTemplate } from '@/components/PageTemplate';
import { FilterPanel } from '@/components/internships/FilterPanel';

function JobCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white border-2 border-black rounded-xl p-5 shadow-neo animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-2 mb-6 flex-grow">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="flex gap-4 pt-2">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-28 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="mt-auto pt-4 border-t-2 border-gray-100 flex gap-3">
        <div className="flex-1 h-9 bg-gray-200 rounded-full" />
        <div className="h-9 w-12 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

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

  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error('Failed to load internships');
        const dbJobs = await res.json();
        const mapped: Internship[] = dbJobs.map((j: Record<string, unknown>) => ({
          id: j.id as string,
          title: j.title as string,
          company: j.companyName as string,
          location: ((j.location as Record<string, unknown>)?.name as string) || 'Remote',
          type: ((j.jobType as string) || 'Remote') as Internship['type'],
          category: ((j.category as Record<string, unknown>)?.name as string || 'Fullstack') as Internship['category'],
          postedDate: (j.createdAt as string)?.split('T')[0] || new Date().toISOString().split('T')[0],
          deadline: (j.deadline as string) || (j.expiresAt as string)?.split('T')[0] || '',
          summary: (j.description as string) || '',
          responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities as string[] : [],
          requirements: Array.isArray(j.requirements) ? j.requirements as string[] : [],
          skills: Array.isArray(j.skills) ? j.skills as string[] : [],
          duration: (j.duration as string) || undefined,
          stipend: (j.stipend as string) || undefined,
          telegramApplyLink: j.telegramLink as string,
        }));
        setAllInternships(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch real locations + categories from backend for filter dropdowns
  const [dbLocations, setDbLocations] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [locRes, catRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/categories'),
        ]);
        if (locRes.ok) {
          const locs = await locRes.json();
          setDbLocations(locs.map((l: { name: string }) => l.name));
        }
        if (catRes.ok) {
          const cats = await catRes.json();
          setDbCategories(cats.map((c: { name: string }) => c.name));
        }
      } catch {
        // fall back to deriving from data
      }
    })();
  }, []);

  // Fallback: derive from loaded internships if API failed
  const locations = dbLocations.length > 0
    ? dbLocations
    : [...new Set(allInternships.map(i => i.location))];
  const categories = dbCategories.length > 0
    ? dbCategories
    : [...new Set(allInternships.map(i => i.category))];

  const filteredInternships = useMemo(() => {
    let result = [...allInternships];

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
  }, [filters, allInternships]);

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
        <div className="text-center mb-12">
          <div className="inline-block bg-primary text-white border-2 border-black px-4 py-1 rounded-full font-bold text-sm tracking-wide mb-4 shadow-neo-sm">
            OPPORTUNITIES
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Find Your Perfect Match</h1>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">Browse curated internships tailored for aspiring developers.</p>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          locations={locations}
          categories={categories}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20 bg-red-50 border-2 border-dashed border-red-300 rounded-xl mb-12">
            <h3 className="text-xl font-bold text-red-500">Failed to load internships</h3>
            <p className="text-red-400 mt-1">{error}</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filteredInternships.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {paginatedInternships.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredInternships.length === 0 && (
          <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl mb-12">
            <Filter size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500">No internships found</h3>
            <p className="text-gray-400">Try adjusting your filters or check back later for new postings.</p>
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

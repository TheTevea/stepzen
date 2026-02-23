'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowRight, Filter } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { JobStatusBadge } from '@/components/admin/StatusBadge';
import { JobStatus } from '@/types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ARCHIVED', label: 'Archived' },
  { value: 'DRAFT', label: 'Draft' },
];

export default function AdminJobsPage() {
  const { jobs, categories } = useAdmin();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState('');

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map(c => [c.id, c.name])),
    [categories]
  );

  const filtered = useMemo(() => {
    return jobs.filter(job => {
      if (statusFilter && job.status !== statusFilter) return false;
      if (categoryFilter && job.categoryId !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return job.title.toLowerCase().includes(q) || job.companyName.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [jobs, statusFilter, categoryFilter, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Jobs Management</h1>
        <p className="text-gray-500 font-medium text-sm mt-1">Review, approve, reject, or archive job postings.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black rounded-xl p-4 shadow-neo mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <span className="ml-auto text-sm font-bold text-gray-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Jobs table */}
      <div className="bg-white border-2 border-black rounded-xl shadow-neo overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-gray-50">
                <th className="px-4 py-3 text-left font-bold">Title</th>
                <th className="px-4 py-3 text-left font-bold">Company</th>
                <th className="px-4 py-3 text-left font-bold">Category</th>
                <th className="px-4 py-3 text-left font-bold">Status</th>
                <th className="px-4 py-3 text-left font-bold">Posted</th>
                <th className="px-4 py-3 text-left font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filtered.map(job => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold max-w-[200px] truncate">{job.title}</td>
                  <td className="px-4 py-3 text-gray-600">{job.companyName}</td>
                  <td className="px-4 py-3 text-gray-600">{categoryMap[job.categoryId] ?? '—'}</td>
                  <td className="px-4 py-3">
                    <JobStatusBadge status={job.status as JobStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg border-2 border-black text-xs font-bold shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
                    >
                      Review <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 font-medium">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

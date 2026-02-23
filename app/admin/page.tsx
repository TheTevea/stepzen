'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  Users,
  Tag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { JobStatusBadge } from '@/components/admin/StatusBadge';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  href?: string;
}) {
  const content = (
    <div className={`bg-white border-2 border-black rounded-xl p-5 shadow-neo hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-lg border-2 border-black flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        {href && <ArrowRight size={16} className="text-gray-400" />}
      </div>
      <p className="text-3xl font-display font-bold">{value}</p>
      <p className="text-sm font-bold text-gray-500 mt-1">{label}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { jobs, reports, users, categories, auditLogs } = useAdmin();

  const pending = jobs.filter(j => j.status === 'PENDING_REVIEW').length;
  const published = jobs.filter(j => j.status === 'PUBLISHED').length;
  const rejected = jobs.filter(j => j.status === 'REJECTED').length;
  const openReports = reports.filter(r => r.status === 'OPEN').length;
  const activeCategories = categories.filter(c => c.isActive).length;
  const bannedUsers = users.filter(u => u.isBanned).length;

  const recentJobs = [...jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentLogs = auditLogs.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-primary text-white border-2 border-black px-3 py-1 rounded-full font-bold text-xs tracking-widest mb-3 shadow-neo-sm">
          <TrendingUp size={14} />
          ADMIN DASHBOARD
        </div>
        <h1 className="text-3xl font-display font-bold">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1 font-medium">Here&apos;s what&apos;s happening with StepZen today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <StatCard label="Pending Review" value={pending} icon={Clock} color="bg-yellow-400" href="/admin/jobs?status=PENDING_REVIEW" />
        <StatCard label="Published Jobs" value={published} icon={CheckCircle} color="bg-green-500" href="/admin/jobs?status=PUBLISHED" />
        <StatCard label="Rejected Jobs" value={rejected} icon={XCircle} color="bg-red-500" href="/admin/jobs?status=REJECTED" />
        <StatCard label="Open Reports" value={openReports} icon={Flag} color="bg-orange-500" href="/admin/reports" />
        <StatCard label="Total Users" value={users.length} icon={Users} color="bg-blue-500" href="/admin/users" />
        <StatCard label="Active Categories" value={activeCategories} icon={Tag} color="bg-purple-500" href="/admin/categories" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent jobs */}
        <div className="bg-white border-2 border-black rounded-xl shadow-neo overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-2 font-display font-bold text-lg">
              <Briefcase size={18} />
              Recent Job Postings
            </div>
            <Link href="/admin/jobs" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y-2 divide-gray-100">
            {recentJobs.map(job => (
              <Link key={job.id} href={`/admin/jobs/${job.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.companyName}</p>
                </div>
                <JobStatusBadge status={job.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent audit logs */}
        <div className="bg-white border-2 border-black rounded-xl shadow-neo overflow-hidden">
          <div className="px-5 py-4 border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-2 font-display font-bold text-lg">
              <Clock size={18} />
              Recent Activity
            </div>
            <Link href="/admin/audit-logs" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y-2 divide-gray-100">
            {recentLogs.map(log => (
              <div key={log.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm">{log.action.replace(/_/g, ' ')}</p>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {log.targetType} · {log.targetId}
                </p>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">No activity yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(pending > 0 || openReports > 0 || bannedUsers > 0) && (
        <div className="mt-6 space-y-3">
          {pending > 0 && (
            <Link href="/admin/jobs?status=PENDING_REVIEW" className="flex items-center gap-3 bg-yellow-50 border-2 border-yellow-400 rounded-xl px-5 py-3 hover:bg-yellow-100 transition-colors">
              <Clock size={18} className="text-yellow-600 shrink-0" />
              <p className="font-bold text-yellow-800 text-sm">
                {pending} job{pending > 1 ? 's' : ''} waiting for your review
              </p>
              <ArrowRight size={16} className="ml-auto text-yellow-600" />
            </Link>
          )}
          {openReports > 0 && (
            <Link href="/admin/reports" className="flex items-center gap-3 bg-red-50 border-2 border-red-400 rounded-xl px-5 py-3 hover:bg-red-100 transition-colors">
              <Flag size={18} className="text-red-600 shrink-0" />
              <p className="font-bold text-red-800 text-sm">
                {openReports} open report{openReports > 1 ? 's' : ''} require attention
              </p>
              <ArrowRight size={16} className="ml-auto text-red-600" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

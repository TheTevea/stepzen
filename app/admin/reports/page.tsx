'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { ReportStatusBadge } from '@/components/admin/StatusBadge';
import { ReportStatus } from '@/types';

const STATUS_OPTS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'DISMISSED', label: 'Dismissed' },
];

export default function AdminReportsPage() {
  const { reports, jobs, users, updateReportStatus, archiveJob } = useAdmin();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const adminUser = users.find(u => u.email === user?.email);
  const actorId = adminUser?.id ?? 'u-1';

  const [statusFilter, setStatusFilter] = useState('');
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const jobMap = useMemo(() => Object.fromEntries(jobs.map(j => [j.id, j])), [jobs]);
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);

  const filtered = useMemo(() => {
    return reports
      .filter(r => !statusFilter || r.status === statusFilter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [reports, statusFilter]);

  const handleAction = (reportId: string, status: ReportStatus) => {
    const note = noteMap[reportId] || undefined;
    updateReportStatus(reportId, status, actorId, note);
    showAlert(`Report marked as ${status.replace('_', ' ').toLowerCase()}.`, 'success');
  };

  const handleArchiveJob = (jobId: string, reportId: string) => {
    archiveJob(jobId, actorId);
    updateReportStatus(reportId, 'RESOLVED', actorId, 'Job archived after report review.');
    showAlert('Job archived and report resolved.', 'success');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Reports</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Handle user-submitted job reports.</p>
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-black"
        >
          {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map(report => {
          const job = jobMap[report.jobId];
          const reporter = report.reportedById ? userMap[report.reportedById] : null;
          const handler = report.handledById ? userMap[report.handledById] : null;
          const isOpen = report.status === 'OPEN' || report.status === 'IN_REVIEW';

          return (
            <div key={report.id} className="bg-white border-2 border-black rounded-xl shadow-neo p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm bg-orange-100 text-orange-700 border border-orange-300 px-2.5 py-0.5 rounded-full">
                      {report.reason}
                    </span>
                    <ReportStatusBadge status={report.status} />
                  </div>
                  <p className="font-bold">
                    Job: {' '}
                    {job ? (
                      <Link href={`/admin/jobs/${job.id}`} className="text-primary hover:underline inline-flex items-center gap-1">
                        {job.title} <ExternalLink size={12} />
                      </Link>
                    ) : <span className="text-gray-400">Unknown</span>}
                  </p>
                  {report.message && <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{report.message}&rdquo;</p>}
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>Reported by: {reporter?.name ?? 'Anonymous'}</p>
                  <p>{new Date(report.createdAt).toLocaleDateString()}</p>
                  {handler && <p className="mt-1">Handled by: {handler.name}</p>}
                  {report.handledNote && <p className="italic mt-0.5">{report.handledNote}</p>}
                </div>
              </div>

              {isOpen && (
                <div className="border-t-2 border-gray-100 pt-4 mt-3">
                  <textarea
                    value={noteMap[report.id] || ''}
                    onChange={e => setNoteMap(prev => ({ ...prev, [report.id]: e.target.value }))}
                    placeholder="Optional note..."
                    rows={2}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-black resize-none mb-3"
                  />
                  <div className="flex flex-wrap gap-2">
                    {report.status === 'OPEN' && (
                      <button
                        onClick={() => handleAction(report.id, 'IN_REVIEW')}
                        className="px-3 py-1.5 bg-yellow-400 border-2 border-black rounded-lg font-bold text-xs shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
                      >
                        Mark In Review
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(report.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-green-500 text-white border-2 border-black rounded-lg font-bold text-xs shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'DISMISSED')}
                      className="px-3 py-1.5 bg-gray-200 border-2 border-black rounded-lg font-bold text-xs shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
                    >
                      Dismiss
                    </button>
                    {job && job.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => handleArchiveJob(job.id, report.id)}
                        className="px-3 py-1.5 bg-red-500 text-white border-2 border-black rounded-lg font-bold text-xs shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
                      >
                        Archive Job &amp; Resolve
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white border-2 border-black rounded-xl p-10 text-center text-gray-400 shadow-neo">
            No reports found.
          </div>
        )}
      </div>
    </div>
  );
}

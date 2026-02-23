'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Archive, ExternalLink, AlertTriangle } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { JobStatusBadge } from '@/components/admin/StatusBadge';

export default function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const { jobs, categories, users, approveJob, rejectJob, archiveJob } = useAdmin();

  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const job = jobs.find(j => j.id === id);
  const category = categories.find(c => c.id === job?.categoryId);
  const postedBy = users.find(u => u.id === job?.createdById);
  const reviewedBy = users.find(u => u.id === job?.reviewedById);

  // Get the admin's user ID — use the admin user entry from the users list
  const adminUser = users.find(u => u.email === user?.email);
  const actorId = adminUser?.id ?? 'u-1';

  if (!job) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-gray-500">Job not found.</p>
        <Link href="/admin/jobs" className="text-primary font-bold mt-4 inline-block">← Back to jobs</Link>
      </div>
    );
  }

  const handleApprove = () => {
    approveJob(job.id, actorId);
    showAlert('Job approved and published.', 'success');
    router.push('/admin/jobs');
  };

  const handleReject = () => {
    if (!rejectNote.trim()) {
      showAlert('Please provide a rejection reason.', 'error');
      return;
    }
    rejectJob(job.id, actorId, rejectNote);
    showAlert('Job rejected.', 'info');
    router.push('/admin/jobs');
  };

  const handleArchive = () => {
    archiveJob(job.id, actorId);
    showAlert('Job archived.', 'info');
    router.push('/admin/jobs');
  };

  const canApprove = job.status === 'PENDING_REVIEW' || job.status === 'DRAFT';
  const canReject = job.status === 'PENDING_REVIEW' || job.status === 'PUBLISHED';
  const canArchive = job.status === 'PUBLISHED' || job.status === 'PENDING_REVIEW';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Link href="/admin/jobs" className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-black mb-6">
        <ArrowLeft size={16} /> Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main card */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border-2 border-black rounded-xl p-6 shadow-neo">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="text-2xl font-display font-bold">{job.title}</h1>
                <p className="text-gray-500 font-bold mt-1">{job.companyName}</p>
              </div>
              <JobStatusBadge status={job.status} />
            </div>

            <div className="flex flex-wrap gap-3 text-sm font-medium text-gray-600 mb-5">
              {job.location && <span className="bg-gray-100 px-2.5 py-1 rounded-full border border-gray-300">{job.location}</span>}
              {job.jobType && <span className="bg-gray-100 px-2.5 py-1 rounded-full border border-gray-300">{job.jobType}</span>}
              {category && <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-300">{category.name}</span>}
            </div>

            <div className="prose prose-sm max-w-none">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>

            <div className="mt-5 pt-4 border-t-2 border-gray-100">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-2">Telegram Contact</h3>
              <a
                href={job.telegramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border-2 border-blue-300 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors"
              >
                <ExternalLink size={14} />
                {job.telegramLink}
              </a>
            </div>
          </div>

          {/* Reject form */}
          {showRejectForm && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-red-600" />
                <h3 className="font-bold text-red-800">Reject this job</h3>
              </div>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="Provide a reason for rejection (required)..."
                rows={3}
                className="w-full border-2 border-red-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-red-500 resize-none"
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-500 text-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Moderation actions */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-neo">
            <h3 className="font-display font-bold mb-4">Moderation Actions</h3>
            <div className="space-y-3">
              {canApprove && (
                <button
                  onClick={handleApprove}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
                >
                  <CheckCircle size={16} /> Approve & Publish
                </button>
              )}
              {canReject && !showRejectForm && (
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
                >
                  <XCircle size={16} /> Reject
                </button>
              )}
              {canArchive && (
                <button
                  onClick={handleArchive}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-800 border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
                >
                  <Archive size={16} /> Archive
                </button>
              )}
              {!canApprove && !canReject && !canArchive && (
                <p className="text-sm text-gray-400 text-center py-2">No actions available for this status.</p>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="bg-white border-2 border-black rounded-xl p-5 shadow-neo text-sm">
            <h3 className="font-display font-bold mb-4">Job Info</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Posted by</dt>
                <dd className="font-bold mt-0.5">{postedBy?.name ?? '—'}</dd>
                <dd className="text-gray-500 text-xs">{postedBy?.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Created</dt>
                <dd className="font-bold">{new Date(job.createdAt).toLocaleDateString()}</dd>
              </div>
              {job.publishedAt && (
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Published</dt>
                  <dd className="font-bold">{new Date(job.publishedAt).toLocaleDateString()}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Views</dt>
                <dd className="font-bold">{job.viewCount}</dd>
              </div>
              {job.reviewNote && (
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Review Note</dt>
                  <dd className="text-gray-700 mt-0.5 bg-gray-50 p-2 rounded-lg border border-gray-200">{job.reviewNote}</dd>
                  {reviewedBy && <dd className="text-xs text-gray-400 mt-1">by {reviewedBy.name}</dd>}
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

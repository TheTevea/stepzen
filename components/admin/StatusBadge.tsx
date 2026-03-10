import React from 'react';
import { JobStatus, ReportStatus } from '@/types';

const JOB_STATUS_STYLES: Record<JobStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-400',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-500',
  PUBLISHED: 'bg-green-100 text-green-800 border-green-500',
  REJECTED: 'bg-red-100 text-red-800 border-red-500',
  ARCHIVED: 'bg-slate-100 text-slate-700 border-slate-400',
};

const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending Review',
  PUBLISHED: 'Published',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
};

const REPORT_STATUS_STYLES: Record<ReportStatus, string> = {
  OPEN: 'bg-red-100 text-red-800 border-red-500',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-500',
  RESOLVED: 'bg-green-100 text-green-800 border-green-500',
  DISMISSED: 'bg-gray-100 text-gray-600 border-gray-400',
};

export const JobStatusBadge: React.FC<{ status: JobStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${JOB_STATUS_STYLES[status]}`}>
    {JOB_STATUS_LABELS[status]}
  </span>
);

export const ReportStatusBadge: React.FC<{ status: ReportStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${REPORT_STATUS_STYLES[status]}`}>
    {status.replace('_', ' ')}
  </span>
);

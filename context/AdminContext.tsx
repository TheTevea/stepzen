'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminUser,
  AdminJob,
  Category,
  JobReport,
  AuditLog,
  JobStatus,
  ReportStatus,
  UserRole,
} from '@/types';

// ─── Seed / default data ──────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Frontend', slug: 'frontend', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-2', name: 'Backend', slug: 'backend', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-3', name: 'Fullstack', slug: 'fullstack', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-4', name: 'Design', slug: 'design', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-5', name: 'Mobile', slug: 'mobile', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat-6', name: 'Data', slug: 'data', isActive: true, createdAt: '2024-01-01T00:00:00Z' },
];

const DEFAULT_USERS: AdminUser[] = [
  { id: 'u-1', email: 'admin@stepzen.com', name: 'Admin', role: 'ADMIN', isBanned: false, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'u-2', email: 'employer@acme.com', name: 'Acme Recruiter', role: 'EMPLOYER', isBanned: false, createdAt: '2024-02-10T00:00:00Z' },
  { id: 'u-3', email: 'dev@example.com', name: 'Dev User', role: 'SEEKER', isBanned: false, createdAt: '2024-03-05T00:00:00Z' },
  { id: 'u-4', email: 'spam@bad.com', name: 'Spammer', role: 'EMPLOYER', isBanned: true, banReason: 'Posted spam jobs', createdAt: '2024-03-20T00:00:00Z' },
];

const DEFAULT_JOBS: AdminJob[] = [
  {
    id: 'j-1', title: 'Frontend React Engineer', description: 'Build beautiful UIs using React and Tailwind CSS.',
    companyName: 'PixelPerfect', location: 'San Francisco, CA', jobType: 'Remote',
    telegramLink: 'https://t.me/+xYrIev4OEHk2MTY1', categoryId: 'cat-1', createdById: 'u-2',
    status: 'PUBLISHED', publishedAt: '2024-03-01T00:00:00Z', viewCount: 142,
    createdAt: '2024-02-28T00:00:00Z', updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'j-2', title: 'Backend Node.js Intern', description: 'Dive deep into scalable APIs and microservices.',
    companyName: 'ServerSide Solutions', location: 'New York, NY', jobType: 'Hybrid',
    telegramLink: 'https://t.me/+xYrIev4OEHk2MTY1', categoryId: 'cat-2', createdById: 'u-2',
    status: 'PENDING_REVIEW', viewCount: 0,
    createdAt: '2024-03-10T00:00:00Z', updatedAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'j-3', title: 'UI/UX Designer', description: 'Create user-centered designs for web products.',
    companyName: 'DesignHub', location: 'Remote', jobType: 'Remote',
    telegramLink: 'https://t.me/+xYrIev4OEHk2MTY1', categoryId: 'cat-4', createdById: 'u-2',
    status: 'PENDING_REVIEW', viewCount: 0,
    createdAt: '2024-03-12T00:00:00Z', updatedAt: '2024-03-12T00:00:00Z',
  },
  {
    id: 'j-4', title: 'Data Science Intern', description: 'Work on ML models and data pipelines.',
    companyName: 'DataMind', location: 'Boston, MA', jobType: 'Onsite',
    telegramLink: 'https://t.me/+xYrIev4OEHk2MTY1', categoryId: 'cat-6', createdById: 'u-2',
    status: 'REJECTED', reviewNote: 'Missing valid Telegram link format.', reviewedById: 'u-1',
    viewCount: 0, createdAt: '2024-03-08T00:00:00Z', updatedAt: '2024-03-09T00:00:00Z',
  },
  {
    id: 'j-5', title: 'Mobile Flutter Developer', description: 'Build cross-platform apps using Flutter.',
    companyName: 'AppFactory', location: 'Remote', jobType: 'Remote',
    telegramLink: 'https://t.me/+xYrIev4OEHk2MTY1', categoryId: 'cat-5', createdById: 'u-2',
    status: 'ARCHIVED', viewCount: 55,
    createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-28T00:00:00Z',
  },
];

const DEFAULT_REPORTS: JobReport[] = [
  {
    id: 'r-1', jobId: 'j-1', reportedById: 'u-3', reason: 'SPAM',
    message: 'This looks like a duplicate posting.', status: 'OPEN',
    createdAt: '2024-03-15T00:00:00Z', updatedAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'r-2', jobId: 'j-4', reportedById: 'u-3', reason: 'SCAM',
    message: 'Company does not exist.', status: 'IN_REVIEW', handledById: 'u-1',
    createdAt: '2024-03-09T00:00:00Z', updatedAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'r-3', jobId: 'j-5', reportedById: 'u-3', reason: 'INAPPROPRIATE',
    message: 'Content violates terms.', status: 'RESOLVED', handledById: 'u-1',
    handledNote: 'Job archived after review.', createdAt: '2024-02-25T00:00:00Z', updatedAt: '2024-02-28T00:00:00Z',
  },
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  { id: 'al-1', actorId: 'u-1', action: 'JOB_APPROVED', targetType: 'Job', targetId: 'j-1', createdAt: '2024-03-01T00:00:00Z' },
  { id: 'al-2', actorId: 'u-1', action: 'JOB_REJECTED', targetType: 'Job', targetId: 'j-4', metadata: { reason: 'Missing valid Telegram link format.' }, createdAt: '2024-03-09T00:00:00Z' },
  { id: 'al-3', actorId: 'u-1', action: 'JOB_ARCHIVED', targetType: 'Job', targetId: 'j-5', createdAt: '2024-02-28T00:00:00Z' },
  { id: 'al-4', actorId: 'u-1', action: 'USER_BANNED', targetType: 'User', targetId: 'u-4', metadata: { reason: 'Posted spam jobs' }, createdAt: '2024-03-20T00:00:00Z' },
];

// ─── Context type ─────────────────────────────────────────────────────────────

interface AdminContextType {
  users: AdminUser[];
  jobs: AdminJob[];
  categories: Category[];
  reports: JobReport[];
  auditLogs: AuditLog[];

  // Jobs
  approveJob: (jobId: string, actorId: string) => void;
  rejectJob: (jobId: string, actorId: string, note: string) => void;
  archiveJob: (jobId: string, actorId: string) => void;
  updateJobStatus: (jobId: string, status: JobStatus, actorId: string, note?: string) => void;

  // Categories
  addCategory: (name: string, slug: string) => void;
  toggleCategory: (categoryId: string, actorId: string) => void;
  renameCategory: (categoryId: string, name: string, slug: string, actorId: string) => void;

  // Reports
  updateReportStatus: (reportId: string, status: ReportStatus, actorId: string, note?: string) => void;

  // Users
  banUser: (userId: string, reason: string, actorId: string) => void;
  unbanUser: (userId: string, actorId: string) => void;
  updateUserRole: (userId: string, role: UserRole, actorId: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AdminContext = createContext<AdminContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, defaults: T): T {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaults;
  } catch {
    return defaults;
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<JobReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setUsers(loadFromStorage('sz_admin_users', DEFAULT_USERS));
    setJobs(loadFromStorage('sz_admin_jobs', DEFAULT_JOBS));
    setCategories(loadFromStorage('sz_admin_categories', DEFAULT_CATEGORIES));
    setReports(loadFromStorage('sz_admin_reports', DEFAULT_REPORTS));
    setAuditLogs(loadFromStorage('sz_admin_audit_logs', DEFAULT_AUDIT_LOGS));
  }, []);

  const addLog = useCallback((log: Omit<AuditLog, 'id' | 'createdAt'>) => {
    const newLog: AuditLog = { ...log, id: `al-${Date.now()}`, createdAt: new Date().toISOString() };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      saveToStorage('sz_admin_audit_logs', updated);
      return updated;
    });
  }, []);

  // ── Jobs ────────────────────────────────────────────────────────────────────

  const approveJob = useCallback((jobId: string, actorId: string) => {
    setJobs(prev => {
      const updated = prev.map(j =>
        j.id === jobId ? { ...j, status: 'PUBLISHED' as JobStatus, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : j
      );
      saveToStorage('sz_admin_jobs', updated);
      return updated;
    });
    addLog({ actorId, action: 'JOB_APPROVED', targetType: 'Job', targetId: jobId });
  }, [addLog]);

  const rejectJob = useCallback((jobId: string, actorId: string, note: string) => {
    setJobs(prev => {
      const updated = prev.map(j =>
        j.id === jobId ? { ...j, status: 'REJECTED' as JobStatus, reviewNote: note, reviewedById: actorId, updatedAt: new Date().toISOString() } : j
      );
      saveToStorage('sz_admin_jobs', updated);
      return updated;
    });
    addLog({ actorId, action: 'JOB_REJECTED', targetType: 'Job', targetId: jobId, metadata: { reason: note } });
  }, [addLog]);

  const archiveJob = useCallback((jobId: string, actorId: string) => {
    setJobs(prev => {
      const updated = prev.map(j =>
        j.id === jobId ? { ...j, status: 'ARCHIVED' as JobStatus, updatedAt: new Date().toISOString() } : j
      );
      saveToStorage('sz_admin_jobs', updated);
      return updated;
    });
    addLog({ actorId, action: 'JOB_ARCHIVED', targetType: 'Job', targetId: jobId });
  }, [addLog]);

  const updateJobStatus = useCallback((jobId: string, status: JobStatus, actorId: string, note?: string) => {
    setJobs(prev => {
      const updated = prev.map(j =>
        j.id === jobId ? { ...j, status, reviewNote: note, reviewedById: actorId, updatedAt: new Date().toISOString() } : j
      );
      saveToStorage('sz_admin_jobs', updated);
      return updated;
    });
    addLog({ actorId, action: `JOB_STATUS_CHANGED_${status}`, targetType: 'Job', targetId: jobId });
  }, [addLog]);

  // ── Categories ──────────────────────────────────────────────────────────────

  const addCategory = useCallback((name: string, slug: string) => {
    const newCat: Category = { id: `cat-${Date.now()}`, name, slug, isActive: true, createdAt: new Date().toISOString() };
    setCategories(prev => {
      const updated = [...prev, newCat];
      saveToStorage('sz_admin_categories', updated);
      return updated;
    });
  }, []);

  const toggleCategory = useCallback((categoryId: string, actorId: string) => {
    setCategories(prev => {
      const updated = prev.map(c =>
        c.id === categoryId ? { ...c, isActive: !c.isActive } : c
      );
      saveToStorage('sz_admin_categories', updated);
      return updated;
    });
    addLog({ actorId, action: 'CATEGORY_TOGGLED', targetType: 'Category', targetId: categoryId });
  }, [addLog]);

  const renameCategory = useCallback((categoryId: string, name: string, slug: string, actorId: string) => {
    setCategories(prev => {
      const updated = prev.map(c =>
        c.id === categoryId ? { ...c, name, slug } : c
      );
      saveToStorage('sz_admin_categories', updated);
      return updated;
    });
    addLog({ actorId, action: 'CATEGORY_RENAMED', targetType: 'Category', targetId: categoryId, metadata: { name, slug } });
  }, [addLog]);

  // ── Reports ─────────────────────────────────────────────────────────────────

  const updateReportStatus = useCallback((reportId: string, status: ReportStatus, actorId: string, note?: string) => {
    setReports(prev => {
      const updated = prev.map(r =>
        r.id === reportId ? { ...r, status, handledById: actorId, handledNote: note, updatedAt: new Date().toISOString() } : r
      );
      saveToStorage('sz_admin_reports', updated);
      return updated;
    });
    addLog({ actorId, action: `REPORT_${status}`, targetType: 'Report', targetId: reportId });
  }, [addLog]);

  // ── Users ───────────────────────────────────────────────────────────────────

  const banUser = useCallback((userId: string, reason: string, actorId: string) => {
    setUsers(prev => {
      const updated = prev.map(u =>
        u.id === userId ? { ...u, isBanned: true, banReason: reason } : u
      );
      saveToStorage('sz_admin_users', updated);
      return updated;
    });
    addLog({ actorId, action: 'USER_BANNED', targetType: 'User', targetId: userId, metadata: { reason } });
  }, [addLog]);

  const unbanUser = useCallback((userId: string, actorId: string) => {
    setUsers(prev => {
      const updated = prev.map(u =>
        u.id === userId ? { ...u, isBanned: false, banReason: undefined } : u
      );
      saveToStorage('sz_admin_users', updated);
      return updated;
    });
    addLog({ actorId, action: 'USER_UNBANNED', targetType: 'User', targetId: userId });
  }, [addLog]);

  const updateUserRole = useCallback((userId: string, role: UserRole, actorId: string) => {
    setUsers(prev => {
      const updated = prev.map(u =>
        u.id === userId ? { ...u, role } : u
      );
      saveToStorage('sz_admin_users', updated);
      return updated;
    });
    addLog({ actorId, action: 'USER_ROLE_CHANGED', targetType: 'User', targetId: userId, metadata: { role } });
  }, [addLog]);

  return (
    <AdminContext.Provider value={{
      users, jobs, categories, reports, auditLogs,
      approveJob, rejectJob, archiveJob, updateJobStatus,
      addCategory, toggleCategory, renameCategory,
      updateReportStatus,
      banUser, unbanUser, updateUserRole,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

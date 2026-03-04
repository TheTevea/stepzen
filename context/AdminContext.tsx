'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  AdminUser,
  AdminJob,
  Category,
  JobReport,
  AuditLogEntry,
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




// ─── Context type ─────────────────────────────────────────────────────────────

interface AdminUserWithJobCount extends AdminUser {
  jobCount: number;
}

interface AdminContextType {
  users: AdminUserWithJobCount[];
  usersLoading: boolean;
  usersError: string | null;
  refreshUsers: () => Promise<void>;
  jobs: AdminJob[];
  categories: Category[];
  reports: JobReport[];
  auditLogs: AuditLogEntry[];
  auditLogsLoading: boolean;
  refreshAuditLogs: () => Promise<void>;

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
  banUser: (userId: string, reason: string, actorId: string) => Promise<void>;
  unbanUser: (userId: string, actorId: string) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole, actorId: string) => Promise<void>;
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

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AdminUserWithJobCount[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<JobReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setAuditLogsLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setAuditLogs(data.logs);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setAuditLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
    setJobs(loadFromStorage('sz_admin_jobs', DEFAULT_JOBS));
    setReports(loadFromStorage('sz_admin_reports', DEFAULT_REPORTS));

    // Fetch categories from API (database), fallback to localStorage
    fetch('/api/categories')
      .then(res => res.ok ? res.json() : Promise.reject('API error'))
      .then((data: Category[]) => {
        setCategories(data);
        saveToStorage('sz_admin_categories', data);
      })
      .catch(() => {
        setCategories(loadFromStorage('sz_admin_categories', DEFAULT_CATEGORIES));
      });
  }, [fetchUsers, fetchAuditLogs]);

  const addLog = useCallback(async (log: { action: string; targetType: string; targetId: string; metadata?: Record<string, unknown> }) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(log),
      });
      if (!res.ok) throw new Error('Failed to create audit log');
      const data = await res.json();
      setAuditLogs(prev => [data.log, ...prev]);
    } catch (err) {
      console.error('Failed to create audit log:', err);
    }
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
    addLog({ action: 'JOB_APPROVED', targetType: 'Job', targetId: jobId });
  }, [addLog]);

  const rejectJob = useCallback((jobId: string, actorId: string, note: string) => {
    setJobs(prev => {
      const updated = prev.map(j =>
        j.id === jobId ? { ...j, status: 'REJECTED' as JobStatus, reviewNote: note, reviewedById: actorId, updatedAt: new Date().toISOString() } : j
      );
      saveToStorage('sz_admin_jobs', updated);
      return updated;
    });
    addLog({ action: 'JOB_REJECTED', targetType: 'Job', targetId: jobId, metadata: { reason: note } });
  }, [addLog]);

  const archiveJob = useCallback((jobId: string, actorId: string) => {
    setJobs(prev => {
      const updated = prev.map(j =>
        j.id === jobId ? { ...j, status: 'ARCHIVED' as JobStatus, updatedAt: new Date().toISOString() } : j
      );
      saveToStorage('sz_admin_jobs', updated);
      return updated;
    });
    addLog({ action: 'JOB_ARCHIVED', targetType: 'Job', targetId: jobId });
  }, [addLog]);

  const updateJobStatus = useCallback((jobId: string, status: JobStatus, actorId: string, note?: string) => {
    setJobs(prev => {
      const updated = prev.map(j =>
        j.id === jobId ? { ...j, status, reviewNote: note, reviewedById: actorId, updatedAt: new Date().toISOString() } : j
      );
      saveToStorage('sz_admin_jobs', updated);
      return updated;
    });
    addLog({ action: `JOB_STATUS_CHANGED_${status}`, targetType: 'Job', targetId: jobId });
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
    addLog({ action: 'CATEGORY_TOGGLED', targetType: 'Category', targetId: categoryId });
  }, [addLog]);

  const renameCategory = useCallback((categoryId: string, name: string, slug: string, actorId: string) => {
    setCategories(prev => {
      const updated = prev.map(c =>
        c.id === categoryId ? { ...c, name, slug } : c
      );
      saveToStorage('sz_admin_categories', updated);
      return updated;
    });
    addLog({ action: 'CATEGORY_RENAMED', targetType: 'Category', targetId: categoryId, metadata: { name, slug } });
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
    addLog({ action: `REPORT_${status}`, targetType: 'Report', targetId: reportId });
  }, [addLog]);

  // ── Users ───────────────────────────────────────────────────────────────────

  const banUser = useCallback(async (userId: string, reason: string, actorId: string) => {
    const token = await getAuthToken();
    if (!token) return;
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'ban', reason }),
    });
    if (!res.ok) throw new Error('Failed to ban user');
    const { user } = await res.json();
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...user } : u));
    // Audit log already recorded server-side; refresh the list
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const unbanUser = useCallback(async (userId: string, actorId: string) => {
    const token = await getAuthToken();
    if (!token) return;
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'unban' }),
    });
    if (!res.ok) throw new Error('Failed to unban user');
    const { user } = await res.json();
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...user } : u));
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const updateUserRole = useCallback(async (userId: string, role: UserRole, actorId: string) => {
    const token = await getAuthToken();
    if (!token) return;
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'updateRole', role }),
    });
    if (!res.ok) throw new Error('Failed to update role');
    const { user } = await res.json();
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...user } : u));
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return (
    <AdminContext.Provider value={{
      users, usersLoading, usersError, refreshUsers: fetchUsers,
      jobs, categories, reports, auditLogs, auditLogsLoading, refreshAuditLogs: fetchAuditLogs,
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

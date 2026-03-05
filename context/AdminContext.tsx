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
  jobsLoading: boolean;
  jobsError: string | null;
  refreshJobs: () => Promise<void>;
  categories: Category[];
  reports: JobReport[];
  reportsLoading: boolean;
  refreshReports: () => Promise<void>;
  auditLogs: AuditLogEntry[];
  auditLogsLoading: boolean;
  refreshAuditLogs: () => Promise<void>;

  // Jobs
  approveJob: (jobId: string) => Promise<void>;
  rejectJob: (jobId: string, note: string) => Promise<void>;
  archiveJob: (jobId: string) => Promise<void>;

  // Categories
  addCategory: (name: string, slug: string) => void;
  toggleCategory: (categoryId: string, actorId: string) => void;
  renameCategory: (categoryId: string, name: string, slug: string, actorId: string) => void;

  // Reports
  updateReportStatus: (reportId: string, status: ReportStatus, actorId: string, note?: string) => Promise<void>;

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
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<JobReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
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

  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/admin/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data.jobs);
    } catch (err) {
      setJobsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await fetch('/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data.reports);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchJobs();
    fetchAuditLogs();
    fetchReports();

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
  }, [fetchUsers, fetchJobs, fetchAuditLogs, fetchReports]);

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

  const approveJob = useCallback(async (jobId: string) => {
    const token = await getAuthToken();
    if (!token) return;
    const res = await fetch(`/api/admin/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'approve' }),
    });
    if (!res.ok) throw new Error('Failed to approve job');
    await fetchJobs();
    fetchAuditLogs();
  }, [fetchJobs, fetchAuditLogs]);

  const rejectJob = useCallback(async (jobId: string, note: string) => {
    const token = await getAuthToken();
    if (!token) return;
    const res = await fetch(`/api/admin/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'reject', note }),
    });
    if (!res.ok) throw new Error('Failed to reject job');
    await fetchJobs();
    fetchAuditLogs();
  }, [fetchJobs, fetchAuditLogs]);

  const archiveJob = useCallback(async (jobId: string) => {
    const token = await getAuthToken();
    if (!token) return;
    const res = await fetch(`/api/admin/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'archive' }),
    });
    if (!res.ok) throw new Error('Failed to archive job');
    await fetchJobs();
    fetchAuditLogs();
  }, [fetchJobs, fetchAuditLogs]);

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

  const updateReportStatus = useCallback(async (reportId: string, status: ReportStatus, _actorId: string, note?: string) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, note }),
      });
      if (!res.ok) throw new Error('Failed to update report');
      await fetchReports();
      fetchAuditLogs();
    } catch (err) {
      console.error('Failed to update report status:', err);
    }
  }, [fetchReports, fetchAuditLogs]);

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
      jobs, jobsLoading, jobsError, refreshJobs: fetchJobs,
      categories, reports, reportsLoading, refreshReports: fetchReports,
      auditLogs, auditLogsLoading, refreshAuditLogs: fetchAuditLogs,
      approveJob, rejectJob, archiveJob,
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

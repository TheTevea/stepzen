'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminAuditLogsPage() {
  const { auditLogs, users } = useAdmin();
  const [search, setSearch] = useState('');

  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);

  const filtered = useMemo(() => {
    if (!search.trim()) return auditLogs;
    const q = search.toLowerCase();
    return auditLogs.filter(
      log =>
        log.action.toLowerCase().includes(q) ||
        log.targetType.toLowerCase().includes(q) ||
        log.targetId.toLowerCase().includes(q)
    );
  }, [auditLogs, search]);

  const ACTION_COLOR: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    BANNED: 'bg-red-100 text-red-800',
    ARCHIVED: 'bg-slate-100 text-slate-700',
    DISMISSED: 'bg-slate-100 text-slate-700',
    RESOLVED: 'bg-blue-100 text-blue-800',
    RENAMED: 'bg-yellow-100 text-yellow-800',
    TOGGLED: 'bg-orange-100 text-orange-800',
    UNBANNED: 'bg-green-100 text-green-800',
  };

  const getActionColor = (action: string) => {
    for (const [keyword, cls] of Object.entries(ACTION_COLOR)) {
      if (action.includes(keyword)) return cls;
    }
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">Audit Logs</h1>
        <p className="text-gray-500 font-medium text-sm mt-1">All admin actions are recorded here for accountability.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by action, target..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-black transition-colors bg-white shadow-neo-sm"
        />
      </div>

      <div className="bg-white border-2 border-black rounded-xl shadow-neo overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-gray-50">
                <th className="px-4 py-3 text-left font-bold">Action</th>
                <th className="px-4 py-3 text-left font-bold">Target</th>
                <th className="px-4 py-3 text-left font-bold">Actor</th>
                <th className="px-4 py-3 text-left font-bold">Details</th>
                <th className="px-4 py-3 text-left font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filtered.map(log => {
                const actor = userMap[log.actorId];
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-current/30 ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-xs">{log.targetType}</p>
                      <p className="text-gray-400 text-xs font-mono">{log.targetId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold">{actor?.name ?? '—'}</p>
                      <p className="text-gray-400 text-xs">{actor?.email}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      {log.metadata ? (
                        <p className="text-xs text-gray-500 truncate" title={JSON.stringify(log.metadata)}>
                          {Object.entries(log.metadata)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </p>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 font-medium">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

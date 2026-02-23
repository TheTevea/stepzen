'use client';

import React, { useState, useMemo } from 'react';
import { Search, ShieldBan, ShieldCheck } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { UserRole } from '@/types';

const ROLE_STYLES: Record<UserRole, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-400',
  EMPLOYER: 'bg-blue-100 text-blue-800 border-blue-400',
  SEEKER: 'bg-gray-100 text-gray-700 border-gray-400',
};

export default function AdminUsersPage() {
  const { users, jobs, banUser, unbanUser, updateUserRole } = useAdmin();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const adminUser = users.find(u => u.email === user?.email);
  const actorId = adminUser?.id ?? 'u-1';

  const [search, setSearch] = useState('');
  const [banModal, setBanModal] = useState<{ userId: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const jobCountByUser = useMemo(() => {
    const map: Record<string, number> = {};
    jobs.forEach(j => { map[j.createdById] = (map[j.createdById] ?? 0) + 1; });
    return map;
  }, [jobs]);

  const handleBan = () => {
    if (!banModal || !banReason.trim()) return;
    banUser(banModal.userId, banReason, actorId);
    showAlert(`${banModal.name} has been banned.`, 'info');
    setBanModal(null);
    setBanReason('');
  };

  const handleUnban = (userId: string, name: string) => {
    unbanUser(userId, actorId);
    showAlert(`${name} has been unbanned.`, 'success');
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    if (userId === actorId) { showAlert("You can't change your own role.", 'error'); return; }
    updateUserRole(userId, role, actorId);
    showAlert('User role updated.', 'success');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold">User Management</h1>
        <p className="text-gray-500 font-medium text-sm mt-1">Search, manage roles, and ban/unban users.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-black transition-colors bg-white shadow-neo-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-black rounded-xl shadow-neo overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-gray-50">
                <th className="px-4 py-3 text-left font-bold">User</th>
                <th className="px-4 py-3 text-left font-bold">Role</th>
                <th className="px-4 py-3 text-left font-bold">Jobs Posted</th>
                <th className="px-4 py-3 text-left font-bold">Joined</th>
                <th className="px-4 py-3 text-left font-bold">Status</th>
                <th className="px-4 py-3 text-left font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filtered.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.isBanned ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-bold">{u.name}</p>
                    <p className="text-gray-500 text-xs">{u.email}</p>
                    {u.isBanned && u.banReason && (
                      <p className="text-red-500 text-xs mt-0.5 italic">{u.banReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.id === actorId ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${ROLE_STYLES[u.role]}`}>
                        {u.role}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                        className={`text-xs font-bold px-2 py-1 border-2 rounded-lg focus:outline-none focus:border-black cursor-pointer ${ROLE_STYLES[u.role]}`}
                      >
                        <option value="SEEKER">SEEKER</option>
                        <option value="EMPLOYER">EMPLOYER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-medium">{jobCountByUser[u.id] ?? 0}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-300 px-2 py-0.5 rounded-full">Banned</span>
                    ) : (
                      <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-300 px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== actorId && (
                      u.isBanned ? (
                        <button
                          onClick={() => handleUnban(u.id, u.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white border-2 border-black rounded-lg font-bold text-xs shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
                        >
                          <ShieldCheck size={12} /> Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => setBanModal({ userId: u.id, name: u.name })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white border-2 border-black rounded-lg font-bold text-xs shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
                        >
                          <ShieldBan size={12} /> Ban
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 font-medium">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full">
            <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
              <ShieldBan size={20} className="text-red-500" />
              Ban {banModal.name}?
            </h3>
            <p className="text-sm text-gray-600 mb-4">This will prevent them from accessing the platform. Provide a reason:</p>
            <textarea
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              placeholder="Reason for ban..."
              rows={3}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleBan}
                disabled={!banReason.trim()}
                className="flex-1 py-2 bg-red-500 text-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Ban
              </button>
              <button
                onClick={() => { setBanModal(null); setBanReason(''); }}
                className="flex-1 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

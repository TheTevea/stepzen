'use client';

import React, { useState, useMemo } from 'react';
import { Search, ShieldBan, ShieldCheck, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
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
  const { users, usersLoading, usersError, refreshUsers, banUser, unbanUser, updateUserRole } = useAdmin();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const currentAdmin = users.find(u => u.email === user?.email);
  const actorId = currentAdmin?.id ?? '';

  const [search, setSearch] = useState('');
  const [banModal, setBanModal] = useState<{ userId: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const handleBan = async () => {
    if (!banModal || !banReason.trim()) return;
    setActionLoading(banModal.userId);
    try {
      await banUser(banModal.userId, banReason, actorId);
      showAlert(`${banModal.name} has been banned.`, 'info');
    } catch {
      showAlert('Failed to ban user.', 'error');
    } finally {
      setActionLoading(null);
      setBanModal(null);
      setBanReason('');
    }
  };

  const handleUnban = async (userId: string, name: string) => {
    setActionLoading(userId);
    try {
      await unbanUser(userId, actorId);
      showAlert(`${name} has been unbanned.`, 'success');
    } catch {
      showAlert('Failed to unban user.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    if (userId === actorId) { showAlert("You can't change your own role.", 'error'); return; }
    setActionLoading(userId);
    try {
      await updateUserRole(userId, role, actorId);
      showAlert('User role updated.', 'success');
    } catch {
      showAlert('Failed to update role.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">User Management</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Search, manage roles, and ban/unban users.</p>
        </div>
        <button
          onClick={refreshUsers}
          disabled={usersLoading}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={usersLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
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

      {/* Loading state */}
      {usersLoading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={32} className="animate-spin mb-3" />
          <p className="font-medium text-sm">Loading users...</p>
        </div>
      )}

      {/* Error state */}
      {usersError && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <AlertTriangle size={32} className="mb-3" />
          <p className="font-bold text-sm mb-2">Failed to load users</p>
          <p className="text-gray-500 text-xs mb-4">{usersError}</p>
          <button
            onClick={refreshUsers}
            className="px-4 py-2 bg-primary text-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {(!usersLoading || users.length > 0) && !usersError && (
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
                          disabled={actionLoading === u.id}
                          className={`text-xs font-bold px-2 py-1 border-2 rounded-lg focus:outline-none focus:border-black cursor-pointer disabled:opacity-50 ${ROLE_STYLES[u.role]}`}
                        >
                          <option value="SEEKER">SEEKER</option>
                          <option value="EMPLOYER">EMPLOYER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{u.jobCount ?? 0}</td>
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
                        actionLoading === u.id ? (
                          <Loader2 size={16} className="animate-spin text-gray-400" />
                        ) : u.isBanned ? (
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
                {filtered.length === 0 && !usersLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400 font-medium">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                disabled={!banReason.trim() || actionLoading === banModal.userId}
                className="flex-1 py-2 bg-red-500 text-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === banModal.userId ? 'Banning...' : 'Confirm Ban'}
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

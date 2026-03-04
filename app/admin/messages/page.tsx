'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Trash2,
  Loader2,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Mail,
  Clock,
  Reply,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAlert } from '@/context/AlertContext';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  replied: boolean;
  repliedAt: string | null;
  replyMessage: string | null;
  createdAt: string;
}

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function AdminMessagesPage() {
  const { showAlert } = useAlert();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);

  // Reply state
  const [replyModal, setReplyModal] = useState<{ id: string; name: string; email: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchMessages = useCallback(async (p: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`/api/admin/messages?page=${p}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    const { id } = deleteModal;
    setDeleteLoading(id);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/admin/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete message');
      setMessages(prev => prev.filter(m => m.id !== id));
      setTotal(prev => prev - 1);
      showAlert('Message deleted.', 'success');
    } catch {
      showAlert('Failed to delete message.', 'error');
    } finally {
      setDeleteLoading(null);
      setDeleteModal(null);
    }
  };

  const handleReply = async () => {
    if (!replyModal || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`/api/admin/messages/${replyModal.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ replyMessage: replyText }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send reply');
      }
      const data = await res.json();
      // Update local state with reply info
      setMessages(prev =>
        prev.map(m =>
          m.id === replyModal.id
            ? { ...m, replied: true, repliedAt: data.message.repliedAt, replyMessage: data.message.replyMessage }
            : m
        )
      );
      showAlert(`Reply sent to ${replyModal.email}`, 'success');
      setReplyModal(null);
      setReplyText('');
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Failed to send reply.', 'error');
    } finally {
      setReplyLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter(
      m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.message.toLowerCase().includes(q)
    );
  }, [messages, search]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <MessageSquare size={24} /> Contact Messages
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            {total} total message{total !== 1 ? 's' : ''} from users.
          </p>
        </div>
        <button
          onClick={() => fetchMessages(page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or message..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-black transition-colors bg-white shadow-neo-sm"
        />
      </div>

      {/* Loading */}
      {loading && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={32} className="animate-spin mb-3" />
          <p className="font-medium text-sm">Loading messages...</p>
        </div>
      )}

      {/* Error */}
      {error && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <AlertTriangle size={32} className="mb-3" />
          <p className="font-bold text-sm mb-2">Failed to load messages</p>
          <p className="text-gray-500 text-xs mb-4">{error}</p>
          <button
            onClick={() => fetchMessages()}
            className="px-4 py-2 bg-primary text-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Messages list */}
      {(!loading || messages.length > 0) && !error && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-xl shadow-neo p-10 text-center text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium text-sm">No messages found.</p>
            </div>
          ) : (
            filtered.map(m => (
              <div
                key={m.id}
                className={`bg-white border-2 rounded-xl shadow-neo-sm overflow-hidden transition-all hover:shadow-neo ${
                  m.replied ? 'border-green-400' : 'border-black'
                }`}
              >
                <div
                  className="px-5 py-4 flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="font-bold text-sm">{m.name}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Mail size={11} /> {m.email}
                      </span>
                      {m.replied ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-300 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={11} /> Replied
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className={`text-sm text-gray-600 ${expandedId === m.id ? '' : 'line-clamp-1'}`}>
                      {m.message}
                    </p>

                    {/* Show reply if expanded and replied */}
                    {expandedId === m.id && m.replied && m.replyMessage && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                          <Reply size={11} /> Your Reply
                          {m.repliedAt && (
                            <span className="font-normal text-green-500 ml-1">· {formatDate(m.repliedAt)}</span>
                          )}
                        </p>
                        <p className="text-sm text-green-800 whitespace-pre-wrap">{m.replyMessage}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Clock size={11} />
                      {formatDate(m.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    {/* Reply button */}
                    <button
                      onClick={e => { e.stopPropagation(); setReplyModal({ id: m.id, name: m.name, email: m.email }); setReplyText(''); }}
                      className={`p-2 rounded-lg border-2 border-transparent transition-all ${
                        m.replied
                          ? 'text-green-500 hover:bg-green-50 hover:border-green-200'
                          : 'text-blue-500 hover:bg-blue-50 hover:border-blue-200'
                      }`}
                      title={m.replied ? 'Reply again' : 'Reply'}
                    >
                      <Reply size={14} />
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteModal({ id: m.id, name: m.name }); }}
                      disabled={deleteLoading === m.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg border-2 border-transparent hover:border-red-200 transition-all disabled:opacity-50"
                      title="Delete message"
                    >
                      {deleteLoading === m.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => fetchMessages(page - 1)}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-xs shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-sm font-medium text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchMessages(page + 1)}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1 px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-xs shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full">
            <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
              <Trash2 size={20} className="text-red-500" />
              Delete message?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the message from <strong>{deleteModal.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteLoading === deleteModal.id}
                className="flex-1 py-2 bg-red-500 text-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading === deleteModal.id ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply modal */}
      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
            <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
              <Reply size={20} className="text-blue-500" />
              Reply to {replyModal.name}
            </h3>
            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <Mail size={12} /> Sending to: <strong>{replyModal.email}</strong>
            </p>
            <p className="text-xs text-gray-400 mb-4">Your reply will be sent via email from dan974941@gmail.com</p>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows={5}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black resize-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || replyLoading}
                className="flex-1 py-2 bg-blue-500 text-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {replyLoading ? (
                  <><Loader2 size={14} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={14} /> Send Reply</>
                )}
              </button>
              <button
                onClick={() => { setReplyModal(null); setReplyText(''); }}
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

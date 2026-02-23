'use client';

import React, { useState } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight, Check, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function AdminCategoriesPage() {
  const { categories, addCategory, toggleCategory, renameCategory, users } = useAdmin();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const adminUser = users.find(u => u.email === user?.email);
  const actorId = adminUser?.id ?? 'u-1';

  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      showAlert('Category already exists.', 'error');
      return;
    }
    addCategory(trimmed, slugify(trimmed));
    showAlert(`Category "${trimmed}" created.`, 'success');
    setNewName('');
    setIsAdding(false);
  };

  const startEdit = (id: string, name: string, slug: string) => {
    setEditingId(id);
    setEditName(name);
    setEditSlug(slug);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    renameCategory(editingId, editName.trim(), editSlug.trim() || slugify(editName.trim()), actorId);
    showAlert('Category updated.', 'success');
    setEditingId(null);
  };

  const handleToggle = (id: string, isActive: boolean) => {
    toggleCategory(id, actorId);
    showAlert(isActive ? 'Category disabled.' : 'Category enabled.', 'info');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Categories</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Manage job categories used for filtering.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="bg-white border-2 border-black rounded-xl p-5 shadow-neo mb-6">
          <h3 className="font-bold mb-3">New Category</h3>
          <div className="flex gap-3">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Category name (e.g. DevOps)"
              className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-black transition-colors"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-500 text-white border-2 border-black rounded-lg font-bold text-sm hover:-translate-y-0.5 transition-all shadow-neo-sm hover:shadow-none"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewName(''); }}
              className="px-4 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Slug will be auto-generated from the name.</p>
        </div>
      )}

      {/* Categories list */}
      <div className="bg-white border-2 border-black rounded-xl shadow-neo overflow-hidden">
        <div className="divide-y-2 divide-gray-100">
          {categories.map(cat => (
            <div key={cat.id} className="px-5 py-4 flex items-center gap-4">
              {editingId === cat.id ? (
                <>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-black"
                    />
                    <input
                      type="text"
                      value={editSlug}
                      onChange={e => setEditSlug(e.target.value)}
                      placeholder="slug"
                      className="w-32 border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                  <button onClick={saveEdit} className="p-1.5 bg-green-100 border-2 border-green-400 rounded-lg hover:bg-green-200 transition-colors">
                    <Check size={14} className="text-green-700" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                    <X size={14} className="text-gray-600" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{cat.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cat.isActive ? 'bg-green-50 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => startEdit(cat.id, cat.name, cat.slug)}
                    className="p-1.5 border-2 border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all"
                    title="Rename"
                  >
                    <Pencil size={14} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleToggle(cat.id, cat.isActive)}
                    className={`p-1.5 border-2 rounded-lg transition-all ${cat.isActive ? 'border-orange-300 hover:bg-orange-50' : 'border-green-300 hover:bg-green-50'}`}
                    title={cat.isActive ? 'Disable' : 'Enable'}
                  >
                    {cat.isActive
                      ? <ToggleRight size={16} className="text-orange-500" />
                      : <ToggleLeft size={16} className="text-green-500" />}
                  </button>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="px-5 py-8 text-center text-gray-400">No categories yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

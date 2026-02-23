'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Tag,
  Flag,
  Users,
  ScrollText,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showAlert('Logged out successfully', 'info');
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b-2 border-black flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-lg border-2 border-black flex items-center justify-center shadow-neo-sm">
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-sm leading-tight">StepZen</p>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all duration-150 ${
              isActive(href)
                ? 'bg-primary text-white border-2 border-black shadow-neo-sm'
                : 'text-gray-700 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t-2 border-black">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-black flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r-2 border-black min-h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-black flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg border-2 border-black flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm">StepZen Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 border-2 border-black rounded-lg"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-white border-r-2 border-black h-full pt-14 overflow-y-auto">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
};

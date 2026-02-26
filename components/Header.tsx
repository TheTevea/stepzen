'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, User, Plus } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Internships', path: '/internships' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    showAlert('Logged out successfully', 'info');
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 ">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="relative flex items-center gap-2 group  self-stretch">
        
            <img src="/assets/images/logo_stepzen.png" alt="Stepzen Logo" className="h-14" />
       
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`font-bold text-sm uppercase tracking-wide transition-colors hover:text-primary ${
                  isActive(link.path) ? 'text-primary decoration-2 underline-offset-4 underline' : 'text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-3 ml-4">
                 <Link href="/post">
                   <Button variant="secondary" size="sm" className="gap-1.5">
                     <Plus size={16} /> Post Internship
                   </Button>
                 </Link>
                 <div className="flex items-center gap-2 font-bold text-sm bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                    <User size={16} />
                    <span>{user.name}</span>
                 </div>
                 <Button variant="outline" size="sm" onClick={handleLogout} className="px-3">
                    <LogOut size={16} />
                 </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="ml-4">
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b-2 border-black absolute w-full left-0 top-16 shadow-xl">
          <div className="px-4 py-6 space-y-4 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`text-lg font-bold ${
                  isActive(link.path) ? 'text-primary' : 'text-black'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
             
             <div className="border-t border-gray-200 pt-4 mt-2">
                {user ? (
                  <div className="space-y-3">
                     <div className="font-bold text-lg flex items-center gap-2">
                        <User size={20} />
                        Hi, {user.name}
                     </div>
                     <Link href="/post" onClick={() => setIsMenuOpen(false)}>
                       <Button variant="secondary" size="sm" fullWidth className="gap-1.5">
                         <Plus size={16} /> Post Internship
                       </Button>
                     </Link>
                     <Button variant="outline" size="sm" fullWidth onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" fullWidth>
                      Login
                    </Button>
                  </Link>
                )}
             </div>
          </div>
        </div>
      )}
    </header>
  );
};
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import logoImg from '@/src/assets/images/logo.svg';
import { Button } from './Button';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Internships', path: '/internships' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logoImg} alt="Stepzen Logo" className="w-8 h-8" />
            <span className="font-display font-black text-2xl tracking-[-0.04em] text-slate-900">StepZen</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-bold text-sm uppercase tracking-wide transition-colors hover:text-primary ${
                  isActive(link.path) ? 'text-primary decoration-2 underline-offset-4 underline' : 'text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                 <div className="flex items-center gap-2 font-bold text-sm bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                    <User size={16} />
                    <span>{user.name}</span>
                 </div>
                 <Button variant="outline" size="sm" onClick={handleLogout} className="px-3">
                    <LogOut size={16} />
                 </Button>
              </div>
            ) : (
              <Link to="/login">
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
                to={link.path}
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
                  <div className="space-y-4">
                     <div className="font-bold text-lg flex items-center gap-2">
                        <User size={20} />
                        Hi, {user.name}
                     </div>
                     <Button variant="outline" size="sm" fullWidth onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
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
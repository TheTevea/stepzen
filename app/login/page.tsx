'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { Button } from '@/components/Button';
import { PageTemplate } from '@/components/PageTemplate';

export const dynamic = 'force-dynamic';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);
    try {
      await login(email, password);
      showAlert('Welcome back! 👋', 'success');
      setTimeout(() => router.push('/'), 100);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      showAlert(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTemplate>
      <div className="auth-bg min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full auth-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <img src="/assets/images/icon_stepzen.png" alt="Stepzen Logo" className="h-20 mb-3 inline-block" />
            <h1 className="text-3xl font-display font-bold">Welcome Back</h1>
            <p className="text-gray-500 mt-2 text-sm">Login to apply for internships.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="developer@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input auth-input-pr"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-primary font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              disabled={isSubmitting}
              className="group"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Login <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            {/* Divider */}
            <div className="auth-divider">or</div>

            {/* Sign up link */}
            <div className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-bold text-black hover:text-primary transition-colors">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageTemplate>
  );
}

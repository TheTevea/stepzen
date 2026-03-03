'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';
import { Button } from '@/components/Button';
import { PageTemplate } from '@/components/PageTemplate';

export const dynamic = 'force-dynamic';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !password) return;

    if (password.length < 6) {
      showAlert('Password must be at least 6 characters.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Store signup data temporarily for the verify step
      sessionStorage.setItem(
        'stepzen_pending_signup',
        JSON.stringify({ name, password })
      );

      // Send OTP to email
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || 'Failed to send verification code.', 'error');
        return;
      }

      showAlert('Verification code sent to your email! 📧', 'success');
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch {
      showAlert('Something went wrong. Please try again.', 'error');
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
            <h1 className="text-3xl font-display font-bold">Join Stepzen</h1>
            <p className="text-gray-500 mt-2 text-sm">Start your career journey today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                  placeholder="Jane Doe"
                  required
                />
              </div>
            </div>

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
                  minLength={6}
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
              <p className="text-xs text-gray-400 mt-1.5">Must be at least 6 characters</p>
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
                  Sending Code...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            {/* Divider */}
            <div className="auth-divider">or</div>

            {/* Login link */}
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-black hover:text-primary transition-colors">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageTemplate>
  );
}

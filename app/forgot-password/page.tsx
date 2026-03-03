'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';
import { Button } from '@/components/Button';
import { PageTemplate } from '@/components/PageTemplate';

export const dynamic = 'force-dynamic';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || 'Failed to send reset code.', 'error');
        return;
      }

      showAlert('Reset code sent to your email! 📧', 'success');
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
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
            <h1 className="text-3xl font-display font-bold">Reset Password</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Enter your email and we&apos;ll send you a code to reset your password.
            </p>
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
                  Send Reset Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            {/* Back to login */}
            <div className="text-center text-sm text-gray-500 mt-4">
              <Link href="/login" className="inline-flex items-center gap-1.5 font-bold text-black hover:text-primary transition-colors">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageTemplate>
  );
}

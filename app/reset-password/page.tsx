'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowRight, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';
import { Button } from '@/components/Button';
import { PageTemplate } from '@/components/PageTemplate';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const router = useRouter();
  const { showAlert } = useAlert();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length !== 6) {
      showAlert('Please enter the full 6-digit code.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('Password must be at least 6 characters.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Passwords do not match.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || 'Password reset failed.', 'error');
        return;
      }

      showAlert('Password reset successfully! You can now log in. 🎉', 'success');
      setTimeout(() => router.push('/login'), 500);
    } catch {
      showAlert('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setIsResending(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || 'Failed to resend code.', 'error');
        return;
      }

      showAlert('New code sent! Check your email. 📧', 'success');
      setCooldown(60);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      showAlert('Failed to resend code. Please try again.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <PageTemplate>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-500">No email address provided.</p>
            <Button onClick={() => router.push('/forgot-password')} className="mt-4">
              Go to Forgot Password
            </Button>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate>
      <div className="auth-bg min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full auth-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 border-2 border-black rounded-full mb-4">
              <KeyRound size={32} className="text-warning" />
            </div>
            <h1 className="text-3xl font-display font-bold">Set New Password</h1>
            <p className="text-gray-600 mt-2">
              Enter the 6-digit code sent to
            </p>
            <p className="font-mono font-bold text-black mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs */}
            <div>
              <label className="block text-sm font-bold mb-2 text-center">Reset Code</label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                    required
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-bold mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="auth-input auth-input-pr"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input auth-input-pr"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

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
                  Resetting Password...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Reset Password <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            {/* Resend */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Didn&apos;t receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
                className="inline-flex items-center gap-1 text-sm font-bold text-black hover:text-primary disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <Link href="/login" className="font-bold text-black hover:text-primary">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageTemplate>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <PageTemplate>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTemplate>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';
import { Button } from '@/components/Button';
import { PageTemplate } from '@/components/PageTemplate';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const router = useRouter();
  const { showAlert } = useAlert();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
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
    newOtp[index] = value.slice(-1); // take last digit
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      showAlert('Please enter the full 6-digit code.', 'error');
      return;
    }

    // Retrieve stored signup data
    const signupData = sessionStorage.getItem('stepzen_pending_signup');
    if (!signupData) {
      showAlert('Signup session expired. Please sign up again.', 'error');
      router.push('/signup');
      return;
    }

    const { name, password } = JSON.parse(signupData);

    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, name, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || 'Verification failed.', 'error');
        return;
      }

      sessionStorage.removeItem('stepzen_pending_signup');
      showAlert('Email verified! You can now log in. 🎉', 'success');
      setTimeout(() => router.push('/login'), 500);
    } catch {
      showAlert('Something went wrong. Please try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setIsResending(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
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
            <Button onClick={() => router.push('/signup')} className="mt-4">
              Go to Signup
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border-2 border-black rounded-full mb-4">
              <ShieldCheck size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold">Verify Your Email</h1>
            <p className="text-gray-600 mt-2">
              We sent a 6-digit code to
            </p>
            <p className="font-mono font-bold text-black mt-1">{email}</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* OTP Inputs */}
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

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isVerifying}
              className="group"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Verify Email <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
          </form>
        </div>
      </div>
    </PageTemplate>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <PageTemplate>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTemplate>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Send, ExternalLink, Check, Loader2 } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';
import { Button } from '@/components/Button';
import { PageTemplate } from '@/components/PageTemplate';

export const dynamic = 'force-dynamic';

type VerifyChannel = 'email' | 'telegram';
type TelegramLinkState = 'idle' | 'generating' | 'waiting' | 'linked' | 'error';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();

  // Telegram linking state
  const [telegramState, setTelegramState] = useState<TelegramLinkState>('idle');
  const [deepLink, setDeepLink] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const handleTelegramLink = async () => {
    if (!email || !name || !password) {
      showAlert('Please fill in all fields first.', 'error');
      return;
    }
    if (password.length < 6) {
      showAlert('Password must be at least 6 characters.', 'error');
      return;
    }

    setTelegramState('generating');

    try {
      const res = await fetch('/api/auth/telegram-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || 'Failed to generate Telegram link.', 'error');
        setTelegramState('error');
        return;
      }

      if (data.linked) {
        // Already linked, skip to OTP
        setTelegramState('linked');
        await sendOtpViaTelegram();
        return;
      }

      setDeepLink(data.deepLink);
      setLinkCode(data.linkCode);
      setTelegramState('waiting');

      // Start polling for link status
      stopPolling();
      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/auth/telegram-link/status?linkCode=${data.linkCode}`
          );
          const statusData = await statusRes.json();

          if (statusData.linked) {
            stopPolling();
            setTelegramState('linked');
            // Auto-send OTP
            await sendOtpViaTelegram();
          } else if (statusData.expired) {
            stopPolling();
            setTelegramState('error');
            showAlert('Link expired. Please try again.', 'error');
          }
        } catch {
          // Silently continue polling
        }
      }, 2000);
    } catch {
      showAlert('Something went wrong. Please try again.', 'error');
      setTelegramState('error');
    }
  };

  const sendOtpViaTelegram = async () => {
    sessionStorage.setItem(
      'stepzen_pending_signup',
      JSON.stringify({ name, password })
    );

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, channel: 'telegram' }),
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || 'Failed to send code.', 'error');
        return;
      }

      if (data.sentVia === 'telegram') {
        showAlert('Verification code sent to your Telegram! 📱', 'success');
      } else {
        showAlert('Telegram not linked — code sent to email instead. 📧', 'info');
      }
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch {
      showAlert('Failed to send verification code.', 'error');
    }
  };

  const handleEmailVerify = async () => {
    if (!email || !name || !password) {
      showAlert('Please fill in all fields first.', 'error');
      return;
    }
    if (password.length < 6) {
      showAlert('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      sessionStorage.setItem(
        'stepzen_pending_signup',
        JSON.stringify({ name, password })
      );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent default form submission — buttons handle actions
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

            {/* Telegram Linking Section */}
            {telegramState === 'waiting' && (
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                  <Loader2 size={16} className="animate-spin" />
                  Waiting for Telegram link...
                </div>
                <p className="text-xs text-blue-600">
                  Click the button below to open Telegram and link your account:
                </p>
                <a
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-[#0088cc] text-white text-sm font-bold hover:bg-[#0077b5] transition-colors"
                >
                  <Send size={16} />
                  Open @StepZenBot
                  <ExternalLink size={14} />
                </a>
                <p className="text-xs text-center text-gray-400">
                  Send <code className="bg-white px-1.5 py-0.5 rounded text-blue-600 font-mono text-xs">/start {linkCode}</code> in the bot
                </p>
              </div>
            )}

            {telegramState === 'linked' && (
              <div className="rounded-xl border-2 border-green-200 bg-green-50/50 p-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-sm font-bold text-green-700">
                  <Check size={16} />
                  Telegram linked! Sending verification code...
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Verify via Telegram */}
              <button
                type="button"
                onClick={handleTelegramLink}
                disabled={isSubmitting || telegramState === 'generating' || telegramState === 'waiting' || telegramState === 'linked'}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#0088cc] text-white text-sm font-bold hover:bg-[#0077b5] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {telegramState === 'generating' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating link...
                  </>
                ) : telegramState === 'waiting' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Waiting for link...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Verify via Telegram
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="auth-divider">or</div>

              {/* Verify via Email */}
              <Button 
                type="button"
                onClick={handleEmailVerify}
                fullWidth 
                size="lg" 
                disabled={isSubmitting || telegramState === 'linked'}
                className="group"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending Code...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail size={18} />
                    Verify via Email <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>

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

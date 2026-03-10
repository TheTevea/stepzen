'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, Send, ExternalLink, Check, Loader2 } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';
import { Button } from '@/components/Button';
import { PageTemplate } from '@/components/PageTemplate';

export const dynamic = 'force-dynamic';

type TelegramLinkState = 'idle' | 'generating' | 'waiting' | 'linked' | 'sending' | 'error';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();

  // Telegram linking state
  const [telegramState, setTelegramState] = useState<TelegramLinkState>('idle');
  const [deepLink, setDeepLink] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const sendResetViaTelegram = async () => {
    setTelegramState('sending');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, channel: 'telegram' }),
      });
      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || 'Failed to send reset code.', 'error');
        setTelegramState('error');
        return;
      }

      if (data.sentVia === 'telegram') {
        showAlert('Reset code sent to your Telegram! 📱', 'success');
      } else {
        showAlert('Telegram not linked — code sent to email instead. 📧', 'info');
      }
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      showAlert('Failed to send reset code.', 'error');
      setTelegramState('error');
    }
  };

  const handleTelegramReset = async () => {
    if (!email) {
      showAlert('Please enter your email first.', 'error');
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
        // Already linked — send code directly
        setTelegramState('linked');
        await sendResetViaTelegram();
        return;
      }

      setDeepLink(data.deepLink);
      setLinkCode(data.linkCode);
      setTelegramState('waiting');

      // Poll for link status
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
            await sendResetViaTelegram();
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

  const handleEmailReset = async (e: React.FormEvent) => {
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

          <form onSubmit={handleEmailReset} className="space-y-5">
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

            {(telegramState === 'linked' || telegramState === 'sending') && (
              <div className="rounded-xl border-2 border-green-200 bg-green-50/50 p-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-sm font-bold text-green-700">
                  <Check size={16} />
                  Telegram linked! Sending reset code...
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Send via Telegram */}
              <button
                type="button"
                onClick={handleTelegramReset}
                disabled={isSubmitting || telegramState === 'generating' || telegramState === 'waiting' || telegramState === 'linked' || telegramState === 'sending'}
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
                ) : telegramState === 'sending' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Reset via Telegram
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="auth-divider">or</div>

              {/* Send via Email */}
              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={isSubmitting || telegramState === 'linked' || telegramState === 'sending'}
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
                    Reset via Email <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>

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

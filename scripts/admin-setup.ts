#!/usr/bin/env tsx
/**
 * admin:setup — Bootstrap the first admin user in a fresh environment.
 *
 * Usage:
 *   pnpm admin:setup --email admin@example.com --password 'S3cur3!Pass'
 *   pnpm admin:setup --mode promote --email existing-user@example.com
 *
 * Env-var fallback:
 *   ADMIN_SETUP_EMAIL, ADMIN_SETUP_PASSWORD
 *
 * Flags:
 *   --mode     "create" (default) | "promote"
 *   --email    Admin email address
 *   --password Admin password (create mode only)
 */

import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient } from '@supabase/supabase-js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(message: string) {
  const ts = new Date().toISOString();
  console.log(`[admin:setup ${ts}] ${message}`);
}

function fatal(message: string): never {
  log(`ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(): { mode: 'create' | 'promote'; email: string; password?: string } {
  const args = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
  };

  const modeArg = get('--mode') ?? 'create';
  if (modeArg !== 'create' && modeArg !== 'promote') {
    fatal(`Invalid --mode "${modeArg}". Must be "create" or "promote".`);
  }

  const email =
    get('--email') ?? process.env.ADMIN_SETUP_EMAIL ?? '';
  const password =
    get('--password') ?? process.env.ADMIN_SETUP_PASSWORD ?? undefined;

  return { mode: modeArg, email, password };
}

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): void {
  if (!email) fatal('Email is required. Use --email or set ADMIN_SETUP_EMAIL.');
  if (!EMAIL_RE.test(email)) fatal(`Invalid email format: "${email}".`);
}

function validatePassword(password: string | undefined): asserts password is string {
  if (!password)
    fatal('Password is required in create mode. Use --password or set ADMIN_SETUP_PASSWORD.');
  const issues: string[] = [];
  if (password.length < 8) issues.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) issues.push('an uppercase letter');
  if (!/[a-z]/.test(password)) issues.push('a lowercase letter');
  if (!/\d/.test(password)) issues.push('a digit');
  if (!/[^A-Za-z0-9]/.test(password)) issues.push('a special character');
  if (issues.length > 0) fatal(`Weak password — must contain: ${issues.join(', ')}.`);
}

// ─── Database & Supabase clients ──────────────────────────────────────────────

function getPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) fatal('DATABASE_URL env var is not set.');
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    fatal('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { mode, email, password } = parseArgs();

  validateEmail(email);
  if (mode === 'create') validatePassword(password);

  const prisma = getPrisma();
  const supabaseAdmin = getSupabaseAdmin();

  try {
    // ── Idempotency check ────────────────────────────────────────────────
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      log(`An admin user already exists (${existingAdmin.email}). No changes made.`);
      return;
    }

    // ── Create mode ──────────────────────────────────────────────────────
    if (mode === 'create') {
      log(`Creating new admin user: ${email}`);

      // 1. Create in Supabase Auth
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: password!,
        email_confirm: true,
        user_metadata: { name: email.split('@')[0] },
      });

      if (error) {
        // If user already exists in Supabase but not in Prisma, handle gracefully
        if (error.message?.includes('already been registered')) {
          log('User already exists in Supabase Auth. Updating password and creating Prisma record as ADMIN.');

          // Look up the existing Supabase Auth user and update their password
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existingAuthUser = listData?.users?.find((u) => u.email === email);
          if (existingAuthUser) {
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
              existingAuthUser.id,
              { password: password! }
            );
            if (updateError) {
              fatal(`Failed to update Supabase Auth password: ${updateError.message}`);
            }
            log(`Supabase Auth password updated for existing user (id: ${existingAuthUser.id}).`);
          }
        } else {
          fatal(`Supabase Auth error: ${error.message}`);
        }
      } else {
        log(`Supabase Auth user created (id: ${data.user.id}).`);
      }

      // 2. Create or update in Prisma
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' },
        });
        log(`Existing Prisma user promoted to ADMIN.`);
      } else {
        await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0],
            role: 'ADMIN',
          },
        });
        log(`Prisma user created with role ADMIN.`);
      }

      log(`✅ Admin setup complete for ${email}.`);
    }

    // ── Promote mode ─────────────────────────────────────────────────────
    if (mode === 'promote') {
      log(`Promoting existing user to admin: ${email}`);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) fatal(`No user found with email "${email}". Cannot promote.`);

      if (user.role === 'ADMIN') {
        log(`User ${email} is already an ADMIN. No changes made.`);
        return;
      }

      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      });

      log(`✅ User ${email} promoted to ADMIN.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[admin:setup] Unhandled error:', err);
  process.exit(1);
});

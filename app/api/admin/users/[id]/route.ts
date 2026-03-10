import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/generated/prisma/client';

/** Verify the request is from an authenticated ADMIN user */
async function getAdminUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: data.user.email },
  });

  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

const VALID_ROLES: UserRole[] = ['SEEKER', 'EMPLOYER', 'ADMIN'];

// ─── PATCH /api/admin/users/[id] — ban/unban/role change ───────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Prevent self-modification
    if (id === admin.id) {
      return NextResponse.json(
        { error: "You cannot modify your own account." },
        { status: 403 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    let updated;

    switch (action) {
      case 'ban': {
        const { reason } = body;
        if (!reason?.trim()) {
          return NextResponse.json({ error: 'Ban reason is required.' }, { status: 400 });
        }
        updated = await prisma.user.update({
          where: { id },
          data: { isBanned: true, banReason: reason.trim() },
        });
        await prisma.auditLog.create({
          data: { actorId: admin.id, action: 'USER_BANNED', targetType: 'User', targetId: id, metadata: { reason: reason.trim() } },
        });
        break;
      }

      case 'unban': {
        updated = await prisma.user.update({
          where: { id },
          data: { isBanned: false, banReason: null },
        });
        await prisma.auditLog.create({
          data: { actorId: admin.id, action: 'USER_UNBANNED', targetType: 'User', targetId: id },
        });
        break;
      }

      case 'updateRole': {
        const { role } = body;
        if (!VALID_ROLES.includes(role)) {
          return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
        }
        updated = await prisma.user.update({
          where: { id },
          data: { role },
        });
        await prisma.auditLog.create({
          data: { actorId: admin.id, action: 'USER_ROLE_CHANGED', targetType: 'User', targetId: id, metadata: { role } },
        });
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name ?? updated.email.split('@')[0],
        role: updated.role,
        isBanned: updated.isBanned,
        banReason: updated.banReason,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('PATCH /api/admin/users/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

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

// ─── GET /api/admin/audit-logs — list all audit logs ─────────────────
export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { id: true, name: true, email: true },
        },
      },
      take: 200,
    });

    const mapped = logs.map((log) => ({
      id: log.id,
      actorId: log.actorId,
      actorName: log.actor.name ?? log.actor.email.split('@')[0],
      actorEmail: log.actor.email,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({ logs: mapped });
  } catch (err) {
    console.error('GET /api/admin/audit-logs error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── POST /api/admin/audit-logs — create an audit log entry ──────────
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, targetType, targetId, metadata } = body;

    if (!action || !targetType || !targetId) {
      return NextResponse.json(
        { error: 'action, targetType, and targetId are required.' },
        { status: 400 }
      );
    }

    const log = await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action,
        targetType,
        targetId,
        metadata: metadata ?? undefined,
      },
      include: {
        actor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      log: {
        id: log.id,
        actorId: log.actorId,
        actorName: log.actor.name ?? log.actor.email.split('@')[0],
        actorEmail: log.actor.email,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        metadata: log.metadata as Record<string, unknown> | null,
        createdAt: log.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error('POST /api/admin/audit-logs error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

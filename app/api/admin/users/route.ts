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

// ─── GET /api/admin/users — list all users with job counts ─────────────
export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { jobsCreated: true },
        },
      },
    });

    const mapped = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name ?? u.email.split('@')[0],
      role: u.role,
      isBanned: u.isBanned,
      banReason: u.banReason,
      jobCount: u._count.jobsCreated,
      createdAt: u.createdAt.toISOString(),
    }));

    return NextResponse.json({ users: mapped });
  } catch (err) {
    console.error('GET /api/admin/users error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

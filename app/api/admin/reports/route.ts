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

// ─── GET /api/admin/reports — list all reports ───────────────────────────
export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.jobReport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        job: { select: { id: true, title: true, companyName: true, status: true } },
        reportedBy: { select: { id: true, name: true, email: true } },
        handledBy: { select: { id: true, name: true, email: true } },
      },
    });

    const mapped = reports.map((r) => ({
      id: r.id,
      jobId: r.jobId,
      reportedById: r.reportedById,
      reason: r.reason,
      message: r.message,
      status: r.status,
      handledById: r.handledById,
      handledNote: r.handledNote,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      // Extra info for the admin UI
      job: r.job,
      reportedBy: r.reportedBy,
      handledBy: r.handledBy,
    }));

    return NextResponse.json({ reports: mapped });
  } catch (err) {
    console.error('GET /api/admin/reports error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

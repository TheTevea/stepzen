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

// ─── PATCH /api/admin/reports/:id — update report status ─────────────────
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
    const body = await request.json();
    const { status, note } = body as { status?: string; note?: string };

    const validStatuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Use one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify report exists
    const existing = await prisma.jobReport.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    // Update report
    const report = await prisma.jobReport.update({
      where: { id },
      data: {
        status: status as 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED',
        handledById: admin.id,
        handledNote: note?.trim() || null,
      },
      include: {
        job: { select: { id: true, title: true, companyName: true, status: true } },
        reportedBy: { select: { id: true, name: true, email: true } },
        handledBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: `REPORT_${status}`,
        targetType: 'Report',
        targetId: id,
        metadata: note ? { note } : undefined,
      },
    });

    return NextResponse.json({
      report: {
        id: report.id,
        jobId: report.jobId,
        reportedById: report.reportedById,
        reason: report.reason,
        message: report.message,
        status: report.status,
        handledById: report.handledById,
        handledNote: report.handledNote,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
        job: report.job,
        reportedBy: report.reportedBy,
        handledBy: report.handledBy,
      },
    });
  } catch (err) {
    console.error('PATCH /api/admin/reports/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

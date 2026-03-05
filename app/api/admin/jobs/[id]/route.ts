import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendJobToTelegram } from '@/lib/telegram';

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

// ─── PATCH /api/admin/jobs/:id — approve / reject / archive ────────────
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
    const { action, note } = body as { action: string; note?: string };

    // Validate the job exists
    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};
    let auditAction = '';

    switch (action) {
      case 'approve':
        updateData = {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          reviewedById: admin.id,
          reviewNote: note || null,
        };
        auditAction = 'JOB_APPROVED';
        break;

      case 'reject':
        if (!note?.trim()) {
          return NextResponse.json(
            { error: 'A rejection reason is required.' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'REJECTED',
          reviewedById: admin.id,
          reviewNote: note,
        };
        auditAction = 'JOB_REJECTED';
        break;

      case 'archive':
        updateData = {
          status: 'ARCHIVED',
          archivedAt: new Date(),
          reviewedById: admin.id,
          reviewNote: note || null,
        };
        auditAction = 'JOB_ARCHIVED';
        break;

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}. Use approve, reject, or archive.` },
          { status: 400 }
        );
    }

    // Update the job
    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        location: true,
        createdBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: auditAction,
        targetType: 'Job',
        targetId: id,
        metadata: note ? { reason: note } : undefined,
      },
    });

    // ── Send to Telegram channel on approval ──────────────────────────
    if (action === 'approve' && job.postToTelegram) {
      try {
        await sendJobToTelegram(job);

        // Clear temporary banner from Supabase and the database
        if (job.telegramBannerUrl) {
          // Extract the filename from the end of the public URL
          const parts = job.telegramBannerUrl.split('/');
          const fileName = parts[parts.length - 1];
          
          if (fileName) {
            const admin = getSupabaseAdmin();
            const { error: deleteError } = await admin.storage
              .from('telegram-banners')
              .remove([fileName]);
              
            if (deleteError) {
              console.error('[Storage] Failed to delete banner:', deleteError);
            }
          }

          await prisma.job.update({
            where: { id },
            data: { telegramBannerUrl: null },
          });
        }
      } catch (telegramErr) {
        console.error('[Telegram] Failed to send job to channel:', telegramErr);
        // Don't fail the approval — just log the error
      }
    }

    return NextResponse.json({ job });
  } catch (err) {
    console.error('PATCH /api/admin/jobs/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

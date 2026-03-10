import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ARCHIVE_RETENTION_DAYS = 30;

/**
 * GET /api/cron/cleanup-archived-jobs
 *
 * Deletes jobs that have been in ARCHIVED status for more than 30 days.
 * Designed to be called by a cron scheduler (e.g. Vercel Cron).
 *
 * Protected by a CRON_SECRET env variable to prevent unauthorized access.
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ARCHIVE_RETENTION_DAYS);

    // First delete related records (SavedJob, JobReport) for jobs to be deleted
    const jobsToDelete = await prisma.job.findMany({
      where: {
        status: 'ARCHIVED',
        archivedAt: { lte: cutoffDate },
      },
      select: { id: true, title: true },
    });

    if (jobsToDelete.length === 0) {
      return NextResponse.json({
        message: 'No archived jobs older than 30 days found.',
        deleted: 0,
      });
    }

    const jobIds = jobsToDelete.map((j) => j.id);

    // Delete related records first (foreign key constraints)
    await prisma.savedJob.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.jobReport.deleteMany({ where: { jobId: { in: jobIds } } });

    // Delete the archived jobs
    const result = await prisma.job.deleteMany({
      where: { id: { in: jobIds } },
    });

    // Create audit log for the cleanup
    // Use the first admin user for the actor (system action)
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (adminUser) {
      await prisma.auditLog.create({
        data: {
          actorId: adminUser.id,
          action: 'ARCHIVED_JOBS_CLEANUP',
          targetType: 'Job',
          targetId: 'system',
          metadata: {
            deletedCount: result.count,
            jobIds,
            retentionDays: ARCHIVE_RETENTION_DAYS,
          },
        },
      });
    }

    console.log(`Cleanup: deleted ${result.count} archived jobs older than ${ARCHIVE_RETENTION_DAYS} days.`);

    return NextResponse.json({
      message: `Deleted ${result.count} archived job(s) older than ${ARCHIVE_RETENTION_DAYS} days.`,
      deleted: result.count,
      jobs: jobsToDelete.map((j) => ({ id: j.id, title: j.title })),
    });
  } catch (err) {
    console.error('Cron cleanup error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

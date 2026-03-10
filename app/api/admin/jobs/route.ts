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

// ─── GET /api/admin/jobs — list ALL jobs (admin only) ──────────────────
export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        location: true,
        createdBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
    });

    const mapped = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      description: j.description,
      companyName: j.companyName,
      location: j.location?.name ?? null,
      jobType: j.jobType,
      telegramLink: j.telegramLink,
      postToTelegram: j.postToTelegram,
      telegramBannerUrl: j.telegramBannerUrl ?? undefined,
      responsibilities: j.responsibilities,
      requirements: j.requirements,
      skills: j.skills,
      duration: j.duration,
      stipend: j.stipend,
      deadline: j.deadline,
      categoryId: j.categoryId,
      categoryName: j.category.name,
      createdById: j.createdById,
      createdByName: j.createdBy.name ?? j.createdBy.email.split('@')[0],
      createdByEmail: j.createdBy.email,
      status: j.status,
      reviewedById: j.reviewedById,
      reviewedByName: j.reviewedBy?.name ?? null,
      reviewNote: j.reviewNote,
      publishedAt: j.publishedAt?.toISOString() ?? null,
      expiresAt: j.expiresAt?.toISOString() ?? null,
      createdAt: j.createdAt.toISOString(),
      updatedAt: j.updatedAt.toISOString(),
    }));

    return NextResponse.json({ jobs: mapped });
  } catch (err) {
    console.error('GET /api/admin/jobs error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

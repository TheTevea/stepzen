import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

const DAILY_POST_LIMIT = 3;

/** Helper: extract the authenticated user's Prisma record from the Authorization header */
async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: data.user.email },
  });
  return user;
}

// ─── POST /api/jobs — create a new job (auth + rate limit) ─────────────
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to post a job.' },
        { status: 401 }
      );
    }

    // ── Rate-limit: max 3 posts per calendar day ──────────────────────
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await prisma.job.count({
      where: {
        createdById: user.id,
        createdAt: { gte: startOfDay },
      },
    });

    if (todayCount >= DAILY_POST_LIMIT) {
      return NextResponse.json(
        {
          error: `You've reached the daily limit of ${DAILY_POST_LIMIT} posts. Please try again tomorrow.`,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // ── Validate body ─────────────────────────────────────────────────
    const body = await request.json();
    const {
      title,
      companyName,
      description,
      telegramLink,
      categoryId,
      locationId,
      jobType,
      responsibilities,
      requirements,
      skills,
      duration,
      stipend,
      deadline,
    } = body;

    if (!title || !companyName || !description || !telegramLink || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, companyName, description, telegramLink, categoryId.' },
        { status: 400 }
      );
    }

    // ── Create the Job ────────────────────────────────────────────────
    const job = await prisma.job.create({
      data: {
        title,
        companyName,
        description,
        telegramLink,
        locationId: locationId || null,
        jobType: jobType || null,
        categoryId,
        createdById: user.id,
        status: 'PENDING_REVIEW',
        responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
        requirements: Array.isArray(requirements) ? requirements : [],
        skills: Array.isArray(skills) ? skills : [],
        duration: duration || null,
        stipend: stipend || null,
        deadline: deadline || null,
      },
      include: { category: true, location: true },
    });

    return NextResponse.json(
      { job, remaining: DAILY_POST_LIMIT - todayCount - 1 },
      { status: 201 }
    );
  } catch (err) {
    console.error('POST /api/jobs error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── GET /api/jobs — list published jobs ───────────────────────────────
export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true, location: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(jobs);
  } catch (err) {
    console.error('GET /api/jobs error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

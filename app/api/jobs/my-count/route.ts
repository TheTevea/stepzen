import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

const DAILY_POST_LIMIT = 3;

// ─── GET /api/jobs/my-count — today's post count for the auth'd user ───
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user?.email) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: data.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await prisma.job.count({
      where: {
        createdById: user.id,
        createdAt: { gte: startOfDay },
      },
    });

    return NextResponse.json({
      count: todayCount,
      limit: DAILY_POST_LIMIT,
      remaining: Math.max(0, DAILY_POST_LIMIT - todayCount),
    });
  } catch (err) {
    console.error('GET /api/jobs/my-count error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

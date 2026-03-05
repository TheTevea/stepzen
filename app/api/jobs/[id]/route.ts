import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET /api/jobs/:id — single job detail ─────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        createdBy: { select: { name: true, email: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (err) {
    console.error('GET /api/jobs/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

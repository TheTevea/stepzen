import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Map UI-friendly reason strings to Prisma enum values
const REASON_MAP: Record<string, string> = {
  'Scam / Fraud': 'SCAM',
  'Misleading information': 'INAPPROPRIATE',
  'Expired / Invalid': 'DUPLICATE',
  'Inappropriate content': 'INAPPROPRIATE',
  'Other': 'OTHER',
  // Also accept raw enum values
  SPAM: 'SPAM',
  SCAM: 'SCAM',
  INAPPROPRIATE: 'INAPPROPRIATE',
  DUPLICATE: 'DUPLICATE',
  OTHER: 'OTHER',
};

// ─── POST /api/jobs/:id/report — submit a report (public, anonymous) ───
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const body = await request.json();
    const { reason, message } = body as { reason?: string; message?: string };

    if (!reason) {
      return NextResponse.json(
        { error: 'A reason is required.' },
        { status: 400 }
      );
    }

    const mappedReason = REASON_MAP[reason];
    if (!mappedReason) {
      return NextResponse.json(
        { error: 'Invalid reason.' },
        { status: 400 }
      );
    }

    // Verify the job exists and is published
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    }

    if (job.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'This job is not currently available.' },
        { status: 400 }
      );
    }

    const report = await prisma.jobReport.create({
      data: {
        jobId,
        reason: mappedReason as 'SPAM' | 'SCAM' | 'INAPPROPRIATE' | 'DUPLICATE' | 'OTHER',
        message: message?.trim() || null,
        status: 'OPEN',
      },
    });

    return NextResponse.json({
      id: report.id,
      message: 'Report submitted successfully.',
    });
  } catch (err) {
    console.error('POST /api/jobs/[id]/report error:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

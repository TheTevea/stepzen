import { NextRequest, NextResponse } from 'next/server';
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

// ─── GET /api/admin/messages — list all contact messages ───────────────
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count(),
    ]);

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        message: m.message,
        replied: m.replied,
        repliedAt: m.repliedAt?.toISOString() ?? null,
        replyMessage: m.replyMessage,
        createdAt: m.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('GET /api/admin/messages error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── DELETE /api/admin/messages — delete a contact message ─────────────
export async function DELETE(request: Request) {
  try {
    const admin = await getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Message ID is required.' }, { status: 400 });
    }

    await prisma.contactMessage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/messages error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

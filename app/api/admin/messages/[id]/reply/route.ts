import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { sendContactReplyEmail } from '@/lib/email';

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

// ─── POST /api/admin/messages/[id]/reply — reply to a contact message ──
export async function POST(
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
    const { replyMessage } = body;

    if (!replyMessage?.trim()) {
      return NextResponse.json({ error: 'Reply message is required.' }, { status: 400 });
    }

    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
    }

    // Send the reply email
    try {
      await sendContactReplyEmail(
        message.email,
        message.name,
        message.message,
        replyMessage.trim()
      );
    } catch (emailErr) {
      console.error('Failed to send reply email:', emailErr);
      return NextResponse.json(
        { error: 'Failed to send email. Please check email configuration.' },
        { status: 502 }
      );
    }

    // Mark message as replied in the database
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        replied: true,
        repliedAt: new Date(),
        replyMessage: replyMessage.trim(),
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: 'MESSAGE_REPLIED',
        targetType: 'ContactMessage',
        targetId: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: updated.id,
        replied: updated.replied,
        repliedAt: updated.repliedAt?.toISOString(),
        replyMessage: updated.replyMessage,
      },
    });
  } catch (err) {
    console.error('POST /api/admin/messages/[id]/reply error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

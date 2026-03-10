import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/telegram-link/status?linkCode=xxx
 * Polling endpoint — returns whether the user has linked their Telegram.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const linkCode = searchParams.get('linkCode');

    if (!linkCode) {
      return NextResponse.json({ error: 'linkCode is required' }, { status: 400 });
    }

    const link = await prisma.telegramLink.findUnique({
      where: { linkCode },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Check if expired
    if (new Date() > link.expiresAt) {
      return NextResponse.json({
        linked: false,
        expired: true,
        error: 'Link code has expired. Please generate a new one.',
      });
    }

    return NextResponse.json({
      linked: !!link.chatId,
      expired: false,
    });
  } catch (error) {
    console.error('Failed to check Telegram link status:', error);
    return NextResponse.json(
      { error: 'Failed to check link status.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * POST /api/auth/telegram-link
 * Generate a unique link code so the user can connect their Telegram account.
 * Returns a deep-link URL to the bot.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Clean up any expired link codes for this email
    await prisma.telegramLink.deleteMany({
      where: {
        email,
        expiresAt: { lt: new Date() },
      },
    });

    // Check if there's already an active link for this email
    const existingLink = await prisma.telegramLink.findFirst({
      where: {
        email,
        chatId: { not: null },
        expiresAt: { gt: new Date() },
      },
    });

    if (existingLink) {
      return NextResponse.json({
        linked: true,
        chatId: existingLink.chatId,
        message: 'Telegram already linked',
      });
    }

    // Generate a unique 8-char link code
    const linkCode = crypto.randomBytes(4).toString('hex');

    // Store it (10 minute expiry)
    const telegramLink = await prisma.telegramLink.create({
      data: {
        linkCode,
        email,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'StepZenBot';
    const deepLink = `https://t.me/${botUsername}?start=${linkCode}`;

    return NextResponse.json({
      linked: false,
      linkCode: telegramLink.linkCode,
      deepLink,
      expiresAt: telegramLink.expiresAt,
    });
  } catch (error) {
    console.error('Failed to create Telegram link:', error);
    return NextResponse.json(
      { error: 'Failed to generate Telegram link.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { sendTelegramOtp } from '@/lib/telegram';
import crypto from 'crypto';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { email, channel } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const successResponse = (sentVia: string) => NextResponse.json({
      message: 'If an account with that email exists, a reset code has been sent.',
      sentVia,
    });

    // Check if user exists in our database
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      return successResponse(channel === 'telegram' ? 'telegram' : 'email');
    }

    // Rate limit: check if an OTP was sent in the last 60 seconds
    const recentOtp = await prisma.emailOtp.findFirst({
      where: {
        email,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: 'Please wait 60 seconds before requesting a new code.' },
        { status: 429 }
      );
    }

    // Delete any existing OTPs for this email
    await prisma.emailOtp.deleteMany({ where: { email } });

    // Generate and store new OTP (hashed, 5-min expiry)
    const code = generateOtp();
    await prisma.emailOtp.create({
      data: {
        email,
        code: hashCode(code),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Send via the chosen channel
    if (channel === 'telegram') {
      const telegramLink = await prisma.telegramLink.findFirst({
        where: {
          email,
          chatId: { not: null },
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (telegramLink?.chatId) {
        await sendTelegramOtp(telegramLink.chatId, code);
        return successResponse('telegram');
      }

      // Fallback to email if Telegram not linked
      await sendPasswordResetEmail(email, code);
      return NextResponse.json({
        message: 'Telegram not linked. Reset code sent to email instead.',
        sentVia: 'email',
      });
    }

    // Default: send via email
    await sendPasswordResetEmail(email, code);
    return successResponse('email');
  } catch (error) {
    console.error('Failed to send password reset:', error);
    return NextResponse.json(
      { error: 'Failed to send reset code. Please try again.' },
      { status: 500 }
    );
  }
}


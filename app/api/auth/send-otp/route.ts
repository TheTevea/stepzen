import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/email';
import crypto from 'crypto';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
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

    // Send the email
    await sendOtpEmail(email, code);

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email. Please try again.' },
      { status: 500 }
    );
  }
}

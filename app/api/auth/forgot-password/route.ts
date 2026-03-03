import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: 'If an account with that email exists, a reset code has been sent.',
    });

    // Check if user exists in our database
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      // Return success even if user doesn't exist (prevent enumeration)
      return successResponse;
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

    // Send the password reset email
    await sendPasswordResetEmail(email, code);

    return successResponse;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return NextResponse.json(
      { error: 'Failed to send reset email. Please try again.' },
      { status: 500 }
    );
  }
}

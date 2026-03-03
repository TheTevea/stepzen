import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // Find the OTP record
    const otpRecord = await prisma.emailOtp.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'No reset code found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await prisma.emailOtp.deleteMany({ where: { email } });
      return NextResponse.json(
        { error: 'Code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check code matches
    if (hashCode(code) !== otpRecord.code) {
      return NextResponse.json(
        { error: 'Invalid reset code.' },
        { status: 400 }
      );
    }

    // OTP is valid — update the password in Supabase Auth
    const supabaseAdmin = getSupabaseAdmin();

    // First, find the user by email using the admin client
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Failed to list users:', listError);
      return NextResponse.json(
        { error: 'Failed to reset password. Please try again.' },
        { status: 500 }
      );
    }

    const supabaseUser = usersData.users.find((u) => u.email === email);

    if (!supabaseUser) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      supabaseUser.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return NextResponse.json(
        { error: 'Failed to reset password. Please try again.' },
        { status: 500 }
      );
    }

    // Clean up OTP records
    await prisma.emailOtp.deleteMany({ where: { email } });

    return NextResponse.json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Failed to reset password:', error);
    return NextResponse.json(
      { error: 'Password reset failed. Please try again.' },
      { status: 500 }
    );
  }
}

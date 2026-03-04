import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendContactNotificationEmail } from '@/lib/email';

const COOLDOWN_SECONDS = 20;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    // Rate limit: check for messages from same IP in last 20 seconds
    const cooldownDate = new Date(Date.now() - COOLDOWN_SECONDS * 1000);
    const recentMessage = await prisma.contactMessage.findFirst({
      where: {
        ipAddress: ip,
        createdAt: { gte: cooldownDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentMessage) {
      const waitMs = recentMessage.createdAt.getTime() + COOLDOWN_SECONDS * 1000 - Date.now();
      const waitSeconds = Math.ceil(waitMs / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSeconds} seconds before sending another message.`, cooldown: waitSeconds },
        { status: 429 }
      );
    }

    // Save the contact message
    await prisma.contactMessage.create({
      data: { name, email, message, ipAddress: ip },
    });

    // Send email notification to admin
    try {
      await sendContactNotificationEmail(name, email, message);
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
      // Don't fail the request if email fails — message is already saved
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

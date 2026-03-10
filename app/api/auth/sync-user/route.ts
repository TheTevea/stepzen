import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists to avoid duplicates
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ user: existingUser });
    }

    // Create the user in the Prisma User table
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        role: email === 'admin@stepzen.com' ? 'ADMIN' : 'SEEKER',
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to sync user:', error);
    return NextResponse.json(
      { error: 'Failed to create user record' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

async function requireAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: data.user.email } });
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

// GET /api/admin/locations — all locations (including inactive)
export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(locations);
}

// POST /api/admin/locations — create a new location
export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { name, slug } = await request.json();
  if (!name || !slug) {
    return NextResponse.json({ error: 'name and slug are required.' }, { status: 400 });
  }

  try {
    const location = await prisma.location.create({ data: { name, slug } });

    // Audit log
    await prisma.auditLog.create({
      data: { actorId: admin.id, action: 'LOCATION_CREATED', targetType: 'Location', targetId: location.id, metadata: { name, slug } },
    });

    return NextResponse.json(location, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Location with that name or slug already exists.' }, { status: 409 });
  }
}

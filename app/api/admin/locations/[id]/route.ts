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

// PUT /api/admin/locations/:id — rename
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { name, slug } = await request.json();

  const location = await prisma.location.update({
    where: { id },
    data: { name, slug },
  });

  await prisma.auditLog.create({
    data: { actorId: admin.id, action: 'LOCATION_RENAMED', targetType: 'Location', targetId: id, metadata: { name, slug } },
  });

  return NextResponse.json(location);
}

// PATCH /api/admin/locations/:id — toggle isActive
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.location.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const location = await prisma.location.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  await prisma.auditLog.create({
    data: { actorId: admin.id, action: 'LOCATION_TOGGLED', targetType: 'Location', targetId: id, metadata: { isActive: location.isActive } },
  });

  return NextResponse.json(location);
}

// DELETE /api/admin/locations/:id — delete (only if no jobs linked)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const jobCount = await prisma.job.count({ where: { locationId: id } });
  if (jobCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${jobCount} job(s) still use this location. Disable it instead.` },
      { status: 409 }
    );
  }

  await prisma.location.delete({ where: { id } });

  await prisma.auditLog.create({
    data: { actorId: admin.id, action: 'LOCATION_DELETED', targetType: 'Location', targetId: id },
  });

  return NextResponse.json({ success: true });
}

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

// PUT /api/admin/categories/:id — rename
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { name, slug } = await request.json();

  const category = await prisma.category.update({
    where: { id },
    data: { name, slug },
  });

  await prisma.auditLog.create({
    data: { actorId: admin.id, action: 'CATEGORY_RENAMED', targetType: 'Category', targetId: id, metadata: { name, slug } },
  });

  return NextResponse.json(category);
}

// PATCH /api/admin/categories/:id — toggle isActive
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const category = await prisma.category.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  await prisma.auditLog.create({
    data: { actorId: admin.id, action: 'CATEGORY_TOGGLED', targetType: 'Category', targetId: id, metadata: { isActive: category.isActive } },
  });

  return NextResponse.json(category);
}

// DELETE /api/admin/categories/:id — delete (only if no jobs linked)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const jobCount = await prisma.job.count({ where: { categoryId: id } });
  if (jobCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${jobCount} job(s) still use this category. Disable it instead.` },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });

  await prisma.auditLog.create({
    data: { actorId: admin.id, action: 'CATEGORY_DELETED', targetType: 'Category', targetId: id },
  });

  return NextResponse.json({ success: true });
}

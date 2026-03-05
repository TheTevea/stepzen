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

// GET /api/admin/categories — all categories (including inactive)
export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

// POST /api/admin/categories — create a new category
export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { name, slug } = await request.json();
  if (!name || !slug) {
    return NextResponse.json({ error: 'name and slug are required.' }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({ data: { name, slug } });

    await prisma.auditLog.create({
      data: { actorId: admin.id, action: 'CATEGORY_CREATED', targetType: 'Category', targetId: category.id, metadata: { name, slug } },
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Category with that name or slug already exists.' }, { status: 409 });
  }
}

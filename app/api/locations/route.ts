import { prisma } from "@/lib/prisma";

// GET /api/locations — public, returns active locations for dropdowns
export async function GET() {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return Response.json(locations);
}

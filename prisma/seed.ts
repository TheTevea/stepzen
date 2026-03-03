import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const categories = [
    { name: "Frontend", slug: "frontend" },
    { name: "Backend", slug: "backend" },
    { name: "Fullstack", slug: "fullstack" },
    { name: "Mobile", slug: "mobile" },
    { name: "UI/UX", slug: "ui-ux" },
    { name: "Data", slug: "data" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }
}

main()
  .then(() => console.log("Seed complete"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

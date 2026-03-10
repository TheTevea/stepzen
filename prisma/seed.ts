import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  // ── Categories ────────────────────────────────────────────────────────
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

  // ── Locations (all 25 provinces of Cambodia) ──────────────────────────
  const locations = [
    { name: "Phnom Penh", slug: "phnom-penh" },
    { name: "Banteay Meanchey", slug: "banteay-meanchey" },
    { name: "Battambang", slug: "battambang" },
    { name: "Kampong Cham", slug: "kampong-cham" },
    { name: "Kampong Chhnang", slug: "kampong-chhnang" },
    { name: "Kampong Speu", slug: "kampong-speu" },
    { name: "Kampong Thom", slug: "kampong-thom" },
    { name: "Kampot", slug: "kampot" },
    { name: "Kandal", slug: "kandal" },
    { name: "Kep", slug: "kep" },
    { name: "Koh Kong", slug: "koh-kong" },
    { name: "Kratié", slug: "kratie" },
    { name: "Mondulkiri", slug: "mondulkiri" },
    { name: "Oddar Meanchey", slug: "oddar-meanchey" },
    { name: "Pailin", slug: "pailin" },
    { name: "Preah Sihanouk", slug: "preah-sihanouk" },
    { name: "Preah Vihear", slug: "preah-vihear" },
    { name: "Prey Veng", slug: "prey-veng" },
    { name: "Pursat", slug: "pursat" },
    { name: "Ratanakiri", slug: "ratanakiri" },
    { name: "Siem Reap", slug: "siem-reap" },
    { name: "Stung Treng", slug: "stung-treng" },
    { name: "Svay Rieng", slug: "svay-rieng" },
    { name: "Takéo", slug: "takeo" },
    { name: "Tboung Khmum", slug: "tboung-khmum" },
  ];

  for (const l of locations) {
    await prisma.location.upsert({
      where: { slug: l.slug },
      update: { name: l.name },
      create: l,
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

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const connectionString = process.env.BGSC_POSTGRES_PRISMA_URL;
if (!connectionString) {
  throw new Error("BGSC_POSTGRES_PRISMA_URL is not set");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.siteConfig.upsert({
    where: { key: "passion_app_url" },
    update: {},
    create: { key: "passion_app_url", value: "http://Badgirlstrengthclub.passion.io" },
  });
  await prisma.siteConfig.upsert({
    where: { key: "trial_days" },
    update: {},
    create: { key: "trial_days", value: "7" },
  });
  await prisma.siteConfig.upsert({
    where: { key: "cta_url" },
    update: {},
    create: { key: "cta_url", value: "" },
  });
  await prisma.siteConfig.upsert({
    where: { key: "site_name" },
    update: {},
    create: { key: "site_name", value: "Bad Girl Strength Club" },
  });
  await prisma.siteConfig.upsert({
    where: { key: "tagline" },
    update: {},
    create: { key: "tagline", value: "Build strength. Build confidence. Build your best life." },
  });

  const existingOwner = await prisma.adminUser.findFirst({ where: { role: "owner" } });
  if (!existingOwner) {
    const password = process.env.SEED_ADMIN_PASSWORD ?? "BGSCadmin2024!";
    await prisma.adminUser.create({
      data: {
        email: "admin@badgirlstrengthclub.com",
        passwordHash: bcrypt.hashSync(password, 10),
        role: "owner",
      },
    });
    console.log(`Seeded owner admin@badgirlstrengthclub.com`);
  }

  const existingBgscAdmin = await prisma.adminUser.findUnique({ where: { email: "admin@bgsc.com" } });
  if (!existingBgscAdmin) {
    await prisma.adminUser.create({
      data: {
        email: "admin@bgsc.com",
        passwordHash: bcrypt.hashSync("bgsc-admin-2024", 10),
        role: "team",
      },
    });
    console.log("Seeded admin@bgsc.com");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

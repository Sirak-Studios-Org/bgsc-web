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
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

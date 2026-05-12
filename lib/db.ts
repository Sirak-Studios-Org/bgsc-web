import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.BGSC_POSTGRES_PRISMA_URL;
  if (!connectionString) {
    throw new Error("BGSC_POSTGRES_PRISMA_URL is not set");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function getConfig(): Promise<Record<string, string>> {
  const rows = await prisma.siteConfig.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

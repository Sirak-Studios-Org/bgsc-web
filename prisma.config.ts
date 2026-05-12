import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.BGSC_POSTGRES_URL_NON_POOLING,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});

import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const dbUrl = process.env.BGSC_POSTGRES_URL_NON_POOLING ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: dbUrl,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});

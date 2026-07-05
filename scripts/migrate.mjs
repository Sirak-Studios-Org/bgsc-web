// Run `prisma migrate deploy` ONLY for production builds.
//
// Previously the build script migrated the production DB on every build,
// including preview/branch deploys — a bad migration on any branch could brick
// prod. Vercel sets VERCEL_ENV to "production" | "preview" | "development".
import { execSync } from "node:child_process";

const env = process.env.VERCEL_ENV;

// Outside Vercel (local), VERCEL_ENV is undefined — skip; devs run migrations manually.
if (env !== "production") {
  console.log(`[migrate] Skipping prisma migrate deploy (VERCEL_ENV=${env ?? "local"}).`);
  process.exit(0);
}

console.log("[migrate] Production build — running prisma migrate deploy…");
execSync("prisma migrate deploy", { stdio: "inherit" });

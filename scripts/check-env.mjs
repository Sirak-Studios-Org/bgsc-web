/**
 * Build-time guard on the public CTA destinations.
 *
 * Runs as the first step of `npm run build`, before `next build`, so a
 * deploy whose booking button would render dead fails instead of shipping.
 *
 * Background: on 2026-08-20 production rendered the "Book a Call" button
 * with href="" because NEXT_PUBLIC_CALENDLY_URL was never set in Vercel
 * and the code fell back to an empty string. Clicking it reloaded the
 * homepage. Nothing reported it.
 *
 * A guard placed inside a client component does not solve this: client
 * modules are compiled during `next build`, not executed, so the check
 * would only run in the visitor's browser and would blank the page.
 *
 * This script checks the destination the site will actually render, which
 * means the hardcoded default in lib/links.ts as well as any environment
 * override, so emptying either one fails the build.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX =
  "Fix the default in lib/links.ts, or correct NEXT_PUBLIC_CALENDLY_URL in " +
  "Vercel > bgsc project > Settings > Environment Variables.";

const failures = [];

function checkUrl(label, raw) {
  const value = (raw ?? "").trim();

  if (!value) {
    failures.push(`${label} is empty.`);
    return;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    failures.push(`${label} is not a valid URL: ${JSON.stringify(value)}.`);
    return;
  }

  if (parsed.protocol !== "https:") {
    failures.push(`${label} must use https. Received ${parsed.protocol}//.`);
  }
}

// 1. The default compiled into the site.
const linksSource = readFileSync(join(repoRoot, "lib/links.ts"), "utf8");
const defaultMatch = linksSource.match(
  /CALENDLY_URL_DEFAULT\s*=\s*\n?\s*"([^"]*)"/
);

if (!defaultMatch) {
  failures.push(
    "CALENDLY_URL_DEFAULT was not found in lib/links.ts. The Book a Call " +
      "button has no destination to fall back on."
  );
} else {
  checkUrl("CALENDLY_URL_DEFAULT in lib/links.ts", defaultMatch[1]);
}

// 2. The environment override, when one is present.
if ("NEXT_PUBLIC_CALENDLY_URL" in process.env) {
  checkUrl("NEXT_PUBLIC_CALENDLY_URL", process.env.NEXT_PUBLIC_CALENDLY_URL);
}

if (failures.length > 0) {
  console.error("\nBuild stopped. The Book a Call CTA would render dead.\n");
  for (const line of failures) console.error(`  - ${line}`);
  console.error(`\n  ${FIX}\n`);
  process.exit(1);
}

console.log("check-env: Book a Call resolves to a valid https destination.");

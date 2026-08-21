/**
 * Build-time environment guard.
 *
 * Runs as the first step of `npm run build`, before `next build`, so a
 * deploy that is missing a public CTA destination fails instead of
 * shipping a dead button.
 *
 * Background: on 2026-08-20 the production site rendered the "Book a Call"
 * button with href="" because NEXT_PUBLIC_CALENDLY_URL was never set in
 * Vercel. Clicking it reloaded the homepage. Nothing reported it, and the
 * booking CTA sat broken on the live site.
 *
 * A guard placed inside a client component does not solve this: client
 * modules are compiled during `next build`, not executed, so the check
 * would only run in the visitor's browser and would blank the page.
 */

const REQUIRED = [
  {
    name: "NEXT_PUBLIC_CALENDLY_URL",
    purpose: 'the "Book a Call" pre-enrollment booking CTA',
    fix: "Vercel > bgsc project > Settings > Environment Variables. Add it for Production, Preview, and Development, then redeploy.",
  },
];

const failures = [];

for (const item of REQUIRED) {
  const raw = (process.env[item.name] ?? "").trim();

  if (!raw) {
    failures.push(`${item.name} is not set. It supplies ${item.purpose}.`);
    continue;
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    failures.push(`${item.name} is not a valid URL: ${JSON.stringify(raw)}.`);
    continue;
  }

  if (parsed.protocol !== "https:") {
    failures.push(`${item.name} must use https. Received ${parsed.protocol}//.`);
  }
}

if (failures.length > 0) {
  console.error("\nBuild stopped. Required CTA configuration is missing.\n");
  for (const line of failures) console.error(`  - ${line}`);
  console.error(`\n  ${REQUIRED[0].fix}\n`);
  process.exit(1);
}

console.log("check-env: all required CTA destinations are set.");

/**
 * Outbound destinations for the public marketing site.
 *
 * Every public CTA resolves its destination here, and
 * `scripts/check-env.mjs` fails the build when a required destination is
 * missing, so a dead link cannot reach a live page.
 */

/** DOM id of the metabolic assessment card in TierSection. */
export const ASSESSMENT_ANCHOR_ID = "metabolic-assessment";

/**
 * Steph's metabolic assessment form. She owns this page and the Zapier
 * automation behind it, which emails the visitor their results and
 * notifies her of each submission.
 */
export const METABOLIC_ASSESSMENT_URL = (
  process.env.NEXT_PUBLIC_METABOLIC_ASSESSMENT_URL ??
  "https://incandescent-axolotl-2588fb.netlify.app/"
).trim();

/**
 * Steph's pre-enrollment call booking page.
 *
 * This value has no default on purpose. `scripts/check-env.mjs` fails the
 * build when it is unset, and that guard is what keeps a dead "Book a
 * Call" button off the live site. The empty fallback below is reached
 * only by a local dev server started without the variable.
 */
export const CALENDLY_URL = (process.env.NEXT_PUBLIC_CALENDLY_URL ?? "").trim();

/** Scroll the visitor to the metabolic assessment card. */
export function scrollToAssessment() {
  if (typeof document === "undefined") return;
  document
    .getElementById(ASSESSMENT_ANCHOR_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

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
 * The URL lives here rather than only in the Vercel dashboard. Before
 * 2026-08-20 it lived only in the dashboard, was never actually set, and
 * silently resolved to an empty string, so production rendered the "Book
 * a Call" button with href="" and clicking it reloaded the homepage. A
 * public URL that changes once a year does not belong in invisible
 * deploy state.
 *
 * `NEXT_PUBLIC_CALENDLY_URL` still overrides it for a temporary change.
 * `scripts/check-env.mjs` fails the build when either this default or
 * that override stops being a valid https URL.
 */
export const CALENDLY_URL_DEFAULT =
  "https://calendly.com/stephie-badgirlstrength";

export const CALENDLY_URL =
  (process.env.NEXT_PUBLIC_CALENDLY_URL ?? "").trim() || CALENDLY_URL_DEFAULT;

/** Scroll the visitor to the metabolic assessment card. */
export function scrollToAssessment() {
  if (typeof document === "undefined") return;
  document
    .getElementById(ASSESSMENT_ANCHOR_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

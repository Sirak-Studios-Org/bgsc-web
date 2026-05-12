import { getDb } from "./turso";
export type { SiteContent } from "./cms-types";
export { CMS_DEFAULTS } from "./cms-types";
import { SiteContent, CMS_DEFAULTS } from "./cms-types";

export async function getAllContent(): Promise<SiteContent> {
  try {
    const db = await getDb();
    const result = await db.execute("SELECT key, value FROM site_content");
    const stored: Record<string, unknown> = {};
    for (const row of result.rows) {
      try { stored[row.key as string] = JSON.parse(row.value as string); } catch { /* skip */ }
    }
    return {
      hero: (stored.hero as SiteContent["hero"]) ?? CMS_DEFAULTS.hero,
      video: (stored.video as SiteContent["video"]) ?? CMS_DEFAULTS.video,
      marquee: (stored.marquee as SiteContent["marquee"]) ?? CMS_DEFAULTS.marquee,
      scrollReveal: (stored.scrollReveal as SiteContent["scrollReveal"]) ?? CMS_DEFAULTS.scrollReveal,
      problems: (stored.problems as SiteContent["problems"]) ?? CMS_DEFAULTS.problems,
      method: (stored.method as SiteContent["method"]) ?? CMS_DEFAULTS.method,
      tiers: (stored.tiers as SiteContent["tiers"]) ?? CMS_DEFAULTS.tiers,
      culture: (stored.culture as SiteContent["culture"]) ?? CMS_DEFAULTS.culture,
      bocaHq: (stored.bocaHq as SiteContent["bocaHq"]) ?? CMS_DEFAULTS.bocaHq,
      objections: (stored.objections as SiteContent["objections"]) ?? CMS_DEFAULTS.objections,
      close: (stored.close as SiteContent["close"]) ?? CMS_DEFAULTS.close,
      stickyBar: (stored.stickyBar as SiteContent["stickyBar"]) ?? CMS_DEFAULTS.stickyBar,
    };
  } catch {
    return CMS_DEFAULTS;
  }
}

export async function setContent(key: keyof SiteContent, value: unknown) {
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, datetime('now'))
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    args: [key, JSON.stringify(value)],
  });
}

export async function getConfig(): Promise<Record<string, string>> {
  try {
    const db = await getDb();
    const result = await db.execute("SELECT key, value FROM site_config");
    return Object.fromEntries(result.rows.map(r => [r.key as string, r.value as string]));
  } catch {
    return { passion_app_url: "http://Badgirlstrengthclub.passion.io", trial_days: "7", cta_url: "", posthog_key: "" };
  }
}

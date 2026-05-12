import { prisma } from "./db";
import type { SiteContent } from "./cms-types";
import { CMS_DEFAULTS } from "./cms-types";

export type { SiteContent } from "./cms-types";
export { CMS_DEFAULTS } from "./cms-types";
export { getConfig } from "./db";

export async function getAllContent(): Promise<SiteContent> {
  try {
    const rows = await prisma.siteContent.findMany();
    const stored: Record<string, unknown> = {};
    for (const row of rows) {
      try { stored[row.key] = JSON.parse(row.value); } catch { /* skip */ }
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
  const json = JSON.stringify(value);
  await prisma.siteContent.upsert({
    where: { key },
    update: { value: json },
    create: { key, value: json },
  });
}

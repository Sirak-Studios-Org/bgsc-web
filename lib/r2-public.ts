// Client-safe: no AWS SDK import. Mirrors lib/r2.ts's publicUrl() for use in
// client components, where pulling in the S3 SDK would bloat the bundle.
export function publicUrl(key: string): string {
  return `${process.env.NEXT_PUBLIC_R2_URL ?? ""}/${key}`;
}

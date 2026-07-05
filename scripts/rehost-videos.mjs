/**
 * rehost-videos.mjs — one-time migration: upload course videos to Cloudflare R2
 * and repoint every lesson video widget away from Passion's (expired) CloudFront.
 *
 * USAGE
 *   1. Download the masters from Passion into a folder tree keyed by lesson slug:
 *
 *        videos/<course_slug>/<lesson_slug>/01.mp4
 *        videos/<course_slug>/<lesson_slug>/02.mp4   (2nd video in that lesson, etc)
 *
 *      Slugs come from video-inventory.csv. Files are matched to a lesson's
 *      widgets in filename order → widget sort_order. One video per lesson? Just
 *      drop a single file in the folder.
 *
 *   2. Dry run (writes nothing, prints the exact plan):
 *        DEST_URL=... CLOUDFLARE_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... \
 *        R2_SECRET_ACCESS_KEY=... R2_BUCKET_NAME=bgsc-content \
 *        node scripts/rehost-videos.mjs ./videos
 *
 *   3. Commit (uploads to R2 + updates the DB):
 *        node scripts/rehost-videos.mjs ./videos --commit
 *
 * Idempotent: re-running re-uploads and re-points the same keys.
 */
import fs from "fs";
import path from "path";
import pg from "pg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ROOT = process.argv[2] || "./videos";
const COMMIT = process.argv.includes("--commit");
const BUCKET = process.env.R2_BUCKET_NAME || "bgsc-content";
const CT = { ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm", ".m4v": "video/x-m4v" };

if (!fs.existsSync(ROOT)) { console.error(`Video root not found: ${ROOT}`); process.exit(1); }

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});

const db = new pg.Client({ connectionString: process.env.DEST_URL, ssl: { rejectUnauthorized: false } });
await db.connect();

// Current video widgets, grouped by lesson, in play order.
const { rows } = await db.query(`
  select w.id as widget_id, w.sort_order, w.content,
         l.slug as lesson_slug, c.slug as course_slug
  from widgets w
  join lessons l on l.id = w.lesson_id
  join courses c on c.id = l.course_id
  where w.type in ('video','clip')
  order by c.slug, l.slug, w.sort_order, w.id
`);
const byLesson = new Map();
for (const r of rows) {
  const key = `${r.course_slug}/${r.lesson_slug}`;
  if (!byLesson.has(key)) byLesson.set(key, []);
  byLesson.get(key).push(r);
}

let uploaded = 0, repointed = 0, missing = 0, extra = 0;
for (const [lessonKey, widgets] of byLesson) {
  const dir = path.join(ROOT, lessonKey);
  if (!fs.existsSync(dir)) { missing += widgets.length; console.log(`— no folder for ${lessonKey} (${widgets.length} widget(s) still unhosted)`); continue; }
  const files = fs.readdirSync(dir).filter(f => CT[path.extname(f).toLowerCase()]).sort();
  if (files.length > widgets.length) extra += files.length - widgets.length;

  for (let i = 0; i < widgets.length; i++) {
    const w = widgets[i];
    const file = files[i];
    if (!file) { missing++; console.log(`— missing file for widget ${w.widget_id} (${lessonKey} #${i + 1})`); continue; }
    const ext = path.extname(file).toLowerCase();
    const r2Key = `courses/${lessonKey}/${w.widget_id}${ext}`;
    console.log(`${COMMIT ? "↑" : "·"} ${lessonKey}/${file}  →  r2:${r2Key}  (widget ${w.widget_id})`);

    if (COMMIT) {
      const body = fs.readFileSync(path.join(dir, file));
      await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: r2Key, Body: body, ContentType: CT[ext] }));
      uploaded++;
      let content = {}; try { content = JSON.parse(w.content); } catch {}
      content.videoKey = r2Key;         // app resolves bare key via CDN_URL
      delete content.videoUrl;          // drop the dead CloudFront URL
      await db.query(`update widgets set content=$1 where id=$2`, [JSON.stringify(content), w.widget_id]);
      repointed++;
    }
  }
}

console.log(`\n${COMMIT ? "COMMITTED" : "DRY RUN"} — uploaded:${uploaded} repointed:${repointed} missing:${missing} extraFiles:${extra}`);
if (!COMMIT) console.log("Re-run with --commit to upload to R2 and update the database.");
await db.end();

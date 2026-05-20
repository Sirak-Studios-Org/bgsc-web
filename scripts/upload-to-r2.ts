import * as fs from "fs";
import * as path from "path";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET, uploadFile } from "../lib/r2";

const CONTENT_DIR = path.join(__dirname, "..", "content");

const CONTENT_TYPE_MAP: Record<string, string> = {
  ".mp4": "video/mp4",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function collectFiles(dir: string, results: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext in CONTENT_TYPE_MAP) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function keyExists(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const allFiles = collectFiles(CONTENT_DIR);
  const total = allFiles.length;
  console.log(`Found ${total} files to process`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < allFiles.length; i++) {
    const filePath = allFiles[i];
    const key = path.relative(CONTENT_DIR, filePath).split(path.sep).join("/");
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPE_MAP[ext];

    console.log(`Uploading ${i + 1} of ${total}: ${key}`);

    try {
      const exists = await keyExists(key);
      if (exists) {
        console.log(`  Skipped (already exists)`);
        skipped++;
        continue;
      }

      const buffer = fs.readFileSync(filePath);
      await uploadFile(key, buffer, contentType);
      uploaded++;
    } catch (err) {
      console.error(`  Error uploading ${key}:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`\nDone. Uploaded: ${uploaded}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

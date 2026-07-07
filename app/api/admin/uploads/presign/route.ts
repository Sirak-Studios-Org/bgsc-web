import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { signedUploadUrl, publicUrl } from "@/lib/r2";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES: Record<string, Record<string, string>> = {
  video: {
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "video/webm": ".webm",
    "video/x-m4v": ".m4v",
  },
  image: {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
  },
  pdf: {
    "application/pdf": ".pdf",
  },
};

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const limited = rateLimit(`presign:${session.adminId}`, 40, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many uploads, slow down." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const kind = body?.kind as string | undefined;
  const contentType = body?.contentType as string | undefined;

  if (!kind || !contentType || !ALLOWED_TYPES[kind]) {
    return NextResponse.json({ error: "Invalid kind." }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[kind][contentType];
  if (!ext) {
    return NextResponse.json({ error: `Unsupported content type for ${kind}.` }, { status: 400 });
  }

  const key = `${kind}s/${crypto.randomUUID()}${ext}`;
  const uploadUrl = await signedUploadUrl(key, contentType);

  return NextResponse.json({ uploadUrl, key, publicUrl: publicUrl(key) });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const cap = (v: unknown, n: number): string | null =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null;

export async function POST(req: NextRequest) {
  try {
    // Public write — throttle to prevent analytics-table spam/DoS.
    const rl = rateLimit(`events:${clientIp(req)}`, 60, 60_000);
    if (!rl.ok) return NextResponse.json({ ok: false }, { status: 429 });

    const { type, path, referrer, meta } = await req.json();
    const cappedType = cap(type, 64);
    if (!cappedType) return NextResponse.json({ ok: false }, { status: 400 });

    const country = req.headers.get("x-vercel-ip-country") ?? null;
    await prisma.event.create({
      data: {
        type: cappedType,
        path: cap(path, 512),
        referrer: cap(referrer, 512),
        country,
        meta: meta ? JSON.stringify(meta).slice(0, 2000) : null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

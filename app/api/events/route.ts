import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { type, path, referrer, meta } = await req.json();
    if (!type) return NextResponse.json({ ok: false }, { status: 400 });
    const country = req.headers.get("x-vercel-ip-country") ?? null;
    await prisma.event.create({
      data: {
        type,
        path: path ?? null,
        referrer: referrer ?? null,
        country,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

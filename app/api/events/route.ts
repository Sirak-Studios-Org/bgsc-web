import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/turso";

export async function POST(req: NextRequest) {
  try {
    const { type, path, referrer, meta } = await req.json();
    if (!type) return NextResponse.json({ ok: false }, { status: 400 });
    const country = req.headers.get("x-vercel-ip-country") ?? null;
    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO events (type, path, referrer, country, meta) VALUES (?, ?, ?, ?, ?)`,
      args: [type, path ?? null, referrer ?? null, country, meta ? JSON.stringify(meta) : null],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

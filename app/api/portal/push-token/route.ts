import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { token, platform } = await req.json() as { token: string; platform: string };
  await prisma.siteConfig.upsert({
    where: { key: `push_token_${session.userId}` },
    create: { key: `push_token_${session.userId}`, value: JSON.stringify({ token, platform }) },
    update: { value: JSON.stringify({ token, platform }) },
  });
  return NextResponse.json({ ok: true });
}

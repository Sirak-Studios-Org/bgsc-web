import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const rows = await prisma.siteConfig.findMany();
  return NextResponse.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = await req.json() as Record<string, string>;
    await prisma.$transaction(
      Object.entries(body).map(([key, value]) =>
        prisma.siteConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        }),
      ),
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[config/patch]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

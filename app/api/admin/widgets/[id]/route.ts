import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const widgetId = parseInt(id);
  if (isNaN(widgetId)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (body?.type !== undefined) data.type = body.type;
  if (body?.sortOrder !== undefined) data.sortOrder = body.sortOrder;
  if (body?.content !== undefined) data.content = JSON.stringify(body.content);

  const widget = await prisma.widget.update({ where: { id: widgetId }, data });
  return NextResponse.json({ widget });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const widgetId = parseInt(id);
  if (isNaN(widgetId)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  await prisma.widget.delete({ where: { id: widgetId } });
  return NextResponse.json({ ok: true });
}

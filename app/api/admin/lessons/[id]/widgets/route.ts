import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

const VALID_TYPES = new Set(["video", "text", "timer", "question"]);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const lessonId = parseInt(id);
  if (isNaN(lessonId)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const body = await req.json().catch(() => null);
  const type = body?.type as string | undefined;
  if (!type || !VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid widget type." }, { status: 400 });
  }

  const count = await prisma.widget.count({ where: { lessonId } });
  const widget = await prisma.widget.create({
    data: {
      lessonId,
      type,
      sortOrder: count,
      content: JSON.stringify(body?.content ?? {}),
    },
  });
  return NextResponse.json({ widget });
}

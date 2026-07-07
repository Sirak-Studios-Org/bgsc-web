import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const lessonId = parseInt(id);
  if (isNaN(lessonId)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { widgets: { orderBy: { sortOrder: "asc" } }, course: { select: { id: true, title: true, slug: true } } },
  });
  if (!lesson) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ lesson });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const lessonId = parseInt(id);
  if (isNaN(lessonId)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.isPublished !== undefined) data.isPublished = body.isPublished;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
  if (body.durationMinutes !== undefined) data.durationMinutes = body.durationMinutes;
  if (body.lessonType !== undefined) data.lessonType = body.lessonType;
  if (body.completionXp !== undefined) data.completionXp = body.completionXp;
  if (body.dripDays !== undefined) data.dripDays = body.dripDays;
  if (body.coverImageKey !== undefined) data.coverImageKey = body.coverImageKey;

  const lesson = await prisma.lesson.update({ where: { id: lessonId }, data });
  return NextResponse.json({ lesson });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const lessonId = parseInt(id);
  if (isNaN(lessonId)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  await prisma.lesson.delete({ where: { id: lessonId } });
  return NextResponse.json({ ok: true });
}

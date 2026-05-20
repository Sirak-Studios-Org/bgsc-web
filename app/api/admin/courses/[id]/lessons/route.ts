import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const courseId = parseInt(id);
  if (isNaN(courseId)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const body = await req.json();
  const title = (body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });

  const slug =
    body.slug?.trim() ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const existing = await prisma.lesson.count({ where: { courseId } });

  const lesson = await prisma.lesson.create({
    data: {
      courseId,
      slug,
      title,
      durationMinutes: body.durationMinutes ?? 0,
      sortOrder: body.sortOrder ?? existing,
      isPublished: body.isPublished ?? false,
      lessonType: body.lessonType ?? "lesson",
      completionXp: body.completionXp ?? 50,
    },
  });

  return NextResponse.json({ lesson }, { status: 201 });
}

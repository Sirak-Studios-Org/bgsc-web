import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const courseId = parseInt(id);
  if (isNaN(courseId)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { orderBy: { sortOrder: "asc" } } },
  });
  if (!course) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({
    course: {
      ...course,
      planRequired: JSON.parse(course.planRequired),
    },
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const courseId = parseInt(id);
  if (isNaN(courseId)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.isPublished !== undefined) data.isPublished = body.isPublished;
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
  if (body.planRequired !== undefined)
    data.planRequired = JSON.stringify(body.planRequired);

  const course = await prisma.course.update({ where: { id: courseId }, data });
  return NextResponse.json({ course });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const courseId = parseInt(id);
  if (isNaN(courseId)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  await prisma.course.delete({ where: { id: courseId } });
  return NextResponse.json({ ok: true });
}

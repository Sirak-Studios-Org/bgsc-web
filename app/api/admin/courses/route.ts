import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const courses = await prisma.course.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { lessons: true } } },
  });

  return NextResponse.json({
    courses: courses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      planRequired: JSON.parse(c.planRequired),
      isPublished: c.isPublished,
      sortOrder: c.sortOrder,
      lessonCount: c._count.lessons,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();
  const title = (body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });

  const slug =
    body.slug?.trim() ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const course = await prisma.course.create({
    data: {
      slug,
      title,
      description: body.description ?? "",
      planRequired: JSON.stringify(body.planRequired ?? []),
      isPublished: body.isPublished ?? false,
      sortOrder: body.sortOrder ?? 0,
    },
  });

  return NextResponse.json({ course }, { status: 201 });
}

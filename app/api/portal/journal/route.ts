import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { widgetId, lessonId, value } = await req.json();

  // Check if it's a PR (simple text comparison for now; numeric comparison if possible)
  const last = await prisma.journalEntry.findFirst({
    where: { userId: session.userId, widgetId },
    orderBy: { entryDate: "desc" },
  });

  let isPr = false;
  if (last) {
    try {
      const lastVal = JSON.parse(last.value);
      const newText = value?.text ?? "";
      const lastText = lastVal?.text ?? "";
      const newNum = parseFloat(newText);
      const lastNum = parseFloat(lastText);
      if (!isNaN(newNum) && !isNaN(lastNum) && newNum > lastNum) isPr = true;
    } catch { /* not numeric, no PR check */ }
  }

  const entry = await prisma.journalEntry.create({
    data: { userId: session.userId, widgetId, lessonId, value: JSON.stringify(value), isPr },
  });

  return NextResponse.json({ success: true, isPr, entryId: entry.id });
}

export async function GET(req: NextRequest) {
  const session = await getMemberSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const widgetId = parseInt(url.searchParams.get("widgetId") ?? "0");
  if (!widgetId) return NextResponse.json({ entries: [] });

  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.userId, widgetId },
    orderBy: { entryDate: "desc" },
    take: 10,
  });

  return NextResponse.json({ entries });
}

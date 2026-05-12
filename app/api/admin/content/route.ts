import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllContent, setContent } from "@/lib/cms";
import { SiteContent } from "@/lib/cms-types";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const content = await getAllContent();
  return NextResponse.json(content);
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { key, value } = await req.json() as { key: keyof SiteContent; value: unknown };
    await setContent(key, value);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[content/patch]", err);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
}

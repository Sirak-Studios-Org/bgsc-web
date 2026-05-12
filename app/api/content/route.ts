import { NextResponse } from "next/server";
import { getAllContent } from "@/lib/cms";

export const revalidate = 60;

export async function GET() {
  const content = await getAllContent();
  return NextResponse.json(content);
}

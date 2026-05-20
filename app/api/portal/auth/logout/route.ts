import { NextResponse } from "next/server";
import { MEMBER_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(MEMBER_COOKIE);
  return res;
}

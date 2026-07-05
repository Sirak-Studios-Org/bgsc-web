import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getMemberSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getMemberSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are required." }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !bcrypt.compareSync(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: bcrypt.hashSync(newPassword, 10) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[portal/auth/change-password]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

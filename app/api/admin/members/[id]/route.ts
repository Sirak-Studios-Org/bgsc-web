import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const memberId = parseInt(id, 10);
  const body = await req.json();

  const update: Record<string, unknown> = {};

  if (body.isActive !== undefined) update.isActive = Boolean(body.isActive);
  if (body.trialEnd) update.trialEnd = new Date(body.trialEnd);
  if (body.name) update.name = body.name.trim();
  if (body.email) update.email = body.email.trim().toLowerCase();

  if (body.password) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    update.passwordHash = bcrypt.hashSync(body.password, 10);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: memberId },
    data: update,
    select: { id: true, name: true, email: true, trialEnd: true, isActive: true },
  });

  return NextResponse.json({ success: true, member: user });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const memberId = parseInt(id, 10);

  // Soft delete: a hard delete throws on the many Restrict-FK relations
  // (subscription, posts, streaks, progress…) and destroys billing history.
  // Deactivating blocks login and hides the member without data loss.
  await prisma.user.update({
    where: { id: memberId },
    data: { isActive: false },
  });
  return NextResponse.json({ success: true });
}

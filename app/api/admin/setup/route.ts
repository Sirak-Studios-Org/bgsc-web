import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function GET() {
  const count = await prisma.adminUser.count();
  return NextResponse.json({ needsSetup: count === 0 });
}

export async function POST(req: NextRequest) {
  const setupSecret = process.env.ADMIN_SETUP_SECRET;

  const count = await prisma.adminUser.count();
  if (count > 0) {
    return NextResponse.json({ error: "Admin already configured." }, { status: 409 });
  }

  const { email, password, secret } = await req.json();

  if (setupSecret && secret?.trim() !== setupSecret?.trim()) {
    return NextResponse.json({ error: "Invalid setup secret." }, { status: 403 });
  }

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Email and password (min 8 chars) required." }, { status: 400 });
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const admin = await prisma.adminUser.create({
    data: { email: email.trim().toLowerCase(), passwordHash, role: "owner" },
  });

  return NextResponse.json({ success: true, id: admin.id });
}

// Reset admin credentials — requires ADMIN_SETUP_SECRET
export async function PATCH(req: NextRequest) {
  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json({ error: "ADMIN_SETUP_SECRET not configured." }, { status: 500 });
  }

  const { email, password, secret } = await req.json();

  if (secret?.trim() !== setupSecret?.trim()) {
    return NextResponse.json({ error: "Invalid setup secret." }, { status: 403 });
  }

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Email and password (min 8 chars) required." }, { status: 400 });
  }

  const passwordHash = bcrypt.hashSync(password, 12);

  const existing = await prisma.adminUser.findFirst();
  if (existing) {
    await prisma.adminUser.update({
      where: { id: existing.id },
      data: { email: email.trim().toLowerCase(), passwordHash },
    });
  } else {
    await prisma.adminUser.create({
      data: { email: email.trim().toLowerCase(), passwordHash, role: "owner" },
    });
  }

  return NextResponse.json({ success: true });
}

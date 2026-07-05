import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

function secretMatches(provided: unknown, expected: string): boolean {
  if (typeof provided !== "string") return false;
  const a = Buffer.from(provided.trim());
  const b = Buffer.from(expected.trim());
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET() {
  const count = await prisma.adminUser.count();
  return NextResponse.json({ needsSetup: count === 0 });
}

// First-run admin creation ONLY. Refuses once an admin exists, and always
// requires ADMIN_SETUP_SECRET (fail closed if the secret isn't configured).
// The old PATCH credential-reset backdoor has been removed — password recovery
// for a locked-out admin is an operator/DB task, not a public HTTP endpoint.
export async function POST(req: NextRequest) {
  const rl = rateLimit(`admin-setup:${clientIp(req)}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json({ error: "Setup is disabled." }, { status: 403 });
  }

  const count = await prisma.adminUser.count();
  if (count > 0) {
    return NextResponse.json({ error: "Admin already configured." }, { status: 409 });
  }

  const { email, password, secret } = await req.json();

  if (!secretMatches(secret, setupSecret)) {
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

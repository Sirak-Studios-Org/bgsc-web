import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Fail closed: never fall back to a public/default secret. A missing JWT_SECRET
// must break signing/verification loudly rather than silently allow token forgery.
function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET is not set (or too short). Refusing to sign/verify tokens.");
  }
  return s;
}

const COOKIE = "bgsc_admin";

export type AdminPayload = {
  adminId: number;
  email: string;
  role: string;
};

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, getSecret()) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export const ADMIN_COOKIE = COOKIE;

// ── Member auth ──────────────────────────────────────────
export const MEMBER_COOKIE = "bgsc_session";

export type MemberPayload = {
  userId: number;
  email: string;
  name: string;
  plan: "club" | "premium" | "vip" | "trial" | "free";
  planExpiry: string | null; // ISO string
  onboardingComplete: boolean;
};

export function signMemberToken(payload: MemberPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "30d" });
}

export function verifyMemberToken(token: string): MemberPayload | null {
  try {
    return jwt.verify(token, getSecret()) as MemberPayload;
  } catch {
    return null;
  }
}

export async function getMemberSession(): Promise<MemberPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  return verifyMemberToken(token);
}

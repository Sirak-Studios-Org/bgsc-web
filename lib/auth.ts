import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET ?? "bgsc-dev-secret-change-in-production";
const COOKIE = "bgsc_admin";

export type AdminPayload = {
  adminId: number;
  email: string;
  role: string;
};

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, SECRET) as AdminPayload;
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
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyMemberToken(token: string): MemberPayload | null {
  try {
    return jwt.verify(token, SECRET) as MemberPayload;
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

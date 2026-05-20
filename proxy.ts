import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "bgsc_admin";
const MEMBER_COOKIE = "bgsc_session";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (
    pathname.startsWith("/portal") &&
    pathname !== "/portal/login" &&
    pathname !== "/portal/register" &&
    !pathname.startsWith("/portal/login") &&
    !pathname.startsWith("/portal/register")
  ) {
    const token = req.cookies.get(MEMBER_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL("/portal/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path+", "/portal/:path+"],
};

import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // --- ADMIN MIDDLEWARE ---
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("adminToken")?.value;

    const publicPaths = [
      "/admin/account/login",
      "/admin/account/register",
      "/admin/account/forgot-password",
      "/admin/account/otp-password",
      "/admin/account/initial",
    ];

    if (token && publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/admin/category", req.url));
    }

    if (!token && !publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/admin/account/login", req.url));
    }

    return NextResponse.next();
  }

  // --- CLIENT MIDDLEWARE ---
  if (pathname.startsWith("/account")) {
    const token = req.cookies.get("clientToken")?.value;

    const publicPaths = [
      "/account/login",
      "/account/register",
      "/account/forgot-password",
      "/account/otp-password",
      "/account/initial",
    ];

    if (token && publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (!token && !publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/account/login", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};

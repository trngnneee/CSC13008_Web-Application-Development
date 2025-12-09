import { NextResponse } from "next/server";

const createIsPublic = (exact, wildcard) => (pathname) => {
  if (exact.includes(pathname)) return true;
  if (wildcard.some(prefix => pathname.startsWith(prefix))) return true;
  return false;
};

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // ----- ADMIN -----
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("adminToken")?.value;

    const exactPublic = [
      "/admin/account/login",
      "/admin/account/register",
      "/admin/account/forgot-password",
      "/admin/account/otp-password",
      "/admin/account/initial",
    ];

    const isPublic = createIsPublic(exactPublic, []);

    if (token && isPublic(pathname)) {
      return NextResponse.redirect(new URL("/admin/category", req.url));
    }

    if (!token && !isPublic(pathname)) {
      return NextResponse.redirect(new URL("/admin/account/login", req.url));
    }

    return NextResponse.next();
  }

  // ----- CLIENT -----
  if (pathname.startsWith("/")) {
    const token = req.cookies.get("clientToken")?.value;

    const exactPublic = [
      "/",
      "/search",
      "/account/login",
      "/account/register",
      "/account/forgot-password",
      "/account/otp-password",
      "/account/initial",
    ];

    const wildcardPublic = [
      "/product/",
      "/category/",
    ];

    const isPublic = createIsPublic(exactPublic, wildcardPublic);

    if (token && isPublic(pathname) && pathname.startsWith("/account")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (!token && !isPublic(pathname)) {
      return NextResponse.redirect(new URL("/account/login", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/category/:path*",
    "/product/:path*",
    "/me/:path*",
    "/",
  ],
};
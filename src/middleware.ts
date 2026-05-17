import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: "",
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const { pathname } = req.nextUrl;
  
  // Validate and refresh session using getUser() instead of getSession()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("Middleware auth check:", {
    pathname,
    hasUser: !!user,
    userEmail: user?.email,
    error: error?.message,
  });

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/verify/property",
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // If route is public, allow access
  if (isPublicRoute) {
    return res;
  }

  // Protected routes - require authentication
  const protectedPaths = [
    "/verify/identity",
    "/verify/ownership",
    "/cases",
    "/admin",
  ];

  const isProtectedRoute = protectedPaths.some((route) =>
    pathname.startsWith(route)
  );

  // If accessing protected route without user, redirect to login
  if (isProtectedRoute && !user) {
    console.log("Redirecting to login - no user found for protected route:", pathname);
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin routes require @xtrust.com email
  if (pathname.startsWith("/admin") && user) {
    const userEmail = user.email || "";
    if (!userEmail.endsWith("@xtrust.com")) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
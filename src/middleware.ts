import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("🔍 Middleware - Path:", pathname);

  // Skip middleware for auth pages to prevent redirect loops
  if (pathname.startsWith("/auth/")) {
    console.log("✅ Middleware - Skipping auth page");
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll();
          console.log("🍪 Middleware - Cookies found:", cookies.length);
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log("🍪 Middleware - Setting cookies:", cookiesToSet.length);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh the session if needed
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  console.log("👤 Middleware - User check:", {
    hasUser: !!user,
    email: user?.email,
    error: error?.message
  });

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/verify/property",
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // If route is public, allow access
  if (isPublicRoute) {
    console.log("✅ Middleware - Public route, allowing access");
    return response;
  }

  // Protected routes - require authentication
  const protectedPaths = [
    "/dashboard",
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
    console.log("⛔ Middleware - Protected route, no user, redirecting to login");
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin routes require @xtrust.com email
  if (pathname.startsWith("/admin") && user) {
    const userEmail = user.email || "";
    if (!userEmail.endsWith("@xtrust.com")) {
      console.log("⛔ Middleware - Admin route, non-admin user, redirecting");
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }
  }

  console.log("✅ Middleware - Access granted");
  return response;
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
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection and role-based access control
 *
 * Note: Most auth protection is handled client-side via RequireAuth/RequireRole components
 * This middleware provides basic routing and could be extended for server-side checks
 *
 * Role hierarchy:
 * - society_admin: Can manage assigned societies
 * - admin: Can manage all societies
 * - super_admin: Full system access
 */
export async function middleware(request: NextRequest) {
  // For now, we'll handle auth protection on the client side
  // This middleware just ensures proper routing
  return NextResponse.next();
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


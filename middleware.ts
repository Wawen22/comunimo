import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/api/middleware';

/**
 * Middleware for route protection and role-based access control
 *
 * This middleware:
 * 1. Refreshes the Supabase auth token on every request
 * 2. Passes the refreshed token to Server Components
 * 3. Ensures auth state is consistent across client and server
 *
 * Role hierarchy:
 * - society_admin: Can manage assigned societies
 * - admin: Can manage all societies
 * - super_admin: Full system access
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
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


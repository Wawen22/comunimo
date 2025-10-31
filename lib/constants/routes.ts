/**
 * Application route constants
 */

export const ROUTES = {
  HOME: '/',
  
  // Auth routes
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },

  // Dashboard routes
  DASHBOARD: {
    HOME: '/dashboard',
    PROFILE: '/dashboard/profile',
    SETTINGS: '/dashboard/settings',
  },

  // Admin routes
  ADMIN: {
    HOME: '/admin',
    USERS: '/admin/users',
    SOCIETIES: '/admin/societies',
    SETTINGS: '/admin/settings',
  },

  // Public routes
  PUBLIC: {
    ABOUT: '/about',
    CONTACT: '/contact',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    EVENTS: '/eventi',
  },
} as const;

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes: string[] = [
    ROUTES.HOME,
    ROUTES.AUTH.LOGIN,
    ROUTES.AUTH.REGISTER,
    ROUTES.AUTH.FORGOT_PASSWORD,
    ROUTES.AUTH.RESET_PASSWORD,
    '/forgot-password', // Add direct path
    '/reset-password', // Add direct path
    ROUTES.PUBLIC.ABOUT,
    ROUTES.PUBLIC.CONTACT,
    ROUTES.PUBLIC.PRIVACY,
    ROUTES.PUBLIC.TERMS,
    ROUTES.PUBLIC.EVENTS,
  ];

  return publicRoutes.includes(pathname);
}

/**
 * Check if a route is an admin route
 */
export function isAdminRoute(pathname: string): boolean {
  const adminRoutes: string[] = ['/admin'];
  return adminRoutes.some((route) => pathname.startsWith(route));
}

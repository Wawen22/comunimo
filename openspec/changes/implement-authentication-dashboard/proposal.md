# Proposal: Implement Authentication & Dashboard - Phase 2

## Why

Phase 1 established the technical foundation (Next.js 14, TypeScript, Tailwind, database schema). Phase 2 implements the core user-facing functionality that enables all subsequent features.

**Current State:**
- ✅ Next.js 14 project infrastructure ready
- ✅ Supabase database schema deployed
- ✅ Admin user created
- ❌ No authentication system
- ❌ No protected routes
- ❌ No dashboard UI
- ❌ No user management

**Problems to Solve:**
- Users cannot register or login
- No way to protect sensitive routes
- No role-based access control
- No dashboard interface for authenticated users
- No user profile management

**Opportunity:**
- Implement complete authentication flow with Supabase Auth
- Create secure, role-based authorization system
- Build responsive dashboard layout that serves as foundation for all features
- Enable user profile management
- Establish patterns for all future authenticated features

## What Changes

This proposal introduces **4 new capabilities**:

### 1. **authentication** (NEW)
- User registration with email/password
- Email/password login with Supabase Auth
- Logout functionality
- Password reset flow (forgot password, reset with token)
- Session management and persistence
- Email verification (optional for Phase 2)

### 2. **authorization** (NEW)
- Role-based access control (user, admin, super_admin)
- Next.js middleware for route protection
- Permission checking utilities
- Integration with Supabase RLS policies
- Redirect logic for unauthorized access
- Auth state management

### 3. **dashboard-layout** (NEW)
- Responsive sidebar navigation
- Header with user menu and logout
- Route groups for different sections:
  - `(auth)` - Public auth pages (login, register)
  - `(dashboard)` - Protected dashboard pages
  - `(admin)` - Admin-only pages
- Mobile-responsive design with hamburger menu
- Loading states and error boundaries
- Breadcrumb navigation

### 4. **user-profile** (NEW)
- View user profile information
- Edit profile (name, email, phone, etc.)
- Change password functionality
- Account settings
- Profile data validation with Zod

## Impact

### Affected Specs
- **NEW**: `authentication` - User authentication flows
- **NEW**: `authorization` - Role-based access control
- **NEW**: `dashboard-layout` - Dashboard UI structure
- **NEW**: `user-profile` - User profile management

### Affected Code
New files to be created:
- `middleware.ts` - Route protection middleware
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/register/page.tsx` - Registration page
- `app/(auth)/forgot-password/page.tsx` - Password reset request
- `app/(auth)/reset-password/page.tsx` - Password reset form
- `app/(dashboard)/dashboard/page.tsx` - Main dashboard
- `app/(dashboard)/dashboard/layout.tsx` - Dashboard layout
- `app/(dashboard)/profile/page.tsx` - User profile
- `components/forms/LoginForm.tsx` - Login form component
- `components/forms/RegisterForm.tsx` - Registration form component
- `components/forms/ProfileForm.tsx` - Profile edit form
- `components/layout/Sidebar.tsx` - Dashboard sidebar
- `components/layout/Header.tsx` - Dashboard header
- `components/layout/UserMenu.tsx` - User dropdown menu
- `lib/hooks/useAuth.ts` - Authentication hook
- `lib/hooks/useUser.ts` - User data hook
- `actions/auth.ts` - Server actions for auth
- `actions/profile.ts` - Server actions for profile
- Additional shadcn/ui components: Form, Dialog, Toast, Avatar, DropdownMenu

Modified files:
- `lib/api/supabase.ts` - Enhanced with auth helpers (already has basic structure)
- `types/database.ts` - Already has Profile type

### Dependencies
- **Depends on**: Phase 1 (setup-nextjs-phase1) - COMPLETE ✅
- **Blocks**: All future features (societies, members, payments, events)

### Breaking Changes
None - this is new functionality.

### Migration Path
Not applicable - new features.

## Timeline

**Estimated effort**: 1-2 weeks (Sprint 2)

**Implementation Stages:**
- **Stage 1** (2-3 days): Core authentication (login, register, logout)
- **Stage 2** (1-2 days): Authorization middleware and protected routes
- **Stage 3** (2-3 days): Dashboard layout with navigation
- **Stage 4** (1-2 days): User profile management

## Success Criteria

- [ ] Users can register with email/password
- [ ] Users can login with valid credentials
- [ ] Users can logout
- [ ] Password reset flow works end-to-end
- [ ] Unauthenticated users are redirected to login
- [ ] Protected routes check authentication
- [ ] Role-based access control works (user/admin/super_admin)
- [ ] Dashboard displays after successful login
- [ ] Sidebar navigation works on desktop and mobile
- [ ] User can view their profile
- [ ] User can edit their profile information
- [ ] User can change their password
- [ ] All TypeScript checks pass
- [ ] All ESLint checks pass
- [ ] Build completes without errors
- [ ] Forms have proper validation with Zod
- [ ] Error messages are user-friendly
- [ ] Loading states are shown during async operations

## Risks & Mitigations

**Risk**: Supabase Auth configuration complexity
- **Mitigation**: Follow Supabase Auth documentation, use official examples, test thoroughly

**Risk**: Middleware performance impact
- **Mitigation**: Keep middleware logic minimal, cache auth checks where possible

**Risk**: Session management edge cases (expired tokens, concurrent sessions)
- **Mitigation**: Use Supabase's built-in session refresh, handle errors gracefully

**Risk**: Mobile responsiveness issues with sidebar
- **Mitigation**: Test on multiple devices, use Tailwind responsive utilities, implement hamburger menu

**Risk**: RLS policies not matching middleware logic
- **Mitigation**: Keep authorization logic consistent, document policies, test with different roles

## References

- [Phase 1 Proposal](../setup-nextjs-phase1/proposal.md)
- [Database Schema](../../refactoring-nextjs/comunimo-next/supabase/schema.sql)
- [Database Types](../../refactoring-nextjs/comunimo-next/types/database.ts)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [shadcn/ui Form Component](https://ui.shadcn.com/docs/components/form)


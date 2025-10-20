# Design Document: Authentication & Dashboard

## Context

ComUniMo requires a secure authentication system integrated with Supabase Auth and a responsive dashboard layout that serves as the foundation for all authenticated features. This design covers the technical decisions for implementing authentication, authorization, and the dashboard UI.

**Stakeholders:**
- End users (società sportive, administrators)
- Development team
- System administrators

**Constraints:**
- Must use Supabase Auth (already configured)
- Must support 3 roles: user, admin, super_admin
- Must be mobile-responsive
- Must integrate with existing RLS policies
- Must follow Next.js 14 App Router patterns

## Goals / Non-Goals

### Goals
- ✅ Secure authentication with email/password
- ✅ Role-based access control (RBAC)
- ✅ Protected routes with middleware
- ✅ Responsive dashboard layout
- ✅ User profile management
- ✅ Session persistence across page reloads
- ✅ User-friendly error messages
- ✅ Loading states for async operations

### Non-Goals
- ❌ OAuth providers (Google, GitHub) - Future phase
- ❌ Two-factor authentication (2FA) - Future phase
- ❌ Magic link authentication - Future phase
- ❌ Email verification - Optional for Phase 2
- ❌ Advanced admin features - Future phases
- ❌ User impersonation - Future phase

## Decisions

### 1. Authentication Provider: Supabase Auth

**Decision**: Use Supabase Auth for all authentication operations.

**Rationale**:
- Already configured in Phase 1
- Integrates seamlessly with Supabase database and RLS
- Provides JWT tokens for stateless authentication
- Handles session refresh automatically
- Built-in security best practices

**Alternatives Considered**:
- NextAuth.js: More flexible but adds complexity, requires separate session management
- Custom JWT: Too much work, security risks, reinventing the wheel

**Implementation**:
```typescript
// lib/api/supabase.ts - Already has basic structure
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}
```

### 2. Route Protection: Next.js Middleware

**Decision**: Use Next.js middleware for route protection.

**Rationale**:
- Runs on Edge runtime (fast)
- Executes before page renders (no flash of protected content)
- Can redirect unauthenticated users before React loads
- Centralized authorization logic

**Alternatives Considered**:
- Client-side checks: Causes flash of content, not secure
- Server Components only: Requires checks in every component, not DRY
- HOC pattern: Works but middleware is more performant

**Implementation**:
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check role-based permissions
  if (isAdminRoute(request.nextUrl.pathname)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (!['admin', 'super_admin'].includes(profile?.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### 3. Session Management: Supabase Client-Side Sessions

**Decision**: Use Supabase's built-in session management with automatic refresh.

**Rationale**:
- Handles token refresh automatically
- Stores session in localStorage (persistent)
- Provides session events for state updates
- No need for custom session logic

**Implementation**:
```typescript
// lib/hooks/useAuth.ts
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return { session, user: session?.user };
}
```

### 4. Form Validation: React Hook Form + Zod

**Decision**: Use React Hook Form with Zod schemas for all forms.

**Rationale**:
- Already installed in Phase 1
- Type-safe validation with TypeScript inference
- Excellent performance (minimal re-renders)
- Great DX with shadcn/ui Form component

**Implementation**:
```typescript
// Zod schema
const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password deve essere almeno 6 caratteri'),
});

// Form component
const form = useForm<z.infer<typeof loginSchema>>({
  resolver: zodResolver(loginSchema),
});
```

### 5. Dashboard Layout: Sidebar + Header Pattern

**Decision**: Use sidebar navigation with collapsible mobile menu.

**Rationale**:
- Common pattern, users are familiar
- Works well on desktop and mobile
- Easy to add new navigation items
- Supports nested navigation

**Structure**:
```
app/(dashboard)/
├── dashboard/
│   ├── layout.tsx          # Sidebar + Header wrapper
│   ├── page.tsx            # Dashboard home
│   ├── profile/
│   │   └── page.tsx        # User profile
│   ├── societies/          # Future
│   ├── members/            # Future
│   └── ...
```

**Responsive Behavior**:
- Desktop (≥1024px): Sidebar always visible
- Tablet (768-1023px): Collapsible sidebar
- Mobile (<768px): Hamburger menu with overlay

### 6. Role-Based Access Control: Database + Middleware

**Decision**: Store roles in `profiles` table, enforce with RLS + middleware.

**Rationale**:
- Single source of truth (database)
- RLS policies provide defense in depth
- Middleware prevents unauthorized page access
- Easy to audit and modify

**Role Hierarchy**:
- `user`: Basic access, can view own data
- `admin`: Can manage societies, members, events
- `super_admin`: Full access, can manage other admins

**Implementation**:
```typescript
// Check in middleware
const hasPermission = (userRole: string, requiredRole: string) => {
  const hierarchy = { user: 0, admin: 1, super_admin: 2 };
  return hierarchy[userRole] >= hierarchy[requiredRole];
};
```

### 7. Error Handling: Toast Notifications

**Decision**: Use shadcn/ui Toast component for error/success messages.

**Rationale**:
- Non-intrusive
- Accessible
- Consistent UX
- Auto-dismiss option

**Implementation**:
```typescript
// Show error
toast({
  title: "Errore",
  description: "Email o password non validi",
  variant: "destructive",
});

// Show success
toast({
  title: "Successo",
  description: "Login effettuato con successo",
});
```

## Risks / Trade-offs

### Risk: Middleware Performance
- **Impact**: Middleware runs on every request
- **Mitigation**: Keep logic minimal, cache role checks, use Edge runtime
- **Trade-off**: Slight latency vs security and UX

### Risk: Session Expiry Edge Cases
- **Impact**: User might lose work if session expires during form submission
- **Mitigation**: Supabase auto-refreshes tokens, show warning before expiry
- **Trade-off**: Complexity vs user experience

### Risk: RLS Policy Mismatch
- **Impact**: Middleware allows access but RLS blocks database query
- **Mitigation**: Keep authorization logic consistent, document policies
- **Trade-off**: Duplication vs defense in depth

### Risk: Mobile Sidebar UX
- **Impact**: Sidebar might be cumbersome on small screens
- **Mitigation**: Hamburger menu, swipe gestures, test on real devices
- **Trade-off**: Desktop-optimized vs mobile-optimized

## Migration Plan

### Phase 2.1: Authentication Core (Days 1-3)
1. Create auth forms (Login, Register, Reset Password)
2. Implement Server Actions for auth operations
3. Add auth pages to `(auth)` route group
4. Test authentication flows
5. Add error handling and validation

### Phase 2.2: Authorization Middleware (Days 4-5)
1. Create middleware.ts
2. Implement route protection logic
3. Add role-based checks
4. Test with different user roles
5. Handle edge cases (expired sessions, etc.)

### Phase 2.3: Dashboard Layout (Days 6-8)
1. Create dashboard layout component
2. Implement Sidebar with navigation
3. Implement Header with user menu
4. Add responsive behavior
5. Test on multiple screen sizes

### Phase 2.4: User Profile (Days 9-10)
1. Create profile view page
2. Create profile edit form
3. Implement change password functionality
4. Add Server Actions for profile updates
5. Test profile management flows

### Rollback Plan
If critical issues arise:
1. Disable middleware (allow all access temporarily)
2. Redirect all users to maintenance page
3. Fix issues in development
4. Re-deploy with fixes
5. Re-enable middleware

## Open Questions

- ✅ **Q**: Should we implement email verification in Phase 2?
  - **A**: Optional - can be added later without breaking changes

- ✅ **Q**: Should we add "Remember Me" functionality?
  - **A**: Supabase handles this automatically with persistent sessions

- ✅ **Q**: Should we implement password strength requirements?
  - **A**: Yes - minimum 6 characters, validated with Zod

- ✅ **Q**: Should we log authentication events?
  - **A**: Future phase - can add audit logging later

## Testing Strategy

### Unit Tests
- Auth helper functions
- Form validation schemas
- Permission checking utilities

### Integration Tests
- Login flow end-to-end
- Registration flow end-to-end
- Password reset flow end-to-end
- Middleware route protection
- Profile update operations

### E2E Tests (Playwright)
- User can register and login
- Protected routes redirect to login
- Admin can access admin pages
- User cannot access admin pages
- Profile edit saves correctly

### Manual Testing Checklist
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test with slow network (throttling)
- [ ] Test session expiry scenarios
- [ ] Test concurrent sessions
- [ ] Test password reset email delivery
- [ ] Test form validation messages
- [ ] Test loading states
- [ ] Test error states

## Performance Considerations

- Middleware runs on Edge (fast)
- Auth state cached in React Context
- Profile data cached with TanStack Query
- Sidebar navigation pre-rendered
- Forms use controlled components (minimal re-renders)

**Target Metrics**:
- Middleware latency: <50ms
- Login time: <1s
- Dashboard load: <2s
- Profile update: <1s

## Security Considerations

- Passwords never stored in plain text (Supabase handles hashing)
- JWT tokens stored in httpOnly cookies (Supabase default)
- CSRF protection via Supabase Auth
- Rate limiting on auth endpoints (Supabase default)
- Input validation on all forms (Zod)
- XSS protection via React (auto-escaping)
- SQL injection protection via Supabase client (parameterized queries)

## Accessibility

- All forms keyboard navigable
- Proper ARIA labels on inputs
- Error messages announced to screen readers
- Focus management on page transitions
- Color contrast meets WCAG AA
- Touch targets ≥44px on mobile


# Specification: Authorization

## ADDED Requirements

### Requirement: Route Protection
The system SHALL protect routes that require authentication using Next.js middleware.

#### Scenario: Unauthenticated user accesses protected route
- **WHEN** an unauthenticated user attempts to access a protected route (e.g., /dashboard)
- **THEN** the user is redirected to the login page
- **AND** the original URL is preserved as a redirect parameter
- **AND** after login, the user is redirected to the original URL

#### Scenario: Authenticated user accesses protected route
- **WHEN** an authenticated user accesses a protected route
- **THEN** the page is rendered normally
- **AND** no redirect occurs

#### Scenario: Authenticated user accesses public route
- **WHEN** an authenticated user accesses a public route (e.g., /login)
- **THEN** the user is redirected to the dashboard
- **AND** no login form is shown

### Requirement: Role-Based Access Control
The system SHALL enforce role-based permissions for different user types.

#### Scenario: User role hierarchy
- **WHEN** the system checks permissions
- **THEN** the following hierarchy is enforced: super_admin > admin > user
- **AND** higher roles have all permissions of lower roles

#### Scenario: Admin accessing admin-only route
- **WHEN** a user with admin or super_admin role accesses an admin route
- **THEN** the page is rendered normally
- **AND** no redirect occurs

#### Scenario: Regular user accessing admin-only route
- **WHEN** a user with user role attempts to access an admin route
- **THEN** the user is redirected to the dashboard
- **AND** an error message "Non hai i permessi per accedere a questa pagina" is displayed

#### Scenario: Super admin accessing all routes
- **WHEN** a user with super_admin role accesses any route
- **THEN** access is always granted
- **AND** no permission checks fail

### Requirement: Permission Checking
The system SHALL provide utilities to check user permissions.

#### Scenario: Check if user has specific role
- **WHEN** a component needs to check if a user has a specific role
- **THEN** a hasRole() utility function is available
- **AND** it returns true if the user has the role or higher
- **AND** it returns false otherwise

#### Scenario: Check if user can perform action
- **WHEN** a component needs to check if a user can perform an action
- **THEN** a canPerform() utility function is available
- **AND** it checks both authentication and role permissions
- **AND** it returns a boolean result

### Requirement: Middleware Configuration
The system SHALL configure middleware to run on appropriate routes.

#### Scenario: Middleware runs on protected routes
- **WHEN** a request is made to a protected route
- **THEN** the middleware executes before the page renders
- **AND** authentication is checked
- **AND** role permissions are verified if needed

#### Scenario: Middleware skips public routes
- **WHEN** a request is made to a public route (e.g., /login, /register, /about)
- **THEN** the middleware allows the request without auth checks
- **AND** the page renders immediately

#### Scenario: Middleware skips static assets
- **WHEN** a request is made for static assets (images, fonts, etc.)
- **THEN** the middleware does not execute
- **AND** the asset is served directly

### Requirement: Session Validation
The system SHALL validate user sessions in middleware.

#### Scenario: Valid session token
- **WHEN** middleware checks a request with a valid session token
- **THEN** the session is verified with Supabase
- **AND** the user's profile is fetched
- **AND** the request is allowed to proceed

#### Scenario: Expired session token
- **WHEN** middleware checks a request with an expired session token
- **THEN** the user is redirected to the login page
- **AND** the session is cleared from storage

#### Scenario: Invalid session token
- **WHEN** middleware checks a request with an invalid or tampered token
- **THEN** the user is redirected to the login page
- **AND** the session is cleared from storage
- **AND** the error is logged for security monitoring

### Requirement: Authorization Context
The system SHALL provide authorization context to React components.

#### Scenario: Access current user in components
- **WHEN** a component needs the current user's information
- **THEN** a useUser() hook is available
- **AND** it returns the user object with id, email, and role
- **AND** it returns null if not authenticated

#### Scenario: Access auth state in components
- **WHEN** a component needs to check authentication state
- **THEN** a useAuth() hook is available
- **AND** it returns session, user, and loading state
- **AND** it updates automatically when auth state changes

### Requirement: Conditional Rendering
The system SHALL support conditional rendering based on permissions.

#### Scenario: Show content only to authenticated users
- **WHEN** a component uses the RequireAuth wrapper
- **THEN** the content is only rendered if the user is authenticated
- **AND** a loading state is shown while checking auth
- **AND** unauthenticated users see nothing or a redirect

#### Scenario: Show content only to specific roles
- **WHEN** a component uses the RequireRole wrapper with a role parameter
- **THEN** the content is only rendered if the user has the required role or higher
- **AND** users without permission see nothing or an error message

### Requirement: API Route Protection
The system SHALL protect API routes and Server Actions.

#### Scenario: Server Action with auth check
- **WHEN** a Server Action is called
- **THEN** it checks for a valid session
- **AND** it throws an error if not authenticated
- **AND** it returns the user's ID for use in queries

#### Scenario: Server Action with role check
- **WHEN** a Server Action requires a specific role
- **THEN** it checks the user's role from the profiles table
- **AND** it throws an error if the user doesn't have permission
- **AND** it logs the unauthorized attempt

### Requirement: Redirect Handling
The system SHALL handle redirects intelligently after authentication.

#### Scenario: Redirect to original URL after login
- **WHEN** a user is redirected to login from a protected route
- **THEN** the original URL is stored as a query parameter
- **AND** after successful login, the user is redirected to the original URL
- **AND** if no original URL exists, the user is redirected to /dashboard

#### Scenario: Prevent redirect loops
- **WHEN** a redirect would create a loop (e.g., login → dashboard → login)
- **THEN** the redirect is prevented
- **AND** the user is sent to a safe default route (/dashboard)

### Requirement: Authorization Error Handling
The system SHALL handle authorization errors gracefully.

#### Scenario: Permission denied error
- **WHEN** a user attempts an action they don't have permission for
- **THEN** a user-friendly error message is displayed
- **AND** the user is not redirected (stays on current page)
- **AND** the error is logged for monitoring

#### Scenario: Session expired during operation
- **WHEN** a user's session expires while performing an action
- **THEN** the user is redirected to login
- **AND** a message "Sessione scaduta, effettua nuovamente il login" is displayed
- **AND** the original action is not completed

### Requirement: Security Logging
The system SHALL log security-relevant authorization events.

#### Scenario: Failed authorization attempt
- **WHEN** a user attempts to access a route they don't have permission for
- **THEN** the attempt is logged with user ID, route, and timestamp
- **AND** the log includes the user's current role
- **AND** the log is stored for security auditing

#### Scenario: Successful role-based access
- **WHEN** a user with appropriate role accesses a protected route
- **THEN** the access is logged (optional, for audit trail)
- **AND** the log includes user ID, role, and route


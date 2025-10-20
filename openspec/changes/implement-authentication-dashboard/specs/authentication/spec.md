# Specification: Authentication

## ADDED Requirements

### Requirement: User Registration
The system SHALL allow new users to register with email and password.

#### Scenario: Successful registration
- **WHEN** a user provides valid email and password (minimum 6 characters)
- **THEN** a new user account is created in Supabase Auth
- **AND** a corresponding profile is created in the profiles table
- **AND** the user is redirected to the dashboard

#### Scenario: Registration with existing email
- **WHEN** a user attempts to register with an email that already exists
- **THEN** an error message "Email già registrata" is displayed
- **AND** the registration form remains visible

#### Scenario: Registration with invalid email
- **WHEN** a user provides an invalid email format
- **THEN** a validation error "Email non valida" is displayed
- **AND** the form cannot be submitted

#### Scenario: Registration with weak password
- **WHEN** a user provides a password shorter than 6 characters
- **THEN** a validation error "Password deve essere almeno 6 caratteri" is displayed
- **AND** the form cannot be submitted

### Requirement: User Login
The system SHALL allow registered users to login with email and password.

#### Scenario: Successful login
- **WHEN** a user provides valid credentials
- **THEN** a session is created in Supabase Auth
- **AND** the user is redirected to the dashboard
- **AND** the session persists across page reloads

#### Scenario: Login with invalid credentials
- **WHEN** a user provides incorrect email or password
- **THEN** an error message "Email o password non validi" is displayed
- **AND** the login form remains visible
- **AND** no session is created

#### Scenario: Login with unregistered email
- **WHEN** a user provides an email that doesn't exist
- **THEN** an error message "Email o password non validi" is displayed
- **AND** the specific error (email vs password) is not revealed for security

### Requirement: User Logout
The system SHALL allow authenticated users to logout.

#### Scenario: Successful logout
- **WHEN** an authenticated user clicks the logout button
- **THEN** the session is destroyed in Supabase Auth
- **AND** the user is redirected to the login page
- **AND** the session is cleared from localStorage

#### Scenario: Logout from multiple tabs
- **WHEN** a user logs out in one browser tab
- **THEN** all other tabs detect the logout event
- **AND** all tabs redirect to the login page

### Requirement: Password Reset Request
The system SHALL allow users to request a password reset via email.

#### Scenario: Successful password reset request
- **WHEN** a user provides a registered email address
- **THEN** a password reset email is sent via Supabase Auth
- **AND** a success message "Email di reset inviata" is displayed
- **AND** the email contains a secure reset link

#### Scenario: Password reset for unregistered email
- **WHEN** a user provides an email that doesn't exist
- **THEN** a generic success message is displayed (to prevent email enumeration)
- **AND** no email is actually sent

### Requirement: Password Reset Completion
The system SHALL allow users to reset their password using a valid reset token.

#### Scenario: Successful password reset
- **WHEN** a user clicks a valid reset link from email
- **AND** provides a new password (minimum 6 characters)
- **THEN** the password is updated in Supabase Auth
- **AND** the user is redirected to the login page
- **AND** a success message "Password aggiornata con successo" is displayed

#### Scenario: Password reset with expired token
- **WHEN** a user clicks an expired reset link
- **THEN** an error message "Link scaduto, richiedi un nuovo reset" is displayed
- **AND** the user is redirected to the forgot password page

#### Scenario: Password reset with invalid token
- **WHEN** a user accesses the reset page with an invalid token
- **THEN** an error message "Link non valido" is displayed
- **AND** the user is redirected to the forgot password page

### Requirement: Session Management
The system SHALL manage user sessions securely and persistently.

#### Scenario: Session persistence across page reloads
- **WHEN** an authenticated user reloads the page
- **THEN** the session is restored from localStorage
- **AND** the user remains authenticated
- **AND** no re-login is required

#### Scenario: Automatic session refresh
- **WHEN** a user's access token is about to expire
- **THEN** Supabase Auth automatically refreshes the token
- **AND** the user's session continues without interruption

#### Scenario: Session expiry after prolonged inactivity
- **WHEN** a user's refresh token expires (default 7 days)
- **THEN** the session is invalidated
- **AND** the user is redirected to the login page on next interaction

### Requirement: Authentication State Management
The system SHALL provide real-time authentication state to the application.

#### Scenario: Auth state change detection
- **WHEN** a user logs in or logs out
- **THEN** all components using the auth hook receive the updated state
- **AND** the UI updates accordingly (show/hide user menu, etc.)

#### Scenario: Initial auth state loading
- **WHEN** the application first loads
- **THEN** the auth state is fetched from Supabase
- **AND** a loading state is shown until auth state is determined
- **AND** the appropriate page is rendered based on auth state

### Requirement: Form Validation
The system SHALL validate all authentication forms before submission.

#### Scenario: Client-side validation
- **WHEN** a user enters invalid data in an auth form
- **THEN** validation errors are displayed in real-time
- **AND** the submit button is disabled until all fields are valid

#### Scenario: Server-side validation
- **WHEN** a form is submitted with data that passes client validation
- **THEN** the data is validated again on the server
- **AND** any server-side errors are displayed to the user

### Requirement: Error Handling
The system SHALL handle authentication errors gracefully.

#### Scenario: Network error during login
- **WHEN** a network error occurs during authentication
- **THEN** an error message "Errore di connessione, riprova" is displayed
- **AND** the user can retry the operation

#### Scenario: Supabase service error
- **WHEN** Supabase Auth service is unavailable
- **THEN** an error message "Servizio temporaneamente non disponibile" is displayed
- **AND** the error is logged for monitoring

### Requirement: Loading States
The system SHALL show loading indicators during async authentication operations.

#### Scenario: Loading state during login
- **WHEN** a user submits the login form
- **THEN** a loading spinner is shown on the submit button
- **AND** the form inputs are disabled
- **AND** the loading state is cleared when the operation completes

#### Scenario: Loading state during registration
- **WHEN** a user submits the registration form
- **THEN** a loading indicator is shown
- **AND** the user cannot submit the form again until the operation completes


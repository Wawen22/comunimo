## ADDED Requirements
### Requirement: Super Admin User Administration
Super administrators MUST be able to manage every user account directly from the application.

#### Scenario: view roster of all users
- **GIVEN** a user with role `super_admin` is authenticated
- **WHEN** they open the user management area
- **THEN** they see a list of every account with key fields (email, role, society, status)
- **AND** non-super-admin users cannot access this area

#### Scenario: create new user accounts
- **GIVEN** a super admin is on the user management area
- **WHEN** they submit the new user form with email, role, and required metadata
- **THEN** a user record is created with the chosen role and society assignment
- **AND** the invite/reset email is sent through Supabase to the provided email address

#### Scenario: reset passwords for existing users
- **GIVEN** a super admin selects an existing account
- **WHEN** they trigger a password reset action
- **THEN** the system sends reset instructions to that user via Supabase auth
- **AND** the administrator receives a confirmation of the action

#### Scenario: update existing user details
- **GIVEN** a super admin edits an existing account
- **WHEN** they change the role, society assignment, or activation state
- **THEN** the updates are persisted if they pass validation and RBAC checks
- **AND** changes are rejected with clear errors if they would violate constraints (e.g., downgrading last super admin)

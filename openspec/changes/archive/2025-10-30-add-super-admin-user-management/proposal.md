# Proposal: Enable Super Admin User Management

## Why
- Super admins currently lack UI workflows to manage other user accounts directly.
- Operations like inviting a new administrator or triggering credential resets require manual database work, which is error-prone.
- Providing first-class tooling keeps account management in-app and auditable.

## What Changes
- Introduce a dedicated management area limited to the `super_admin` role containing the full roster of users.
- Allow super admins to create new users by specifying email, role, and optional society association.
- Allow super admins to force a password reset / send reset instructions for any account.
- Allow super admins to edit core profile details (role, society assignment, activation status) while enforcing existing RBAC constraints.
- Surface activity feedback (success, errors, pending states) so administrators understand the outcome of each action.

## Impact
- Requires extending existing Supabase service layer to expose user CRUD helpers restricted to super admins.
- Adds UI components and forms in the dashboard section; ensure they remain hidden for non-super-admin roles.
- Must respect RLS policies by routing mutations through server actions that validate the caller role.

## Open Questions
- Should invitations auto-generate temporary passwords or rely on Supabase magic links? (Resolved: create user with temporary password and trigger Supabase reset email.)
- Should society assignment be optional when the user role is `society_admin`? (Resolved: require at least one assignment at creation/update time.)

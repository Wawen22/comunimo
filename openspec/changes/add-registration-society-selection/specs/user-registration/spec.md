## ADDED Requirements
### Requirement: Capture Society Requests During Signup
The public registration experience MUST collect the applicant's target societies using the canonical directory so admins can approve access accurately.

#### Scenario: present searchable society directory
- **GIVEN** a visitor opens the registration form
- **WHEN** the form renders
- **THEN** it shows a multi-select input sourced from `all_societies`
- **AND** the input supports searching by society name or code before selecting
- **AND** each option displays at least the society name and code so users can identify the right entry

#### Scenario: enforce society selection before submission
- **GIVEN** a visitor attempts to register
- **WHEN** they submit the form without choosing any societies
- **THEN** the submission is blocked client-side
- **AND** an error explains that selecting at least one society is required

#### Scenario: persist requested societies for admin review
- **GIVEN** a visitor completes registration with society selections
- **WHEN** the Supabase sign-up call succeeds
- **THEN** the selected society IDs are stored with the new auth user metadata (e.g. `requested_society_ids`)
- **AND** super/admin views can read those IDs so they know which societies to grant access to

#### Scenario: notify administrators about new registrations
- **GIVEN** a visitor completes registration with society selections
- **THEN** the system creates an in-app notification for active admin and super admin accounts summarizing the request
- **AND** the notification is delivered via the existing communications channel (including email when enabled)

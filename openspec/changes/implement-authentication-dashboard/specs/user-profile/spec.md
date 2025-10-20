# Specification: User Profile

## ADDED Requirements

### Requirement: View User Profile
The system SHALL allow users to view their profile information.

#### Scenario: Display profile information
- **WHEN** a user navigates to the profile page
- **THEN** their profile information is displayed
- **AND** it shows: full name, email, phone, fiscal code, role
- **AND** sensitive information (password) is not displayed
- **AND** the data is fetched from the profiles table

#### Scenario: Profile loading state
- **WHEN** the profile page is loading
- **THEN** a loading skeleton is displayed
- **AND** the layout structure is visible
- **AND** the loading state is replaced when data loads

#### Scenario: Profile data error
- **WHEN** an error occurs fetching profile data
- **THEN** an error message is displayed
- **AND** a retry button is provided
- **AND** the error is logged for monitoring

### Requirement: Edit User Profile
The system SHALL allow users to edit their profile information.

#### Scenario: Edit profile form
- **WHEN** a user clicks the Edit Profile button
- **THEN** the profile fields become editable
- **AND** the current values are pre-filled
- **AND** Save and Cancel buttons are shown
- **AND** validation is applied to all fields

#### Scenario: Save profile changes
- **WHEN** a user edits their profile and clicks Save
- **THEN** the changes are validated
- **AND** if valid, the changes are saved to the profiles table
- **AND** a success message "Profilo aggiornato con successo" is displayed
- **AND** the form returns to view mode

#### Scenario: Cancel profile edit
- **WHEN** a user clicks Cancel while editing
- **THEN** all changes are discarded
- **AND** the original values are restored
- **AND** the form returns to view mode
- **AND** no data is saved

#### Scenario: Profile validation errors
- **WHEN** a user submits invalid profile data
- **THEN** validation errors are displayed next to the relevant fields
- **AND** the form is not submitted
- **AND** the user can correct the errors and resubmit

### Requirement: Change Password
The system SHALL allow users to change their password.

#### Scenario: Change password form
- **WHEN** a user clicks Change Password
- **THEN** a form is displayed with fields: Current Password, New Password, Confirm New Password
- **AND** all fields are password inputs (masked)
- **AND** validation is applied to all fields

#### Scenario: Successful password change
- **WHEN** a user provides correct current password and valid new password
- **THEN** the password is updated in Supabase Auth
- **AND** a success message "Password aggiornata con successo" is displayed
- **AND** the form is cleared
- **AND** the user remains logged in

#### Scenario: Incorrect current password
- **WHEN** a user provides an incorrect current password
- **THEN** an error message "Password attuale non corretta" is displayed
- **AND** the password is not changed
- **AND** the form remains visible

#### Scenario: Password mismatch
- **WHEN** New Password and Confirm New Password don't match
- **THEN** a validation error "Le password non corrispondono" is displayed
- **AND** the form cannot be submitted

#### Scenario: Weak new password
- **WHEN** a user provides a new password shorter than 6 characters
- **THEN** a validation error "Password deve essere almeno 6 caratteri" is displayed
- **AND** the form cannot be submitted

### Requirement: Profile Field Validation
The system SHALL validate all profile fields.

#### Scenario: Email validation
- **WHEN** a user edits their email
- **THEN** the email format is validated
- **AND** duplicate emails are checked
- **AND** invalid emails show error "Email non valida"
- **AND** duplicate emails show error "Email già in uso"

#### Scenario: Phone validation
- **WHEN** a user edits their phone number
- **THEN** the phone format is validated (Italian format)
- **AND** invalid phones show error "Numero di telefono non valido"
- **AND** the field is optional (can be empty)

#### Scenario: Fiscal code validation
- **WHEN** a user edits their fiscal code
- **THEN** the fiscal code format is validated (Italian format)
- **AND** invalid codes show error "Codice fiscale non valido"
- **AND** the field is optional (can be empty)

#### Scenario: Name validation
- **WHEN** a user edits their full name
- **THEN** the name is required (cannot be empty)
- **AND** minimum length is 2 characters
- **AND** invalid names show error "Nome deve essere almeno 2 caratteri"

### Requirement: Profile Data Security
The system SHALL ensure profile data is secure.

#### Scenario: User can only edit own profile
- **WHEN** a user accesses the profile page
- **THEN** they can only view and edit their own profile
- **AND** they cannot access other users' profiles
- **AND** attempts to access other profiles are blocked by RLS

#### Scenario: Admin viewing user profiles
- **WHEN** an admin accesses a user's profile (future feature)
- **THEN** they can view the profile
- **AND** they can edit certain fields (role, is_active)
- **AND** they cannot change the user's password
- **AND** all changes are logged

### Requirement: Profile Image Upload
The system SHALL allow users to upload a profile image (optional for Phase 2).

#### Scenario: Upload profile image
- **WHEN** a user clicks the profile image placeholder
- **THEN** a file picker is opened
- **AND** only image files are accepted (jpg, png, webp)
- **AND** maximum file size is 2MB
- **AND** the image is uploaded to Supabase Storage

#### Scenario: Image validation
- **WHEN** a user selects an invalid file
- **THEN** an error message is displayed
- **AND** the file is not uploaded
- **AND** the user can select a different file

#### Scenario: Image preview
- **WHEN** a user uploads an image
- **THEN** a preview is shown immediately
- **AND** the user can confirm or cancel
- **AND** the image is only saved when the user confirms

### Requirement: Account Settings
The system SHALL provide account settings options.

#### Scenario: View account settings
- **WHEN** a user navigates to account settings
- **THEN** they see options for: Email notifications, Language preference, Timezone
- **AND** current settings are displayed
- **AND** each setting has a description

#### Scenario: Update email notifications
- **WHEN** a user toggles email notification settings
- **THEN** the preference is saved to the profiles table
- **AND** a success message is displayed
- **AND** the setting takes effect immediately

#### Scenario: Language preference (future)
- **WHEN** a user selects a language preference
- **THEN** the preference is saved
- **AND** the UI language changes immediately
- **AND** the preference persists across sessions

### Requirement: Profile Completeness
The system SHALL indicate profile completeness.

#### Scenario: Incomplete profile indicator
- **WHEN** a user has not filled all recommended profile fields
- **THEN** a completeness indicator is shown (e.g., "Profile 60% complete")
- **AND** missing fields are highlighted
- **AND** the user is encouraged to complete their profile

#### Scenario: Complete profile
- **WHEN** a user has filled all recommended fields
- **THEN** a success indicator is shown (e.g., "Profile complete")
- **AND** no missing fields are highlighted

### Requirement: Profile Activity Log
The system SHALL log profile changes for security (optional for Phase 2).

#### Scenario: Log profile updates
- **WHEN** a user updates their profile
- **THEN** the change is logged with timestamp and changed fields
- **AND** the log is stored in the database
- **AND** the user can view their activity log

#### Scenario: Log password changes
- **WHEN** a user changes their password
- **THEN** the change is logged with timestamp
- **AND** the user receives an email notification
- **AND** the log entry does not contain the password

### Requirement: Profile Data Export
The system SHALL allow users to export their profile data (GDPR compliance).

#### Scenario: Request data export
- **WHEN** a user requests to export their data
- **THEN** a JSON file is generated with all their profile data
- **AND** the file is downloaded to their device
- **AND** the export includes: profile info, activity log, settings

#### Scenario: Data export format
- **WHEN** profile data is exported
- **THEN** it's in a human-readable JSON format
- **AND** it includes all personal data
- **AND** it includes timestamps for all data points

### Requirement: Account Deletion
The system SHALL allow users to delete their account (GDPR compliance).

#### Scenario: Request account deletion
- **WHEN** a user requests to delete their account
- **THEN** a confirmation dialog is shown
- **AND** the user must enter their password to confirm
- **AND** the consequences are clearly explained

#### Scenario: Confirm account deletion
- **WHEN** a user confirms account deletion
- **THEN** their account is marked as deleted (soft delete)
- **AND** their data is anonymized after 30 days
- **AND** they are logged out immediately
- **AND** they receive a confirmation email

#### Scenario: Cancel account deletion
- **WHEN** a user cancels the deletion process
- **THEN** no changes are made
- **AND** they remain on the profile page
- **AND** their account remains active


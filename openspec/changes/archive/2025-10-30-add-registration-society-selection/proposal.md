## Why
- Current self-registration flow lets volunteers create accounts without indicating which societies they belong to, forcing admins to manually chase the info.
- Admins need the requested societies up front so they can approve and grant the right access quickly.
- We already maintain the `all_societies` directory, so we can present authoritative options instead of free-text input.

## What Changes
- Extend the public registration form with a required, searchable multi-select fed by `all_societies` so applicants can pick one or more societies.
- Persist the requested society IDs alongside the auth user (e.g. Supabase auth metadata) so admins can review them before assigning access.
- Ensure validation blocks completion when no society is selected and communicates the error to the registrant.

## Impact
- Touches the public auth UI, Supabase data fetching during registration, and storage of registration metadata.
- No new external services; reuse existing Supabase client.
- Super admins will rely on the stored requests when granting society access, so the data must be easy to surface in management views.

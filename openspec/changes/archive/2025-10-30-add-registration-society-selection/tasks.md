1. [x] Review the current registration flow and confirm how Supabase auth metadata is stored/read for new users.
2. [x] Fetch active societies from `all_societies` for the public form (server/helpers) with search support and loading states.
3. [x] Replace the free-text gap with a searchable multi-select in the registration UI and require at least one selection in validation.
4. [x] Persist the selected society IDs with the new auth user (e.g. `requested_society_ids` metadata) and surface the data for admin review (e.g. user management view / API).
5. [x] Verify the flow end-to-end (local signup + admin review) and update docs/UX copy if needed.

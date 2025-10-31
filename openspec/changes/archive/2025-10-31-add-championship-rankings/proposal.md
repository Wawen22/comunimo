## Why
Staff members currently have no way to attach the official ranking PDFs to each race stage or to the overall championship on ComUniMo. Rankings are shared externally and athletes cannot find them from the site. Centralising uploads ensures results and running standings stay accessible as soon as they are published.

## What Changes
- Let authenticated staff upload and update a PDF ranking for every championship stage from the race management screens.
- Let authenticated staff upload and update two championship-level ranking PDFs (societies and individual standings) from the championship detail view.
- Surface the available ranking PDFs to public visitors alongside the existing stage cards and championship overview so they can open/download them at any time.
- Store uploaded ranking files in Supabase storage and persist the public URLs on the related records (events, championships), replacing the previous file when a newer version is uploaded.

## Impact
- Adds new Supabase storage usage for race and championship ranking PDFs.
- Updates the admin dashboard flows for race and championship management.
- Extends the public landing page to advertise available rankings.
- Requires new validation and UI states for upload progress and errors.

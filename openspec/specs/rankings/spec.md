# rankings Specification

## Purpose
TBD - created by archiving change add-championship-rankings. Update Purpose after archive.
## Requirements
### Requirement: Staff Manage Stage Ranking PDF
Authenticated staff users MUST be able to upload, replace, and remove a PDF ranking file for each championship stage directly from the race management UI, including the rankings modal reachable from the championship registrations dashboard. Only `.pdf` files are allowed and uploads MUST replace the previous file atomically so the public URL always points at the latest ranking.

#### Scenario: upload new stage ranking
- **GIVEN** a staff user is editing a championship stage that currently has no ranking PDF stored
- **WHEN** they select a `.pdf` file and confirm the upload
- **THEN** the file is stored in Supabase storage, the event record `results_url` field is updated with the new public URL, and a success confirmation is shown

#### Scenario: replace existing stage ranking
- **GIVEN** a staff user is editing a stage that already has a ranking PDF linked
- **WHEN** they upload a new `.pdf` file
- **THEN** the previous file is removed or overwritten in storage, the `results_url` on the event is updated to the new public URL, and the UI reflects the latest file metadata

#### Scenario: reject invalid stage ranking upload
- **GIVEN** a staff user selects a file that is not a `.pdf`
- **WHEN** they attempt to upload it as the stage ranking
- **THEN** the upload is prevented, the existing ranking stays unchanged, and an error message explains the valid file requirements

#### Scenario: manage stage ranking from registrations modal
- **GIVEN** a staff user opens the "Classifiche" modal from the championship registrations view
- **WHEN** they choose the edit action next to a stage and upload a `.pdf`
- **THEN** the same storage and event record updates occur without leaving the registrations flow, and the modal immediately reflects the updated file

### Requirement: Public Stage Ranking Access
Visitors MUST be able to open the uploaded stage ranking PDF from the public site as soon as it is available.

#### Scenario: open stage ranking from calendar
- **GIVEN** a stage has a `results_url` set and its event date is in the past
- **WHEN** a visitor views the stage card on the public calendar
- **THEN** a "Visualizza Risultati" action is rendered and opens the stored PDF in a new tab

### Requirement: Staff Manage Championship Ranking PDFs
Authenticated staff users MUST be able to manage two championship-level ranking PDFs—one for societies and one for individual standings—directly from the championship registrations dashboard via the "Classifiche" modal. Only `.pdf` files are allowed, and replacing a file MUST update the persisted URL immediately.

#### Scenario: upload society ranking PDF
- **GIVEN** a staff user opens the "Classifiche" modal from the registrations page and no society ranking is stored yet
- **WHEN** they upload a `.pdf` file for the society ranking
- **THEN** the file is stored, the championship record gains or updates a dedicated `society_ranking_url`, and the UI shows a confirmation with the new link

#### Scenario: update individual ranking PDF
- **GIVEN** a staff user sees an existing individual ranking linked within the modal
- **WHEN** they upload a newer `.pdf`
- **THEN** the previous file is replaced in storage, the championship `individual_ranking_url` value is refreshed, and the UI reflects the latest upload date

#### Scenario: prevent invalid championship ranking upload
- **GIVEN** a staff user tries to upload a non-PDF file for either ranking slot
- **WHEN** the upload is attempted
- **THEN** the action is blocked, the stored URLs stay untouched, and an error explains the file requirements

#### Scenario: open rankings modal from registrations header
- **GIVEN** a staff user is viewing the championship registrations dashboard
- **WHEN** they activate the "Classifiche" call-to-action in the header
- **THEN** a modal opens summarising both championship-level and per-stage rankings with download actions and admin edit controls

### Requirement: Public Championship Ranking Access
Visitors MUST be able to download both the society and individual championship ranking PDFs from the public site when they are available.

#### Scenario: view championship rankings on landing page
- **GIVEN** at least one of the championship ranking URLs is set
- **WHEN** a visitor loads the public championship overview
- **THEN** dedicated actions labelled "Classifica Società" and/or "Classifica Individuale" are visible and open the respective PDFs in a new tab, while empty states communicate when a ranking is not yet available


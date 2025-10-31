# guided-registration-tour Specification

## Purpose
Equip society administrators who are inexperienced with the registration process with a step-by-step tour that highlights each action required to enroll their athletes in a championship.
## Requirements
### Requirement: Guided Tour Launcher
The dashboard MUST provide a discoverable entry point for starting the registration tour without disrupting existing workflows.

#### Scenario: Dashboard launcher visible
- **GIVEN** a society admin visits `/dashboard`
- **WHEN** the page renders
- **THEN** a "Guida iscrizione campionato" control is visible in the dashboard header area
- **AND** activating it starts the guided tour without a full page reload

#### Scenario: Reopen after dismissal
- **GIVEN** the guided tour was previously skipped or completed
- **WHEN** the same user returns to `/dashboard`
- **THEN** the launcher remains available
- **AND** selecting it restarts the tour from the first step after confirmation

### Requirement: Registration Tour Overlay
The tour overlay MUST present a polished, modal-like experience that highlights target UI regions, keeps the page interactive only through the tour controls, and adapts to viewport changes.

#### Scenario: Spotlight focus with navigation
- **GIVEN** the tour is active on any step
- **WHEN** the user advances or rewinds using Next, Back, or keyboard shortcuts
- **THEN** the overlay highlights the relevant UI section with a translucent dimmed backdrop and branded accent
- **AND** the callout shows title, descriptive guidance, and primary/secondary actions
- **AND** the rest of the page is inert until the step completes or the tour is exited

#### Scenario: Responsive layout support
- **GIVEN** the tour displays on a viewport narrower than 768px
- **WHEN** the highlighted element would be off-screen
- **THEN** the page scrolls smoothly to bring the element into view before the callout animates

### Requirement: Registration Steps Coverage
The guided experience MUST walk users through the key phases of registering athletes to a championship with actionable guidance.

#### Scenario: Navigate to championships
- **GIVEN** the tour has just started
- **WHEN** the first step renders
- **THEN** it highlights the sidebar entry for “Campionati”
- **AND** instructs the user to aprire la sezione per proseguire con le iscrizioni

#### Scenario: Choose championship from list
- **GIVEN** the user is on `/dashboard/races/championships`
- **WHEN** the tour advances to the next step
- **THEN** it focuses the "Gestisci Iscrizioni" action inviting the user to aprire la pagina del campionato selezionato

#### Scenario: Select target society
- **GIVEN** the user is viewing a championship’s registrazioni page
- **WHEN** the tour reaches the selection step
- **THEN** it highlights the società selector and spiega che è necessario scegliere la società prima di procedere

#### Scenario: Start new registration
- **GIVEN** a società specifica è selezionata
- **WHEN** the tour reaches the final step
- **THEN** it spotlights the “Nuova Iscrizione” action e la guida avanza automaticamente appena il pulsante è disponibile
- **AND** invita ad aprire la procedura di inserimento atleti

### Requirement: Tour Progress Persistence
The platform MUST persist tour completion and provide an unobtrusive way to reset progress for QA or refresher purposes.

#### Scenario: Remember completion state
- **GIVEN** a user completes the tour
- **WHEN** they revisit the dashboard later
- **THEN** the tour does not auto-restart
- **AND** the launcher indicates the tour is completed with an option to replay

#### Scenario: Reset from settings
- **GIVEN** an admin opens their user settings panel
- **WHEN** they select "Reimposta guida iscrizione"
- **THEN** stored progress is cleared and the next launch starts from step one

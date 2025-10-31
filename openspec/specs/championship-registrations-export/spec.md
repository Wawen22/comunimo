# championship-registrations-export Specification

## Purpose
TBD - created by archiving change add-championship-registrations-excel-export. Update Purpose after archive.
## Requirements
### Requirement: Championship Registrations Excel Export
Users managing a championship MUST be able to export the confirmed athlete registrations to an `.xlsx` file directly from the registrations page.

#### Scenario: download Excel with confirmed registrations
- **GIVEN** an authenticated staff user is viewing the registrations list of a championship that has at least one confirmed registration
- **WHEN** they choose the "Esporta Excel" action
- **THEN** the browser downloads an `.xlsx` file containing one row per confirmed registration ordered by pettorale (bib number)
- **AND** the exported file provides the following columns with formatted values:
  - `GARA`: championship title (`championship.name`)
  - `Specialità`: human-readable label for the championship type (e.g. `Corsa Campestre` for `cross_country`)
  - `Numero Tessera`: membership organization code followed by ``ENTE: numero`` (e.g. `FIDAL: GE007245`)
  - `Cognome e Nome`: formatted as ``Cognome, Nome (YYYY)`` using the member birth year when available
  - `Codice Società`: formatted as ``CODICE, Nome società, Provincia`` using the society linked to the registration; missing parts are omitted but separators remain consistent
  - `Sesso`: member gender (`M` / `F`)
  - `Categoria`: category stored on the registration (fallback to member category if the registration field is empty)
  - `Pettorale`: registration bib number
  - `Scadenza`: medical certificate expiry date formatted as `DD/MM/YYYY` when present
  - `Data di nascita`: birth date formatted as `DD/MM/YYYY`
  - `Scadenza tessera`: membership card expiry date formatted as `DD/MM/YYYY` when present
  - `Anno in corso`: championship year
  - `Data iscrizione`: registration date formatted as `DD/MM/YYYY`

#### Scenario: handle export with no registrations
- **GIVEN** an authenticated staff user is viewing the registrations page of a championship with zero confirmed registrations
- **WHEN** they choose the "Esporta Excel" action
- **THEN** no file is downloaded
- **AND** the UI surfaces a toast or inline message informing that there are no athletes to export


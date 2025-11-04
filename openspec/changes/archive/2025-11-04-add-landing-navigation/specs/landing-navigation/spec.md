## ADDED Requirements
### Requirement: Landing Navigation Bar
Visitors MUST see a sticky navigation bar on the landing page with links to all primary sections.

#### Scenario: Navigation links scroll to sections
- **GIVEN** a visitor is on the landing page
- **WHEN** they activate a section link in the navigation bar
- **THEN** the page scrolls smoothly to the corresponding section anchor.

#### Scenario: Mobile navigation remains accessible
- **GIVEN** a visitor on a small viewport (≤768px wide)
- **THEN** the navigation bar remains reachable without overlapping the hero content and allows section selection.

### Requirement: Landing Scroll Progress Indicator
Visitors MUST see a progress indicator aligned with the navigation that reflects vertical progress through the landing content.

#### Scenario: Progress reflects scroll position
- **GIVEN** a visitor scrolls through the landing sections
- **THEN** the progress indicator updates continuously to reflect their position between the top and bottom of the landing content.

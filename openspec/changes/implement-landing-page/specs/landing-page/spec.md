# Specification: Landing Page

## ADDED Requirements

### Requirement: Hero Section
The landing page SHALL display a hero section with registration status and primary call-to-action.

#### Scenario: Registration open
- **WHEN** a user visits the landing page
- **AND** championship registrations are currently open
- **THEN** the hero section displays "Iscrizioni Aperte" status with green indicator
- **AND** displays the primary CTA button "Iscriviti Ora" linking to dashboard
- **AND** displays championship name and season

#### Scenario: Registration closed
- **WHEN** a user visits the landing page
- **AND** championship registrations are currently closed
- **THEN** the hero section displays "Iscrizioni Chiuse" status with red indicator
- **AND** displays secondary CTA button "Vai alla Dashboard" linking to dashboard
- **AND** displays championship name and season

#### Scenario: Responsive hero
- **WHEN** the hero section is displayed on mobile devices (<768px)
- **THEN** the layout stacks vertically
- **AND** text sizes are appropriately scaled
- **AND** CTA button is full-width

### Requirement: Next Event Display
The landing page SHALL display information about the next upcoming championship stage.

#### Scenario: Upcoming event exists
- **WHEN** there is a championship stage scheduled in the future
- **THEN** the next event section displays the event title
- **AND** displays the event date in readable format (e.g., "10 Febbraio 2025")
- **AND** displays the event location
- **AND** displays a countdown timer (days, hours, minutes)
- **AND** displays registration deadline if available

#### Scenario: No upcoming events
- **WHEN** there are no championship stages scheduled in the future
- **THEN** the next event section displays "Nessuna gara in programma"
- **AND** displays a message to check back later

#### Scenario: Event poster available
- **WHEN** the next event has a poster_url
- **THEN** a "Visualizza Locandina" button is displayed
- **AND** clicking the button opens the PDF poster in a new tab

### Requirement: Championship Calendar
The landing page SHALL display an interactive calendar of all championship stages.

#### Scenario: Display all stages
- **WHEN** a user views the calendar section
- **THEN** all championship stages are displayed in chronological order
- **AND** each stage shows title, date, and location
- **AND** past stages are visually distinguished from future stages
- **AND** the current/next stage is highlighted

#### Scenario: Stage interaction
- **WHEN** a user clicks on a stage with a poster
- **THEN** the poster PDF opens in a new tab or modal
- **AND** the stage is visually indicated as selected

#### Scenario: Stage without poster
- **WHEN** a stage does not have a poster_url
- **THEN** the stage is displayed but not clickable
- **AND** a "Locandina non disponibile" message is shown on hover

#### Scenario: Responsive calendar
- **WHEN** the calendar is displayed on mobile devices
- **THEN** stages are displayed in a vertical list
- **AND** on tablet/desktop, stages are displayed in a timeline or grid layout

### Requirement: Rankings Display
The landing page SHALL provide access to championship rankings.

#### Scenario: Rankings available
- **WHEN** championship rankings PDFs are available
- **THEN** a rankings section is displayed
- **AND** each ranking document is listed with a descriptive name
- **AND** a download button is provided for each ranking
- **AND** clicking download opens the PDF in a new tab

#### Scenario: No rankings available
- **WHEN** no championship rankings are available
- **THEN** the rankings section displays "Classifiche non ancora disponibili"
- **AND** displays a message indicating when rankings will be published

#### Scenario: Multiple ranking categories
- **WHEN** multiple ranking PDFs exist (e.g., by category, by gender)
- **THEN** rankings are organized by category
- **AND** each category is clearly labeled
- **AND** users can easily distinguish between different rankings

### Requirement: Registration Status Determination
The system SHALL accurately determine and display registration status.

#### Scenario: Within registration window
- **WHEN** the current date is between registration_start_date and registration_end_date of any active event
- **THEN** registration status is "open"
- **AND** the hero section displays "Iscrizioni Aperte"

#### Scenario: Outside registration window
- **WHEN** the current date is before registration_start_date or after registration_end_date of all events
- **THEN** registration status is "closed"
- **AND** the hero section displays "Iscrizioni Chiuse"

#### Scenario: No active championship
- **WHEN** there is no active championship (is_active = false for all)
- **THEN** registration status is "closed"
- **AND** a message indicates no active championship

### Requirement: Navigation and CTAs
The landing page SHALL provide clear navigation to the dashboard.

#### Scenario: Primary CTA
- **WHEN** a user clicks the primary CTA button
- **THEN** they are navigated to the dashboard home page (/dashboard)
- **AND** if not authenticated, they are redirected to login

#### Scenario: Secondary navigation
- **WHEN** a user scrolls through the landing page
- **THEN** a sticky navigation bar appears at the top
- **AND** the navigation includes a "Dashboard" link
- **AND** the navigation includes smooth scroll links to page sections

#### Scenario: Footer links
- **WHEN** a user scrolls to the bottom of the page
- **THEN** a footer is displayed with additional links
- **AND** footer includes links to privacy policy, terms, and contact

### Requirement: Responsive Design
The landing page SHALL be fully responsive across all device sizes.

#### Scenario: Mobile layout
- **WHEN** the landing page is viewed on mobile devices (<768px)
- **THEN** all sections stack vertically
- **AND** text is readable without zooming
- **AND** touch targets are at least 44x44px
- **AND** images are optimized for mobile bandwidth

#### Scenario: Tablet layout
- **WHEN** the landing page is viewed on tablets (768px-1023px)
- **THEN** sections use a 2-column layout where appropriate
- **AND** calendar displays in a grid format
- **AND** navigation is accessible via hamburger menu or full nav

#### Scenario: Desktop layout
- **WHEN** the landing page is viewed on desktop (≥1024px)
- **THEN** sections use full-width layouts with appropriate max-width
- **AND** calendar displays in a timeline or grid format
- **AND** navigation is always visible

### Requirement: Performance
The landing page SHALL load quickly and perform efficiently.

#### Scenario: Initial page load
- **WHEN** a user first visits the landing page
- **THEN** the page loads in under 2 seconds on 3G connection
- **AND** critical content is visible within 1 second (LCP)
- **AND** the page is interactive within 2 seconds (TTI)

#### Scenario: Data fetching
- **WHEN** the landing page fetches championship data
- **THEN** loading states are displayed for each section
- **AND** errors are handled gracefully with user-friendly messages
- **AND** data is cached to avoid redundant requests

#### Scenario: Image optimization
- **WHEN** images are displayed on the landing page
- **THEN** images are lazy-loaded below the fold
- **AND** images use modern formats (WebP, AVIF) with fallbacks
- **AND** images have appropriate sizes for different viewports

### Requirement: Accessibility
The landing page SHALL be accessible to users with disabilities.

#### Scenario: Keyboard navigation
- **WHEN** a user navigates using only keyboard
- **THEN** all interactive elements are reachable via Tab key
- **AND** focus indicators are clearly visible
- **AND** focus order is logical and intuitive

#### Scenario: Screen reader support
- **WHEN** a user accesses the page with a screen reader
- **THEN** all content is announced in logical order
- **AND** images have descriptive alt text
- **AND** interactive elements have appropriate ARIA labels
- **AND** headings are properly structured (h1, h2, h3)

#### Scenario: Color contrast
- **WHEN** text is displayed on the landing page
- **THEN** all text meets WCAG AA contrast requirements (4.5:1 for normal text)
- **AND** interactive elements have sufficient contrast in all states
- **AND** status indicators do not rely solely on color

#### Scenario: Motion preferences
- **WHEN** a user has reduced motion preferences enabled
- **THEN** animations are disabled or significantly reduced
- **AND** countdown timer updates without animation
- **AND** scroll behavior is instant instead of smooth

### Requirement: SEO and Social Sharing
The landing page SHALL be optimized for search engines and social sharing.

#### Scenario: Meta tags
- **WHEN** the landing page is rendered
- **THEN** appropriate meta tags are included (title, description)
- **AND** Open Graph tags are included for social sharing
- **AND** Twitter Card tags are included
- **AND** canonical URL is specified

#### Scenario: Structured data
- **WHEN** search engines crawl the landing page
- **THEN** JSON-LD structured data is included
- **AND** structured data includes Event schema for championship stages
- **AND** structured data includes Organization schema for the committee

#### Scenario: Social preview
- **WHEN** the landing page URL is shared on social media
- **THEN** a preview card is displayed with championship image
- **AND** preview includes championship name and description
- **AND** preview includes registration status


# Specification: Dashboard Layout

## ADDED Requirements

### Requirement: Dashboard Layout Structure
The system SHALL provide a consistent layout for all dashboard pages.

#### Scenario: Dashboard layout on desktop
- **WHEN** a user accesses the dashboard on a desktop device (≥1024px)
- **THEN** a sidebar is displayed on the left side
- **AND** a header is displayed at the top
- **AND** the main content area fills the remaining space
- **AND** the sidebar is always visible

#### Scenario: Dashboard layout on tablet
- **WHEN** a user accesses the dashboard on a tablet device (768-1023px)
- **THEN** a collapsible sidebar is available
- **AND** a hamburger menu button is shown in the header
- **AND** the sidebar can be toggled open/closed

#### Scenario: Dashboard layout on mobile
- **WHEN** a user accesses the dashboard on a mobile device (<768px)
- **THEN** the sidebar is hidden by default
- **AND** a hamburger menu button is shown in the header
- **AND** tapping the button shows the sidebar as an overlay
- **AND** tapping outside the sidebar closes it

### Requirement: Sidebar Navigation
The system SHALL provide sidebar navigation with menu items.

#### Scenario: Sidebar menu structure
- **WHEN** the sidebar is displayed
- **THEN** it shows navigation links organized by section
- **AND** each link has an icon and label
- **AND** the current page is highlighted
- **AND** links are keyboard accessible

#### Scenario: Navigation items for regular user
- **WHEN** a user with user role views the sidebar
- **THEN** they see: Dashboard, Profile, Societies, Members, Events
- **AND** they do NOT see admin-only items

#### Scenario: Navigation items for admin
- **WHEN** a user with admin or super_admin role views the sidebar
- **THEN** they see all user items
- **AND** they also see: Admin Panel, User Management, Settings
- **AND** admin items are visually distinguished (e.g., separator or section)

#### Scenario: Active navigation item
- **WHEN** a user is on a specific page
- **THEN** the corresponding sidebar item is highlighted
- **AND** the highlight uses the brand color (#1e88e5)
- **AND** the text is bold or has increased contrast

#### Scenario: Sidebar collapse on mobile
- **WHEN** a user taps a navigation link on mobile
- **THEN** the sidebar automatically closes
- **AND** the user is navigated to the selected page
- **AND** the page content is immediately visible

### Requirement: Header Component
The system SHALL provide a header with user information and actions.

#### Scenario: Header on desktop
- **WHEN** the header is displayed on desktop
- **THEN** it shows the page title or breadcrumbs
- **AND** it shows the user menu on the right
- **AND** it has a consistent height (64px)

#### Scenario: Header on mobile
- **WHEN** the header is displayed on mobile
- **THEN** it shows a hamburger menu button on the left
- **AND** it shows the page title in the center
- **AND** it shows the user menu on the right
- **AND** all elements are touch-friendly (≥44px)

#### Scenario: Breadcrumb navigation
- **WHEN** a user is on a nested page (e.g., /dashboard/societies/123)
- **THEN** breadcrumbs are shown in the header
- **AND** each breadcrumb is clickable
- **AND** the current page is not clickable
- **AND** breadcrumbs are responsive (truncate on mobile)

### Requirement: User Menu
The system SHALL provide a user menu with account actions.

#### Scenario: User menu display
- **WHEN** a user clicks their avatar or name in the header
- **THEN** a dropdown menu appears
- **AND** it shows the user's name and email
- **AND** it shows menu items: Profile, Settings, Logout
- **AND** it closes when clicking outside

#### Scenario: User menu on mobile
- **WHEN** a user taps the user menu on mobile
- **THEN** the menu appears as a bottom sheet or modal
- **AND** it's easy to dismiss (tap outside or close button)
- **AND** menu items are touch-friendly

#### Scenario: Logout from user menu
- **WHEN** a user clicks Logout in the user menu
- **THEN** a confirmation dialog appears (optional)
- **AND** clicking confirm logs the user out
- **AND** the user is redirected to the login page

### Requirement: Responsive Behavior
The system SHALL adapt the layout to different screen sizes.

#### Scenario: Breakpoint transitions
- **WHEN** a user resizes the browser window
- **THEN** the layout smoothly transitions between breakpoints
- **AND** no content is cut off or inaccessible
- **AND** the sidebar behavior changes appropriately

#### Scenario: Mobile sidebar overlay
- **WHEN** the sidebar is open on mobile
- **THEN** it appears as an overlay on top of content
- **AND** the background is dimmed (overlay)
- **AND** scrolling the main content is disabled
- **AND** tapping the overlay closes the sidebar

#### Scenario: Tablet sidebar toggle
- **WHEN** a user toggles the sidebar on tablet
- **THEN** the sidebar slides in/out with animation
- **AND** the main content area adjusts its width
- **AND** the toggle state persists during the session

### Requirement: Loading States
The system SHALL show loading states while fetching dashboard data.

#### Scenario: Initial dashboard load
- **WHEN** a user first accesses the dashboard
- **THEN** a loading skeleton is shown for the main content
- **AND** the sidebar and header are rendered immediately
- **AND** the loading state is replaced when data loads

#### Scenario: Navigation loading
- **WHEN** a user navigates to a different dashboard page
- **THEN** a loading indicator is shown
- **AND** the sidebar remains visible
- **AND** the previous page content is replaced with the new page

### Requirement: Error Boundaries
The system SHALL handle errors gracefully in the dashboard.

#### Scenario: Component error
- **WHEN** an error occurs in a dashboard component
- **THEN** an error boundary catches it
- **AND** a user-friendly error message is displayed
- **AND** the sidebar and header remain functional
- **AND** the user can navigate to other pages

#### Scenario: Data fetching error
- **WHEN** an error occurs while fetching dashboard data
- **THEN** an error message is displayed in the content area
- **AND** a retry button is provided
- **AND** the error is logged for monitoring

### Requirement: Accessibility
The system SHALL ensure the dashboard is accessible.

#### Scenario: Keyboard navigation
- **WHEN** a user navigates using only the keyboard
- **THEN** all interactive elements are reachable with Tab
- **AND** the current focus is clearly visible
- **AND** the sidebar can be opened/closed with keyboard
- **AND** the user menu can be accessed with keyboard

#### Scenario: Screen reader support
- **WHEN** a screen reader user accesses the dashboard
- **THEN** all navigation items have descriptive labels
- **AND** the current page is announced
- **AND** the sidebar state (open/closed) is announced
- **AND** ARIA landmarks are used (navigation, main, etc.)

#### Scenario: Focus management
- **WHEN** the sidebar is opened on mobile
- **THEN** focus moves to the first navigation item
- **AND** focus is trapped within the sidebar
- **AND** when closed, focus returns to the hamburger button

### Requirement: Visual Design
The system SHALL follow the established design system.

#### Scenario: Brand colors
- **WHEN** the dashboard is displayed
- **THEN** it uses the brand colors defined in Phase 1
- **AND** the primary color (#1e88e5) is used for active states
- **AND** the dark color (#223f4a) is used for the sidebar background
- **AND** text has sufficient contrast (WCAG AA)

#### Scenario: Spacing and typography
- **WHEN** dashboard elements are rendered
- **THEN** they use the 4px spacing scale
- **AND** they use the Inter font family
- **AND** font sizes are responsive (scale on mobile)
- **AND** line heights ensure readability

#### Scenario: Icons
- **WHEN** icons are displayed in the sidebar or header
- **THEN** they use lucide-react icons
- **AND** they have consistent size (20px or 24px)
- **AND** they have appropriate color and contrast
- **AND** they have descriptive aria-labels

### Requirement: Performance
The system SHALL ensure the dashboard loads and performs well.

#### Scenario: Initial load performance
- **WHEN** a user first loads the dashboard
- **THEN** the layout renders in <1 second
- **AND** the sidebar and header are immediately visible
- **AND** content loads progressively

#### Scenario: Navigation performance
- **WHEN** a user navigates between dashboard pages
- **THEN** the transition is smooth (<300ms)
- **AND** the sidebar doesn't re-render unnecessarily
- **AND** the header doesn't re-render unnecessarily

#### Scenario: Mobile performance
- **WHEN** the dashboard is used on a mobile device
- **THEN** animations are smooth (60fps)
- **AND** the sidebar overlay opens/closes smoothly
- **AND** touch interactions are responsive (<100ms)

### Requirement: State Persistence
The system SHALL persist certain UI states across sessions.

#### Scenario: Sidebar state persistence on tablet
- **WHEN** a user collapses the sidebar on tablet
- **THEN** the collapsed state is saved to localStorage
- **AND** on next visit, the sidebar is in the same state
- **AND** the state is per-device (not synced across devices)

#### Scenario: Theme preference (future)
- **WHEN** a user selects a theme preference
- **THEN** the preference is saved
- **AND** it persists across sessions
- **AND** it applies to all dashboard pages


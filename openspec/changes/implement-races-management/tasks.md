# Tasks: Implement Races Management

**Status**: 🟡 In Progress (32/44 tasks completed)
**Created**: 2025-10-22
**Last Updated**: 2025-10-22

---

## Progress Overview

```
Phase 1: Championships CRUD          [██████████] 12/12 (100%) ✅
Phase 2: Races CRUD                  [██████████] 8/8   (100%) ✅
Phase 3: Championship Registrations  [██████████] 12/12 (100%) ✅
Phase 4: Event Registrations         [██████████] 8/8   (100%) ✅
Phase 5: Advanced Features           [░░░░░░░░░░] 0/6   (0%)
Phase 6: Integration & Testing       [░░░░░░░░░░] 0/6   (0%)
─────────────────────────────────────────────────────
TOTAL PROGRESS                       [███████░░░] 40/52 (77%)
```

---

## Phase 1: Championships CRUD (Core) ✅ COMPLETE

### 1.1 Database Setup ✅
- [x] **Task 1.1.1**: Create `championships` table migration
  - Create SQL migration file
  - Add all columns (name, slug, year, season, etc.)
  - Add indexes (year, is_active)
  - Add RLS policies (public read, admin write)
  - Test migration in Supabase

- [x] **Task 1.1.2**: Update `events` table with championship_id
  - Add `championship_id` column (UUID, nullable, FK to championships)
  - Add index on championship_id
  - Update existing events to NULL (standalone races)
  - Test FK constraint

- [x] **Task 1.1.3**: Create TypeScript types
  - Create `types/database/championship.ts`
  - Create `Championship` interface
  - Create `ChampionshipInsert` type
  - Create `ChampionshipUpdate` type
  - Update `types/database/event.ts` with championship_id

### 1.2 Championships List ✅
- [x] **Task 1.2.1**: Create championships list page
  - Create `app/(dashboard)/dashboard/races/championships/page.tsx`
  - Implement data fetching with Supabase client
  - Add pagination (20 per page)
  - Add loading states
  - Add empty state

- [x] **Task 1.2.2**: Create ChampionshipsList component
  - Create `components/races/ChampionshipsList.tsx`
  - Display championships in table/grid
  - Show key info (name, year, season, race count)
  - Add action buttons (view, edit, delete)
  - Add responsive design

- [x] **Task 1.2.3**: Create ChampionshipCard component
  - Create `components/races/ChampionshipCard.tsx`
  - Display championship summary
  - Show statistics (total races, participants)
  - Add status badge (active/inactive)
  - Add click to detail

### 1.3 Championship Detail ✅
- [x] **Task 1.3.1**: Create championship detail page
  - Create `app/(dashboard)/dashboard/races/championships/[id]/page.tsx`
  - Fetch championship with races
  - Display championship info
  - Display races list (within championship)
  - Add edit/delete buttons

- [x] **Task 1.3.2**: Create ChampionshipDetail component
  - Create `components/races/ChampionshipDetail.tsx`
  - Display all championship fields
  - Show races list with RaceCard
  - Add "Add Race" button
  - Add statistics section

### 1.4 Championship Form ✅
- [x] **Task 1.4.1**: Create championship form page (new)
  - Create `app/(dashboard)/dashboard/races/championships/new/page.tsx`
  - Implement create mode
  - Add form validation
  - Add success/error handling
  - Redirect to detail on success

- [x] **Task 1.4.2**: Create championship form page (edit)
  - Create `app/(dashboard)/dashboard/races/championships/[id]/edit/page.tsx`
  - Implement edit mode
  - Pre-fill form with existing data
  - Add update logic
  - Redirect to detail on success

- [x] **Task 1.4.3**: Create ChampionshipForm component
  - Create `components/races/ChampionshipForm.tsx`
  - Add form fields (name, year, season, description, dates, type)
  - Add Zod validation schema
  - Add slug auto-generation from name
  - Add create/edit modes
  - Add cancel button

### 1.5 Championship Delete ✅
- [x] **Task 1.5.1**: Create DeleteChampionshipDialog component
  - Create `components/races/DeleteChampionshipDialog.tsx`
  - Add confirmation dialog
  - Show warning if championship has races
  - Implement soft delete (is_active = false)
  - Add success toast

---

## Phase 2: Races CRUD (Core) ✅ COMPLETE

### 2.1 Races List (within Championship) ✅
- [x] **Task 2.1.1**: Create races list page (within championship)
  - Update `ChampionshipDetail` to show races
  - Add filters (date, status)
  - Add sorting (by event_number, date)
  - Add "Add Race" button
  - Show race count

- [x] **Task 2.1.2**: Create RacesList component
  - Integrated in ChampionshipDetail component
  - Display races in table/grid
  - Show key info (number, title, date, location, registrations)
  - Add action buttons (view, edit, delete)
  - Add responsive design

- [x] **Task 2.1.3**: Create RaceCard component
  - Integrated in ChampionshipDetail component
  - Display race summary
  - Show race number badge
  - Show registration stats
  - Add status badge
  - Add click to detail

### 2.2 Race Detail ✅
- [x] **Task 2.2.1**: Create race detail page
  - Create `app/(dashboard)/dashboard/races/championships/[id]/races/[raceId]/page.tsx`
  - Fetch race with championship and registrations
  - Display race info
  - Display registrations list (basic, for future)
  - Add edit/delete buttons

- [x] **Task 2.2.2**: Create RaceDetail component
  - Create `components/races/RaceDetail.tsx`
  - Display all race fields
  - Show championship info (breadcrumb)
  - Show poster image if available
  - Add tabs (Info, Registrations, Results)
  - Add statistics section

### 2.3 Race Form ✅
- [x] **Task 2.3.1**: Create race form page (new)
  - Create `app/(dashboard)/dashboard/races/championships/[id]/races/new/page.tsx`
  - Implement create mode
  - Auto-assign event_number (max + 1)
  - Add form validation
  - Add success/error handling
  - Redirect to detail on success

- [x] **Task 2.3.2**: Create race form page (edit)
  - Create `app/(dashboard)/dashboard/races/championships/[id]/races/[raceId]/edit/page.tsx`
  - Implement edit mode
  - Pre-fill form with existing data
  - Add update logic
  - Redirect to detail on success

- [x] **Task 2.3.3**: Create RaceForm component
  - Create `components/races/RaceForm.tsx`
  - Add form fields (title, description, date, time, location, etc.)
  - Add Zod validation schema
  - Add championship_id (hidden, from URL)
  - Add event_number (auto or manual)
  - Add registration dates
  - Add max_participants
  - Add create/edit modes
  - Add cancel button

### 2.4 Race Delete ✅
- [x] **Task 2.4.1**: Create DeleteRaceDialog component
  - Create `components/races/DeleteRaceDialog.tsx`
  - Add confirmation dialog
  - Show warning if race has registrations
  - Implement soft delete (is_active = false)
  - Add success toast

---

## Phase 3: Championship Registrations ✅ COMPLETE

### 3.1 Database & Types ✅
- [x] **Task 3.1.1**: Create championship_registrations table
  - Create SQL migration file
  - Add all columns (championship_id, member_id, society_id, bib_number, etc.)
  - Add indexes (championship_id, member_id, society_id)
  - Add RLS policies (authenticated read, admin/society write)
  - Add unique constraint (championship_id, member_id)
  - Test migration in Supabase

- [x] **Task 3.1.2**: Update event_registrations RLS policies
  - Add RLS policies for event_registrations
  - Allow authenticated users to view all registrations
  - Allow admins to manage all registrations
  - Allow societies to manage their own athletes' registrations
  - Test policies with different user roles

- [x] **Task 3.1.3**: Create TypeScript types
  - Update `types/database.ts` with ChampionshipRegistration interface
  - Add ChampionshipRegistrationStatus type
  - Add ChampionshipRegistrationWithDetails type
  - Update EventRegistration interface

### 3.2 Championship Registrations Page ✅
- [x] **Task 3.2.1**: Create championship registrations page
  - Create `app/(dashboard)/dashboard/races/championships/[id]/registrations/page.tsx`
  - Fetch championship data
  - Implement society selector for admin/super_admin
  - Add tabs for list and new registration
  - Add loading states

- [x] **Task 3.2.2**: Create ChampionshipRegistrations component
  - Create `components/races/ChampionshipRegistrations.tsx`
  - Implement tabs (Iscritti, Nuova Iscrizione)
  - Handle society change and refresh
  - Pass societyId to child components

### 3.3 Registration Form ✅
- [x] **Task 3.3.1**: Create ChampionshipRegistrationForm component
  - Create `components/races/ChampionshipRegistrationForm.tsx`
  - Add organization filter (FIDAL, UISP, All)
  - Implement member selection with checkboxes
  - Add bulk registration logic
  - Implement smart reactivation of cancelled registrations
  - Add bib number assignment (sequential, persistent)
  - Add cascading registration to all championship races
  - Add success/error handling

- [x] **Task 3.3.2**: Create MemberSelectionList component
  - Create `components/races/MemberSelectionList.tsx`
  - Display members with checkboxes
  - Show member info (name, category, organization)
  - Filter by organization
  - Filter out already registered members
  - Add select all/none functionality

### 3.4 Registrations List ✅
- [x] **Task 3.4.1**: Create ChampionshipRegistrationsList component
  - Create `components/races/ChampionshipRegistrationsList.tsx`
  - Fetch registrations filtered by society
  - Display registrations in table
  - Show member info, bib number, organization, category
  - Add search by member name
  - Add organization filter
  - Add cancel registration action
  - Add real-time updates on society change

- [x] **Task 3.4.2**: Implement cancel registration
  - Add cancel button with confirmation
  - Update championship_registration status to 'cancelled'
  - Cascade cancellation to all event_registrations
  - Show success toast
  - Refresh list after cancellation

### 3.5 Bib Number Management ✅
- [x] **Task 3.5.1**: Create bib number utilities
  - Create `lib/utils/bibNumberUtils.ts`
  - Implement getNextBibNumbers() function
  - Check for existing bib numbers for member
  - Assign sequential bib numbers for new members
  - Ensure persistence across championship races

- [x] **Task 3.5.2**: Test bib number assignment
  - Test sequential assignment for new registrations
  - Test persistence for same athlete across races
  - Test reactivation keeps original bib number
  - Test bulk registration assigns correct numbers

---

## Phase 4: Event Registrations (Standalone Races) ✅ COMPLETE

### 4.1 Event Registrations Page ✅
- [x] **Task 4.1.1**: Create event registrations page
  - Create `app/(dashboard)/dashboard/races/events/[id]/registrations/page.tsx`
  - Fetch event data
  - Implement society selector for admin/super_admin
  - Add tabs for list and new registration
  - Add loading states
  - Add breadcrumbs

- [x] **Task 4.1.2**: Create EventRegistrations component
  - Create `components/races/EventRegistrations.tsx`
  - Implement tabs (Iscritti, Nuova Iscrizione)
  - Handle society change and refresh
  - Pass eventId and societyId to child components
  - Add event info header

### 4.2 Event Registration Form ✅
- [x] **Task 4.2.1**: Create EventRegistrationForm component
  - Create `components/races/EventRegistrationForm.tsx`
  - Add organization filter (FIDAL, UISP, All)
  - Implement member selection with checkboxes
  - Add bulk registration logic
  - Implement bib number assignment for standalone events
  - Check for existing registrations
  - Add success/error handling
  - Reuse MemberSelectionList component

- [x] **Task 4.2.2**: Implement standalone event bib number logic
  - Update `lib/utils/bibNumberUtils.ts`
  - Add getNextEventBibNumbers() function
  - Assign sequential bib numbers per event (independent from championships)
  - Handle bib number conflicts
  - Test bib number assignment

### 4.3 Event Registrations List ✅
- [x] **Task 4.3.1**: Create EventRegistrationsList component
  - Create `components/races/EventRegistrationsList.tsx`
  - Fetch registrations filtered by event and society
  - Display registrations in table
  - Show member info, bib number, organization, category, status
  - Add search by member name
  - Add organization filter
  - Add status filter (confirmed, pending, cancelled)
  - Add real-time updates on society change

- [x] **Task 4.3.2**: Implement registration actions
  - Add cancel registration button with confirmation
  - Add confirm registration button (if pending)
  - Update registration status
  - Show success toast
  - Refresh list after action

### 4.4 Export Functionality ✅
- [x] **Task 4.4.1**: Implement CSV export
  - Add export button to EventRegistrationsList
  - Create exportEventRegistrations() utility
  - Export columns: bib_number, member_name, society, organization, category, status
  - Format CSV with UTF-8 BOM for Excel compatibility
  - Add download functionality
  - Add loading state during export

- [ ] **Task 4.4.2**: Implement PDF export (optional)
  - Add PDF export button
  - Create printable start list format
  - Include event info header
  - Group by category or organization
  - Add page numbers and totals
  - Use browser print dialog

### 4.5 Testing ✅
- [x] **Task 4.5.1**: Test event registrations flow
  - Test registration creation for standalone events
  - Test bib number assignment (independent from championships)
  - Test bulk registration
  - Test filters and search
  - Test cancel/confirm actions
  - Test CSV export
  - Test society filtering for admin users

---

## Phase 5: Advanced Features

### 5.1 Poster Upload
- [ ] **Task 5.1.1**: Create PosterUpload component
  - Create `components/races/PosterUpload.tsx`
  - Add drag & drop interface
  - Add file validation (size: 5MB, types: jpg/png/webp)
  - Upload to Supabase Storage (bucket: race-posters)
  - Update race.poster_url
  - Add preview and delete

### 5.2 Filters & Search
- [ ] **Task 5.2.1**: Create ChampionshipFilters component
  - Create `components/races/ChampionshipFilters.tsx`
  - Add year filter (dropdown)
  - Add type filter (cross_country, road, track, other)
  - Add status filter (active/inactive)
  - Add search by name

- [ ] **Task 5.2.2**: Create RaceFilters component
  - Create `components/races/RaceFilters.tsx`
  - Add date range filter
  - Add status filter (upcoming, open, closed, completed)
  - Add championship filter (if viewing all races)
  - Add search by title/location

### 5.3 Statistics & Badges
- [ ] **Task 5.3.1**: Create RaceStatusBadge component
  - Create `components/races/RaceStatusBadge.tsx`
  - Calculate status based on dates (upcoming, open, closed, completed)
  - Add color coding (gray, blue, yellow, green, red)
  - Add icons

- [ ] **Task 5.3.2**: Create RegistrationStats component
  - Create `components/races/RegistrationStats.tsx`
  - Show total registrations
  - Show registrations by organization
  - Show registrations by category
  - Show available spots (if max_participants set)
  - Add progress bar

### 5.4 Standalone Races
- [ ] **Task 5.4.1**: Create standalone races list page
  - Create `app/(dashboard)/dashboard/races/standalone/page.tsx`
  - List races where championship_id IS NULL
  - Add filters and search
  - Add "Create Standalone Race" button

- [ ] **Task 5.4.2**: Create standalone race form
  - Create `app/(dashboard)/dashboard/races/standalone/new/page.tsx`
  - Use RaceForm component
  - Set championship_id to NULL
  - Add all race fields
  - Redirect to detail on success

---

## Phase 6: Integration & Testing

### 6.1 Navigation & Routing
- [ ] **Task 6.1.1**: Update sidebar navigation
  - Add "Gare" menu item in Sidebar.tsx
  - Add submenu: "Campionati", "Gare Singole"
  - Add icons (Trophy for championships, Flag for races)
  - Add active state

- [ ] **Task 6.1.2**: Create breadcrumbs
  - Update breadcrumb logic for nested routes
  - Show: Dashboard > Gare > Campionati > [Championship] > Gare > [Race]
  - Add click navigation

### 6.2 Utilities & Helpers
- [ ] **Task 6.2.1**: Create race utilities
  - Create `lib/utils/raceUtils.ts`
  - Add `getRaceStatus()` function
  - Add `isRegistrationOpen()` function
  - Add `getNextEventNumber()` function
  - Add `generateSlug()` function

- [ ] **Task 6.2.2**: Create race validation
  - Create `lib/validation/raceValidation.ts`
  - Add Zod schema for Championship
  - Add Zod schema for Race
  - Add date validation (end_date > start_date)
  - Add registration deadline validation

### 6.3 Testing & Documentation
- [ ] **Task 6.3.1**: Test all CRUD operations
  - Test championship create/edit/delete
  - Test race create/edit/delete
  - Test filters and search
  - Test poster upload
  - Test permissions (admin only)

- [ ] **Task 6.3.2**: Update OpenSpec documentation
  - Update proposal.md with final implementation
  - Update tasks.md with completion status
  - Create IMPLEMENTATION-SUMMARY.md
  - Update REFACTORING-STATUS.md

---

## 📊 Task Statistics

- **Total Tasks**: 52
- **Completed**: 32
- **In Progress**: 0
- **Not Started**: 20
- **Blocked**: 0

**Completion Rate**: 62%

---

## 🎯 Current Focus

**Current Phase**: Phase 4 - Event Registrations (Standalone Races)
**Next Task**: Task 4.1.1 - Create event registrations page

---

## 📝 Notes

- Follow Championship Registrations patterns for consistency
- Use client-side fetching (no Server Actions)
- TypeScript strict mode (0 errors)
- Responsive design (mobile-first)
- Accessibility (ARIA labels, keyboard navigation)
- Loading states and error handling
- Reuse components where possible (MemberSelectionList)
- Standalone events have independent bib number sequences
- Society filtering for admin users
- CSV export for start lists

---

**Last Updated**: 2025-10-22


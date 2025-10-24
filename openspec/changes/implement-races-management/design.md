# Design: Implement Races Management

**Status**: 🟡 In Progress  
**Created**: 2025-10-22  
**Last Updated**: 2025-10-22

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 14 + TypeScript)                         │
│  ├── Pages (App Router)                                     │
│  │   ├── /dashboard/races/championships/*                   │
│  │   └── /dashboard/races/standalone/*                      │
│  ├── Components                                             │
│  │   ├── ChampionshipsList, ChampionshipDetail, Form        │
│  │   ├── RacesList, RaceDetail, RaceForm                    │
│  │   └── Shared (Badges, Stats, Filters)                    │
│  └── Utilities                                              │
│      ├── raceUtils.ts (status, validation)                  │
│      └── raceValidation.ts (Zod schemas)                    │
├─────────────────────────────────────────────────────────────┤
│  API Layer (Supabase Client)                                │
│  └── Client-side data fetching with RLS                     │
├─────────────────────────────────────────────────────────────┤
│  Database (Supabase PostgreSQL)                             │
│  ├── championships (new)                                    │
│  ├── events (updated with championship_id)                  │
│  ├── event_registrations (existing)                         │
│  └── bib_number_sequences (existing)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Model

### Database Schema

#### Championships Table (NEW)

```sql
CREATE TABLE public.championships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic Info
  name TEXT NOT NULL,                    -- "Campionato Corsa Campestre 2024/2025"
  slug TEXT UNIQUE NOT NULL,             -- "campionato-corsa-campestre-2024-2025"
  year INTEGER NOT NULL,                 -- 2024
  season TEXT,                           -- "2024/2025"
  description TEXT,
  
  -- Dates
  start_date DATE,                       -- Data prima tappa
  end_date DATE,                         -- Data ultima tappa
  
  -- Type
  championship_type TEXT DEFAULT 'cross_country' 
    CHECK (championship_type IN ('cross_country', 'road', 'track', 'other')),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Indexes
CREATE INDEX idx_championships_year ON public.championships(year);
CREATE INDEX idx_championships_active ON public.championships(is_active);
CREATE INDEX idx_championships_type ON public.championships(championship_type);

-- RLS Policies
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;

-- Public can view active championships
CREATE POLICY "Public can view active championships" ON public.championships
  FOR SELECT USING (is_active = true);

-- Authenticated users can view all championships
CREATE POLICY "Authenticated can view all championships" ON public.championships
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage championships" ON public.championships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_championships_updated_at
  BEFORE UPDATE ON public.championships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Events Table (UPDATED)

```sql
-- Add championship_id column
ALTER TABLE public.events 
  ADD COLUMN championship_id UUID REFERENCES public.championships(id) ON DELETE SET NULL;

-- Add index
CREATE INDEX idx_events_championship ON public.events(championship_id);

-- Note: All other columns already exist:
-- - event_number (for race numbering)
-- - registration_start_date, registration_end_date
-- - poster_url, results_url
-- - has_specialties
```

---

## 🎨 Component Architecture

### Component Hierarchy

```
Championships
├── ChampionshipsList
│   ├── ChampionshipCard (multiple)
│   │   ├── RaceStatusBadge
│   │   └── RegistrationStats
│   └── ChampionshipFilters
├── ChampionshipDetail
│   ├── ChampionshipInfo
│   ├── RacesList (races in championship)
│   │   └── RaceCard (multiple)
│   └── RegistrationStats
├── ChampionshipForm
│   ├── Input fields
│   └── DatePicker
└── DeleteChampionshipDialog

Races
├── RacesList
│   ├── RaceCard (multiple)
│   │   ├── RaceStatusBadge
│   │   └── RegistrationStats
│   └── RaceFilters
├── RaceDetail
│   ├── RaceInfo
│   ├── PosterUpload
│   ├── Tabs
│   │   ├── Info
│   │   ├── Registrations (future)
│   │   └── Results (future)
│   └── RegistrationStats
├── RaceForm
│   ├── Input fields
│   ├── DatePicker
│   └── PosterUpload
└── DeleteRaceDialog

Shared
├── RaceStatusBadge
├── RegistrationStats
├── ChampionshipFilters
└── RaceFilters
```

---

## 🔄 Data Flow

### Championship Creation Flow

```
User clicks "Create Championship"
  ↓
Navigate to /championships/new
  ↓
ChampionshipForm renders
  ↓
User fills form (name, year, season, dates, type)
  ↓
Auto-generate slug from name
  ↓
Validate with Zod schema
  ↓
Submit to Supabase
  ↓
Insert into championships table
  ↓
Redirect to championship detail page
  ↓
Show success toast
```

### Race Creation Flow (within Championship)

```
User on Championship Detail page
  ↓
Clicks "Add Race"
  ↓
Navigate to /championships/[id]/races/new
  ↓
RaceForm renders with championship_id
  ↓
Auto-calculate next event_number (max + 1)
  ↓
User fills form (title, date, location, etc.)
  ↓
Validate with Zod schema
  ↓
Submit to Supabase
  ↓
Insert into events table with championship_id
  ↓
Redirect to race detail page
  ↓
Show success toast
```

### Bib Number Assignment Flow (Future - Registrations)

```
Athlete registers for Race 1 of Championship
  ↓
Check if athlete already has bib for this championship
  ↓
If NO:
  ├─ Get next bib number from bib_number_sequences
  ├─ Assign to athlete for this championship
  └─ Store in event_registrations
  ↓
If YES:
  └─ Use existing bib number
  ↓
Create registration record
  ↓
Show success with bib number
```

---

## 🎯 Business Logic

### Race Status Calculation

```typescript
function getRaceStatus(race: Race): RaceStatus {
  const now = new Date();
  const raceDate = new Date(race.event_date);
  const regStart = race.registration_start_date ? new Date(race.registration_start_date) : null;
  const regEnd = race.registration_end_date ? new Date(race.registration_end_date) : null;
  
  // Race already happened
  if (raceDate < now) {
    return 'completed';
  }
  
  // Registrations not yet open
  if (regStart && regStart > now) {
    return 'upcoming';
  }
  
  // Registrations closed
  if (regEnd && regEnd < now) {
    return 'closed';
  }
  
  // Registrations open
  if (regStart && regEnd && regStart <= now && regEnd >= now) {
    return 'open';
  }
  
  // Default: upcoming
  return 'upcoming';
}

type RaceStatus = 'upcoming' | 'open' | 'closed' | 'completed';
```

### Event Number Assignment

```typescript
async function getNextEventNumber(championshipId: string): Promise<number> {
  const { data: races } = await supabase
    .from('events')
    .select('event_number')
    .eq('championship_id', championshipId)
    .order('event_number', { ascending: false })
    .limit(1);
  
  if (!races || races.length === 0) {
    return 1; // First race
  }
  
  return (races[0].event_number || 0) + 1;
}
```

### Slug Generation

```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, '');        // Remove leading/trailing -
}
```

---

## 🎨 UI/UX Specifications

### Championships List Page

**Layout**: Table view with cards on mobile

**Columns**:
- Name (with year badge)
- Season
- Type (badge)
- Races Count
- Status (active/inactive badge)
- Actions (View, Edit, Delete)

**Filters**:
- Year (dropdown: 2024, 2023, 2022, All)
- Type (dropdown: Cross Country, Road, Track, Other, All)
- Status (dropdown: Active, Inactive, All)
- Search (by name)

**Actions**:
- "Create Championship" button (top right, admin only)
- Click row → navigate to detail
- Edit icon → navigate to edit
- Delete icon → open confirmation dialog

---

### Championship Detail Page

**Layout**: Header + Tabs

**Header**:
- Championship name (h1)
- Year badge
- Type badge
- Status badge
- Edit/Delete buttons (admin only)

**Tabs**:
1. **Overview**:
   - Description
   - Dates (start - end)
   - Statistics (total races, total participants)
   
2. **Races**:
   - RacesList component
   - "Add Race" button (admin only)
   - Sorted by event_number

**Breadcrumb**: Dashboard > Gare > Campionati > [Championship Name]

---

### Race Detail Page

**Layout**: Modern card-based layout with gradient accents

**Header Section** (Gradient background):
- Race title (h1, large and bold)
- Race number badge (e.g., "Tappa 1")
- Championship name with icon (if part of championship)
- Status badge with color coding
- Back to Championship button
- Edit/Delete buttons (admin only)

**Main Info Card**:
1. **Description Section**:
   - Full race description with proper formatting

2. **Date & Location** (Gradient cards):
   - Date card (orange gradient):
     - Event date with calendar icon
     - Event time with clock icon
   - Location card (teal gradient):
     - Location with map pin icon

3. **Championship Info Section** (if part of championship):
   - Championship name card (blue gradient)
   - Total registrations count card (green gradient):
     - Large number display
     - "Iscrizioni Totali" label
   - Available spots card (purple gradient):
     - Remaining spots / max participants
     - Only shown if max_participants is set

4. **Registration Period**:
   - Registration start date
   - Registration end date

5. **Media & Results**:
   - Poster link button (with external link icon)
   - Results link button (with external link icon)
   - Enhanced styling with shadows

6. **Additional Info**:
   - Visibility status (Public/Private)
   - Multiple specialties indicator
   - Created date
   - Last modified date

**Registrations CTA Section** (Prominent gradient card):
- Large icon in circular badge
- "Gestisci Iscrizioni" heading (h3)
- Descriptive text explaining the action
- Large, prominent action button with shadow effects
- Stats preview (for championship races):
  - Total registrations
  - Available spots
  - Fill percentage
- Different layouts for:
  - Championship races → Link to championship registrations
  - Standalone races → Link to event registrations

**Design Features**:
- Gradient backgrounds for visual hierarchy
- Color-coded cards for different information types
- Large, accessible buttons for primary actions
- Responsive grid layout (adapts to mobile/desktop)
- Dark mode support for all gradient cards
- Consistent spacing and typography
- Shadow effects for depth and emphasis

**Breadcrumb**: Dashboard > Gare > Campionati > [Championship] > Gare > [Race]

---

### Race Form

**Fields**:
1. **Basic Info**:
   - Title* (text)
   - Description (textarea)
   - Race Number* (number, auto-filled)
   
2. **Date & Location**:
   - Event Date* (date picker)
   - Event Time (time picker)
   - Location* (text)
   
3. **Registration**:
   - Registration Start Date (datetime picker)
   - Registration End Date (datetime picker)
   - Max Participants (number, optional)
   
4. **Media**:
   - Poster Upload (image, optional)
   - Results URL (text, optional)

**Validation**:
- Title: required, min 3 chars
- Event Date: required, must be future date
- Registration End Date: must be before Event Date
- Max Participants: must be > 0 if set

---

## 🔐 Security & Permissions

### RLS Policies Summary

**Championships**:
- ✅ Public: Read active championships
- ✅ Authenticated: Read all championships
- ✅ Admin: Full CRUD

**Events (Races)**:
- ✅ Public: Read public races
- ✅ Authenticated: Read all races
- ✅ Admin: Full CRUD

**Event Registrations**:
- ✅ Authenticated: Read own registrations
- ✅ Society Users: Read their society's registrations
- ✅ Admin: Read all registrations

---

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md)
- Desktop: > 1024px (lg)

### Mobile Adaptations
- Table → Card layout
- Hide less important columns
- Stack form fields vertically
- Collapsible filters
- Bottom sheet for actions

---

## ♿ Accessibility

- Semantic HTML (h1, h2, nav, main, etc.)
- ARIA labels for icons and buttons
- Keyboard navigation (Tab, Enter, Esc)
- Focus indicators
- Screen reader announcements for actions
- Color contrast (WCAG AA)

---

## 🚀 Performance Optimizations

- Pagination (20 items per page)
- Lazy loading for images
- Debounced search (300ms)
- Optimistic UI updates
- Cached queries (React Query future)
- Indexed database queries
- Image optimization (Next.js Image)

---

## 📝 TypeScript Types

### Championship Types

```typescript
// Database types
export interface Championship {
  id: string;
  name: string;
  slug: string;
  year: number;
  season: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  championship_type: ChampionshipType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type ChampionshipType = 'cross_country' | 'road' | 'track' | 'other';

export type ChampionshipInsert = Omit<Championship, 'id' | 'created_at' | 'updated_at'>;
export type ChampionshipUpdate = Partial<ChampionshipInsert>;

// With relations
export interface ChampionshipWithRaces extends Championship {
  races: Race[];
  race_count: number;
}
```

### Race Types

```typescript
// Extends Event
export interface Race {
  id: string;
  championship_id: string | null;
  society_id: string | null;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  max_participants: number | null;
  registration_deadline: string | null;
  is_public: boolean;
  is_active: boolean;
  event_number: number | null;
  registration_start_date: string | null;
  registration_end_date: string | null;
  poster_url: string | null;
  results_url: string | null;
  has_specialties: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type RaceInsert = Omit<Race, 'id' | 'created_at' | 'updated_at'>;
export type RaceUpdate = Partial<RaceInsert>;

// With relations
export interface RaceWithChampionship extends Race {
  championship: Championship | null;
  registration_count: number;
}

export type RaceStatus = 'upcoming' | 'open' | 'closed' | 'completed';
```

---

**Next Steps**: Begin implementation with Phase 1 (Championships CRUD)


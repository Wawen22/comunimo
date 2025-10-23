# Proposal: Implement Races Management

**Status**: 🟡 In Progress  
**Created**: 2025-10-22  
**Author**: AI Agent  
**Related**: Members Management (completed), Registrations Management (future)

---

## 📋 Summary

Implement comprehensive **Races Management** system for ComUniMo, focusing on the **Campionato di Corsa Campestre** (Cross Country Championship) with support for future race types. This feature enables creation and management of championships composed of multiple races (tappe), with automatic bib number assignment that persists across all championship races.

---

## 🎯 Goals

### Primary Goals
1. ✅ Create and manage **Championships** (Campionati)
2. ✅ Create and manage **Races** (Gare/Tappe) within championships
3. ✅ Automatic **bib number assignment** on first championship registration
4. ✅ **Persistent bib numbers** across all championship races
5. ✅ Race categories and age groups management
6. ✅ Integration with Members and Societies

### Secondary Goals
1. ✅ Support for multiple championship types (future-proof)
2. ✅ Race poster/image upload
3. ✅ Registration deadlines and participant limits
4. ✅ Public/private race visibility
5. ✅ Race results URL tracking (for future results management)

---

## 🔍 Business Requirements

### Campionato di Corsa Campestre
- **Structure**: 1 Championship = ~6 Races (tappe)
- **Registration Logic**: 
  - Athlete registers for Race 1 → enrolled in entire championship
  - Bib number assigned on first registration
  - Same bib number used for all subsequent races in championship
- **Society-based**: Societies register their own athletes
- **Categories**: Age-based categories (same as Members Management)

### Future Expansion
- Support for other race types (strada, pista, marcia)
- Support for multiple championships per season
- Support for standalone races (not part of championship)

---

## 🏗️ Architecture

### Database Schema

#### New Table: `championships`
```sql
CREATE TABLE public.championships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,                    -- "Campionato Corsa Campestre 2024/2025"
  slug TEXT UNIQUE NOT NULL,             -- "campionato-corsa-campestre-2024-2025"
  year INTEGER NOT NULL,                 -- 2024
  season TEXT,                           -- "2024/2025"
  description TEXT,
  start_date DATE,                       -- Data prima tappa
  end_date DATE,                         -- Data ultima tappa
  championship_type TEXT DEFAULT 'cross_country', -- cross_country, road, track, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX idx_championships_year ON public.championships(year);
CREATE INDEX idx_championships_active ON public.championships(is_active);
```

#### Modified Table: `events` (add championship_id)
```sql
ALTER TABLE public.events 
  ADD COLUMN championship_id UUID REFERENCES public.championships(id) ON DELETE SET NULL;

CREATE INDEX idx_events_championship ON public.events(championship_id);
```

**Note**: `events` table already has:
- `event_number` (race number within championship)
- `registration_start_date`, `registration_end_date`
- `poster_url`, `results_url`
- `has_specialties` (for future multi-discipline events)

#### Existing Tables (no changes needed)
- ✅ `event_registrations` - Already has `bib_number`, `category`, `organization`
- ✅ `event_specialties` - For future multi-discipline support
- ✅ `bib_number_sequences` - For automatic bib number generation

---

## 📊 Data Model

### Championship
```typescript
interface Championship {
  id: string;
  name: string;
  slug: string;
  year: number;
  season: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  championship_type: 'cross_country' | 'road' | 'track' | 'other';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  
  // Relations
  races?: Race[];
  race_count?: number;
}
```

### Race (extends Event)
```typescript
interface Race {
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
  
  // Championship-specific
  event_number: number | null;          // Race number (1, 2, 3...)
  registration_start_date: string | null;
  registration_end_date: string | null;
  poster_url: string | null;
  results_url: string | null;
  has_specialties: boolean;
  
  created_at: string;
  updated_at: string;
  created_by: string | null;
  
  // Relations
  championship?: Championship;
  registrations?: EventRegistration[];
  registration_count?: number;
}
```

---

## 🎨 UI/UX Design

### Page Structure

```
/dashboard/races
├── /championships
│   ├── page.tsx                    # Championships list
│   ├── /new
│   │   └── page.tsx                # Create championship
│   ├── /[id]
│   │   ├── page.tsx                # Championship detail + races list
│   │   └── /edit
│   │       └── page.tsx            # Edit championship
│   └── /[championshipId]/races
│       ├── /new
│       │   └── page.tsx            # Create race in championship
│       └── /[raceId]
│           ├── page.tsx            # Race detail
│           └── /edit
│               └── page.tsx        # Edit race
└── /standalone
    ├── page.tsx                    # Standalone races list
    ├── /new
    │   └── page.tsx                # Create standalone race
    └── /[id]
        ├── page.tsx                # Race detail
        └── /edit
            └── page.tsx            # Edit race
```

### Components

**Championships**:
- `ChampionshipsList` - List with filters (year, type, status)
- `ChampionshipCard` - Card with stats (races, participants)
- `ChampionshipDetail` - Detail view with races list
- `ChampionshipForm` - Create/Edit form
- `DeleteChampionshipDialog` - Soft delete confirmation

**Races**:
- `RacesList` - List with filters (championship, date, status)
- `RaceCard` - Card with key info (date, location, registrations)
- `RaceDetail` - Detail view with tabs (Info, Registrations, Results)
- `RaceForm` - Create/Edit form with championship selection
- `DeleteRaceDialog` - Soft delete confirmation
- `PosterUpload` - Image upload for race poster

**Shared**:
- `RaceStatusBadge` - Status indicator (upcoming, open, closed, completed)
- `RegistrationStats` - Registration statistics widget

---

## 🔐 Security & Permissions

### Row Level Security (RLS)

**Championships**:
- Public: Can view active championships
- Authenticated: Can view all championships
- Admin: Full CRUD access

**Races (Events)**:
- Public: Can view public races
- Authenticated: Can view all races
- Society Users: Can view races and register their athletes
- Admin: Full CRUD access

### Access Control
- Only admins can create/edit/delete championships
- Only admins can create/edit/delete races
- Society users can only view races (registration in future feature)

---

## 📈 Success Metrics

1. ✅ Championships can be created and managed
2. ✅ Races can be created within championships
3. ✅ Race numbering is automatic and sequential
4. ✅ Bib numbers are assigned and persist (via registrations)
5. ✅ UI is intuitive and follows Members Management patterns
6. ✅ All TypeScript types are strict and validated
7. ✅ Database queries are optimized with proper indexes

---

## 🚀 Implementation Phases

### Phase 1: Championships CRUD (Core)
- Database migration (create championships table)
- TypeScript types
- Championships list page
- Championship detail page
- Create/Edit championship form
- Delete championship

### Phase 2: Races CRUD (Core)
- Database migration (add championship_id to events)
- Races list page (within championship)
- Race detail page
- Create/Edit race form (with championship link)
- Delete race
- Race numbering logic

### Phase 3: Advanced Features
- Poster upload (Supabase Storage)
- Registration statistics
- Filters and search
- Standalone races support

### Phase 4: Integration & Testing
- Integration with Members
- Integration with Societies
- Bib number assignment logic (basic structure)
- Testing and bug fixes
- Documentation updates

---

## 🔗 Dependencies

### Required (Completed)
- ✅ Members Management
- ✅ Societies Management
- ✅ Authentication & Authorization

### Future Integration
- ⏸️ Registrations Management (will use this structure)
- ⏸️ Results Management (will use results_url field)
- ⏸️ Payments Management (deferred)

---

## 📝 Notes

- **Bib Number Logic**: The actual bib number assignment will be implemented in Registrations Management, but we prepare the structure here
- **Event Specialties**: Not used for cross country, but table exists for future multi-discipline events
- **Standalone Races**: Races without championship_id are standalone events
- **Soft Delete**: Use `is_active` flag for soft deletion
- **Client-side Fetching**: Follow Members Management pattern (no Server Actions)

---

## ✅ Acceptance Criteria

1. [ ] Championships table created with proper schema
2. [ ] Events table updated with championship_id FK
3. [ ] Championships CRUD fully functional
4. [ ] Races CRUD fully functional within championships
5. [ ] Race numbering is automatic and sequential
6. [ ] UI follows Members Management patterns
7. [ ] TypeScript strict mode with 0 errors
8. [ ] RLS policies implemented and tested
9. [ ] Documentation updated (OpenSpec)
10. [ ] Integration points prepared for Registrations Management

---

**Next Steps**: Create detailed tasks.md and design.md


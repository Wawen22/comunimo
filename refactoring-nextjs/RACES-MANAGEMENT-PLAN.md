# Races Management - Implementation Plan

**Feature**: Races Management (Gestione Gare)  
**Status**: 🟡 In Progress  
**Created**: 2025-10-22  
**Estimated Time**: 2-3 weeks  

---

## 📋 Overview

Implement comprehensive **Races Management** system for ComUniMo, focusing on the **Campionato di Corsa Campestre** (Cross Country Championship). This feature enables creation and management of championships composed of multiple races (tappe), with automatic bib number assignment that persists across all championship races.

---

## 🎯 Business Requirements

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

## 🏗️ Database Schema

### New Table: championships

```sql
CREATE TABLE public.championships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  year INTEGER NOT NULL,
  season TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  championship_type TEXT DEFAULT 'cross_country',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);
```

### Updated Table: events (add championship_id)

```sql
ALTER TABLE public.events 
  ADD COLUMN championship_id UUID REFERENCES public.championships(id) ON DELETE SET NULL;
```

### Existing Tables (no changes)
- ✅ `event_registrations` - Already has bib_number, category, organization
- ✅ `event_specialties` - For future multi-discipline support
- ✅ `bib_number_sequences` - For automatic bib number generation

---

## 📂 File Structure

```
refactoring-nextjs/comunimo-next/
├── app/(dashboard)/dashboard/races/
│   ├── championships/
│   │   ├── page.tsx                          # Championships list
│   │   ├── new/
│   │   │   └── page.tsx                      # Create championship
│   │   └── [id]/
│   │       ├── page.tsx                      # Championship detail
│   │       ├── edit/
│   │       │   └── page.tsx                  # Edit championship
│   │       └── races/
│   │           ├── new/
│   │           │   └── page.tsx              # Create race in championship
│   │           └── [raceId]/
│   │               ├── page.tsx              # Race detail
│   │               └── edit/
│   │                   └── page.tsx          # Edit race
│   └── standalone/
│       ├── page.tsx                          # Standalone races list
│       ├── new/
│       │   └── page.tsx                      # Create standalone race
│       └── [id]/
│           ├── page.tsx                      # Race detail
│           └── edit/
│               └── page.tsx                  # Edit race
│
├── components/races/
│   ├── ChampionshipsList.tsx                 # Championships list component
│   ├── ChampionshipCard.tsx                  # Championship card
│   ├── ChampionshipDetail.tsx                # Championship detail view
│   ├── ChampionshipForm.tsx                  # Create/Edit championship form
│   ├── ChampionshipFilters.tsx               # Filters for championships
│   ├── DeleteChampionshipDialog.tsx          # Delete confirmation
│   ├── RacesList.tsx                         # Races list component
│   ├── RaceCard.tsx                          # Race card
│   ├── RaceDetail.tsx                        # Race detail view
│   ├── RaceForm.tsx                          # Create/Edit race form
│   ├── RaceFilters.tsx                       # Filters for races
│   ├── DeleteRaceDialog.tsx                  # Delete confirmation
│   ├── PosterUpload.tsx                      # Poster image upload
│   ├── RaceStatusBadge.tsx                   # Status badge component
│   └── RegistrationStats.tsx                 # Registration statistics
│
├── lib/utils/
│   └── raceUtils.ts                          # Race utilities
│       ├── getRaceStatus()
│       ├── isRegistrationOpen()
│       ├── getNextEventNumber()
│       └── generateSlug()
│
├── lib/validation/
│   └── raceValidation.ts                     # Zod schemas
│       ├── championshipSchema
│       └── raceSchema
│
└── types/database/
    ├── championship.ts                       # Championship types
    └── race.ts                               # Race types (extends event.ts)
```

**Total Files to Create**: ~25 files

---

## 🚀 Implementation Phases

### Phase 1: Championships CRUD (Core) - 8 tasks
**Estimated Time**: 3-4 hours

**Tasks**:
1. Create `championships` table migration
2. Update `events` table with championship_id
3. Create TypeScript types (Championship, ChampionshipInsert, ChampionshipUpdate)
4. Create championships list page + ChampionshipsList component
5. Create championship detail page + ChampionshipDetail component
6. Create championship form pages (new/edit) + ChampionshipForm component
7. Create DeleteChampionshipDialog component
8. Test championships CRUD

**Deliverables**:
- ✅ Championships table in database
- ✅ Full CRUD for championships
- ✅ Admin-only access control
- ✅ Soft delete functionality

---

### Phase 2: Races CRUD (Core) - 8 tasks
**Estimated Time**: 4-5 hours

**Tasks**:
1. Create RacesList component (within championship)
2. Create RaceCard component
3. Create race detail page + RaceDetail component
4. Create race form pages (new/edit) + RaceForm component
5. Implement auto event_number assignment
6. Create DeleteRaceDialog component
7. Test races CRUD
8. Test championship-race relationship

**Deliverables**:
- ✅ Full CRUD for races within championships
- ✅ Automatic race numbering
- ✅ Championship-race relationship working
- ✅ Admin-only access control

---

### Phase 3: Advanced Features - 6 tasks
**Estimated Time**: 3-4 hours

**Tasks**:
1. Create PosterUpload component (Supabase Storage)
2. Create ChampionshipFilters component
3. Create RaceFilters component
4. Create RaceStatusBadge component
5. Create RegistrationStats component
6. Create standalone races pages

**Deliverables**:
- ✅ Poster upload functionality
- ✅ Advanced filters and search
- ✅ Status badges and statistics
- ✅ Standalone races support

---

### Phase 4: Integration & Testing - 6 tasks
**Estimated Time**: 2-3 hours

**Tasks**:
1. Update sidebar navigation (add "Gare" menu)
2. Create breadcrumbs for nested routes
3. Create race utilities (raceUtils.ts)
4. Create race validation (raceValidation.ts)
5. Test all CRUD operations and permissions
6. Update OpenSpec documentation

**Deliverables**:
- ✅ Navigation updated
- ✅ Utilities and validation in place
- ✅ All features tested
- ✅ Documentation complete

---

## 📊 Progress Tracking

```
Phase 1: Championships CRUD          [░░░░░░░░░░] 0/8   (0%)
Phase 2: Races CRUD                  [░░░░░░░░░░] 0/8   (0%)
Phase 3: Advanced Features           [░░░░░░░░░░] 0/6   (0%)
Phase 4: Integration & Testing       [░░░░░░░░░░] 0/6   (0%)
─────────────────────────────────────────────────────
TOTAL PROGRESS                       [░░░░░░░░░░] 0/28  (0%)
```

---

## 🎨 Design Patterns (from Members Management)

### 1. Client-side Fetching
```typescript
// ✅ DO: Client-side fetching
const [championships, setChampionships] = useState<Championship[]>([]);

useEffect(() => {
  async function fetchChampionships() {
    const { data } = await supabase
      .from('championships')
      .select('*')
      .order('year', { ascending: false });
    setChampionships(data || []);
  }
  fetchChampionships();
}, []);

// ❌ DON'T: Server Actions
```

### 2. Form Validation with Zod
```typescript
const championshipSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  year: z.number().min(2020).max(2030),
  season: z.string().optional(),
  // ...
});
```

### 3. Soft Delete
```typescript
// Update is_active instead of DELETE
await supabase
  .from('championships')
  .update({ is_active: false })
  .eq('id', championshipId);
```

### 4. Loading States
```typescript
if (loading) return <ChampionshipsListSkeleton />;
if (error) return <ErrorMessage error={error} />;
if (!championships.length) return <EmptyState />;
```

---

## 🔐 Security Checklist

- [ ] RLS policies on championships table
- [ ] RLS policies on events table (already exists)
- [ ] Admin-only access for create/edit/delete
- [ ] Society users can only view races
- [ ] Public can view active championships and public races
- [ ] Proper FK constraints
- [ ] Input validation (Zod schemas)
- [ ] XSS protection (sanitize inputs)

---

## ✅ Acceptance Criteria

1. [ ] Championships table created with proper schema
2. [ ] Events table updated with championship_id FK
3. [ ] Championships CRUD fully functional
4. [ ] Races CRUD fully functional within championships
5. [ ] Race numbering is automatic and sequential
6. [ ] Poster upload works with Supabase Storage
7. [ ] Filters and search work correctly
8. [ ] Status badges show correct status
9. [ ] UI follows Members Management patterns
10. [ ] TypeScript strict mode with 0 errors
11. [ ] RLS policies implemented and tested
12. [ ] Navigation updated with "Gare" menu
13. [ ] Breadcrumbs work for nested routes
14. [ ] Documentation updated (OpenSpec)
15. [ ] Integration points prepared for Registrations Management

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

## 🎯 Next Steps

1. **Start with Phase 1**: Create championships table and CRUD
2. **Follow Members Management patterns**: Use as reference for structure and code style
3. **Test incrementally**: Test each phase before moving to next
4. **Update OpenSpec**: Keep documentation in sync with implementation

---

**Ready to Start**: Phase 1, Task 1.1.1 - Create championships table migration

---

**Last Updated**: 2025-10-22


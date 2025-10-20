# Tasks: Migrate Legacy Database Schema

**Change ID**: `migrate-legacy-schema`  
**Status**: In Progress  
**Created**: 2024-10-20

---

## Task Breakdown

### Phase 1: Extend Existing Tables ✅ COMPLETED

#### Task 1.1: Update societies table ✅ COMPLETED
- [x] Add `society_code` column (TEXT UNIQUE)
- [x] Add `logo_url` column (TEXT)
- [x] Update schema.sql
- [x] Apply to Supabase database
- [x] Test queries

#### Task 1.2: Update members table ✅ COMPLETED
- [x] Add `organization` column (TEXT)
- [x] Add `year` column (INTEGER)
- [x] Add `regional_code` column (TEXT)
- [x] Add `category` column (TEXT)
- [x] Add `membership_card_number` column (TEXT UNIQUE)
- [x] Add `card_issue_date` column (DATE)
- [x] Add `card_expiry_date` column (DATE)
- [x] Add `birth_place` column (TEXT)
- [x] Add `is_foreign` column (BOOLEAN)
- [x] Add `medical_certificate_date` column (DATE)
- [x] Add `photo_url` column (TEXT)
- [x] Create indexes
- [x] Update schema.sql
- [x] Apply to Supabase database
- [x] Test queries

#### Task 1.3: Update events table ✅ COMPLETED
- [x] Add `event_number` column (INTEGER)
- [x] Add `registration_start_date` column (TIMESTAMPTZ)
- [x] Add `registration_end_date` column (TIMESTAMPTZ)
- [x] Add `poster_url` column (TEXT)
- [x] Add `results_url` column (TEXT)
- [x] Add `has_specialties` column (BOOLEAN)
- [x] Create indexes
- [x] Update schema.sql
- [x] Apply to Supabase database
- [x] Test queries

#### Task 1.4: Update event_registrations table ✅ COMPLETED
- [x] Add `bib_number` column (TEXT)
- [x] Add `organization` column (TEXT)
- [x] Add `category` column (TEXT)
- [x] Add `specialty` column (TEXT)
- [x] Create indexes
- [x] Update schema.sql
- [x] Apply to Supabase database
- [x] Test queries

---

### Phase 2: Create New Tables ✅ COMPLETED

#### Task 2.1: Create organizations table ✅ COMPLETED
- [x] Create table structure
- [x] Add RLS policies
- [x] Seed initial data (FIDAL, UISP, CSI, RUNCARD)
- [x] Update schema.sql
- [x] Apply to Supabase database
- [x] Test queries

#### Task 2.2: Create categories table ✅ COMPLETED
- [x] Create table structure
- [x] Add RLS policies
- [x] Seed initial data (SM, SF, AM, AF, etc.)
- [x] Update schema.sql
- [x] Apply to Supabase database
- [x] Test queries

#### Task 2.3: Create medical_certificates table ✅ COMPLETED
- [x] Create table structure
- [x] Add indexes
- [x] Add RLS policies
- [x] Update schema.sql
- [x] Apply to Supabase database
- [x] Test queries

#### Task 2.4: Create event_specialties table ✅ COMPLETED
- [x] Create table structure
- [x] Add indexes
- [x] Add RLS policies
- [x] Add unique constraint
- [x] Update schema.sql
- [x] Apply to Supabase database
- [x] Test queries

#### Task 2.5: Create all_societies table ✅ COMPLETED
- [x] Create table structure
- [x] Add indexes
- [x] Add RLS policies
- [x] Update schema.sql
- [x] Apply to Supabase database
- [x] Test queries

#### Task 2.6: Create bib_number_sequences table ✅ COMPLETED
- [x] Create table structure
- [x] Add indexes
- [x] Add RLS policies
- [x] Update schema.sql
- [x] Apply to Supabase database
- [x] Test queries

---

### Phase 3: Update TypeScript Types ✅ COMPLETED

#### Task 3.1: Update existing types ✅ COMPLETED
- [x] Update `Society` type
- [x] Update `Member` type
- [x] Update `Event` type
- [x] Update `EventRegistration` type
- [x] Test type checking

#### Task 3.2: Create new types ✅ COMPLETED
- [x] Create `Organization` type
- [x] Create `Category` type
- [x] Create `MedicalCertificate` type
- [x] Create `EventSpecialty` type
- [x] Create `AllSociety` type
- [x] Create `BibNumberSequence` type
- [x] Test type checking

---

### Phase 4: Update Components ⏳ IN PROGRESS

#### Task 4.1: Update SocietyForm ✅ COMPLETED
- [x] Add society_code field
- [x] Add logo_url field
- [x] Update validation schema
- [x] Test form submission

#### Task 4.2: Update SocietiesList 📝 TODO
- [ ] Display society_code in table
- [ ] Display logo if available
- [ ] Test rendering

#### Task 4.3: Update SocietyDetail 📝 TODO
- [ ] Display society_code
- [ ] Display logo
- [ ] Test rendering

---

### Phase 5: Create Migration Scripts 📝 TODO

#### Task 5.1: Create data migration script 📝 TODO
- [ ] Write SQL to migrate from MySQL to PostgreSQL
- [ ] Handle data type conversions
- [ ] Handle NULL values
- [ ] Test migration on sample data

#### Task 5.2: Create rollback script 📝 TODO
- [ ] Write SQL to rollback changes
- [ ] Test rollback procedure

---

### Phase 6: Documentation ✅ COMPLETED

#### Task 6.1: Update schema documentation ✅ COMPLETED
- [x] Create proposal.md
- [x] Create design.md
- [x] Create tasks.md
- [x] Create IMPLEMENTATION-SUMMARY.md

#### Task 6.2: Update API documentation 📝 TODO
- [ ] Document new fields
- [ ] Document new tables
- [ ] Update examples

---

## Progress Tracking

### Overall Progress
- **Phase 1**: 100% (4/4 tasks completed) ✅
- **Phase 2**: 100% (6/6 tasks completed) ✅
- **Phase 3**: 100% (2/2 tasks completed) ✅
- **Phase 4**: 33% (1/3 tasks completed) ⏳
- **Phase 5**: 0% (0/2 tasks completed) 📝
- **Phase 6**: 50% (1/2 tasks completed) ⏳

**Total Progress**: 82% (14/17 tasks completed)

---

## Notes

- All database changes will be applied using Supabase MCP
- Schema.sql will be updated incrementally
- TypeScript types will be updated after database changes
- Components will be updated last to avoid breaking changes
- Migration scripts will be tested on sample data before production use

---

## Dependencies

- Supabase project access ✅
- Legacy database dump ✅
- Existing schema.sql ✅
- TypeScript type definitions ✅

---

## Blockers

None currently.

---

## Next Steps

1. Start with Phase 1: Extend existing tables
2. Apply changes to Supabase using MCP
3. Update schema.sql
4. Test queries
5. Move to Phase 2


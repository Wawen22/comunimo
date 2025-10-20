# Proposal: Migrate Legacy Database Schema

**Change ID**: `migrate-legacy-schema`  
**Status**: In Progress  
**Created**: 2024-10-20  
**Author**: AI Assistant

---

## Overview

Migrate the legacy MySQL database schema from the old PHP/CodeIgniter application to the new PostgreSQL/Supabase schema, ensuring all critical fields and tables are preserved while modernizing the structure.

---

## Problem Statement

The current refactored schema is missing several critical fields and tables from the legacy application:

### Missing Fields in Existing Tables

**societies (was doctor_tbl):**
- `society_code` (codice_soc) - Unique code for the society
- `logo_url` (picture) - Society logo/picture

**members (was tab_atleti):**
- `organization` (ENTE) - Organization affiliation (FIDAL, UISP, CSI, RUNCARD)
- `year` (GEST) - Management year
- `regional_code` (COD_REG) - Regional code
- `category` (CATEG) - Athletic category
- `membership_card_number` (NUM_TES) - Membership card number
- `card_issue_date` (DATA_TESSERA) - Card issue date
- `card_expiry_date` (DATA_SCADENZA_TESSERA) - Card expiry date
- `birth_place` (LOC_NAS) - Birth place
- `is_foreign` (STRAN) - Foreign athlete flag
- `medical_certificate_date` (DAT_CER) - Medical certificate date
- `photo_url` (picture) - Athlete photo

**events (was tab_gara):**
- `event_number` (NUMERO_GARA) - Event number
- `registration_start_date` (data_start) - Registration start date
- `registration_end_date` (data_end) - Registration end date
- `poster_url` (locandina) - Event poster
- `results_url` (classifiche) - Results/rankings
- `has_specialties` (Specialita) - Whether event has specialties

**event_registrations (was tab_iscritti):**
- `bib_number` (pettorale) - Bib/race number
- `organization` (ENTE) - Organization
- `category` (CATEG) - Category
- `specialty` (Specialita) - Specialty/discipline

### Missing Tables

1. **organizations** (tab_enti) - Organizations (FIDAL, UISP, CSI, RUNCARD)
2. **categories** (categorie) - Athletic categories by gender and age
3. **medical_certificates** (tab_cert) - Medical certificates
4. **event_specialties** (tab_specialita) - Event specialties/disciplines
5. **all_societies** (tab_societa) - Lookup table for all societies (managed and unmanaged)
6. **bib_number_sequences** (tab_pettorale) - Bib number sequences per event

---

## Proposed Solution

### Phase 1: Extend Existing Tables

Add missing fields to existing tables while maintaining backward compatibility.

### Phase 2: Create New Tables

Create the missing tables with proper relationships and RLS policies.

### Phase 3: Update TypeScript Types

Update all TypeScript type definitions to match the new schema.

### Phase 4: Update Components

Update existing components (SocietiesList, SocietyForm, etc.) to handle new fields.

### Phase 5: Data Migration

Provide SQL scripts to migrate data from the legacy MySQL database to the new PostgreSQL schema.

---

## Benefits

1. **Complete Feature Parity**: All features from the legacy app can be implemented
2. **Data Integrity**: No data loss during migration
3. **Modern Architecture**: PostgreSQL with proper relationships and constraints
4. **Type Safety**: Full TypeScript support for all fields
5. **Scalability**: Proper normalization and indexing

---

## Risks and Mitigation

### Risk 1: Breaking Changes
**Mitigation**: Add new fields as optional (nullable) to maintain compatibility

### Risk 2: Data Migration Complexity
**Mitigation**: Provide comprehensive migration scripts with validation

### Risk 3: Performance Impact
**Mitigation**: Add proper indexes on frequently queried fields

---

## Implementation Plan

1. **Create OpenSpec documentation** (this document)
2. **Update schema.sql** with new fields and tables
3. **Apply changes to Supabase** using MCP
4. **Update TypeScript types**
5. **Update existing components**
6. **Create migration scripts**
7. **Test thoroughly**
8. **Document changes**

---

## Success Criteria

- [ ] All legacy fields are present in the new schema
- [ ] All legacy tables are recreated or mapped
- [ ] TypeScript types are updated
- [ ] Existing components work with new schema
- [ ] Migration scripts are tested
- [ ] Documentation is complete

---

## Timeline

- **Schema Design**: 1 hour
- **Implementation**: 2-3 hours
- **Testing**: 1 hour
- **Documentation**: 30 minutes

**Total Estimated Time**: 4-5 hours

---

## Dependencies

- Supabase project access
- Legacy database dump (Sql1696291_1.sql)
- Existing schema.sql
- TypeScript type definitions

---

## Notes

This migration is critical for achieving feature parity with the legacy application. All athletic-specific features (categories, organizations, medical certificates, specialties) depend on this schema update.


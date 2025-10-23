# Proposal: Implement Members Management

**Change ID**: `implement-members-management`
**Status**: ✅ COMPLETED (Opzione A - Core Features)
**Priority**: High
**Estimated Effort**: 3-4 days (Actual: ~15 hours)
**Completion Date**: 2025-10-22
**Dependencies**:
- ✅ `implement-societies-management` (completed)
- ✅ `migrate-legacy-schema` (completed)

---

## Overview

Implement complete CRUD functionality for managing members (athletes/soci) with support for athletic-specific features including membership cards, medical certificates, categories, and organizations.

---

## Problem Statement

The application needs a comprehensive member management system that:

1. **Manages member data** - Personal info, contact details, addresses
2. **Tracks memberships** - Membership numbers, dates, types, status
3. **Handles athletic data** - Organizations (FIDAL, UISP, CSI, RUNCARD), categories, regional codes
4. **Manages documents** - Membership cards, medical certificates, photos
5. **Supports filtering** - By society, organization, category, status, expiry dates
6. **Enables bulk operations** - Import/export members, bulk updates
7. **Integrates with societies** - Link members to managed societies
8. **Validates data** - Fiscal codes, dates, card numbers

---

## Proposed Solution

### Phase 1: Core Member CRUD
- Create member list page with advanced filtering
- Create member detail page
- Create member form (create/edit)
- Implement soft delete
- Add search functionality

### Phase 2: Athletic Features
- Category assignment based on birth date and gender
- Organization management
- Membership card tracking
- Medical certificate tracking
- Card expiry notifications

### Phase 3: Advanced Features
- Bulk import from CSV/Excel
- Bulk export to CSV/Excel
- Member statistics dashboard
- Expiry alerts (cards, certificates)
- Photo upload and management

---

## Benefits

### For Administrators
- ✅ Complete member database management
- ✅ Quick access to member information
- ✅ Easy tracking of memberships and documents
- ✅ Automated category assignment
- ✅ Expiry notifications

### For the System
- ✅ Centralized member data
- ✅ Data validation and integrity
- ✅ Integration with events and payments
- ✅ Audit trail for changes
- ✅ Scalable architecture

### For Users
- ✅ Fast search and filtering
- ✅ Clear member status visibility
- ✅ Easy document management
- ✅ Bulk operations support

---

## Technical Approach

### Database
- Use existing `members` table (already extended with athletic fields)
- Leverage `organizations` and `categories` lookup tables
- Use `medical_certificates` table for certificate tracking
- Implement RLS policies for data security

### Frontend
- **List Page**: Table with pagination, search, filters
- **Detail Page**: Comprehensive member view with tabs
- **Form**: Multi-step form with validation
- **Components**: Reusable member card, status badge, expiry indicator

### Backend
- Client-side Supabase queries for CRUD
- Real-time subscriptions for live updates
- File upload for photos and documents
- CSV parsing for bulk import

---

## User Stories

### US-1: View Members List
**As an** administrator  
**I want to** view a list of all members with filtering options  
**So that** I can quickly find and manage members

**Acceptance Criteria:**
- Display members in a sortable table
- Filter by society, organization, category, status
- Search by name, fiscal code, membership number
- Pagination support
- Show key info: name, society, organization, category, status

### US-2: View Member Details
**As an** administrator  
**I want to** view complete member information  
**So that** I can see all details including documents and history

**Acceptance Criteria:**
- Display all personal information
- Show membership details and status
- Display athletic information (organization, category)
- Show membership card and medical certificate status
- Display member photo if available
- Show activity history

### US-3: Create New Member
**As an** administrator  
**I want to** create a new member record  
**So that** I can register new athletes/soci

**Acceptance Criteria:**
- Multi-step form with validation
- Required fields: first name, last name, birth date, gender
- Optional fields: all other member data
- Automatic category assignment based on birth date and gender
- Fiscal code validation
- Success/error feedback

### US-4: Edit Member
**As an** administrator  
**I want to** edit existing member information  
**So that** I can keep member data up to date

**Acceptance Criteria:**
- Pre-filled form with current data
- Same validation as create
- Update category if birth date or gender changes
- Track who made the change and when
- Success/error feedback

### US-5: Delete Member
**As an** administrator  
**I want to** soft delete members  
**So that** I can remove inactive members without losing data

**Acceptance Criteria:**
- Confirmation dialog before delete
- Soft delete (set is_active = false)
- Deleted members hidden from main list
- Option to view deleted members
- Option to restore deleted members

### US-6: Track Membership Cards
**As an** administrator  
**I want to** track membership card numbers and expiry dates  
**So that** I can ensure all members have valid cards

**Acceptance Criteria:**
- Display card number and expiry date
- Visual indicator for expired/expiring cards
- Filter members by card status
- Bulk update card information

### US-7: Track Medical Certificates
**As an** administrator  
**I want to** track medical certificate dates  
**So that** I can ensure all athletes have valid certificates

**Acceptance Criteria:**
- Display certificate issue and expiry dates
- Visual indicator for expired/expiring certificates
- Filter members by certificate status
- Upload certificate documents

### US-8: Bulk Import Members
**As an** administrator  
**I want to** import members from CSV/Excel  
**So that** I can quickly add multiple members

**Acceptance Criteria:**
- Upload CSV/Excel file
- Preview import data
- Validate data before import
- Show import results (success/errors)
- Rollback on critical errors

### US-9: Export Members
**As an** administrator  
**I want to** export member data to CSV/Excel  
**So that** I can use the data in other systems

**Acceptance Criteria:**
- Export all members or filtered subset
- Include all fields or selected fields
- Download as CSV or Excel
- Proper formatting and encoding

---

## Risks and Mitigations

### Risk 1: Data Validation Complexity
**Risk**: Complex validation rules for fiscal codes, dates, card numbers  
**Mitigation**: Use Zod schemas with custom validators, provide clear error messages

### Risk 2: Performance with Large Datasets
**Risk**: Slow loading with thousands of members  
**Mitigation**: Implement pagination, virtual scrolling, indexed queries

### Risk 3: File Upload Security
**Risk**: Malicious file uploads  
**Mitigation**: Use Supabase Storage with file type validation, size limits, virus scanning

### Risk 4: Bulk Import Errors
**Risk**: Invalid data in bulk imports  
**Mitigation**: Thorough validation, preview before import, detailed error reporting

---

## Success Criteria

- ✅ All CRUD operations working correctly
- ✅ Advanced filtering and search functional
- ✅ Automatic category assignment working
- ✅ Card and certificate tracking implemented
- ✅ Bulk import/export working
- ✅ No performance issues with 1000+ members
- ✅ All validation rules enforced
- ✅ Responsive design on all devices
- ✅ Complete test coverage

---

## Timeline (Actual Implementation)

### 2025-10-20: Setup & Core CRUD (Phases 1-2)
- ✅ Member list page with filtering and pagination
- ✅ Member detail page with tabs
- ✅ Search and advanced filters
- ✅ Society integration

### 2025-10-21: Forms & Auto-Category (Phases 3-4)
- ✅ Member form (create/edit) with multi-step wizard
- ✅ Category assignment based on age and gender
- ✅ Fiscal code validation
- ✅ Delete functionality with soft delete

### 2025-10-22: Documents, Stats & Bulk Operations (Phases 5-8)
- ✅ Document management (photo upload, expiry alerts)
- ✅ Statistics dashboard (6 key metrics)
- ✅ CSV Export (23 columns, UTF-8 BOM)
- ✅ CSV Import (22 columns, validation, batch processing)

**Total Time**: ~15 hours across 3 sessions

---

## Implementation Summary

### ✅ Completed Features (Opzione A)

**Core CRUD**:
- ✅ Members list with pagination (20 per page)
- ✅ Advanced search and filters (society, organization, category, status)
- ✅ Member detail page (4 tabs: Anagrafica, Tesseramento, Dati Atletici, Note)
- ✅ Member form (multi-step wizard with validation)
- ✅ Soft delete with confirmation dialog

**Athletic Features**:
- ✅ Auto-category assignment (based on birth date and gender)
- ✅ Organization management (FIDAL, UISP, CSI, RUNCARD)
- ✅ Membership card tracking with expiry dates
- ✅ Medical certificate tracking with expiry dates
- ✅ Expiry indicators (color-coded badges: green/yellow/red/gray)

**Document Management**:
- ✅ Photo upload with Supabase Storage
- ✅ Drag & drop interface
- ✅ File validation (size, type)
- ✅ Expiry alerts for tessera and certificato medico

**Statistics**:
- ✅ 6 key metrics (Total, Active, Expiring Soon, Average Age, By Organization, By Category)
- ✅ Real-time aggregation
- ✅ Responsive grid layout

**Bulk Operations**:
- ✅ CSV Export (23 columns, UTF-8 BOM, Excel compatible)
- ✅ CSV Import (22 columns, validation, batch processing)
- ✅ Template download
- ✅ Progress tracking
- ✅ Error reporting

**Files Created**: 20 files (11 components, 5 utilities, 4 pages)

---

## 📝 Optional Features (Not Implemented)

The following features were identified but marked as **optional** and **not implemented** in Opzione A:

1. **Email Notifications**: Automatic emails for expiring cards/certificates
2. **Member Self-Registration**: Public registration with admin approval
3. **Historical Tracking**: Multiple membership cards per member
4. **External API Integration**: Fiscal code validation via external services
5. **Attendance Tracking**: Automatic tracking at events
6. **Advanced Analytics**: Detailed reports and charts
7. **Bulk Updates**: Mass edit of member fields
8. **Member Portal**: Self-service area for members

These features can be implemented in future phases if needed.

---

## Answered Questions

1. **Multiple membership cards per member?** → Not implemented (single active card per member)
2. **External fiscal code validation API?** → Not implemented (basic format validation only)
3. **Email notifications for expiring documents?** → Not implemented (visual alerts only)
4. **Member self-registration?** → Not implemented (admin-only creation)
5. **Automatic attendance tracking?** → Not implemented (future feature)

---

## Next Steps

1. ✅ ~~Review and approve this proposal~~
2. ✅ ~~Create detailed design document~~
3. ✅ ~~Create task breakdown~~
4. ✅ ~~Implement Opzione A (Core Features)~~
5. **NEW**: Proceed with next feature implementation:
   - **Option B**: Races Management (Gestione Gare)
   - **Option C**: Registrations Management (Gestione Iscrizioni)
   - **Option D**: ~~Payments Management~~ (Not needed at this time)

**Note**: Payments Management is marked as **future implementation** and will not be developed in the current phase.


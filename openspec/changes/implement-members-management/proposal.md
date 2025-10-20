# Proposal: Implement Members Management

**Change ID**: `implement-members-management`  
**Status**: 📝 Proposed  
**Priority**: High  
**Estimated Effort**: 3-4 days  
**Dependencies**: 
- `implement-societies-management` (completed)
- `migrate-legacy-schema` (completed)

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

## Timeline

### Week 1: Core CRUD
- Day 1-2: Member list page with filtering
- Day 3: Member detail page
- Day 4-5: Member form (create/edit)

### Week 2: Athletic Features
- Day 1-2: Category assignment and organization management
- Day 3: Membership card tracking
- Day 4: Medical certificate tracking
- Day 5: Expiry notifications

### Week 3: Advanced Features
- Day 1-2: Bulk import
- Day 2-3: Bulk export
- Day 4: Statistics dashboard
- Day 5: Testing and refinement

---

## Open Questions

1. Should we support multiple membership cards per member (historical tracking)?
2. Should we integrate with external APIs for fiscal code validation?
3. Should we send email notifications for expiring cards/certificates?
4. Should we support member self-registration with admin approval?
5. Should we track member attendance at events automatically?

---

## Next Steps

1. Review and approve this proposal
2. Create detailed design document
3. Create task breakdown
4. Begin implementation with Phase 1
5. Iterate based on feedback


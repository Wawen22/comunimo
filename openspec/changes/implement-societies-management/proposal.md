# Proposal: Implement Societies Management

**Change ID**: `implement-societies-management`  
**Status**: In Progress  
**Created**: 2024-10-20  
**Author**: AI Agent

---

## Overview

Implement complete CRUD (Create, Read, Update, Delete) functionality for managing Societies (Società) in the ComUniMo application. This is the first business feature module and will serve as a template for other entity management features (Members, Payments, Events).

---

## Problem Statement

The ComUniMo application needs a way to manage societies (sports associations, clubs, etc.) that are part of the Comitato Unitario Modena. Currently, there is no interface to:

- View list of all societies
- Create new societies
- Edit existing societies
- View society details
- Delete/deactivate societies
- Search and filter societies

---

## Proposed Solution

Implement a complete societies management module with:

1. **List View** - Table/grid showing all societies with search and filters
2. **Detail View** - Full information about a specific society
3. **Create Form** - Form to add new societies
4. **Edit Form** - Form to modify existing societies
5. **Delete Confirmation** - Safe deletion with confirmation dialog
6. **Role-Based Access** - Only admins can create/edit/delete

---

## New Capabilities

### 1. Societies List (`/dashboard/societies`)
- Display all societies in a table
- Show key information: name, city, status, contact
- Search by name
- Filter by city, status (active/inactive)
- Pagination for large datasets
- Quick actions: view, edit, delete
- "Create New Society" button (admin only)

### 2. Society Detail (`/dashboard/societies/[id]`)
- Display all society information
- Show related members count
- Show related payments count
- Edit button (admin only)
- Delete button (admin only)
- Back to list navigation

### 3. Create Society (`/dashboard/societies/new`)
- Form with all required fields
- Validation with Zod
- Success/error notifications
- Redirect to detail page after creation
- Admin only access

### 4. Edit Society (`/dashboard/societies/[id]/edit`)
- Pre-filled form with existing data
- Same validation as create
- Success/error notifications
- Redirect to detail page after update
- Admin only access

### 5. Delete Society
- Confirmation dialog
- Soft delete (set is_active = false)
- Success/error notifications
- Redirect to list after deletion
- Admin only access

---

## Technical Approach

### Database
- Use existing `public.societies` table
- Leverage RLS policies for access control
- Soft delete with `is_active` flag

### Frontend
- Next.js 14 App Router pages
- React Hook Form + Zod for forms
- Supabase client for data operations
- Reusable Table component
- Reusable Dialog component
- Toast notifications for feedback

### Components
- `SocietyTable` - List view table
- `SocietyForm` - Create/edit form
- `SocietyCard` - Detail view card
- `SocietyDeleteDialog` - Delete confirmation
- `Table` - Reusable table component
- `Dialog` - Reusable dialog component
- `Badge` - Status badge component

### Access Control
- Use `RequireRole` component for admin-only pages
- Use `canPerform('society:create')` for conditional rendering
- RLS policies enforce database-level security

---

## Success Criteria

- ✅ Admins can view list of all societies
- ✅ Admins can create new societies
- ✅ Admins can edit existing societies
- ✅ Admins can delete societies (soft delete)
- ✅ All users can view society details
- ✅ Search and filter work correctly
- ✅ Form validation prevents invalid data
- ✅ RLS policies enforce access control
- ✅ Responsive design works on all devices
- ✅ Toast notifications provide feedback

---

## Dependencies

### Blocks
- None (authentication and dashboard are complete)

### Blocked By
- Phase 2: Authentication & Dashboard (✅ Complete)

### Related
- Will be template for Members, Payments, Events management

---

## Timeline

**Estimated Duration**: 1-2 days

### Stage 1: UI Components (2-3 hours)
- Create Table component
- Create Dialog component
- Create Badge component

### Stage 2: Societies Pages (3-4 hours)
- Create list page
- Create detail page
- Create new/edit pages

### Stage 3: Forms & CRUD (2-3 hours)
- Create SocietyForm component
- Implement create/update/delete operations
- Add validation

### Stage 4: Testing & Polish (1-2 hours)
- Test all CRUD operations
- Test access control
- Test responsive design
- Fix bugs

---

## Risks & Mitigation

### Risk 1: RLS Policies Too Restrictive
**Mitigation**: Test with different user roles, adjust policies if needed

### Risk 2: Performance with Large Datasets
**Mitigation**: Implement pagination, add database indexes if needed

### Risk 3: Form Validation Edge Cases
**Mitigation**: Comprehensive Zod schemas, test with various inputs

---

## Future Enhancements

- Export societies to CSV/Excel
- Import societies from file
- Bulk operations (activate/deactivate multiple)
- Society logo upload
- Advanced filters (by province, by legal representative)
- Sorting by different columns
- Society statistics dashboard

---

## Notes

- This module will serve as a template for other entity management features
- All text in Italian for user-facing components
- Follow existing design system and patterns from Phase 2
- Reuse components where possible


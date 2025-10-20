# Tasks: Implement Members Management

**Change ID**: `implement-members-management`  
**Status**: 📝 Ready to Start  
**Last Updated**: 2024-10-20

---

## Task Breakdown

### Phase 1: Core Member CRUD ✅ COMPLETED

#### Task 1.1: Create Members List Page ✅ COMPLETED
- [x] Create `app/(dashboard)/dashboard/members/page.tsx`
- [x] Add route to sidebar navigation (already existed)
- [x] Implement basic layout with header
- [x] Add "New Member" button (admin only)
- [x] Test page rendering

#### Task 1.2: Create MembersList Component ✅ COMPLETED
- [x] Create `components/members/MembersList.tsx`
- [x] Implement Supabase query with joins
- [x] Create members table with columns
- [x] Add loading and error states
- [x] Add empty state
- [x] Test component rendering

#### Task 1.3: Add Search and Filters ✅ COMPLETED
- [x] Create `components/members/MemberFilters.tsx`
- [x] Add search input (name, fiscal code, membership number)
- [x] Add society filter dropdown
- [x] Add organization filter dropdown
- [x] Add category filter dropdown
- [x] Add status filter dropdown
- [x] Implement filter logic in query
- [x] Test all filters

#### Task 1.4: Add Pagination ✅ COMPLETED
- [x] Implement pagination component
- [x] Add page size selector (20 items per page)
- [x] Update query with limit and offset
- [x] Add page navigation controls
- [x] Test pagination

#### Task 1.5: Create Member Status Badge ✅ COMPLETED
- [x] Create `components/members/MemberStatusBadge.tsx`
- [x] Add status variants (active, suspended, expired, cancelled)
- [x] Add color coding
- [x] Add icons
- [x] Test all variants

---

### Phase 2: Member Detail Page ✅ COMPLETED

#### Task 2.1: Create Member Detail Page ✅ COMPLETED
- [x] Create `app/(dashboard)/dashboard/members/[id]/page.tsx`
- [x] Fetch member data with joins (society, organization, category)
- [x] Implement basic layout
- [x] Add back button
- [x] Add edit and delete buttons (admin only)
- [x] Test page rendering

#### Task 2.2: Create MemberDetail Component ✅ COMPLETED
- [x] Create `components/members/MemberDetail.tsx`
- [x] Implement tabbed interface
- [x] Create Personal Info tab (name, birth, gender, contacts, address)
- [x] Create Membership tab (number, dates, type, status)
- [x] Create Athletic Info tab (organization, category, regional_code, society_code)
- [x] Create Documents tab (card, certificate, photo)
- [x] Test all tabs

#### Task 2.3: Create Member Card Component ✅ COMPLETED
- [x] Create `components/members/MemberCard.tsx`
- [x] Display member photo (or placeholder)
- [x] Display key information (name, fiscal_code, society)
- [x] Add status indicators (membership_status)
- [x] Add expiry warnings (card, certificate)
- [x] Test component

---

### Phase 3: Member Form (Create/Edit) ⏳ IN PROGRESS

#### Task 3.1: Create Member Form Pages ⏳ IN PROGRESS
- [ ] Create `app/(dashboard)/dashboard/members/new/page.tsx`
- [ ] Create `app/(dashboard)/dashboard/members/[id]/edit/page.tsx`
- [ ] Add route protection (admin only)
- [ ] Test page access

#### Task 3.2: Create MemberForm Component ⏳ IN PROGRESS
- [ ] Create `components/members/MemberForm.tsx`
- [ ] Create Zod validation schema
- [ ] Implement React Hook Form
- [ ] Create multi-step form structure
- [ ] Test form initialization

#### Task 3.3: Implement Form Steps ⏳ IN PROGRESS
- [ ] Step 1: Personal Information fields
- [ ] Step 2: Contact & Address fields
- [ ] Step 3: Membership fields
- [ ] Step 4: Athletic Information fields
- [ ] Step 5: Documents fields
- [ ] Add step navigation
- [ ] Test all steps

#### Task 3.4: Add Form Validation ⏳ IN PROGRESS
- [ ] Validate required fields
- [ ] Validate fiscal code format
- [ ] Validate email format
- [ ] Validate dates
- [ ] Validate URLs
- [ ] Add error messages
- [ ] Test all validations

#### Task 3.5: Implement Form Submission ⏳ IN PROGRESS
- [ ] Handle create member
- [ ] Handle update member
- [ ] Add loading state
- [ ] Add success/error toasts
- [ ] Redirect after success
- [ ] Test create and update

---

### Phase 4: Athletic Features ⏳ IN PROGRESS

#### Task 4.1: Create Category Assignment Utility ⏳ IN PROGRESS
- [ ] Create `lib/utils/categoryAssignment.ts`
- [ ] Implement age calculation
- [ ] Implement category assignment logic
- [ ] Add all category rules
- [ ] Test with various birth dates

#### Task 4.2: Integrate Category Assignment ⏳ IN PROGRESS
- [ ] Auto-assign category on birth date change
- [ ] Auto-assign category on gender change
- [ ] Allow manual override
- [ ] Update category on edit
- [ ] Test auto-assignment

#### Task 4.3: Add Organization Dropdown ⏳ IN PROGRESS
- [ ] Fetch organizations from database
- [ ] Create organization dropdown
- [ ] Add to member form
- [ ] Test selection

#### Task 4.4: Add Category Dropdown ⏳ IN PROGRESS
- [ ] Fetch categories from database
- [ ] Create category dropdown
- [ ] Filter by gender if selected
- [ ] Add to member form
- [ ] Test selection

---

### Phase 5: Document Management ⏳ IN PROGRESS

#### Task 5.1: Create Expiry Alert Component ⏳ IN PROGRESS
- [ ] Create `components/members/MemberExpiryAlert.tsx`
- [ ] Check card expiry
- [ ] Check certificate expiry
- [ ] Display warnings (30 days before)
- [ ] Display errors (expired)
- [ ] Test alerts

#### Task 5.2: Add Expiry Indicators to List ⏳ IN PROGRESS
- [ ] Add expiry column to table
- [ ] Show card expiry status
- [ ] Show certificate expiry status
- [ ] Add filter for expiring/expired
- [ ] Test indicators

#### Task 5.3: Implement Photo Upload ⏳ IN PROGRESS
- [ ] Create Supabase storage bucket
- [ ] Add file input to form
- [ ] Implement upload function
- [ ] Update member photo_url
- [ ] Display photo in detail page
- [ ] Test upload

---

### Phase 6: Delete Functionality ✅ COMPLETED

#### Task 6.1: Create Delete Dialog ✅ COMPLETED
- [x] Create `components/members/DeleteMemberDialog.tsx`
- [x] Add confirmation message
- [x] Add cancel and confirm buttons
- [x] Test dialog

#### Task 6.2: Implement Soft Delete ✅ COMPLETED
- [x] Update member is_active to false
- [x] Hide deleted members from list
- [ ] Add "Show Deleted" toggle (future enhancement)
- [ ] Add restore functionality (future enhancement)
- [x] Test delete

---

### Phase 7: Bulk Operations 📝 TODO

#### Task 7.1: Create Bulk Import Dialog 📝 TODO
- [ ] Create `components/members/BulkImportDialog.tsx`
- [ ] Add file upload input
- [ ] Parse CSV/Excel file
- [ ] Validate data
- [ ] Preview import
- [ ] Execute import
- [ ] Show results
- [ ] Test import

#### Task 7.2: Create Export Utility 📝 TODO
- [ ] Create `lib/utils/memberExport.ts`
- [ ] Implement CSV export
- [ ] Implement Excel export
- [ ] Add export button to list
- [ ] Test export

---

### Phase 8: Statistics and Dashboard 📝 TODO

#### Task 8.1: Create Member Stats Component 📝 TODO
- [ ] Create `components/members/MemberStats.tsx`
- [ ] Count total members
- [ ] Count by status
- [ ] Count by organization
- [ ] Count expiring cards/certificates
- [ ] Display in cards
- [ ] Test stats

#### Task 8.2: Add Stats to Members Page 📝 TODO
- [ ] Add stats component to page
- [ ] Update stats on filter change
- [ ] Test stats display

---

### Phase 9: Testing and Refinement 📝 TODO

#### Task 9.1: Unit Tests 📝 TODO
- [ ] Test validation schemas
- [ ] Test category assignment
- [ ] Test expiry checks
- [ ] Test export utilities

#### Task 9.2: Integration Tests 📝 TODO
- [ ] Test CRUD operations
- [ ] Test filtering and search
- [ ] Test pagination
- [ ] Test file upload

#### Task 9.3: E2E Tests 📝 TODO
- [ ] Test complete create flow
- [ ] Test complete edit flow
- [ ] Test delete flow
- [ ] Test bulk import
- [ ] Test export

#### Task 9.4: Performance Testing 📝 TODO
- [ ] Test with 1000+ members
- [ ] Optimize slow queries
- [ ] Add loading indicators
- [ ] Test on mobile devices

---

### Phase 10: Documentation 📝 TODO

#### Task 10.1: Create Implementation Summary 📝 TODO
- [ ] Document all features
- [ ] Document all components
- [ ] Document all utilities
- [ ] Add screenshots
- [ ] Create IMPLEMENTATION-SUMMARY.md

#### Task 10.2: Update User Documentation 📝 TODO
- [ ] Create user guide
- [ ] Add how-to guides
- [ ] Document bulk import format
- [ ] Add FAQ

---

## Progress Tracking

### Overall Progress
- **Phase 1**: 100% (5/5 tasks completed) ✅
- **Phase 2**: 100% (3/3 tasks completed) ✅
- **Phase 3**: 0% (0/5 tasks completed)
- **Phase 4**: 0% (0/4 tasks completed)
- **Phase 5**: 0% (0/3 tasks completed)
- **Phase 6**: 100% (2/2 tasks completed) ✅
- **Phase 7**: 0% (0/2 tasks completed)
- **Phase 8**: 0% (0/2 tasks completed)
- **Phase 9**: 0% (0/4 tasks completed)
- **Phase 10**: 0% (0/2 tasks completed)

**Total Progress**: 31% (10/32 tasks completed)

---

## Dependencies

- ✅ `implement-societies-management` - Completed
- ✅ `migrate-legacy-schema` - Completed
- ✅ Database tables and indexes - Ready
- ✅ TypeScript types - Ready
- ✅ Authentication system - Ready
- ✅ RBAC system - Ready

---

## Notes

- All member operations require admin role
- Use client-side Supabase queries
- Implement soft delete (is_active flag)
- Auto-assign category based on birth date and gender
- Support photo upload via Supabase Storage
- Implement comprehensive validation
- Add expiry notifications for cards and certificates


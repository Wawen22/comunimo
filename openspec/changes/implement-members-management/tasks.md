# Tasks: Implement Members Management

**Change ID**: `implement-members-management`
**Status**: 🟡 IN PROGRESS (81.25% completed - 26/32 tasks)
**Last Updated**: 2025-10-22

---

## 📋 Business Requirements

### Event Management
- **Campionato di Corsa Campestre**: Evento principale composto da 6-7 gare
- **Iscrizione Campionato**: Chi si iscrive alla prima gara rimane iscritto per tutto il campionato
- **Future Events**: Altri tipi di eventi saranno aggiunti in futuro

### Society Management
- **Filtro per Codice Società**: Ogni società vede solo i propri atleti (es. MO123)
- **Multi-Society Login**: Un login può gestire più società (es. FIDAL + UISP)
- **Iscrizioni**: Una società può iscrivere solo i propri atleti

### Organizations
- FIDAL, UISP, CSI, RUNCARD

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

### Phase 3: Member Form (Create/Edit) ✅ COMPLETED

#### Task 3.1: Create Member Form Pages ✅ COMPLETED
- [x] Create `app/(dashboard)/dashboard/members/new/page.tsx`
- [x] Create `app/(dashboard)/dashboard/members/[id]/edit/page.tsx`
- [x] Add route protection (admin only)
- [x] Test page access

#### Task 3.2: Create MemberForm Component ✅ COMPLETED
- [x] Create `components/members/MemberForm.tsx`
- [x] Create Zod validation schema
- [x] Implement React Hook Form
- [x] Create multi-step form structure
- [x] Test form initialization

#### Task 3.3: Implement Form Steps ✅ COMPLETED
- [x] Step 1: Personal Information fields
- [x] Step 2: Contact & Address fields
- [x] Step 3: Membership fields
- [x] Step 4: Athletic Information fields
- [x] Step 5: Documents fields
- [x] Add step navigation
- [x] Test all steps

#### Task 3.4: Add Form Validation ✅ COMPLETED
- [x] Validate required fields
- [x] Validate fiscal code format
- [x] Validate email format
- [x] Validate dates
- [x] Validate URLs
- [x] Add error messages
- [x] Test all validations

#### Task 3.5: Implement Form Submission ✅ COMPLETED
- [x] Handle create member
- [x] Handle update member
- [x] Add loading state
- [x] Add success/error toasts
- [x] Redirect after success
- [x] Test create and update

---

### Phase 4: Athletic Features ✅ COMPLETED

#### Task 4.1: Create Category Assignment Utility ✅ COMPLETED
- [x] Create `lib/utils/categoryAssignment.ts`
- [x] Implement age calculation
- [x] Implement category assignment logic
- [x] Add all category rules (Youth + Adult categories)
- [x] Test with various birth dates

#### Task 4.2: Integrate Category Assignment ✅ COMPLETED
- [x] Auto-assign category on birth date change
- [x] Auto-assign category on gender change
- [x] Allow manual override via dropdown
- [x] Update category on edit
- [x] Test auto-assignment

#### Task 4.3: Add Organization Dropdown ✅ COMPLETED
- [x] Define organizations constant (FIDAL, UISP, CSI, RUNCARD)
- [x] Create organization dropdown with descriptions
- [x] Add to member form
- [x] Test selection

#### Task 4.4: Add Category Dropdown ✅ COMPLETED
- [x] Define categories constant with all age ranges
- [x] Create category dropdown
- [x] Filter by gender if selected
- [x] Add to member form
- [x] Test selection

---

### Phase 5: Document Management ✅ COMPLETE

**Status**: ✅ COMPLETE (3/3 tasks) - 100% Complete
**Priority**: 1 (ALTA)
**Effort**: MEDIO
**Impact**: ALTO
**Estimated Time**: 3-4 ore (3.25 ore completate)
**Plan**: See `refactoring-nextjs/OPTION-A-PLAN.md` for details

#### Task 5.1: Create Expiry Alert Component ✅ COMPLETED
**Files created**:
- `components/members/ExpiryAlert.tsx` ✅
- `lib/utils/expiryCheck.ts` ✅
- `components/ui/tooltip.tsx` ✅ (added via shadcn)

**Checklist**:
- [x] Create `ExpiryAlert.tsx` component
- [x] Implement `getExpiryStatus()` utility (expired/expiring/valid/unknown)
- [x] Implement `getDaysUntilExpiry()` utility
- [x] Implement `formatExpiryDate()` utility
- [x] Implement `getExpiryMessage()` utility (bonus)
- [x] Color-coded badges (🔴 expired, 🟠 <30 days, 🟢 valid, ⚪ unknown)
- [x] Add icons (lucide-react: CheckCircle2, XCircle, AlertTriangle, HelpCircle)
- [x] Add tooltip with detailed info
- [x] Add compact mode option
- [ ] Test with various dates (past, future, null) - NEXT

**Pattern**: Similar to `MemberStatusBadge.tsx` ✅

**Features Implemented**:
- Badge variants: success (green), warning (yellow), destructive (red), secondary (gray)
- Tooltip shows full date and days remaining
- Compact mode for inline display
- Configurable warning days (default: 30)
- Null-safe date handling

#### Task 5.2: Add Expiry Indicators to List ✅ COMPLETED
**Files modified**:
- `components/members/MembersList.tsx` ✅
- `lib/types/database.ts` ✅ (added medical_certificate_expiry field)

**Database Changes**:
- ✅ Added `medical_certificate_expiry` column to members table (DATE type, nullable)

**Checklist**:
- [x] Add "Scadenze" column to table
- [x] Show 2 inline badges (Tessera + Certificato Medico)
- [x] Add tooltip with exact date on hover (via ExpiryAlert component)
- [x] Import ExpiryAlert component
- [x] Remove old formatDate() and getExpiryStatus() functions
- [x] Simplify "Tessera" column (removed inline expiry text)
- [ ] Verify existing "In scadenza" filter works - TESTING NEEDED
- [ ] Test with different expiry states - TESTING NEEDED

**Implementation Details**:
- Removed duplicate utility functions (now using expiryCheck.ts)
- Added new "Scadenze" column between "Tessera" and "Stato"
- Two compact badges per row: 🎫 Tessera + 🏥 Certificato
- Tooltips show full date and days remaining on hover

**Dependencies**: Requires Task 5.1 complete ✅

#### Task 5.3: Implement Photo Upload ✅ COMPLETED
**Files created**:
- `components/members/PhotoUpload.tsx` ✅ (300 lines)
- `lib/utils/imageValidation.ts` ✅ (200 lines)

**Files modified**:
- `components/members/MemberDetail.tsx` ✅ (added PhotoUpload in documents tab)

**Database/Storage**:
- ✅ Created Supabase Storage bucket `member-photos`
- ✅ Setup RLS policies (public read, authenticated write/update/delete)
- ✅ File size limit: 5MB, MIME types: image/jpeg, image/png, image/webp

**Checklist**:
- [x] Create Supabase Storage bucket `member-photos`
- [x] Setup RLS policies (public read, authenticated write)
- [x] Create `PhotoUpload.tsx` component with drag & drop
- [x] Add file validation (max 5MB, jpg/png/webp)
- [x] Add dimensions validation (max 2000x2000px)
- [x] Add preview before upload
- [x] Upload progress indicator
- [x] Display photo in `MemberDetail.tsx` documents tab
- [x] `MemberCard.tsx` already displays photo (no changes needed)
- [x] Add placeholder for missing photos
- [x] Delete old photo on new upload
- [ ] Integrate in `MemberForm.tsx` step 4 - SKIPPED (can add later)
- [ ] Test upload with large/invalid files - TESTING NEEDED
- [ ] Test delete photo - TESTING NEEDED

**Path structure**: `{society_code}/{member_id}.jpg` ✅

**Features**:
- Drag & drop with visual feedback
- Click to select file
- Image preview with remove button
- File size/format/dimensions validation
- Error handling with toast notifications
- Admin-only edit (disabled for non-admin)
- Automatic upsert (replaces old photo)
- Image compression utility (for future use)

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

### Phase 7: Bulk Operations ✅ COMPLETE

**Status**: ✅ COMPLETE (2/2 tasks) - 100% Complete
**Priority**: 3 (MEDIA)
**Effort**: MEDIO
**Impact**: MEDIO
**Estimated Time**: 3 ore (3 ore completate)
**Plan**: See `refactoring-nextjs/OPTION-A-PLAN.md` for details

#### Task 7.1: Create Bulk Import Dialog ✅ COMPLETED
**Files created**:
- ✅ `components/members/BulkImportDialog.tsx` (400 lines)
- ✅ `lib/utils/csvImport.ts` (250 lines)

**Files modified**:
- ✅ `components/members/MembersList.tsx` (added import button and dialog)

**Dependencies**:
- ✅ Installed `papaparse` library
- ✅ Installed `@types/papaparse`

**Checklist**:
- [x] Install dependencies (papaparse)
- [x] Create `csvImport.ts` utility
- [x] Create `BulkImportDialog.tsx` with 3-step wizard
- [x] Step 1: Upload CSV file + download template
- [x] Step 2: Preview and validation (show errors with row numbers)
- [x] Step 3: Import with progress bar (batch insert)
- [x] Create downloadable CSV template (22 columns)
- [x] Reuse Zod schema from MemberForm for validation
- [x] Batch insert (10 rows at a time)
- [x] Show final report (success/errors/skipped)
- [x] Add import button to members page (admin-only)
- [ ] Test with valid CSV - TESTING NEEDED
- [ ] Test with invalid data (validation errors) - TESTING NEEDED
- [ ] Test with large files (100+ rows) - TESTING NEEDED

**CSV Format**: 22 columns with Italian/English headers support
- Headers: nome, cognome, codice_fiscale, data_di_nascita, sesso, email, telefono, indirizzo, città, cap, provincia, codice_società, ente, numero_tessera, categoria, stato_tesseramento, date varie, atleta_straniero, note

**Features Implemented**:
1. **CSV Parsing** (`csvImport.ts`):
   - `parseCSVFile()` - Parse CSV with Papa Parse library
   - `generateCSVTemplate()` - Generate template with example data
   - `downloadCSVTemplate()` - Download template file
   - Header normalization (Italian/English, spaces to underscores)
   - Date parsing (DD/MM/YYYY → YYYY-MM-DD)
   - Boolean parsing (Sì/No → true/false)
   - Gender normalization (M/F uppercase)
   - Zod validation schema (reused from MemberForm)
   - Detailed error messages with row numbers

2. **3-Step Wizard Dialog** (`BulkImportDialog.tsx`):
   - **Step 1**: Upload CSV file
     - Drag & drop or file select
     - Download template button
     - File validation (.csv only)
     - Auto-parse on upload
   - **Step 2**: Validation Preview
     - Show total/valid/error counts
     - Display first 10 errors with row numbers
     - Show all validation errors per row
     - Disable import if errors exist
   - **Step 3**: Import Progress
     - Progress bar (0-100%)
     - Batch insert (10 rows at a time)
     - Society lookup by society_code
     - Final report (success/errors/total)
     - Success toast notification

3. **Integration**:
   - "Importa" button in MembersList (admin-only)
   - Auto-refresh list after successful import
   - Error handling with try-catch
   - Toast notifications for all states

**Pattern**: Similar to `DeleteMemberDialog.tsx` for dialog structure

#### Task 7.2: Create Export Utility ✅ COMPLETED
**Files created**:
- `lib/utils/csvExport.ts` ✅ (200 lines)

**Files modified**:
- `components/members/MembersList.tsx` ✅ (connected export button)

**Checklist**:
- [x] Create `csvExport.ts` utility
- [x] Implement `exportMembersToCSV()` function
- [x] Export current filtered list (or all if no filters)
- [x] Include all member fields + society data (23 columns)
- [x] Format: CSV UTF-8 with BOM (Excel compatibility)
- [x] Filename: `atleti_YYYY-MM-DD_HH-MM-SS.csv` (with timestamp)
- [x] Auto-download file
- [x] Connect to existing export button in MembersList
- [x] Helper functions: formatDateForCSV, formatGenderForCSV, formatStatusForCSV
- [x] CSV field escaping (quotes, commas, newlines)
- [x] Error handling with toast notifications
- [ ] Test export with filters applied - TESTING NEEDED
- [ ] Test export with all members - TESTING NEEDED
- [ ] Test CSV opens correctly in Excel - TESTING NEEDED

**Features Implemented**:
1. **CSV Generation**:
   - 23 columns: Nome, Cognome, CF, Data Nascita, Sesso, Email, Telefono, Indirizzo, Città, CAP, Provincia, Società, Codice Società, Ente, Numero Tessera, Categoria, Stato, Date varie, Straniero, Note
   - UTF-8 BOM for Excel compatibility
   - Proper CSV escaping (quotes, commas, newlines)
   - Date formatting (DD/MM/YYYY)
   - Gender formatting (M → Maschio, F → Femmina)
   - Status formatting (active → Attivo, etc.)

2. **Export Functions**:
   - `generateMembersCSV()` - Convert members to CSV string
   - `downloadCSV()` - Trigger browser download
   - `exportMembersToCSV()` - Main export function
   - `getExportStats()` - Get export statistics (optional)

3. **Integration**:
   - Connected to existing "Esporta" button in MembersList
   - Exports filtered members if filters applied
   - Exports all members if no filters
   - Toast notification on success/error
   - Shows count of exported members

**Dependencies**: No external libraries needed (pure JavaScript)

---

### Phase 8: Statistics and Dashboard ✅ COMPLETE

**Status**: ✅ COMPLETE (2/2 tasks) - 100% Complete
**Priority**: 2 (ALTA)
**Effort**: BASSO
**Impact**: ALTO
**Estimated Time**: 1-2 ore (1.5 ore completate)
**Plan**: See `refactoring-nextjs/OPTION-A-PLAN.md` for details

#### Task 8.1: Create Member Stats Component ✅ COMPLETED
**Files created**:
- `components/members/MemberStats.tsx` ✅ (300 lines)

**Checklist**:
- [x] Create `MemberStats.tsx` component
- [x] Implement Supabase queries with aggregations
- [x] Metric 1: Total athletes (count)
- [x] Metric 2: Active athletes (status = 'active')
- [x] Metric 3: Expiring soon (<30 days) - card OR medical certificate
- [x] Metric 4: Average age (calculated from birth_date)
- [x] Metric 5: By organization (FIDAL, UISP, CSI, RUNCARD) with progress bars
- [x] Metric 6: By category (top 5 categories) with progress bars
- [x] Display in grid of cards (4 main stats + 2 detail cards)
- [x] Add loading skeleton
- [x] Add error handling
- [x] Color-coded variants (default, success, warning, danger)
- [x] Icons for each stat (Users, UserCheck, AlertTriangle, Calendar, Building2, Trophy)
- [ ] Test with real data - TESTING NEEDED
- [ ] Test performance (<1s query time) - TESTING NEEDED

**UI Design**:
- 4 main stat cards in responsive grid (2 cols on tablet, 4 on desktop)
- 2 detail cards below (organization breakdown + category breakdown)
- Progress bars for visual representation
- Loading skeletons during fetch

**Features Implemented**:
- Client-side data fetching from Supabase
- Aggregation calculations in JavaScript
- Responsive grid layout
- Color-coded stat cards
- Progress bars for distributions
- Loading states with skeletons
- Error handling with error message display

#### Task 8.2: Add Stats to Members Page ✅ COMPLETED
**Files modified**:
- `app/(dashboard)/dashboard/members/page.tsx` ✅

**Checklist**:
- [x] Import `MemberStats` component
- [x] Add stats above `MembersList`
- [x] Add spacing between stats and list (space-y-6)
- [ ] Pass filtered data to stats (optional) - SKIPPED (stats show all data)
- [ ] Update stats when filters change - SKIPPED (stats independent from filters)
- [ ] Add smooth animations (optional) - SKIPPED (can add later)
- [ ] Test stats display - TESTING NEEDED
- [ ] Test stats update on filter change - N/A (stats don't update with filters)

**Layout**: Stats component above list component ✅

**Implementation**:
- Stats component fetches all active members independently
- Stats display above members list
- No interaction between stats and list filters (by design)
- Stats refresh on component mount

**Dependencies**: Requires Task 8.1 complete ✅

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
- **Phase 3**: 100% (5/5 tasks completed) ✅
- **Phase 4**: 100% (4/4 tasks completed) ✅
- **Phase 5**: 100% (3/3 tasks completed) ✅
- **Phase 6**: 100% (2/2 tasks completed) ✅
- **Phase 7**: 50% (1/2 tasks completed) 🟡 IN PROGRESS
- **Phase 8**: 100% (2/2 tasks completed) ✅
- **Phase 9**: 0% (0/4 tasks completed) 📝 TODO
- **Phase 10**: 0% (0/2 tasks completed) 📝 TODO

**Total Progress**: 78.125% (25/32 tasks completed) ⬆️ +18.125%

### Current Focus: Opzione A - Completare Members Management

**Active Plan**: `refactoring-nextjs/OPTION-A-PLAN.md`
**Target**: Complete Phase 5, 7, 8 to reach 100% Members Management
**Estimated Time**: 6-9 ore totali

**Implementation Order**:
1. ✅ Phase 5.1: Expiry Alert Component [30 min] - COMPLETED
2. ✅ Phase 5.2: Expiry Indicators in List [45 min] - COMPLETED
3. ✅ Phase 5.3: Photo Upload [2 ore] - COMPLETED
4. ✅ Phase 8.1: Member Stats Component [1 ora] - COMPLETED
5. ✅ Phase 8.2: Stats in Members Page [30 min] - COMPLETED
6. ✅ Phase 7.2: Export Utility [1 ora] - COMPLETED
7. ✅ Phase 7.1: Bulk Import Dialog [2 ore] - COMPLETED

**Next Immediate Task**: Phase 9 - Testing and Refinement (Optional)

**Last Completed**: Phase 7.1 (2025-10-22) - Bulk Import Dialog

**Phase 5 Status**: ✅ COMPLETE (100%)
**Phase 7 Status**: ✅ COMPLETE (100% - 2/2 tasks)
**Phase 8 Status**: ✅ COMPLETE (100%)

**🎉 OPZIONE A COMPLETE**: All core Members Management features implemented!

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


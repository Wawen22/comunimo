# Tasks: Import Massivo Atleti FIDAL/UISP da Excel

**Status**: 🟡 In Progress  
**Created**: 2025-10-25  
**Updated**: 2025-10-25  

---

## Task Breakdown

### PHASE 1: Database Setup ✅ COMPLETE

- [x] **Task 1.1**: Add `fidal_card_date` column to `members` table
  - Status: ✅ Complete
  - Duration: 5 min
  - Notes: Column added with DATE type

- [x] **Task 1.2**: Add `fidal_system_date` column to `members` table
  - Status: ✅ Complete
  - Duration: 5 min
  - Notes: Column added with DATE type

- [x] **Task 1.3**: Create `all_societies` table
  - Status: ✅ Complete
  - Duration: 15 min
  - Notes: Table created with indexes and RLS policies

- [x] **Task 1.4**: Import 842 societies from `tab_societa.sql`
  - Status: ✅ Complete
  - Duration: 20 min
  - Notes: All 842 societies imported successfully

- [x] **Task 1.5**: Update TypeScript types
  - Status: ✅ Complete
  - Duration: 10 min
  - Notes: Added `fidal_card_date`, `fidal_system_date` to Member type

**Phase 1 Total**: ~55 min | ✅ 100% Complete

---

### PHASE 2: OpenSpec Documentation ✅ COMPLETE

- [x] **Task 2.1**: Create `proposal.md`
  - Status: ✅ Complete
  - Duration: 30 min
  - Notes: Comprehensive proposal with problem, solution, impact

- [x] **Task 2.2**: Create `design.md`
  - Status: ✅ Complete
  - Duration: 45 min
  - Notes: Detailed technical design with schemas, flows, diagrams

- [x] **Task 2.3**: Create `tasks.md`
  - Status: ✅ Complete
  - Duration: 15 min
  - Notes: This file

**Phase 2 Total**: ~90 min | ✅ 100% Complete

---

### PHASE 3: Excel Utility Functions ⏸️ PENDING

- [ ] **Task 3.1**: Create `lib/utils/excelImport.ts` file
  - Status: ⏸️ Pending
  - Duration: 15 min
  - Dependencies: None
  - Deliverable: Empty file with imports

- [ ] **Task 3.2**: Implement `parseFIDALExcel()` function
  - Status: ⏸️ Pending
  - Duration: 45 min
  - Dependencies: Task 3.1
  - Deliverable: Function that parses Excel and returns ParsedFIDALData[]

- [ ] **Task 3.3**: Implement Zod validation schemas
  - Status: ⏸️ Pending
  - Duration: 30 min
  - Dependencies: Task 3.1
  - Deliverable: `fidalRowSchema` and `memberFromFIDALSchema`

- [ ] **Task 3.4**: Implement `transformFIDALToMember()` function
  - Status: ⏸️ Pending
  - Duration: 20 min
  - Dependencies: Task 3.3
  - Deliverable: Function that transforms FIDAL row to Member data

- [ ] **Task 3.5**: Implement `parseDate()` utility
  - Status: ⏸️ Pending
  - Duration: 10 min
  - Dependencies: Task 3.1
  - Deliverable: Function that converts DD/MM/YYYY to YYYY-MM-DD

- [ ] **Task 3.6**: Implement `lookupSociety()` function
  - Status: ⏸️ Pending
  - Duration: 15 min
  - Dependencies: Task 3.1
  - Deliverable: Function that looks up society in all_societies

- [ ] **Task 3.7**: Implement `upsertMemberFromFIDAL()` function
  - Status: ⏸️ Pending
  - Duration: 60 min
  - Dependencies: Tasks 3.4, 3.6
  - Deliverable: Function that inserts/updates member with society handling

**Phase 3 Total**: ~195 min (~3.25h) | ⏸️ 0% Complete

---

### PHASE 4: UI Component ⏸️ PENDING

- [ ] **Task 4.1**: Create `components/members/BulkImportExcelDialog.tsx`
  - Status: ⏸️ Pending
  - Duration: 30 min
  - Dependencies: None
  - Deliverable: Empty component with props and state

- [ ] **Task 4.2**: Implement Step 1 - Select Import Type
  - Status: ⏸️ Pending
  - Duration: 30 min
  - Dependencies: Task 4.1
  - Deliverable: UI for selecting FIDAL/UISP

- [ ] **Task 4.3**: Implement Step 2 - Upload Excel
  - Status: ⏸️ Pending
  - Duration: 30 min
  - Dependencies: Task 4.1
  - Deliverable: File input with validation

- [ ] **Task 4.4**: Implement Step 3 - Preview & Validation
  - Status: ⏸️ Pending
  - Duration: 60 min
  - Dependencies: Tasks 4.1, 3.2
  - Deliverable: Table showing parsed data with errors

- [ ] **Task 4.5**: Implement Step 4 - Import Progress
  - Status: ⏸️ Pending
  - Duration: 30 min
  - Dependencies: Tasks 4.1, 3.7
  - Deliverable: Progress bar with percentage

- [ ] **Task 4.6**: Implement Step 5 - Final Report
  - Status: ⏸️ Pending
  - Duration: 30 min
  - Dependencies: Task 4.5
  - Deliverable: Report with inserted/updated/errors stats

- [ ] **Task 4.7**: Add error handling and loading states
  - Status: ⏸️ Pending
  - Duration: 20 min
  - Dependencies: Tasks 4.2-4.6
  - Deliverable: Try-catch blocks, loading spinners

- [ ] **Task 4.8**: Style component with Tailwind
  - Status: ⏸️ Pending
  - Duration: 30 min
  - Dependencies: Tasks 4.2-4.6
  - Deliverable: Polished UI matching design system

**Phase 4 Total**: ~260 min (~4.3h) | ⏸️ 0% Complete

---

### PHASE 5: Integration ⏸️ PENDING

- [ ] **Task 5.1**: Locate `MembersList.tsx` component
  - Status: ⏸️ Pending
  - Duration: 5 min
  - Dependencies: None
  - Deliverable: File path confirmed

- [ ] **Task 5.2**: Add "Importa Excel" button to MembersList
  - Status: ⏸️ Pending
  - Duration: 15 min
  - Dependencies: Task 5.1
  - Deliverable: Button with dropdown (FIDAL/UISP)

- [ ] **Task 5.3**: Integrate BulkImportExcelDialog
  - Status: ⏸️ Pending
  - Duration: 20 min
  - Dependencies: Tasks 5.2, 4.1
  - Deliverable: Dialog opens on button click

- [ ] **Task 5.4**: Handle dialog close and refresh
  - Status: ⏸️ Pending
  - Duration: 15 min
  - Dependencies: Task 5.3
  - Deliverable: Members list refreshes after successful import

**Phase 5 Total**: ~55 min | ⏸️ 0% Complete

---

### PHASE 6: Testing ⏸️ PENDING

- [ ] **Task 6.1**: Create test FIDAL Excel file
  - Status: ⏸️ Pending
  - Duration: 20 min
  - Dependencies: None
  - Deliverable: Excel file with 10 test athletes

- [ ] **Task 6.2**: Test import of new athletes
  - Status: ⏸️ Pending
  - Duration: 15 min
  - Dependencies: Tasks 6.1, 5.4
  - Deliverable: 10 athletes inserted successfully

- [ ] **Task 6.3**: Test update of existing athletes
  - Status: ⏸️ Pending
  - Duration: 15 min
  - Dependencies: Task 6.2
  - Deliverable: Athletes updated with new data

- [ ] **Task 6.4**: Test mixed import (new + existing)
  - Status: ⏸️ Pending
  - Duration: 15 min
  - Dependencies: Task 6.2
  - Deliverable: Correct insert/update counts

- [ ] **Task 6.5**: Test error handling (invalid data)
  - Status: ⏸️ Pending
  - Duration: 20 min
  - Dependencies: Task 6.1
  - Deliverable: Errors shown correctly in preview

- [ ] **Task 6.6**: Test society auto-creation
  - Status: ⏸️ Pending
  - Duration: 15 min
  - Dependencies: Task 6.1
  - Deliverable: New society created in all_societies

- [ ] **Task 6.7**: Test large file (100+ athletes)
  - Status: ⏸️ Pending
  - Duration: 30 min
  - Dependencies: Task 6.1
  - Deliverable: Import completes in < 30 seconds

- [ ] **Task 6.8**: Test with real FIDAL file
  - Status: ⏸️ Pending
  - Duration: 30 min
  - Dependencies: All previous tests
  - Deliverable: Real file imports successfully

**Phase 6 Total**: ~160 min (~2.7h) | ⏸️ 0% Complete

---

## Summary

| Phase | Tasks | Duration | Status | Progress |
|-------|-------|----------|--------|----------|
| 1. Database Setup | 5 | ~55 min | ✅ Complete | 100% |
| 2. OpenSpec | 3 | ~90 min | ✅ Complete | 100% |
| 3. Excel Utility | 7 | ~195 min | ⏸️ Pending | 0% |
| 4. UI Component | 8 | ~260 min | ⏸️ Pending | 0% |
| 5. Integration | 4 | ~55 min | ⏸️ Pending | 0% |
| 6. Testing | 8 | ~160 min | ⏸️ Pending | 0% |
| **TOTAL** | **35** | **~815 min (~13.6h)** | **🟡 In Progress** | **18%** |

---

## Next Immediate Steps

1. ✅ ~~Create OpenSpec files~~ (DONE)
2. ⏸️ **START**: Implement `lib/utils/excelImport.ts` (Task 3.1)
3. ⏸️ Implement parsing and validation functions (Tasks 3.2-3.7)
4. ⏸️ Create UI component (Tasks 4.1-4.8)
5. ⏸️ Integrate in MembersList (Tasks 5.1-5.4)
6. ⏸️ Test thoroughly (Tasks 6.1-6.8)

---

## Blockers

- ❌ None currently

---

## Notes

- Database setup completed successfully
- 842 societies imported from legacy system
- Ready to start implementation of utility functions
- UISP import will be implemented after FIDAL is tested and approved


# ComUniMo - Next Session Prompt

**Last Updated**: 2025-10-22  
**Project Status**: ~70% Complete  
**Current Phase**: Races Management (Phase 4 Complete)  

---

## 🎯 Quick Start for AI Agent

Hi! I'm continuing work on the **ComUniMo** project - a refactoring from PHP/CodeIgniter to **Next.js 14 + TypeScript + Supabase**.

### Project Context
- **Repository**: https://github.com/Wawen22/comunimo
- **Tech Stack**: Next.js 14, TypeScript, Supabase (PostgreSQL + Auth + Storage), shadcn/ui
- **Purpose**: Athletic committee management system (societies, members, races, registrations)
- **Language**: Italian (UI, comments, documentation)

### What's Been Completed ✅

1. **Infrastructure & Setup** (100%)
2. **Authentication & Authorization** (100%) - Including multi-society model
3. **Dashboard Layout** (100%)
4. **Societies Management** (100%)
5. **Members Management** (100%) - All 8 phases complete
6. **Races Management** (77%) - Phases 1-4 complete

### Current Status

**Multi-Society Model**: ✅ FULLY IMPLEMENTED AND TESTED
- Many-to-many user-society relationship via `user_societies` table
- All legacy code migrated from old model (created_by, profile.society_id)
- RLS policies working correctly
- Admin UI for user-society management complete
- ManagedSocietiesWidget in sidebar
- All known bugs fixed (5 sessions of fixes)

**Races Management**: 🟡 IN PROGRESS (77% complete)
- ✅ Phase 1: Championships CRUD (12/12 tasks)
- ✅ Phase 2: Races CRUD (8/8 tasks)
- ✅ Phase 3: Championship Registrations (12/12 tasks)
- ✅ Phase 4: Event Registrations (8/8 tasks)
- 📝 Phase 5-6: Advanced features (results, stats, reports) - TODO

---

## 📚 Essential Documentation to Read

**ALWAYS read these files first**:

1. **Project Overview**:
   - `refactoring-nextjs/00-OVERVIEW.md` - Complete project context
   - `refactoring-nextjs/REFACTORING-STATUS.md` - Current status (THIS IS CRITICAL!)

2. **Multi-Society Model** (IMPORTANT - Read if working on auth/permissions):
   - `openspec/changes/update-auth-model-multi-society/IMPLEMENTATION-LOG.md` - Complete implementation history (5 sessions)
   - `openspec/changes/update-auth-model-multi-society/tasks.md` - All tasks (27/27 complete)
   - `lib/utils/userSocietyUtils.ts` - 12 utility functions for society management

3. **Races Management** (if continuing races work):
   - `openspec/changes/implement-races-management/IMPLEMENTATION-LOG.md` - Phases 1-4 complete
   - `openspec/changes/implement-races-management/tasks.md` - 40/52 tasks complete
   - `refactoring-nextjs/RACES-MANAGEMENT-PLAN.md` - Overall plan

4. **Members Management** (reference for patterns):
   - `openspec/changes/implement-members-management/IMPLEMENTATION-SUMMARY.md` - Complete implementation

---

## 🔑 Critical Technical Concepts

### Multi-Society Model (MUST UNDERSTAND!)

**DO NOT use these deprecated patterns**:
- ❌ `.eq('created_by', user.id)` - Field doesn't exist in new model
- ❌ `profile.society_id` - Field removed from profiles table
- ❌ Direct queries to societies table without checking user_societies

**ALWAYS use these patterns**:
- ✅ `getUserSocieties(userId)` - Get all societies for a user
- ✅ `getUserFirstSociety(userId)` - Get first society (backward compatibility)
- ✅ `canUserManageSociety(userId, societyId)` - Check permissions
- ✅ RLS policies check `user_societies` table

**Key Tables**:
- `user_societies` - Junction table (user_id, society_id)
- `profiles` - User profiles (role: 'society_admin' | 'admin' | 'super_admin')
- `societies` - Society records

**Role Hierarchy**:
- `super_admin` - Full system access
- `admin` - Committee administrator (sees all societies)
- `society_admin` - Manages assigned societies only

### Database & Supabase

- **RLS Policies**: All tables have Row Level Security enabled
- **Migrations**: Located in `supabase/migrations/`
- **Schema**: `supabase/schema.sql` (local copy, sync with Supabase)
- **Supabase Project**: ComUniMo (ID: rlhzsztbkfjpryhlojee, Region: eu-central-1)
- **Auto-Approval**: Supabase MCP tools are auto-approved

### TypeScript & Next.js

- **Strict Mode**: Enabled (0 errors required)
- **App Router**: Next.js 14 with client components (no Server Actions)
- **Type Assertions**: Use `as { data: Type | null; error: any }` for Supabase queries
- **Forms**: React Hook Form + Zod validation
- **UI**: shadcn/ui components

---

## 🚀 Recommended Next Steps

### Option 1: Continue Races Management (Recommended)

**Phase 5: Results Management**
- Results entry for races
- Times, positions, categories
- Automatic category rankings
- Results validation

**Phase 6: Advanced Features**
- Race day management (check-in, start lists)
- Reports and statistics
- PDF export functionality
- Integration testing

**Files to Review**:
- `openspec/changes/implement-races-management/tasks.md` - Tasks 41-52
- `openspec/changes/implement-races-management/design.md` - Design specs

### Option 2: Testing & Bug Fixes

- Test all implemented features end-to-end
- Fix any edge cases
- Optimize performance
- Improve UI/UX

### Option 3: New Feature Implementation

**Admin Panel**:
- System settings
- Audit logs
- Data export/import
- System health monitoring

**CMS & Public Pages**:
- Public homepage
- News and announcements
- Race calendar (public view)
- Results publication

---

## 🛠️ Development Workflow

### Before Making Changes

1. **Read Documentation**: Always read relevant OpenSpec docs first
2. **Use Codebase Retrieval**: Search for existing patterns before implementing
3. **Check Types**: Verify interfaces and types in `types/database.ts`
4. **Review RLS**: Check RLS policies if working with database queries

### When Making Changes

1. **Use Utility Functions**: Don't reinvent the wheel (check `lib/utils/`)
2. **Follow Patterns**: Look at existing components for consistency
3. **Update Types**: Keep TypeScript types in sync with database
4. **Test Build**: Run `npm run build` before finishing

### After Making Changes

1. **Update Documentation**: Update OpenSpec docs (IMPLEMENTATION-LOG.md, tasks.md)
2. **Update Status**: Update `REFACTORING-STATUS.md`
3. **Create Migration**: If database changes, create migration file
4. **Test Thoroughly**: Test with different user roles

---

## 📋 Common Tasks & Patterns

### Creating a New Feature

1. Read OpenSpec proposal and design docs
2. Create/update tasks.md with task breakdown
3. Implement database schema + migration
4. Create TypeScript types
5. Implement backend utilities
6. Create UI components
7. Create pages
8. Update navigation (Sidebar.tsx)
9. Test with different roles
10. Update documentation

### Fixing a Bug

1. Reproduce the issue
2. Check console for errors
3. Review RLS policies if data access issue
4. Check if using deprecated patterns (created_by, profile.society_id)
5. Use correct utility functions
6. Test fix with affected user roles
7. Document fix in IMPLEMENTATION-LOG.md

### Working with Supabase

```typescript
// ✅ CORRECT: Get user societies
const userSocieties = await getUserSocieties(user.id);

// ✅ CORRECT: Check permissions
const canManage = await canUserManageSociety(user.id, societyId);

// ✅ CORRECT: Query with RLS
const { data, error } = await supabase
  .from('members')
  .select('*')
  .eq('society_id', societyId);  // RLS will filter automatically

// ❌ WRONG: Don't use deprecated fields
const { data } = await supabase
  .from('societies')
  .eq('created_by', user.id);  // ❌ Field doesn't exist!
```

---

## 🎨 Code Style & Conventions

- **Language**: Italian for UI text, comments, and user-facing content
- **File Naming**: kebab-case for files, PascalCase for components
- **Component Structure**: Client components with 'use client' directive
- **Error Handling**: Always handle Supabase errors with toast notifications
- **Loading States**: Use Loader2 component from lucide-react
- **Forms**: Use shadcn/ui form components + React Hook Form + Zod

---

## 🔍 Debugging Tips

### Common Issues

1. **406 Not Acceptable**: Usually RLS policy blocking access
   - Check if using correct utility functions
   - Verify RLS policies in schema.sql
   - Test with different user roles

2. **TypeScript Errors**: 
   - Check types in `types/database.ts`
   - Use proper type assertions for Supabase queries
   - Run `npm run build` to see all errors

3. **Data Not Showing**:
   - Check RLS policies
   - Verify user has assigned societies (for society_admin)
   - Check console for Supabase errors

4. **Build Failures**:
   - Fix TypeScript errors first
   - Check for missing imports
   - Verify all components are properly exported

---

## 📞 Key Files Reference

### Core Infrastructure
- `middleware.ts` - Auth middleware
- `lib/api/supabase.ts` - Supabase client
- `lib/hooks/useUser.ts` - User hook with societies
- `types/database.ts` - All TypeScript types

### Utilities
- `lib/utils/userSocietyUtils.ts` - Society management (12 functions)
- `lib/utils/categoryAssignment.ts` - Athletic categories
- `lib/utils/bibNumberUtils.ts` - Bib number management
- `lib/utils/raceUtils.ts` - Race utilities

### Layout
- `components/layout/Sidebar.tsx` - Navigation
- `components/layout/Header.tsx` - Top bar
- `components/layout/ManagedSocietiesWidget.tsx` - Societies widget

### Database
- `supabase/schema.sql` - Complete schema
- `supabase/migrations/` - All migrations

---

## ✅ Final Checklist Before Starting

- [ ] Read `REFACTORING-STATUS.md`
- [ ] Read relevant OpenSpec docs
- [ ] Understand multi-society model
- [ ] Know which utility functions to use
- [ ] Understand RLS policies
- [ ] Ready to update documentation after changes

---

**Good luck! 🚀**

If you need clarification on anything, ask the user before proceeding.
Always prioritize code quality, type safety, and following established patterns.


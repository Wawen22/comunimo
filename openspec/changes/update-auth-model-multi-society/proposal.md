# Proposal: Update Authentication & Authorization Model - Multi-Society Management

**Status**: 🟡 In Progress  
**Created**: 2025-10-22  
**Author**: AI Assistant  
**Priority**: High  
**Impact**: Breaking Change - Database Schema & Authorization Logic  

---

## 📋 Summary

Update the authentication and authorization model to support **many-to-many relationship** between users and societies. This allows:
- Multiple users to manage the same society
- One user to manage multiple societies (e.g., FIDAL and UISP codes)
- Proper separation of athletes by organization while maintaining unified management

---

## 🎯 Goals

1. **Multi-Society Management**: Allow one user to manage multiple society codes (FIDAL, UISP, etc.)
2. **Shared Management**: Allow multiple users to manage the same society
3. **Athlete Separation**: Maintain separate records for athletes with different organizations
4. **Correct Society Assignment**: Automatically use the correct society code when registering athletes
5. **Backward Compatibility**: Migrate existing data without breaking current functionality

---

## 📊 Current State vs Desired State

### Current Model (1:1 relationship)

```
User (user_profile)
├── society_id: UUID (single society)
├── role: 'user' | 'admin' | 'super_admin'
└── Can manage only ONE society

Society
├── id: UUID
├── name: string
├── organization: 'FIDAL' | 'UISP' | null
└── One record per organization code
```

**Limitations**:
- User can only manage ONE society
- Cannot manage both FIDAL and UISP codes
- No shared management between users

### Desired Model (Many-to-Many relationship)

```
User (user_profile)
├── role: 'society_admin' | 'admin' | 'super_admin'
└── Can manage MULTIPLE societies via user_societies

UserSociety (new table)
├── user_id: UUID
├── society_id: UUID
└── Many-to-many relationship

Society
├── id: UUID
├── name: string (e.g., "Modena Atletica FIDAL")
├── code: string (e.g., "MO001")
├── organization: 'FIDAL' | 'UISP'
└── Separate records for FIDAL and UISP

Member (athlete)
├── society_id: UUID (links to specific society)
├── organization: 'FIDAL' | 'UISP'
├── card_number: string (different for FIDAL/UISP)
└── Same person = 2 records if has both FIDAL and UISP
```

**Benefits**:
- User can manage multiple societies (FIDAL + UISP)
- Multiple users can manage the same society
- Clear separation of athletes by organization
- Correct society code used in registrations

---

## 🏗️ Technical Design

### Database Schema Changes

#### 1. New Table: `user_societies`

```sql
CREATE TABLE user_societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, society_id)
);

CREATE INDEX idx_user_societies_user_id ON user_societies(user_id);
CREATE INDEX idx_user_societies_society_id ON user_societies(society_id);
```

#### 2. Update `user_profile` Table

```sql
-- Remove society_id column (now in user_societies)
ALTER TABLE user_profile DROP COLUMN society_id;

-- Add new role
ALTER TYPE user_role ADD VALUE 'society_admin';
```

#### 3. RLS Policies for `user_societies`

```sql
-- Society admins can view their own assignments
CREATE POLICY "Society admins can view their societies"
  ON user_societies FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all assignments
CREATE POLICY "Admins can view all user societies"
  ON user_societies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profile
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can manage assignments
CREATE POLICY "Admins can manage user societies"
  ON user_societies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profile
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

#### 4. Update RLS Policies for `members`

```sql
-- Society admins can view members of their societies
CREATE POLICY "Society admins can view their society members"
  ON members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_societies
      WHERE user_id = auth.uid() AND society_id = members.society_id
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profile
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Society admins can manage members of their societies
CREATE POLICY "Society admins can manage their society members"
  ON members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_societies
      WHERE user_id = auth.uid() AND society_id = members.society_id
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profile
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

### TypeScript Types

```typescript
// Update UserRole
export type UserRole = 'society_admin' | 'admin' | 'super_admin';

// New interface
export interface UserSociety {
  id: string;
  user_id: string;
  society_id: string;
  created_at: string;
  updated_at: string;
}

// Extended type with relations
export interface UserSocietyWithDetails extends UserSociety {
  society: Society;
}

// Update UserProfile
export interface UserProfile {
  id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  // society_id removed
}

// Extended type
export interface UserProfileWithSocieties extends UserProfile {
  societies: Society[];
}
```

### Backend Utilities

```typescript
// Get societies managed by user
async function getUserSocieties(userId: string): Promise<Society[]>

// Check if user can manage society
async function canUserManageSociety(userId: string, societyId: string): Promise<boolean>

// Get user role
async function getUserRole(userId: string): Promise<UserRole>

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean>
```

---

## 🔄 Migration Strategy

### Data Migration

```sql
-- Migrate existing user_profile.society_id to user_societies
INSERT INTO user_societies (user_id, society_id)
SELECT id, society_id
FROM user_profile
WHERE society_id IS NOT NULL;

-- Update existing roles
UPDATE user_profile
SET role = 'society_admin'
WHERE role = 'user' AND society_id IS NOT NULL;
```

### Rollback Plan

```sql
-- Add society_id back to user_profile
ALTER TABLE user_profile ADD COLUMN society_id UUID REFERENCES societies(id);

-- Restore data (take first society if multiple)
UPDATE user_profile up
SET society_id = (
  SELECT society_id FROM user_societies
  WHERE user_id = up.id
  LIMIT 1
);
```

---

## 📝 Implementation Phases

### Phase 1: Database Schema (6 tasks)
- [ ] Create `user_societies` table
- [ ] Add RLS policies for `user_societies`
- [ ] Add `society_admin` role to enum
- [ ] Update RLS policies for `members`
- [ ] Update RLS policies for `championship_registrations`
- [ ] Update RLS policies for `event_registrations`

### Phase 2: TypeScript Types (3 tasks)
- [ ] Update `UserRole` type
- [ ] Create `UserSociety` interface
- [ ] Update `UserProfile` interface

### Phase 3: Backend Logic (4 tasks)
- [ ] Create `getUserSocieties()` utility
- [ ] Create `canUserManageSociety()` utility
- [ ] Update auth hooks (`useUser`, `useAuth`)
- [ ] Update middleware for role checks

### Phase 4: UI Updates (8 tasks)
- [ ] Dashboard: show managed societies
- [ ] Members: filter by managed societies
- [ ] Societies: admin can assign users
- [ ] Registrations: use correct society_id
- [ ] Profile: show assigned societies
- [ ] Society selector component
- [ ] Forms: update validations
- [ ] Navigation: update access logic

---

## ✅ Acceptance Criteria

1. ✅ User can be assigned to multiple societies
2. ✅ Multiple users can manage the same society
3. ✅ Society admin sees only members of assigned societies
4. ✅ Admin/super_admin see all societies and members
5. ✅ Registrations use correct society_id based on athlete's organization
6. ✅ UI shows society selector for users with multiple societies
7. ✅ All RLS policies enforce correct access control
8. ✅ Existing data migrated successfully

---

## 🚨 Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing auth logic | High | Thorough testing, gradual rollout |
| Data migration issues | High | Backup database, test migration script |
| RLS policy conflicts | Medium | Review all policies, test access control |
| UI confusion with multiple societies | Medium | Clear society selector, active society indicator |

---

## 📚 References

- Current auth implementation: `lib/auth/supabase.ts`
- Current RLS policies: `supabase/schema.sql`
- User profile: `types/database.ts`

---

**Next Steps**: Proceed with Phase 1 - Database Schema Updates


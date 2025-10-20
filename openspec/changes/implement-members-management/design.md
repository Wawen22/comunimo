# Design: Implement Members Management

**Change ID**: `implement-members-management`  
**Status**: 📝 In Design  
**Last Updated**: 2024-10-20

---

## Architecture Overview

```
app/(dashboard)/dashboard/members/
├── page.tsx                    # Members list page
├── new/
│   └── page.tsx               # Create new member
├── [id]/
│   ├── page.tsx               # Member detail page
│   └── edit/
│       └── page.tsx           # Edit member page

components/members/
├── MembersList.tsx            # List component with filters
├── MemberDetail.tsx           # Detail view component
├── MemberForm.tsx             # Create/edit form
├── MemberCard.tsx             # Member card component
├── MemberFilters.tsx          # Advanced filters
├── MemberStatusBadge.tsx      # Status indicator
├── MemberExpiryAlert.tsx      # Expiry warnings
├── DeleteMemberDialog.tsx     # Delete confirmation
├── BulkImportDialog.tsx       # CSV/Excel import
└── MemberStats.tsx            # Statistics widget

lib/utils/
├── memberValidation.ts        # Validation helpers
├── categoryAssignment.ts      # Auto category assignment
└── memberExport.ts            # Export utilities
```

---

## Database Schema

### Members Table (Already Exists)

```sql
CREATE TABLE public.members (
  id UUID PRIMARY KEY,
  society_id UUID REFERENCES societies(id),
  user_id UUID REFERENCES profiles(id),
  
  -- Personal Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  fiscal_code TEXT UNIQUE,
  birth_date DATE,
  birth_place TEXT,
  gender TEXT CHECK (gender IN ('M', 'F', 'other')),
  
  -- Contact Info
  email TEXT,
  phone TEXT,
  mobile TEXT,
  
  -- Address
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  
  -- Membership Info
  membership_number TEXT UNIQUE,
  membership_date DATE,
  membership_type TEXT,
  membership_status TEXT DEFAULT 'active',
  
  -- Athletic Info
  organization TEXT,
  year INTEGER,
  regional_code TEXT,
  category TEXT,
  membership_card_number TEXT UNIQUE,
  card_issue_date DATE,
  card_expiry_date DATE,
  is_foreign BOOLEAN DEFAULT false,
  medical_certificate_date DATE,
  photo_url TEXT,
  
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);
```

### Indexes (Already Exist)
```sql
CREATE INDEX idx_members_society ON members(society_id);
CREATE INDEX idx_members_organization ON members(organization);
CREATE INDEX idx_members_category ON members(category);
CREATE INDEX idx_members_card_number ON members(membership_card_number);
CREATE INDEX idx_members_card_expiry ON members(card_expiry_date);
CREATE INDEX idx_members_status ON members(membership_status);
```

---

## Page Designs

### 1. Members List Page (`/dashboard/members`)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Members                                    [+ New Member]│
├─────────────────────────────────────────────────────────┤
│ [Search...] [Society ▼] [Org ▼] [Category ▼] [Status ▼]│
├─────────────────────────────────────────────────────────┤
│ Name          │ Society  │ Org   │ Category │ Status   │
│ Rossi Mario   │ ASD MO   │ FIDAL │ SM       │ Active ✓ │
│ Bianchi Laura │ Pol ME   │ UISP  │ SF       │ Expired ⚠│
│ ...                                                      │
├─────────────────────────────────────────────────────────┤
│ Showing 1-20 of 150                    [< 1 2 3 4 5 >]  │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Search by name, fiscal code, membership number
- Filter by society, organization, category, status
- Sort by any column
- Pagination (20 items per page)
- Bulk actions (export, delete)
- Status indicators (active, expired, expiring soon)

**Queries:**
```typescript
// Base query
const { data: members } = await supabase
  .from('members')
  .select(`
    *,
    society:societies(id, name),
    created_by_user:profiles!created_by(full_name)
  `)
  .eq('is_active', true)
  .order('last_name', { ascending: true });

// With filters
.eq('society_id', societyId)
.eq('organization', organization)
.eq('category', category)
.eq('membership_status', status)
.ilike('first_name', `%${search}%`)
```

---

### 2. Member Detail Page (`/dashboard/members/[id]`)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Members                    [Edit] [Delete]    │
├─────────────────────────────────────────────────────────┤
│ [Photo]  Mario Rossi                                    │
│          RSSMRA85M01F257W                               │
│          ASD Modena Calcio                              │
├─────────────────────────────────────────────────────────┤
│ [Personal] [Membership] [Athletic] [Documents] [History]│
├─────────────────────────────────────────────────────────┤
│ Personal Information                                    │
│ Birth Date: 01/08/1985                                  │
│ Birth Place: Milano                                     │
│ Gender: Male                                            │
│ ...                                                     │
└─────────────────────────────────────────────────────────┘
```

**Tabs:**
1. **Personal**: Name, birth info, contact, address
2. **Membership**: Number, dates, type, status
3. **Athletic**: Organization, category, regional code
4. **Documents**: Card, certificate, photo
5. **History**: Activity log, changes

---

### 3. Member Form (`/dashboard/members/new` or `/dashboard/members/[id]/edit`)

**Multi-step Form:**

**Step 1: Personal Information**
- First Name* (required)
- Last Name* (required)
- Fiscal Code (validated)
- Birth Date* (required)
- Birth Place
- Gender* (required)

**Step 2: Contact & Address**
- Email
- Phone
- Mobile
- Address
- City
- Province
- Postal Code

**Step 3: Membership**
- Society* (required)
- Membership Number
- Membership Date
- Membership Type
- Status

**Step 4: Athletic Information**
- Organization (FIDAL, UISP, CSI, RUNCARD)
- Year
- Regional Code
- Category (auto-assigned, can override)
- Is Foreign

**Step 5: Documents**
- Membership Card Number
- Card Issue Date
- Card Expiry Date
- Medical Certificate Date
- Photo Upload

---

## Component Specifications

### MembersList Component

```typescript
interface MembersListProps {
  initialFilters?: MemberFilters;
}

interface MemberFilters {
  search?: string;
  societyId?: string;
  organization?: string;
  category?: string;
  status?: MembershipStatus;
  cardExpiring?: boolean; // Cards expiring in 30 days
  certExpiring?: boolean; // Certificates expiring in 30 days
}

export function MembersList({ initialFilters }: MembersListProps) {
  const [filters, setFilters] = useState<MemberFilters>(initialFilters || {});
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  
  // Fetch members with filters
  // Render table with pagination
  // Handle bulk actions
}
```

### MemberForm Component

```typescript
const memberSchema = z.object({
  // Personal Info
  first_name: z.string().min(2, 'Nome richiesto'),
  last_name: z.string().min(2, 'Cognome richiesto'),
  fiscal_code: z.string().regex(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/, 'Codice fiscale non valido').optional(),
  birth_date: z.string().refine(isValidDate, 'Data non valida'),
  birth_place: z.string().optional(),
  gender: z.enum(['M', 'F', 'other']),
  
  // Contact
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  
  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().max(2).optional(),
  postal_code: z.string().max(5).optional(),
  
  // Membership
  society_id: z.string().uuid('Società richiesta'),
  membership_number: z.string().optional(),
  membership_date: z.string().optional(),
  membership_type: z.string().optional(),
  membership_status: z.enum(['active', 'suspended', 'expired', 'cancelled']),
  
  // Athletic
  organization: z.string().optional(),
  year: z.number().int().min(2020).max(2030).optional(),
  regional_code: z.string().optional(),
  category: z.string().optional(),
  is_foreign: z.boolean().default(false),
  
  // Documents
  membership_card_number: z.string().optional(),
  card_issue_date: z.string().optional(),
  card_expiry_date: z.string().optional(),
  medical_certificate_date: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal('')),
  
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});
```

---

## Utility Functions

### Category Assignment

```typescript
/**
 * Auto-assign category based on birth date and gender
 */
export function assignCategory(birthDate: Date, gender: 'M' | 'F'): string | null {
  const age = calculateAge(birthDate);
  
  if (age < 18) return null; // Under 18, no category
  
  if (age >= 18 && age <= 34) {
    return gender === 'M' ? 'SM' : 'SF'; // Seniores
  }
  
  if (age >= 35 && age <= 39) {
    return gender === 'M' ? 'AM' : 'AF'; // Master 35
  }
  
  if (age >= 40 && age <= 44) {
    return gender === 'M' ? 'BM' : 'BF'; // Master 40
  }
  
  if (age >= 45 && age <= 49) {
    return gender === 'M' ? 'CM' : 'CF'; // Master 45
  }
  
  // Continue for other age groups...
  
  return null;
}
```

### Expiry Checks

```typescript
export function isCardExpiring(expiryDate: Date, daysThreshold = 30): boolean {
  const today = new Date();
  const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= daysThreshold;
}

export function isCardExpired(expiryDate: Date): boolean {
  return expiryDate < new Date();
}
```

---

## RLS Policies

```sql
-- Members policies (already exist)
CREATE POLICY "Authenticated users can view members"
  ON public.members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage members"
  ON public.members FOR ALL
  USING (public.is_admin());
```

---

## File Upload (Supabase Storage)

### Bucket: `member-photos`

```typescript
// Upload photo
const uploadMemberPhoto = async (file: File, memberId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${memberId}.${fileExt}`;
  const filePath = `photos/${fileName}`;

  const { data, error } = await supabase.storage
    .from('member-photos')
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('member-photos')
    .getPublicUrl(filePath);

  return publicUrl;
};
```

---

## Performance Optimizations

1. **Pagination**: Load 20 members at a time
2. **Indexes**: Use existing indexes on society_id, organization, category, status
3. **Virtual Scrolling**: For large lists (1000+ members)
4. **Debounced Search**: Wait 300ms after typing before searching
5. **Cached Lookups**: Cache organizations and categories lists

---

## Testing Strategy

### Unit Tests
- Validation schemas
- Category assignment logic
- Expiry check functions
- Export utilities

### Integration Tests
- CRUD operations
- Filtering and search
- Bulk import
- File upload

### E2E Tests
- Complete member creation flow
- Edit and delete flows
- Bulk operations
- Navigation between pages

---

## Next Steps

1. Create tasks.md with detailed task breakdown
2. Implement MembersList page
3. Implement MemberDetail page
4. Implement MemberForm
5. Add bulk import/export
6. Add expiry notifications
7. Testing and refinement


# Design: Implement Societies Management

**Change ID**: `implement-societies-management`  
**Status**: In Progress  
**Created**: 2024-10-20

---

## Architecture Overview

The Societies Management module follows a client-side data fetching pattern with Supabase, consistent with the authentication implementation from Phase 2.

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
├─────────────────────────────────────────────────────────────┤
│  Pages (App Router)                                         │
│  ├── /dashboard/societies (List)                            │
│  ├── /dashboard/societies/new (Create)                      │
│  ├── /dashboard/societies/[id] (Detail)                     │
│  └── /dashboard/societies/[id]/edit (Edit)                  │
├─────────────────────────────────────────────────────────────┤
│  Components                                                  │
│  ├── SocietiesList (Table, Search, Actions)                 │
│  ├── SocietyDetail (View)                                   │
│  ├── SocietyForm (Create/Edit)                              │
│  └── DeleteSocietyDialog (Confirmation)                     │
├─────────────────────────────────────────────────────────────┤
│  UI Components (Reusable)                                    │
│  ├── Table (Generic table component)                        │
│  ├── Dialog (Modal dialogs)                                 │
│  └── Badge (Status badges)                                  │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                  │
│  └── Supabase Client (Direct queries from components)       │
├─────────────────────────────────────────────────────────────┤
│  Database (Supabase PostgreSQL)                             │
│  └── public.societies table with RLS policies               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Database Schema

```sql
CREATE TABLE public.societies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  vat_number TEXT UNIQUE,
  fiscal_code TEXT,
  legal_representative TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);
```

### TypeScript Type

```typescript
export interface Society {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  vat_number: string | null;
  fiscal_code: string | null;
  legal_representative: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}
```

### Validation Schema (Zod)

```typescript
const societySchema = z.object({
  name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().max(2, 'La provincia deve essere di 2 caratteri').optional(),
  postal_code: z.string().max(5, 'Il CAP deve essere di 5 cifre').optional(),
  phone: z.string().optional(),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  website: z.string().url('URL non valido').optional().or(z.literal('')),
  vat_number: z.string().optional(),
  fiscal_code: z.string().optional(),
  legal_representative: z.string().optional(),
  is_active: z.boolean().default(true),
});
```

---

## Component Design

### 1. SocietiesList Component

**Purpose**: Display all societies in a table with search and actions

**State**:
- `societies: Society[]` - List of societies
- `loading: boolean` - Loading state
- `searchQuery: string` - Search input value
- `deleteDialogOpen: boolean` - Delete dialog visibility
- `societyToDelete: Society | null` - Society to delete

**Features**:
- Fetch societies on mount
- Client-side search filtering
- Table with sortable columns
- Quick actions (view, edit, delete)
- Admin-only create button
- Soft delete with confirmation

**Data Flow**:
```
Component Mount
  ↓
Fetch Societies (Supabase)
  ↓
Display in Table
  ↓
User Actions (Search, View, Edit, Delete)
  ↓
Update State / Navigate / Mutate Data
```

---

### 2. SocietyDetail Component

**Purpose**: Display detailed information about a single society

**State**:
- `society: Society | null` - Society data
- `loading: boolean` - Loading state
- `deleteDialogOpen: boolean` - Delete dialog visibility

**Features**:
- Fetch society by ID
- Display all fields with icons
- Status badge
- Edit/Delete buttons (admin only)
- Formatted dates

**Data Flow**:
```
Component Mount
  ↓
Fetch Society by ID (Supabase)
  ↓
Display Details
  ↓
User Actions (Edit, Delete)
  ↓
Navigate / Mutate Data
```

---

### 3. SocietyForm Component

**Purpose**: Create or edit a society

**Props**:
- `society?: Society` - Existing society (for edit mode)
- `mode: 'create' | 'edit'` - Form mode

**State**:
- `isLoading: boolean` - Submission state
- Form state managed by React Hook Form

**Features**:
- React Hook Form + Zod validation
- Pre-filled values in edit mode
- Grouped fields (Basic, Address, Contact, Legal)
- Real-time validation
- Success/error notifications
- Redirect after save

**Data Flow**:
```
Form Render
  ↓
User Input
  ↓
Validation (Zod)
  ↓
Submit
  ↓
Create/Update (Supabase)
  ↓
Toast Notification
  ↓
Redirect to Detail Page
```

---

### 4. DeleteSocietyDialog Component

**Purpose**: Confirm society deletion

**Props**:
- `open: boolean` - Dialog visibility
- `society: Society | null` - Society to delete
- `onOpenChange: (open: boolean) => void` - Close handler
- `onConfirm: () => void` - Confirm handler

**Features**:
- Warning icon
- Society name in message
- Soft delete explanation
- Cancel/Delete buttons

---

## Access Control

### RLS Policies

```sql
-- Anyone can view active societies
CREATE POLICY "Anyone can view active societies"
  ON public.societies FOR SELECT
  USING (is_active = true);

-- Admins can manage societies
CREATE POLICY "Admins can manage societies"
  ON public.societies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

### UI-Level Access Control

- **List Page**: Accessible to all authenticated users
- **Detail Page**: Accessible to all authenticated users
- **Create Page**: Admin only (RequireRole component)
- **Edit Page**: Admin only (RequireRole component)
- **Delete Action**: Admin only (useIsAdmin hook)

---

## User Flows

### Create Society Flow

```
1. User clicks "Nuova Società" button (admin only)
2. Navigate to /dashboard/societies/new
3. User fills form
4. User clicks "Crea Società"
5. Validation runs
6. If valid: Create society in database
7. Show success toast
8. Redirect to society detail page
9. If invalid: Show validation errors
```

### Edit Society Flow

```
1. User clicks "Modifica" button on detail page (admin only)
2. Navigate to /dashboard/societies/[id]/edit
3. Fetch society data
4. Pre-fill form with existing data
5. User modifies fields
6. User clicks "Salva Modifiche"
7. Validation runs
8. If valid: Update society in database
9. Show success toast
10. Redirect to society detail page
11. If invalid: Show validation errors
```

### Delete Society Flow

```
1. User clicks "Elimina" button (admin only)
2. Open confirmation dialog
3. User confirms deletion
4. Soft delete (set is_active = false)
5. Show success toast
6. Redirect to societies list
7. Society no longer appears in list (filtered out)
```

### Search Flow

```
1. User types in search input
2. Filter societies by name, city, or email
3. Update table display in real-time
4. Show "Nessuna società trovata" if no matches
```

---

## UI/UX Design

### Color Scheme

- **Primary**: Blue (#1e88e5) - Actions, links
- **Success**: Green (#10b981) - Active status
- **Destructive**: Red (#ef4444) - Delete actions
- **Gray**: Various shades for text, borders, backgrounds

### Typography

- **Headings**: Bold, larger sizes
- **Body**: Regular weight, readable size
- **Labels**: Medium weight, smaller size
- **Metadata**: Gray color, smaller size

### Spacing

- **Sections**: 24px (1.5rem) gap
- **Form Fields**: 16px (1rem) gap
- **Table Cells**: 16px (1rem) padding
- **Buttons**: 8px (0.5rem) gap between icons and text

### Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl)

### Responsive Behavior

**Table**:
- Desktop: Full table with all columns
- Tablet: Scrollable table
- Mobile: Scrollable table with reduced padding

**Form**:
- Desktop: 2-column grid for some fields
- Tablet: 2-column grid for some fields
- Mobile: Single column layout

---

## Error Handling

### Network Errors

```typescript
try {
  const { data, error } = await supabase.from('societies').select('*');
  if (error) throw error;
} catch (error) {
  console.error('Error fetching societies:', error);
  toast({
    title: 'Errore',
    description: 'Impossibile caricare le società',
    variant: 'destructive',
  });
}
```

### Validation Errors

- Displayed inline below each field
- Red text color
- Prevents form submission

### Database Constraint Errors

```typescript
if (error.code === '23505') {
  if (error.message.includes('vat_number')) {
    errorMessage = 'Partita IVA già esistente';
  }
}
```

---

## Performance Considerations

### Data Fetching

- Fetch all societies on mount (no pagination yet)
- Client-side filtering for search
- Future: Implement server-side pagination for large datasets

### Optimizations

- Use React.memo for expensive components
- Debounce search input (future enhancement)
- Lazy load images (future enhancement)

---

## Testing Strategy

### Unit Tests (Future)

- Form validation logic
- Search filtering logic
- Access control utilities

### Integration Tests (Future)

- CRUD operations
- RLS policies
- Form submission

### Manual Testing

- Test all CRUD operations
- Test access control (admin vs user)
- Test form validation
- Test responsive design
- Test error handling

---

## Future Enhancements

1. **Pagination**: Server-side pagination for large datasets
2. **Sorting**: Sort table by different columns
3. **Advanced Filters**: Filter by province, status, etc.
4. **Export**: Export societies to CSV/Excel
5. **Import**: Bulk import from file
6. **Logo Upload**: Upload and display society logos
7. **Statistics**: Dashboard with society statistics
8. **Audit Log**: Track changes to societies

---

## Notes

- This module serves as a template for other entity management features (Members, Payments, Events)
- All user-facing text is in Italian
- Follows existing design system from Phase 2
- Reuses components where possible


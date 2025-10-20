# Troubleshooting: Societies Management

**Change ID**: `implement-societies-management`
**Date**: 2024-10-20

---

## Issue 0: "Infinite recursion detected in policy for relation 'profiles'" ✅ FIXED

### Symptoms
- Error: `infinite recursion detected in policy for relation "profiles"`
- Console error code: `42P17`
- Societies list fails to load

### Root Cause
**Problem**: The RLS policy "Admins can view all profiles" created an infinite recursion loop:
1. To view societies, check if user is admin
2. To check if user is admin, query profiles table
3. To query profiles table, check if user is admin → **INFINITE LOOP**

### Solution ✅ APPLIED

#### Step 1: Remove Recursive Policy
Removed the "Admins can view all profiles" policy that caused recursion.

#### Step 2: Create Security Definer Function
Created a helper function that bypasses RLS:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

The `SECURITY DEFINER` keyword makes the function run with the privileges of the function owner, bypassing RLS.

#### Step 3: Update Societies Policy
Updated the admin policy to use the function:

```sql
CREATE POLICY "Admins can manage societies"
  ON public.societies FOR ALL
  USING (public.is_admin());
```

**Status**: ✅ Fixed in database and schema.sql updated

---

## Issue 1: "Impossibile caricare le società"

### Symptoms
- Error toast: "Impossibile caricare le società"
- Empty societies list
- Console error when loading `/dashboard/societies`

### Root Causes

#### 1. RLS Policy Mismatch
**Problem**: The RLS policy only allows viewing societies with `is_active = true`, but the query might not filter correctly.

**Solution**: Updated the query to explicitly filter by `is_active = true`:

```typescript
const { data, error } = await supabase
  .from('societies')
  .select('*')
  .eq('is_active', true)
  .order('name', { ascending: true });
```

#### 2. Missing RLS Policies
**Problem**: RLS is enabled but policies are not created in the database.

**Solution**: Run the schema.sql file to create the policies:

```sql
-- Enable RLS
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;

-- Policy for viewing active societies
CREATE POLICY "Anyone can view active societies"
  ON public.societies FOR SELECT
  USING (is_active = true);

-- Policy for admins to manage societies
CREATE POLICY "Admins can manage societies"
  ON public.societies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

**How to apply**:
1. Go to Supabase Dashboard → SQL Editor
2. Copy the policies from `supabase/schema.sql` (lines 70-84)
3. Execute the SQL

#### 3. No Societies in Database
**Problem**: The table is empty.

**Solution**: Create a test society manually:

```sql
INSERT INTO public.societies (name, city, email, is_active)
VALUES ('ASD Modena Calcio', 'Modena', 'info@modenacalcio.it', true);
```

---

## Issue 2: "Nuova Società" Button Not Visible

### Symptoms
- The "Nuova Società" button is not visible on the societies list page
- Only search bar is visible

### Root Cause
**Problem**: The current user does not have the `admin` or `super_admin` role in the database.

### Solution

#### Step 1: Check Current User Role

Run this query in Supabase SQL Editor:

```sql
SELECT id, email, full_name, role 
FROM public.profiles 
ORDER BY created_at DESC;
```

#### Step 2: Update User Role to Admin

Replace `your-email@example.com` with your actual email:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Or use the provided script:

```bash
# In Supabase SQL Editor, run:
# refactoring-nextjs/comunimo-next/supabase/fix-admin-role.sql
```

#### Step 3: Verify the Update

```sql
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE role IN ('admin', 'super_admin');
```

#### Step 4: Refresh the Page

After updating the role:
1. Refresh the browser page
2. The "Nuova Società" button should now be visible

---

## Issue 3: Console Errors

### Check Browser Console

Open browser DevTools (F12) and check the Console tab for errors:

#### Expected Debug Logs
```
useUser - Profile loaded: { id: '...', email: '...', role: 'admin', ... }
SocietiesList - isAdmin: true
```

#### Common Errors

**Error**: `Failed to fetch`
- **Cause**: Network issue or Supabase is down
- **Solution**: Check internet connection, verify Supabase project is running

**Error**: `row-level security policy violation`
- **Cause**: RLS policies are too restrictive
- **Solution**: Check and update RLS policies (see Issue 1)

**Error**: `relation "societies" does not exist`
- **Cause**: Table not created
- **Solution**: Run `supabase/schema.sql` to create the table

---

## Issue 4: Can't Create/Edit/Delete Societies

### Symptoms
- "Nuova Società" button is visible but form doesn't work
- Edit/Delete buttons don't work
- Error: "Insufficient permissions"

### Root Cause
**Problem**: RLS policy for admins is not working correctly.

### Solution

#### Check Admin Policy

```sql
-- Verify the policy exists
SELECT * FROM pg_policies 
WHERE tablename = 'societies' 
AND policyname = 'Admins can manage societies';
```

#### Recreate Admin Policy

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Admins can manage societies" ON public.societies;

-- Recreate policy
CREATE POLICY "Admins can manage societies"
  ON public.societies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

---

## Issue 5: Duplicate VAT Number Error

### Symptoms
- Error when creating society: "Partita IVA già esistente"

### Root Cause
**Problem**: Another society already has the same VAT number.

### Solution

#### Option 1: Use Different VAT Number
Enter a unique VAT number.

#### Option 2: Remove Duplicate
Find and remove/update the duplicate:

```sql
-- Find duplicates
SELECT vat_number, COUNT(*) 
FROM public.societies 
WHERE vat_number IS NOT NULL
GROUP BY vat_number 
HAVING COUNT(*) > 1;

-- Update or delete duplicate
UPDATE public.societies
SET vat_number = NULL
WHERE id = 'duplicate-society-id';
```

---

## Debugging Checklist

Use this checklist to debug issues:

### Database
- [ ] Table `societies` exists
- [ ] RLS is enabled on `societies` table
- [ ] Policy "Anyone can view active societies" exists
- [ ] Policy "Admins can manage societies" exists
- [ ] At least one test society exists with `is_active = true`

### User Profile
- [ ] Current user has a profile in `profiles` table
- [ ] User's role is `admin` or `super_admin`
- [ ] User's email matches the authenticated user

### Frontend
- [ ] No console errors in browser DevTools
- [ ] `useUser` hook returns profile with correct role
- [ ] `useIsAdmin` hook returns `true` for admin users
- [ ] Supabase client is configured correctly

### Network
- [ ] Supabase project is running
- [ ] API keys are correct in `.env.local`
- [ ] No CORS errors in console

---

## Quick Fix Commands

### Reset Everything

```sql
-- Drop and recreate policies
DROP POLICY IF EXISTS "Anyone can view active societies" ON public.societies;
DROP POLICY IF EXISTS "Admins can manage societies" ON public.societies;

ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active societies"
  ON public.societies FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage societies"
  ON public.societies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Make first user admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM public.profiles ORDER BY created_at LIMIT 1);

-- Create test society
INSERT INTO public.societies (name, city, email, is_active)
VALUES ('ASD Test', 'Modena', 'test@test.it', true)
ON CONFLICT DO NOTHING;
```

---

## Still Having Issues?

If none of the above solutions work:

1. **Check Supabase Logs**: Go to Supabase Dashboard → Logs → Database
2. **Check Browser Console**: Look for detailed error messages
3. **Verify Environment Variables**: Check `.env.local` has correct Supabase URL and keys
4. **Test with Supabase SQL Editor**: Try running queries directly in Supabase
5. **Check Network Tab**: Look for failed API requests in DevTools Network tab

---

## Contact

If you're still stuck, provide:
- Browser console errors (screenshot or copy-paste)
- Supabase logs (if available)
- Steps to reproduce the issue
- Your user role from the database


-- Fix: Allow same athlete to exist in different organizations (FIDAL, UISP, etc.)
-- Previously UNIQUE(fiscal_code) prevented importing UISP athletes that already existed as FIDAL.
-- Now uniqueness is per (field, organization).

-- Drop existing single-column unique constraints
ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_fiscal_code_key;
ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_membership_number_key;
ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_membership_card_number_key;

-- Recreate as composite unique constraints including organization
-- Partial indexes (WHERE ... IS NOT NULL) allow multiple NULLs
CREATE UNIQUE INDEX IF NOT EXISTS members_fiscal_code_organization_key 
  ON public.members (fiscal_code, organization) 
  WHERE fiscal_code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS members_membership_number_organization_key 
  ON public.members (membership_number, organization) 
  WHERE membership_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS members_membership_card_number_organization_key 
  ON public.members (membership_card_number, organization) 
  WHERE membership_card_number IS NOT NULL;

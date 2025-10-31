-- Add ranking URL columns to championships
alter table public.championships
  add column if not exists society_ranking_url text,
  add column if not exists individual_ranking_url text;

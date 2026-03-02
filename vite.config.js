-- SimpliFinance — Supabase Setup
-- Run this in your Supabase project's SQL Editor (supabase.com → your project → SQL Editor)
-- Takes ~10 seconds, then add your URL + anon key to Vercel env vars

-- 1. Create the profiles table
create table if not exists profiles (
  id          text primary key,
  name        text not null,
  pin_hash    text not null,
  data        jsonb not null default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. Auto-update the updated_at timestamp on any change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- 3. Row Level Security — each row is only readable/writable via the anon key
--    (the app authenticates via name+pin, not Supabase auth)
alter table profiles enable row level security;

-- Allow anyone with the anon key to read/write (app enforces name+pin auth)
create policy "anon full access" on profiles
  for all using (true) with check (true);

-- 4. Index for fast lookups by name
create index if not exists profiles_name_idx on profiles (lower(name));

-- Done! Copy your project URL and anon key into Vercel environment variables:
--   VITE_SUPABASE_URL  = https://xxxx.supabase.co
--   VITE_SUPABASE_ANON_KEY = eyJ...

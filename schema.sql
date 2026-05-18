-- ─────────────────────────────────────────────────────────────────────
-- GATE Prep Hub — schema.sql
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
--
-- What this creates:
--   1. profiles       — extends auth.users with name, is_pro, is_admin
--   2. Trigger        — auto-creates a profile row on every new signup
--   3. RLS policies   — each user can only read/write their own data
--
-- NOTE: favorites, bookmarks, and annotations are stored in localStorage
-- in "Auth only" mode. If you upgrade to "Auth + DB sync", add the
-- tables in the OPTIONAL section at the bottom and sync from app.js.
-- ─────────────────────────────────────────────────────────────────────

-- ── 1. Profiles ──────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  is_pro     boolean not null default false,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per authenticated user. Extends auth.users with app-specific fields.';

-- ── Row-level security ──────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Users can read only their own profile
create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update only their own profile (name only; is_pro/is_admin via Edge Function)
create policy "users can update own name"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── 2. Auto-create profile on signup ────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, is_pro, is_admin)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    coalesce((new.raw_user_meta_data ->> 'is_pro')::boolean,  false),
    coalesce((new.raw_user_meta_data ->> 'is_admin')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop trigger if it exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 3. Keep updated_at fresh ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ── 4. Add email + is_banned columns to profiles ────────────────────
alter table public.profiles add column if not exists email    text;
alter table public.profiles add column if not exists is_banned boolean not null default false;

-- Backfill email for existing users
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- Update trigger to capture email going forward
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, is_pro, is_admin, is_banned)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.email,
    coalesce((new.raw_user_meta_data ->> 'is_pro')::boolean,  false),
    coalesce((new.raw_user_meta_data ->> 'is_admin')::boolean, false),
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── 5. is_admin() helper (avoids recursive RLS on profiles) ─────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Admins can read ALL profiles
create policy "admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Admins can update any profile
create policy "admins can update any profile"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete any profile
create policy "admins can delete any profile"
  on public.profiles for delete
  using (public.is_admin());

-- ── 5. Login logs ─────────────────────────────────────────────────────
create table if not exists public.login_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles (id) on delete cascade,
  email        text,
  name         text,
  logged_in_at timestamptz not null default now(),
  user_agent   text
);
alter table public.login_logs enable row level security;

create policy "users can insert own login log"
  on public.login_logs for insert
  with check (
    auth.uid() = user_id
    AND (email IS NULL OR email = auth.email())
  );

create policy "admins can read all login logs"
  on public.login_logs for select
  using (public.is_admin());

-- ── 6. PDF view log ───────────────────────────────────────────────────
create table if not exists public.pdf_views (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  email      text,
  pdf_id     text not null,
  pdf_name   text,
  subject    text,
  viewed_at  timestamptz not null default now()
);
alter table public.pdf_views enable row level security;

create policy "users can insert own pdf views"
  on public.pdf_views for insert
  with check (auth.uid() = user_id);

create policy "admins can read all pdf views"
  on public.pdf_views for select
  using (public.is_admin());

-- ── 7. Favorites ─────────────────────────────────────────────────────
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  pdf_id     text not null,
  created_at timestamptz not null default now(),
  unique (user_id, pdf_id)
);
alter table public.favorites enable row level security;
create policy "users manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 8. Bookmarks (page-level) ────────────────────────────────────────
create table if not exists public.bookmarks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  pdf_id     text not null,
  page       integer not null check (page >= 1),
  created_at timestamptz not null default now(),
  unique (user_id, pdf_id, page)
);
alter table public.bookmarks enable row level security;
create policy "users manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 9. PDF catalog (drive IDs protected — only served to authenticated users) ──
create table if not exists public.pdfs (
  id        text primary key,
  drive_id  text not null
);
alter table public.pdfs enable row level security;

-- Only logged-in users can read drive IDs
create policy "authenticated users can read pdf catalog"
  on public.pdfs for select
  using (auth.uid() is not null);

-- Admins can insert / update the catalog
create policy "admins can manage pdf catalog"
  on public.pdfs for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed — safe to re-run (upsert)
insert into public.pdfs (id, drive_id) values
  ('p0101', '1wAUVgspBwtfnVUVK3XJ03fzZ_CEf-1Vv'),
  ('p0102', '1VW8C_zeOP4CmFw8-usaJU-ijiLBq9opb'),
  ('p0103', '1P9_OLuRIGTidgkSXhYod1yg5xQ24KonG'),
  ('p0104', '1jrOCQ4VKG6QkJFbqvaSFLx0BVPa_qssJ'),
  ('p0105', '14zi8aXw-pZGbZQOc5rb1V5yCNpTmrEjz'),
  ('p0201', '12Z3bQFX-NrBB9nMKeSlSugOs0G6eAOtL'),
  ('p0202', '1_nTd3ZNJH_zGUAyhPnS4V_66zrPQ0VZL'),
  ('p0203', '1oeY1XiQ0X5eHeFmePmZSBIJV1MnZNoO5'),
  ('p0204', '1pbHBbLCKgwrb6LeWDvStTVBoPxhk1aFv'),
  ('p0301', '1omfsry1qCZREhC1xbfmRv6Ykte6jf7dB'),
  ('p0302', '1FEZHQtbznexQvAe7tPP6SoZXQ7_lhp55'),
  ('p0303', '1EZe6eBvCMDalJbj414OyLLZakyxO433A'),
  ('p0304', '1NbzsA1noJeb9RUc0QpU4MhUtSpyCNNMD'),
  ('p0305', '1UsN99pYuwgi_74qjAVxLxuFAJb6jGf4v'),
  ('p0401', '1neIIgtxR72Rm6Qx6O6Y3RaS0nzKoDuuE'),
  ('p0402', '1fZwffJv1vKVQFiwfoOVwKMqxHUWOxV9q'),
  ('p0403', '1-4Zl-_HuVGrdkGEkmcmr_uW84hTIFKdt'),
  ('p0404', '1ZZi1oD7AAJ54USs-xuHoR1F5PCcuWvT0'),
  ('p0501', '1AxA13yFVybMxOK3mXOx2clW9FL8vQwm9'),
  ('p0502', '1xATiyt5E8g3Z1AwWZeENVCe5Utg1NAyt'),
  ('p0503', '19vOpzJuzrZ7bd6wuE9KSxkrwwM5G4lpK'),
  ('p0504', '1zbdvaIxXQvCSH5dRDWpf8rS-tKAAGhh5'),
  ('p0505', '1Q0nt5emadAV5C21glZRAEfxN1XfMLrn7'),
  ('p0601', '1qA6L9DPDYpkAfHY-db5g3i6HA2niFfxW'),
  ('p0602', '1KZ1ZfBNkijlzr65KjH6LhQ51KvVOaPGS'),
  ('p0603', '1pIVLgL6gNZNGNORIyyxgnMi4X_VmttIQ'),
  ('p0604', '1LWTs18GoMnnrnLsqAqxZoGaZ8X2POv-X'),
  ('p0701', '131Rk4oEfJNrVnyNJ2I71KCFiArkhXbH_'),
  ('p0702', '1h9D4oDMHmz56FrIeQbqbVgxatrFnPRWH'),
  ('p0703', '1UvMFT1DbOdkp9kWIWflF9V17rW3PUU99'),
  ('p0704', '1j4nXuJipR1U1u0mk9X6NuRAFVI0TCDx1'),
  ('p0705', '1kb-7K06GEhYbEtvXRn5CewPw63-2ejom'),
  ('p0706', '1SuBt3VdS0xjqHXoD3eGXZDZMh6qbG8Yg'),
  ('p0801', '1ZssMx0IUXUy9fw4sEGcgDoq9nCob2Gua'),
  ('p0802', '1Mtmw_fAUQivzjFlO4e5k692xztljKTc2'),
  ('p0803', '1qJ8l1M5Ug1nWnxYYK1rLvIaiWeRBTq8_'),
  ('p0804', '13ZXUtmh9aRhzL9EOA1nEVEbZM2pZwQMy'),
  ('p0805', '1JdpXdlbxtX-X5An4LOBY1fL0W37ihjZM'),
  ('p0806', '1CmHvmA4jYSbFrbdruDx2FDF15TQjdhP8'),
  ('p0901', '1RaBk9UDpI4KsnHBYc-6eXC-hWAzgL9eW'),
  ('p0902', '1DYVp6Xzi0xK7oK6HbcJ5hf0dLmY0IUqG'),
  ('p0903', '1geB8P-rOB-d_2JI0mBU8Fw2Qbg4A4fc1'),
  ('p0904', '1jMBkZlxieRHgsadc9NYIuyAqeZXLYqr9'),
  ('p1001', '13jVWfJstiroZvQhlFtfhhDKGv650ehrI'),
  ('p1002', '1H_zDBLF5nQDNKclLt8SAQ89dfcC9tw2I'),
  ('p1003', '1VaDO7BPttEhe5F0inUKs6mWhUax_dr5b'),
  ('p1004', '11rmB44FU0gmGzg6DOswJAJMycNnfxpGQ'),
  ('p1101', '1nqheSl7evz7LVg-JIVmIY7wEOUHuB62y'),
  ('p1102', '1vxvQDWNidN7K4vRGufKoPK1hfAkXKGSm'),
  ('p1201', '1DbeAAMVpTyNMjHAV04EcbUsjcgFB-sk-'),
  ('p1202', '1fmymR5xwIwvRpardaJTp1BKY-qb52-_t'),
  ('p1203', '1CMwVrHjAqx-xFPcQMvD5PMksOTp329z8'),
  ('p1204', '1OjgAv3JElwo5tqzDqGmtepgtdWfa-YRE'),
  ('p1205', '1CE_NKhK73hAk9SZ7rBQjwNSf0eqZIK95')
on conflict (id) do update set drive_id = excluded.drive_id;

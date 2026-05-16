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
  with check (auth.uid() = user_id);

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

-- ─────────────────────────────────────────────────────────────────────
-- OPTIONAL — uncomment if you upgrade to "Auth + DB sync" later
-- ─────────────────────────────────────────────────────────────────────

/*

-- ── Favorites ────────────────────────────────────────────────────────
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

-- ── Bookmarks (page-level) ───────────────────────────────────────────
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

-- ── Annotations (text notes per PDF) ────────────────────────────────
create table if not exists public.annotations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  pdf_id     text not null,
  page       integer not null check (page >= 1),
  body       text not null,
  created_at timestamptz not null default now()
);
alter table public.annotations enable row level security;
create policy "users manage own annotations"
  on public.annotations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── PDF view history ─────────────────────────────────────────────────
create table if not exists public.pdf_views (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  pdf_id     text not null,
  viewed_at  timestamptz not null default now(),
  unique (user_id, pdf_id)
);
alter table public.pdf_views enable row level security;
create policy "users manage own view history"
  on public.pdf_views for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

*/

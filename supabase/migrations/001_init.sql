-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/bebmdntiwjlrgcsuanqr/sql/new)
-- after signing in with your Supabase account.

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  role        text not null default 'alumni' check (role in ('admin', 'alumni')),
  batch       text,
  course      text,
  avatar_url  text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper: bypasses RLS to avoid infinite recursion in admin policies
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
drop function if exists public.handle_new_user cascade;
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'alumni'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- BATCHES TABLE
-- ============================================
create table if not exists public.batches (
  id         uuid primary key default gen_random_uuid(),
  year       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.batches enable row level security;

drop policy if exists "Admins can manage batches" on public.batches;
create policy "Admins can manage batches"
  on public.batches for all
  using (public.is_admin());

drop policy if exists "Anyone can read batches" on public.batches;
create policy "Anyone can read batches"
  on public.batches for select
  using (true);

-- ============================================
-- COURSES TABLE
-- ============================================
create table if not exists public.courses (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  code       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses"
  on public.courses for all
  using (public.is_admin());

drop policy if exists "Anyone can read courses" on public.courses;
create policy "Anyone can read courses"
  on public.courses for select
  using (true);

-- ============================================
-- SEED ADMIN PROFILE
-- ============================================
insert into public.profiles (id, full_name, role)
select id, 'Patricia Ann Mahinay', 'admin'
from auth.users
where email = 'patriciaannmahinay101@gmail.com'
on conflict (id) do update set role = 'admin';

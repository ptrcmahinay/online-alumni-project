-- ============================================
-- CAREERS TABLE
-- ============================================
create table if not exists public.careers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  company    text not null,
  position   text not null,
  start_date text,
  end_date   text,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.careers enable row level security;

drop policy if exists "Users can read own careers" on public.careers;
create policy "Users can read own careers"
  on public.careers for select
  using (auth.uid() = user_id);

drop policy if exists "Users can manage own careers" on public.careers;
create policy "Users can manage own careers"
  on public.careers for all
  using (auth.uid() = user_id);

drop policy if exists "Admins can read all careers" on public.careers;
create policy "Admins can read all careers"
  on public.careers for select
  using (public.is_admin());

-- ============================================
-- EVENTS TABLE
-- ============================================
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  date        text not null,
  time        text,
  location    text,
  type        text not null default 'meetup',
  max_attendees integer,
  status      text not null default 'upcoming',
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists "Anyone can read events" on public.events;
create policy "Anyone can read events"
  on public.events for select
  using (true);

drop policy if exists "Admins can manage events" on public.events;
create policy "Admins can manage events"
  on public.events for all
  using (public.is_admin());

-- ============================================
-- EVENT RSVPS
-- ============================================
create table if not exists public.event_rsvps (
  id       uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id  uuid not null references public.profiles(id) on delete cascade,
  status   text not null default 'attending',
  unique(event_id, user_id)
);

alter table public.event_rsvps enable row level security;

drop policy if exists "Users can manage own rsvps" on public.event_rsvps;
create policy "Users can manage own rsvps"
  on public.event_rsvps for all
  using (auth.uid() = user_id);

drop policy if exists "Anyone can read rsvps" on public.event_rsvps;
create policy "Anyone can read rsvps"
  on public.event_rsvps for select
  using (true);

-- ============================================
-- OPPORTUNITIES (Job Board)
-- ============================================
create table if not exists public.opportunities (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  company     text not null,
  location    text,
  type        text not null default 'job',
  status      text not null default 'pending',
  requirements text,
  apply_link  text,
  posted_by   uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

alter table public.opportunities enable row level security;

drop policy if exists "Anyone can read opportunities" on public.opportunities;
create policy "Anyone can read opportunities"
  on public.opportunities for select
  using (true);

drop policy if exists "Admins can manage opportunities" on public.opportunities;
create policy "Admins can manage opportunities"
  on public.opportunities for all
  using (public.is_admin());

drop policy if exists "Users can post opportunities" on public.opportunities;
create policy "Users can post opportunities"
  on public.opportunities for insert
  with check (auth.role() = 'authenticated');

-- ============================================
-- ANNOUNCEMENTS
-- ============================================
create table if not exists public.announcements (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  content       text,
  status        text not null default 'published',
  schedule_date timestamptz,
  audience      text default 'all',
  created_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "Anyone can read announcements" on public.announcements;
create policy "Anyone can read announcements"
  on public.announcements for select
  using (true);

drop policy if exists "Admins can manage announcements" on public.announcements;
create policy "Admins can manage announcements"
  on public.announcements for all
  using (public.is_admin());

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null default 'info',
  title      text not null,
  message    text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can manage own notifications" on public.notifications;
create policy "Users can manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id);

-- ============================================
-- DONATIONS
-- ============================================
create table if not exists public.donations (
  id         uuid primary key default gen_random_uuid(),
  donor_name text not null,
  batch      text,
  amount     numeric not null default 0,
  type       text not null default 'one-time',
  purpose    text,
  donor_id   uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.donations enable row level security;

drop policy if exists "Anyone can read donations" on public.donations;
create policy "Anyone can read donations"
  on public.donations for select
  using (true);

drop policy if exists "Admins can manage donations" on public.donations;
create policy "Admins can manage donations"
  on public.donations for all
  using (public.is_admin());

-- ============================================
-- UPDATE DATABASE.TYPES FOR NEW TABLES
-- ============================================
-- Update the Profile type to include new fields (done in TypeScript)
-- The corresponding TypeScript interfaces should be updated to match these tables

-- ============================================================
-- CvSU Naic Online Alumni Portal — Full Database Schema
-- ============================================================

-- ############################################################
-- TABLES
-- ############################################################

-- ----------------------------------------
-- PROFILES (extends auth.users)
-- ----------------------------------------
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text not null default '',
  role                text not null default 'alumni' check (role in ('admin', 'alumni')),
  batch               text,
  course              text,
  avatar_url          text,
  phone               text,
  student_number      text,
  location            text,
  bio                 text,
  graduation_year     text,
  employment_status   text,
  company             text,
  position            text,
  industry            text,
  website             text,
  github              text,
  twitter             text,
  linkedin            text,
  resume_url          text,
  certificates        jsonb default '[]'::jsonb,
  verification_status text default 'pending',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ----------------------------------------
-- BATCHES
-- ----------------------------------------
create table if not exists public.batches (
  id         uuid primary key default gen_random_uuid(),
  year       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.batches enable row level security;

-- ----------------------------------------
-- COURSES
-- ----------------------------------------
create table if not exists public.courses (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  code       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

-- ----------------------------------------
-- CAREERS
-- ----------------------------------------
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

-- ----------------------------------------
-- EVENTS
-- ----------------------------------------
create table if not exists public.events (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  date           text not null,
  time           text,
  location       text,
  type           text not null default 'meetup',
  target_course  text,
  max_attendees  integer,
  status         text not null default 'upcoming',
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now()
);

alter table public.events enable row level security;

-- ----------------------------------------
-- EVENT RSVPs
-- ----------------------------------------
create table if not exists public.event_rsvps (
  id       uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id  uuid not null references public.profiles(id) on delete cascade,
  status   text not null default 'attending',
  unique(event_id, user_id)
);

alter table public.event_rsvps enable row level security;

-- ----------------------------------------
-- OPPORTUNITIES (Job Board)
-- ----------------------------------------
create table if not exists public.opportunities (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  company      text not null,
  location     text,
  type         text not null default 'job',
  status       text not null default 'pending',
  requirements text,
  apply_link   text,
  email        text,
  salary_range text,
  hybrid       boolean default false,
  posted_by    uuid references public.profiles(id),
  created_at   timestamptz not null default now()
);

alter table public.opportunities enable row level security;

-- ----------------------------------------
-- ANNOUNCEMENTS
-- ----------------------------------------
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

-- ----------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------
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

-- ----------------------------------------
-- DONATIONS
-- ----------------------------------------
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


-- ############################################################
-- FUNCTIONS & TRIGGERS
-- ############################################################

-- Helper: bypasses RLS to avoid infinite recursion in admin policies
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Auto-create profile on signup
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


-- ############################################################
-- ROW LEVEL SECURITY POLICIES
-- ############################################################

-- ---------- PROFILES ----------
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---------- BATCHES ----------
drop policy if exists "Anyone can read batches" on public.batches;
create policy "Anyone can read batches"
  on public.batches for select
  using (true);

drop policy if exists "Admins can manage batches" on public.batches;
create policy "Admins can manage batches"
  on public.batches for all
  using (public.is_admin());

-- ---------- COURSES ----------
drop policy if exists "Anyone can read courses" on public.courses;
create policy "Anyone can read courses"
  on public.courses for select
  using (true);

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses"
  on public.courses for all
  using (public.is_admin());

-- ---------- CAREERS ----------
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

-- ---------- EVENTS ----------
drop policy if exists "Anyone can read events" on public.events;
create policy "Anyone can read events"
  on public.events for select
  using (true);

drop policy if exists "Admins can manage events" on public.events;
create policy "Admins can manage events"
  on public.events for all
  using (public.is_admin());

-- ---------- EVENT RSVPs ----------
drop policy if exists "Users can manage own rsvps" on public.event_rsvps;
create policy "Users can manage own rsvps"
  on public.event_rsvps for all
  using (auth.uid() = user_id);

drop policy if exists "Anyone can read rsvps" on public.event_rsvps;
create policy "Anyone can read rsvps"
  on public.event_rsvps for select
  using (true);

-- ---------- OPPORTUNITIES ----------
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

-- ---------- ANNOUNCEMENTS ----------
drop policy if exists "Anyone can read announcements" on public.announcements;
create policy "Anyone can read announcements"
  on public.announcements for select
  using (true);

drop policy if exists "Admins can manage announcements" on public.announcements;
create policy "Admins can manage announcements"
  on public.announcements for all
  using (public.is_admin());

-- ---------- NOTIFICATIONS ----------
drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own notifications" on public.notifications;
create policy "Users can insert own notifications"
  on public.notifications for insert
  with check (true);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- ---------- DONATIONS ----------
drop policy if exists "Anyone can read donations" on public.donations;
create policy "Anyone can read donations"
  on public.donations for select
  using (true);

drop policy if exists "Admins can manage donations" on public.donations;
create policy "Admins can manage donations"
  on public.donations for all
  using (public.is_admin());


-- ############################################################
-- STORAGE BUCKETS & POLICIES
-- ############################################################

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Avatars
drop policy if exists "Anyone can view avatars" on storage.objects;
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() = owner
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() = owner
  );

-- Documents
drop policy if exists "Anyone can view documents" on storage.objects;
create policy "Anyone can view documents"
  on storage.objects for select
  using (bucket_id = 'documents');

drop policy if exists "Users can upload their own documents" on storage.objects;
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Users can update their own documents" on storage.objects;
create policy "Users can update their own documents"
  on storage.objects for update
  using (
    bucket_id = 'documents'
    and auth.uid() = owner
  );

drop policy if exists "Users can delete their own documents" on storage.objects;
create policy "Users can delete their own documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and auth.uid() = owner
  );


-- ############################################################
-- DATA (exported from production database)
-- ############################################################

set session_replication_role = 'replica';

-- profiles (3 rows)
insert into public."profiles" ("id", "full_name", "role", "batch", "course", "avatar_url", "phone", "created_at", "updated_at", "student_number", "location", "bio", "graduation_year", "employment_status", "company", "position", "industry", "website", "github", "twitter", "linkedin", "resume_url", "certificates", "verification_status") values
  ('3d65ce27-cfb9-47a4-b8ff-96aba0986aa2', 'Patricia Mahinay', 'admin', NULL, NULL, NULL, NULL, '2026-06-08T05:17:54.023001+00:00', '2026-06-08T05:17:54.023001+00:00', NULL, NULL, NULL, NULL, 'self-employed', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', 'pending'),
  ('a167c300-f564-428b-b664-ff43aaadda1d', 'Patricia Ann C. Mahinay', 'alumni', '2023', 'BSIT', 'https://bebmdntiwjlrgcsuanqr.supabase.co/storage/v1/object/public/avatars/a167c300-f564-428b-b664-ff43aaadda1d/avatar.JPG', '+63 9058192018', '2026-06-08T05:57:34.172823+00:00', '2026-06-08T05:57:34.172823+00:00', '22310658', 'Naic, Cavite', 'A frontend developer', '2027', 'freelance', NULL, NULL, NULL, NULL, 'https://github.com/ptrcmahinay', NULL, NULL, NULL, 'https://bebmdntiwjlrgcsuanqr.supabase.co/storage/v1/object/public/documents/a167c300-f564-428b-b664-ff43aaadda1d/certs/1780915605635-EthicalHackerUpdate20260104-31-40yl62%20(1).pdf', 'verified'),
  ('af513e81-3ee5-439f-94a8-385a9613b741', 'Ariana Grande', 'alumni', NULL, NULL, NULL, NULL, '2026-06-08T23:37:08.646384+00:00', '2026-06-08T23:37:08.646384+00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', 'pending');

-- batches: no data

-- courses: no data

-- careers (1 rows)
insert into public."careers" ("id", "user_id", "company", "position", "start_date", "end_date", "is_current", "created_at") values
  ('659d0b40-1527-4c15-a186-f14743579aca', 'a167c300-f564-428b-b664-ff43aaadda1d', 'Freelancing', 'Frontend Developer', '2026-01-01', NULL, true, '2026-06-08T13:08:21.931982+00:00');

-- events (1 rows)
insert into public."events" ("id", "title", "description", "date", "time", "location", "type", "max_attendees", "status", "created_by", "created_at", "target_course") values
  ('570e5669-0a4b-44d3-83bd-5feb87b27cfe', 'ITD Alumni Webinar Series 2026–2027', 'Join the ITD Alumni Webinar Series featuring industry experts, career mentors, and successful alumni sharing insights on technology, career growth, and professional development.

This online session is designed to help alumni stay competitive in the evolving tech industry.

🎤 Webinar Topics

• Navigating Your First Tech Job
• Trends in Software Development & IT Industry
• Career Growth in Freelancing vs Corporate Jobs
• Building a Strong Online Professional Presence
• Q&A with Industry Professionals', '2026-08-08', '08:00', 'Zoom', 'Webinar', 100, 'upcoming', '3d65ce27-cfb9-47a4-b8ff-96aba0986aa2', '2026-06-08T12:46:39.514919+00:00', 'BSIT');

-- event_rsvps (1 rows)
insert into public."event_rsvps" ("id", "event_id", "user_id", "status") values
  ('726c8bc5-81f4-4158-bb0c-8d8c5270574d', '570e5669-0a4b-44d3-83bd-5feb87b27cfe', 'a167c300-f564-428b-b664-ff43aaadda1d', 'attending');

-- opportunities (1 rows)
insert into public."opportunities" ("id", "title", "description", "company", "location", "type", "status", "requirements", "apply_link", "posted_by", "created_at", "email", "salary_range", "hybrid") values
  ('154283ea-0d0c-4958-b4f0-a7b8b84e1846', 'Junior Frontend Developer (React)', 'TechNova Solutions Inc. is looking for a motivated Junior Frontend Developer who is passionate about building responsive and user-friendly web applications using modern technologies like React.

You will work closely with senior developers, designers, and product teams to deliver high-quality web solutions.

Responsibilities
• Develop and maintain web applications using React
• Convert UI/UX designs into responsive interfaces
• Fix bugs and improve application performance
• Collaborate with backend developers
• Participate in code reviews', 'TechNova Solutions Inc.', 'Quezon City, Philippines', 'Full-time', 'approved', '• Bachelor''s degree in IT, CS, or related field (or graduating student)
• Basic knowledge of React, JavaScript, HTML, CSS
• Familiarity with REST APIs
• Understanding of Git version control
• Strong problem-solving skills', 'https://technova.ph/careers', 'a167c300-f564-428b-b664-ff43aaadda1d', '2026-06-08T13:27:31.154994+00:00', 'careers@technova.ph', '20,000', true);

-- announcements: no data
-- notifications: no data
-- donations: no data

set session_replication_role = 'origin';

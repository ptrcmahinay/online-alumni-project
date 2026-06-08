-- Add target_course column to events for course-specific targeting
alter table public.events
add column if not exists target_course text;

-- Update the RLS policy to allow reading based on target_course
-- (Filtering is done in the application layer, but admins can always see all)

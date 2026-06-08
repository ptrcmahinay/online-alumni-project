export interface Profile {
  id: string;
  full_name: string;
  role: "admin" | "alumni";
  batch: string | null;
  course: string | null;
  avatar_url: string | null;
  phone: string | null;
  student_number: string | null;
  location: string | null;
  bio: string | null;
  graduation_year: string | null;
  employment_status: string | null;
  company: string | null;
  position: string | null;
  industry: string | null;
  website: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  resume_url: string | null;
  certificates: string[] | null;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  year: string;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Career {
  id: string;
  user_id: string;
  company: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  type: string;
  target_course: string | null;
  max_attendees: number | null;
  status: string;
  created_by: string | null;
  created_at: string;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  company: string;
  location: string | null;
  type: string;
  status: string;
  requirements: string | null;
  apply_link: string | null;
  posted_by: string | null;
  created_at: string;
  email: string | null;
  salary_range: string | null;
  hybrid: boolean | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string | null;
  status: string;
  schedule_date: string | null;
  audience: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
}

export interface Donation {
  id: string;
  donor_name: string;
  batch: string | null;
  amount: number;
  type: string;
  purpose: string | null;
  donor_id: string | null;
  created_at: string;
}

-- ========================================================================
-- AT – DESIGN TASK MANAGEMENT SYSTEM
-- Supabase PostgreSQL Relational Database Schema & Policies
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'DESIGNER', 'CONTENT_CREATOR')),
  avatar TEXT,
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#EA580C',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('DESIGN', 'CONTENT', 'BOTH')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRIORITIES TABLE
CREATE TABLE IF NOT EXISTS public.priorities (
  id TEXT PRIMARY KEY, -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  sla_hours INT DEFAULT 24
);

-- 5. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_code TEXT UNIQUE NOT NULL, -- AT-000124
  title TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  task_type TEXT NOT NULL,
  requester TEXT NOT NULL,
  assigned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  priority TEXT NOT NULL REFERENCES public.priorities(id) DEFAULT 'MEDIUM',
  status TEXT NOT NULL CHECK (status IN (
    'DRAFT', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW',
    'REVISION', 'APPROVED', 'COMPLETED', 'ON_HOLD', 'CANCELLED'
  )) DEFAULT 'DRAFT',
  created_date TIMESTAMPTZ DEFAULT NOW(),
  start_date TIMESTAMPTZ,
  deadline TIMESTAMPTZ NOT NULL,
  estimated_work_time TEXT,
  
  -- Design Brief Specifications
  design_brief TEXT NOT NULL,
  objective TEXT,
  target_audience TEXT,
  design_concept TEXT,
  design_clue TEXT,
  reference TEXT,
  required_text TEXT,
  cta TEXT,
  platform TEXT,
  dimension TEXT,
  notes TEXT,
  
  -- Lifecycle trackers
  current_version TEXT DEFAULT 'V1',
  revision_count INT DEFAULT 0,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TASK ASSIGNMENTS (Audit log of PIC reassignments)
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  previous_pic_id UUID REFERENCES public.users(id),
  new_pic_id UUID NOT NULL REFERENCES public.users(id),
  changed_by UUID NOT NULL REFERENCES public.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT NOT NULL
);

-- 7. TASK SUBMISSIONS (Design deliverables V1, V2, V3...)
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  version TEXT NOT NULL, -- V1, V2, V3...
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  preview_url TEXT,
  notes TEXT,
  uploader_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT CHECK (status IN ('PENDING_REVIEW', 'REVISION_REQUESTED', 'APPROVED')) DEFAULT 'PENDING_REVIEW',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TASK REVISIONS (Manager feedback and review cycles)
CREATE TABLE IF NOT EXISTS public.task_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  revision_number INT NOT NULL,
  requested_by UUID NOT NULL REFERENCES public.users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  feedback TEXT NOT NULL,
  submission_version TEXT NOT NULL,
  resolved_at TIMESTAMPTZ
);

-- 9. TASK COMMENTS (Discussion thread)
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TASK ATTACHMENTS (Brief assets, brand guidelines, logo files)
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TASK ACTIVITY LOGS (Detailed Audit Trail)
CREATE TABLE IF NOT EXISTS public.task_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT NOT NULL,
  details TEXT,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies for Tasks:
-- Managers can view and modify all tasks.
-- Designers and Content Creators can view assigned tasks or non-draft tasks, and update tasks assigned to them.
CREATE POLICY "Managers can manage all tasks"
  ON public.tasks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER'))
  );

CREATE POLICY "Designers can view assigned tasks"
  ON public.tasks FOR SELECT
  USING (
    assigned_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER'))
  );

CREATE POLICY "Designers can update assigned tasks progress"
  ON public.tasks FOR UPDATE
  USING (assigned_user_id = auth.uid());

-- Realtime replication activation
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_activity_logs;

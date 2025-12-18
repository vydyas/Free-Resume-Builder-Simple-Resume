-- SimpleResu.me - Full Supabase schema for open source contributors
-- This file combines all app-specific migrations into a single script.
-- It is safe to run multiple times thanks to IF NOT EXISTS guards.

------------------------------------------------------------
-- 1) Users: email preferences & profile fields
------------------------------------------------------------

-- Add email subscription preference and user name fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_subscription_enabled BOOLEAN DEFAULT true;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Index for faster queries when filtering by subscription status
CREATE INDEX IF NOT EXISTS idx_users_email_subscription ON users(email_subscription_enabled);

-- Documentation comments
COMMENT ON COLUMN users.email_subscription_enabled IS 'User email subscription preference. true = opted in, false = opted out';
COMMENT ON COLUMN users.first_name IS 'User first name';
COMMENT ON COLUMN users.last_name IS 'User last name';


------------------------------------------------------------
-- 2) Feedback & Bug reports base tables
------------------------------------------------------------

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text,
  email text,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  mood text,
  message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_clerk_user_id ON feedback(clerk_user_id);

-- Bug reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text,
  email text,
  page_url text,
  description text,
  screenshot_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_clerk_user_id ON bug_reports(clerk_user_id);


------------------------------------------------------------
-- 3) Bug reports: status, admin comments, timestamps
------------------------------------------------------------

ALTER TABLE bug_reports
ADD COLUMN IF NOT EXISTS status text DEFAULT 'open',
ADD COLUMN IF NOT EXISTS admin_comment text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Optional: simple constraint on status values
-- Uncomment if you want to strictly enforce allowed statuses.
-- ALTER TABLE bug_reports
--   ADD CONSTRAINT bug_reports_status_check
--   CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'));

CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);


------------------------------------------------------------
-- 4) Feedback: admin reply metadata
------------------------------------------------------------

ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS admin_reply text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_feedback_updated_at ON feedback(updated_at DESC);


------------------------------------------------------------
-- 5) Admin users (for admin panel login)
------------------------------------------------------------

-- WARNING: For real production apps you should hash passwords.
-- This is intentionally simple for open source/demo usage.

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Seed admin users manually via Supabase dashboard or a private script.
-- Example (do NOT commit real passwords):
-- INSERT INTO admins (username, password) VALUES ('your_admin', 'your_strong_password');

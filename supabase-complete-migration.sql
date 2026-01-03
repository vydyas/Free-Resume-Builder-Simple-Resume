-- ============================================
-- SimpleResu.me - Complete Database Migration
-- Run this SQL in your Supabase SQL Editor
-- This is a comprehensive migration that includes everything
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Users Table
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  email_subscription_enabled BOOLEAN DEFAULT true,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email_subscription ON users(email_subscription_enabled);

COMMENT ON COLUMN users.email_subscription_enabled IS 'User email subscription preference. true = opted in, false = opted out';
COMMENT ON COLUMN users.first_name IS 'User first name';
COMMENT ON COLUMN users.last_name IS 'User last name';

-- ============================================
-- 2. Resumes Table (Base Structure)
-- ============================================

CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'My Resume',

  -- Personal Information (stored as columns)
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  headline TEXT,
  summary TEXT,
  location TEXT,
  phone_number TEXT,
  linkedin_id TEXT,
  github_id TEXT,

  -- Experience & Education (stored as JSONB, synced to tables for filtering)
  positions JSONB DEFAULT '[]'::jsonb,
  educations JSONB DEFAULT '[]'::jsonb,

  -- Custom sections (JSONB only)
  custom_sections JSONB DEFAULT '[]'::jsonb,

  -- Resume configuration
  config JSONB DEFAULT '{
    "showPhoto": true,
    "showSummary": true,
    "showExperience": true,
    "showEducation": true,
    "showSkills": true,
    "showProjects": true,
    "showRepositories": true,
    "showAwards": true,
    "showCertificates": true,
    "showLanguages": true,
    "showVolunteer": true,
    "showCertifications": true
  }'::jsonb,

  -- Styling (JSONB for additional preferences)
  styling JSONB DEFAULT '{}'::jsonb,

  -- Styling fields (direct columns for easy querying)
  heading_font TEXT DEFAULT 'Inter',
  name_font TEXT DEFAULT 'Inter',
  heading_color TEXT DEFAULT '#374151',
  name_color TEXT DEFAULT '#111827',
  border_color TEXT DEFAULT '#666',
  company_color TEXT DEFAULT '#4b5563',
  resume_background_color TEXT DEFAULT '#ffffff',
  skills_style TEXT DEFAULT 'list' CHECK (skills_style IN ('chips', 'list')),
  heading_style TEXT DEFAULT 'background' CHECK (heading_style IN ('background', 'border-bottom', 'border-top')),

  -- Metadata
  template TEXT DEFAULT 'default',
  zoom INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for resumes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_is_active ON resumes(is_active);
CREATE INDEX IF NOT EXISTS idx_resumes_is_public ON resumes(is_public);
CREATE INDEX IF NOT EXISTS idx_resumes_public_active ON resumes(is_public, is_active) WHERE is_public = true AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_resumes_location ON resumes(location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resumes_headline ON resumes(headline) WHERE headline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resumes_email ON resumes(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resumes_first_last_name ON resumes(first_name, last_name) WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

COMMENT ON COLUMN resumes.is_public IS 'Whether the resume is publicly visible for recruiter search.';
COMMENT ON COLUMN resumes.styling IS 'Additional styling preferences stored as JSONB.';
COMMENT ON COLUMN resumes.positions IS 'Primary storage for work experience positions (JSONB). Also synced to resume_positions table for filtering.';
COMMENT ON COLUMN resumes.educations IS 'Primary storage for education entries (JSONB). Also synced to resume_educations table for filtering.';

-- ============================================
-- 3. Resume Sections Tables (for filtering/search)
-- ============================================

-- Positions (Work Experience) - synced from JSONB
CREATE TABLE IF NOT EXISTS resume_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_positions_resume_id ON resume_positions(resume_id);
CREATE INDEX IF NOT EXISTS idx_positions_company ON resume_positions(company);
CREATE INDEX IF NOT EXISTS idx_positions_title ON resume_positions(title);
CREATE INDEX IF NOT EXISTS idx_positions_display_order ON resume_positions(resume_id, display_order);

COMMENT ON TABLE resume_positions IS 'Work experience positions synced from JSONB for filtering. Primary storage is in resumes.positions JSONB.';

-- Educations - synced from JSONB
CREATE TABLE IF NOT EXISTS resume_educations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_educations_resume_id ON resume_educations(resume_id);
CREATE INDEX IF NOT EXISTS idx_educations_school_name ON resume_educations(school_name);
CREATE INDEX IF NOT EXISTS idx_educations_degree ON resume_educations(degree);
CREATE INDEX IF NOT EXISTS idx_educations_field_of_study ON resume_educations(field_of_study);
CREATE INDEX IF NOT EXISTS idx_educations_display_order ON resume_educations(resume_id, display_order);

COMMENT ON TABLE resume_educations IS 'Education entries synced from JSONB for filtering. Primary storage is in resumes.educations JSONB.';

-- Personal Information - synced from resumes table
CREATE TABLE IF NOT EXISTS resume_personal_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL UNIQUE REFERENCES resumes(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  headline TEXT,
  summary TEXT,
  location TEXT,
  phone_number TEXT,
  linkedin_id TEXT,
  github_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_info_resume_id ON resume_personal_info(resume_id);
CREATE INDEX IF NOT EXISTS idx_personal_info_location ON resume_personal_info(location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_personal_info_headline ON resume_personal_info(headline) WHERE headline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_personal_info_email ON resume_personal_info(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_personal_info_name ON resume_personal_info(first_name, last_name) WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

COMMENT ON TABLE resume_personal_info IS 'Personal information synced from resumes table for filtering. Primary storage is in resumes table columns.';

-- Skills (normalized - primary storage)
CREATE TABLE IF NOT EXISTS resume_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resume_id, name)
);

CREATE INDEX IF NOT EXISTS idx_skills_resume_id ON resume_skills(resume_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON resume_skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_name_lower ON resume_skills(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_skills_display_order ON resume_skills(resume_id, display_order);

COMMENT ON TABLE resume_skills IS 'Skills for resumes. Primary storage in normalized table.';

-- Projects (normalized - primary storage)
CREATE TABLE IF NOT EXISTS resume_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_resume_id ON resume_projects(resume_id);
CREATE INDEX IF NOT EXISTS idx_projects_title ON resume_projects(title);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON resume_projects(resume_id, display_order);

COMMENT ON TABLE resume_projects IS 'Projects for resumes. Primary storage in normalized table.';

-- Certifications (normalized - primary storage)
CREATE TABLE IF NOT EXISTS resume_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  completion_date TEXT NOT NULL,
  description TEXT,
  credential_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certifications_resume_id ON resume_certifications(resume_id);
CREATE INDEX IF NOT EXISTS idx_certifications_organization ON resume_certifications(organization);
CREATE INDEX IF NOT EXISTS idx_certifications_title ON resume_certifications(title);
CREATE INDEX IF NOT EXISTS idx_certifications_display_order ON resume_certifications(resume_id, display_order);

COMMENT ON TABLE resume_certifications IS 'Certifications for resumes. Primary storage in normalized table.';

-- ============================================
-- 4. Feedback & Bug Reports Tables
-- ============================================

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT,
  email TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  mood TEXT,
  message TEXT,
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_clerk_user_id ON feedback(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_updated_at ON feedback(updated_at DESC);

-- Bug reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT,
  email TEXT,
  page_url TEXT,
  description TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'open',
  admin_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_clerk_user_id ON bug_reports(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);

-- ============================================
-- 5. Admin Users Table
-- ============================================

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. Triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Resumes
DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Resume sections
DROP TRIGGER IF EXISTS update_positions_updated_at ON resume_positions;
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON resume_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_educations_updated_at ON resume_educations;
CREATE TRIGGER update_educations_updated_at BEFORE UPDATE ON resume_educations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personal_info_updated_at ON resume_personal_info;
CREATE TRIGGER update_personal_info_updated_at BEFORE UPDATE ON resume_personal_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_skills_updated_at ON resume_skills;
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON resume_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON resume_projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON resume_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_certifications_updated_at ON resume_certifications;
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON resume_certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Feedback
DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bug reports
DROP TRIGGER IF EXISTS update_bug_reports_updated_at ON bug_reports;
CREATE TRIGGER update_bug_reports_updated_at BEFORE UPDATE ON bug_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Row Level Security (RLS)
-- ============================================

-- Note: RLS is disabled for now as we use service role key in API routes
-- You can enable and configure RLS policies later if needed

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Migration Complete!
-- ============================================




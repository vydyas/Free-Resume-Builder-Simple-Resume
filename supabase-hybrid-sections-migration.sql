-- SimpleResu.me - Hybrid Sections Migration
-- This migration uses JSONB for Personal Info, Experience, and Education
-- but also maintains normalized tables for filtering/search when data is updated
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. Add new fields to resumes table
-- ============================================

-- Add styling fields
ALTER TABLE resumes 
ADD COLUMN IF NOT EXISTS styling JSONB DEFAULT '{}'::jsonb;

-- Add public/private visibility
ALTER TABLE resumes 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add resume-level styling fields (separate from per-resume styling JSONB)
ALTER TABLE resumes 
ADD COLUMN IF NOT EXISTS heading_font TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS name_font TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS heading_color TEXT DEFAULT '#374151',
ADD COLUMN IF NOT EXISTS name_color TEXT DEFAULT '#111827',
ADD COLUMN IF NOT EXISTS border_color TEXT DEFAULT '#666',
ADD COLUMN IF NOT EXISTS company_color TEXT DEFAULT '#4b5563',
ADD COLUMN IF NOT EXISTS resume_background_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS skills_style TEXT DEFAULT 'list' CHECK (skills_style IN ('chips', 'list')),
ADD COLUMN IF NOT EXISTS heading_style TEXT DEFAULT 'background' CHECK (heading_style IN ('background', 'border-bottom', 'border-top'));

-- Ensure JSONB columns exist for Personal Info, Experience, Education
-- (These should already exist from base migration, but adding IF NOT EXISTS for safety)
DO $$ 
BEGIN
  -- These columns should already exist, but we're documenting them here
  -- Personal Information: first_name, last_name, email, headline, summary, location, phone_number, linkedin_id, github_id
  -- Experience: positions JSONB
  -- Education: educations JSONB
  -- These remain as JSONB for primary storage
END $$;

-- ============================================
-- 2. Create Positions (Work Experience) table for filtering
-- This table is synced from JSONB when positions are updated
-- ============================================

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

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_positions_resume_id ON resume_positions(resume_id);
CREATE INDEX IF NOT EXISTS idx_positions_company ON resume_positions(company);
CREATE INDEX IF NOT EXISTS idx_positions_title ON resume_positions(title);
CREATE INDEX IF NOT EXISTS idx_positions_display_order ON resume_positions(resume_id, display_order);

-- ============================================
-- 3. Create Educations table for filtering
-- This table is synced from JSONB when educations are updated
-- ============================================

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

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_educations_resume_id ON resume_educations(resume_id);
CREATE INDEX IF NOT EXISTS idx_educations_school_name ON resume_educations(school_name);
CREATE INDEX IF NOT EXISTS idx_educations_degree ON resume_educations(degree);
CREATE INDEX IF NOT EXISTS idx_educations_field_of_study ON resume_educations(field_of_study);
CREATE INDEX IF NOT EXISTS idx_educations_display_order ON resume_educations(resume_id, display_order);

-- ============================================
-- 4. Create Personal Information table for filtering
-- This table is synced from resumes table when personal info is updated
-- ============================================

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

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_personal_info_resume_id ON resume_personal_info(resume_id);
CREATE INDEX IF NOT EXISTS idx_personal_info_location ON resume_personal_info(location) WHERE location IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_personal_info_headline ON resume_personal_info(headline) WHERE headline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_personal_info_email ON resume_personal_info(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_personal_info_name ON resume_personal_info(first_name, last_name) WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

-- ============================================
-- 5. Create Skills table (normalized - primary storage)
-- ============================================

CREATE TABLE IF NOT EXISTS resume_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resume_id, name) -- Prevent duplicate skills per resume
);

-- Indexes for filtering (critical for recruiter search)
CREATE INDEX IF NOT EXISTS idx_skills_resume_id ON resume_skills(resume_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON resume_skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_name_lower ON resume_skills(LOWER(name)); -- Case-insensitive search
CREATE INDEX IF NOT EXISTS idx_skills_display_order ON resume_skills(resume_id, display_order);

-- ============================================
-- 6. Create Projects table (normalized - primary storage)
-- ============================================

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

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_projects_resume_id ON resume_projects(resume_id);
CREATE INDEX IF NOT EXISTS idx_projects_title ON resume_projects(title);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON resume_projects(resume_id, display_order);

-- ============================================
-- 7. Create Certifications table (normalized - primary storage)
-- ============================================

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

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_certifications_resume_id ON resume_certifications(resume_id);
CREATE INDEX IF NOT EXISTS idx_certifications_organization ON resume_certifications(organization);
CREATE INDEX IF NOT EXISTS idx_certifications_title ON resume_certifications(title);
CREATE INDEX IF NOT EXISTS idx_certifications_display_order ON resume_certifications(resume_id, display_order);

-- ============================================
-- 8. Add indexes for public resume filtering
-- ============================================

CREATE INDEX IF NOT EXISTS idx_resumes_is_public ON resumes(is_public);
CREATE INDEX IF NOT EXISTS idx_resumes_public_active ON resumes(is_public, is_active) WHERE is_public = true AND is_active = true;

-- ============================================
-- 9. Add triggers for updated_at
-- ============================================

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON resume_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educations_updated_at BEFORE UPDATE ON resume_educations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_info_updated_at BEFORE UPDATE ON resume_personal_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON resume_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON resume_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON resume_certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. Comments for documentation
-- ============================================

COMMENT ON TABLE resume_positions IS 'Work experience positions synced from JSONB for filtering. Primary storage is in resumes.positions JSONB.';
COMMENT ON TABLE resume_educations IS 'Education entries synced from JSONB for filtering. Primary storage is in resumes.educations JSONB.';
COMMENT ON TABLE resume_personal_info IS 'Personal information synced from resumes table for filtering. Primary storage is in resumes table columns.';
COMMENT ON TABLE resume_skills IS 'Skills for resumes. Primary storage in normalized table.';
COMMENT ON TABLE resume_projects IS 'Projects for resumes. Primary storage in normalized table.';
COMMENT ON TABLE resume_certifications IS 'Certifications for resumes. Primary storage in normalized table.';
COMMENT ON COLUMN resumes.is_public IS 'Whether the resume is publicly visible for recruiter search.';
COMMENT ON COLUMN resumes.styling IS 'Additional styling preferences stored as JSONB.';
COMMENT ON COLUMN resumes.positions IS 'Primary storage for work experience positions (JSONB). Also synced to resume_positions table for filtering.';
COMMENT ON COLUMN resumes.educations IS 'Primary storage for education entries (JSONB). Also synced to resume_educations table for filtering.';




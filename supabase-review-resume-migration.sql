-- ============================================
-- Review Resume Feature - Database Migration
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Resume Reviews Table
-- Stores uploaded PDF resumes for review
-- ============================================

CREATE TABLE IF NOT EXISTS resume_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- User-given name for the review
  pdf_url TEXT NOT NULL, -- Supabase Storage URL
  share_token TEXT UNIQUE NOT NULL, -- Random token for shareable link
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ, -- Optional expiration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Resume Review Comments Table
-- Stores comments on PDFs (WYSIWYG content)
-- ============================================

CREATE TABLE IF NOT EXISTS resume_review_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES resume_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who made the comment (required for new comments)
  reviewer_name TEXT, -- Name of reviewer (populated from user data)
  reviewer_email TEXT, -- Email of reviewer (populated from user data)
  comment_text TEXT NOT NULL, -- HTML content from WYSIWYG editor
  parent_comment_id UUID REFERENCES resume_review_comments(id) ON DELETE CASCADE, -- For replies
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_id column if table already exists (for existing installations)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resume_review_comments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE resume_review_comments 
    ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_resume_reviews_user_id ON resume_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_reviews_share_token ON resume_reviews(share_token);
CREATE INDEX IF NOT EXISTS idx_resume_reviews_is_active ON resume_reviews(is_active);
CREATE INDEX IF NOT EXISTS idx_resume_review_comments_review_id ON resume_review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_resume_review_comments_parent ON resume_review_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_resume_review_comments_user_id ON resume_review_comments(user_id);

-- ============================================
-- Triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_resume_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if they exist, then create them
DROP TRIGGER IF EXISTS update_resume_reviews_updated_at ON resume_reviews;
CREATE TRIGGER update_resume_reviews_updated_at
  BEFORE UPDATE ON resume_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_review_updated_at();

DROP TRIGGER IF EXISTS update_resume_review_comments_updated_at ON resume_review_comments;
CREATE TRIGGER update_resume_review_comments_updated_at
  BEFORE UPDATE ON resume_review_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_review_updated_at();

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE resume_reviews IS 'Stores uploaded PDF resumes for review';
COMMENT ON TABLE resume_review_comments IS 'Stores comments on resume reviews (WYSIWYG content)';
COMMENT ON COLUMN resume_reviews.share_token IS 'Unique token used in shareable URL (e.g., /review-resume/[token])';
COMMENT ON COLUMN resume_reviews.pdf_url IS 'Supabase Storage URL for the uploaded PDF';
COMMENT ON COLUMN resume_review_comments.comment_text IS 'HTML content from WYSIWYG editor';


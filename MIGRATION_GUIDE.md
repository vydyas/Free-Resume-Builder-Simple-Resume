# Database Migration Guide

## Quick Start

Run **one file only**: `supabase-complete-migration.sql`

This single file includes everything:
- ✅ Users table with email preferences
- ✅ Resumes table with all fields (Personal Info, Experience, Education as JSONB)
- ✅ Styling fields (fonts, colors, styles)
- ✅ Public/private visibility
- ✅ Normalized tables for filtering (positions, educations, personal_info, skills, projects, certifications)
- ✅ Feedback & bug reports tables
- ✅ Admin users table
- ✅ All indexes and triggers

## Migration Files Explained

### ✅ Use This One
- **`supabase-complete-migration.sql`** - Complete, comprehensive migration (use this!)

### 📦 Legacy Files (kept for reference, not needed)
- `supabase-migration.sql` - Base migration (now included in complete)
- `supabase-hybrid-sections-migration.sql` - Sections approach (now included in complete)
- `supabase-full-migration.sql` - User preferences, feedback, bugs (now included in complete)

### 🗑️ Removed (consolidated)
- `supabase-styling-migration.sql` - Merged into complete
- `supabase-normalized-sections-migration.sql` - Replaced by hybrid approach

## What's Included

### Core Tables
1. **users** - User accounts with Clerk sync
2. **resumes** - Resume data with JSONB and normalized support

### Resume Sections (Hybrid Approach)
- **Personal Info, Experience, Education**: Stored in JSONB, synced to tables for filtering
- **Skills, Projects, Certifications**: Stored only in normalized tables

### Supporting Tables
- **feedback** - User feedback with admin replies
- **bug_reports** - Bug reports with status tracking
- **admins** - Admin user accounts

## Storage Strategy

### JSONB (Primary Storage)
- Personal Information (columns in resumes table)
- Experience (`resumes.positions` JSONB)
- Education (`resumes.educations` JSONB)
- Custom sections (`resumes.custom_sections` JSONB)
- Config (`resumes.config` JSONB)
- Styling (`resumes.styling` JSONB)

### Normalized Tables (For Filtering)
- `resume_personal_info` - Synced from resumes table
- `resume_positions` - Synced from JSONB
- `resume_educations` - Synced from JSONB
- `resume_skills` - Primary storage
- `resume_projects` - Primary storage
- `resume_certifications` - Primary storage

## Running the Migration

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste `supabase-complete-migration.sql`
4. Run it
5. Done! ✅

The migration is idempotent (safe to run multiple times) thanks to `IF NOT EXISTS` guards.

## After Migration

The API automatically:
- Saves Personal Info, Experience, Education to JSONB
- Syncs them to normalized tables for filtering
- Saves Skills, Projects, Certifications to normalized tables

No additional steps needed!




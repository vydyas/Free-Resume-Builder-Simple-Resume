# Normalized Resume Sections Migration Guide

## Overview

This migration refactors the resume data structure to use separate tables for each static section (positions, educations, skills, projects, certifications) instead of storing them as JSONB arrays. This enables:

- **Better filtering**: Query resumes by company, skills, education, etc.
- **Dashboard creation**: Build recruiter dashboards with advanced filtering
- **Public/private resumes**: Support for public resume boards
- **Performance**: Indexed queries for faster searches
- **Scalability**: Easier to add features like skill matching, company analytics, etc.

## Database Changes

### Sections Overview

All resume sections are properly handled:

1. **Personal Information** ✅
   - Stored in `resumes` table as columns: `first_name`, `last_name`, `email`, `headline`, `location`, `phone_number`, `linkedin_id`, `github_id`
   - Indexed for filtering: `location`, `headline`, `email`, `first_name + last_name`
   - Reason: Single values per resume, no need for separate table

2. **Summary** ✅
   - Stored in `resumes` table as `summary` column
   - Reason: Single text field per resume, no need for separate table

3. **Experience** ✅
   - Stored in `resume_positions` table (normalized)
   - Indexed on: `company`, `title`, `resume_id`

4. **Education** ✅
   - Stored in `resume_educations` table (normalized)
   - Indexed on: `school_name`, `degree`, `field_of_study`, `resume_id`

5. **Skills** ✅
   - Stored in `resume_skills` table (normalized)
   - Indexed on: `name` (case-insensitive), `resume_id`
   - Unique constraint: `(resume_id, name)` to prevent duplicates

6. **Projects** ✅
   - Stored in `resume_projects` table (normalized)
   - Indexed on: `title`, `resume_id`

7. **Certifications** ✅
   - Stored in `resume_certifications` table (normalized)
   - Indexed on: `organization`, `title`, `resume_id`

### New Tables Created

1. **`resume_positions`** - Work experience entries
   - Indexed on: `company`, `title`, `resume_id`
   
2. **`resume_educations`** - Education entries
   - Indexed on: `school_name`, `degree`, `field_of_study`, `resume_id`
   
3. **`resume_skills`** - Skills (critical for filtering)
   - Indexed on: `name` (case-insensitive), `resume_id`
   - Unique constraint: `(resume_id, name)` to prevent duplicates
   
4. **`resume_projects`** - Project entries
   - Indexed on: `title`, `resume_id`
   
5. **`resume_certifications`** - Certification entries
   - Indexed on: `organization`, `title`, `resume_id`

### Resume Table Updates

- Added `styling` JSONB field (for additional styling preferences)
- Added `is_public` BOOLEAN field (for public/private visibility)
- Added direct styling columns:
  - `heading_font`, `name_font`
  - `heading_color`, `name_color`, `border_color`, `company_color`
  - `resume_background_color`
  - `skills_style`, `heading_style`

### Custom Sections

Custom sections remain as JSONB in the `resumes.custom_sections` field since they are user-defined and don't need filtering.

## Migration Steps

### 1. Run the Migration SQL

```sql
-- Run: supabase-normalized-sections-migration.sql
```

This will:
- Create all new tables
- Add indexes for filtering
- Add new columns to resumes table
- Set up triggers for `updated_at`

### 2. Migrate Existing Data (Optional)

If you have existing resumes with data in JSONB fields, you'll need to migrate them. Here's a sample migration script:

```sql
-- Migrate existing positions from JSONB to table
INSERT INTO resume_positions (resume_id, title, company, start_date, end_date, description, display_order)
SELECT 
  id as resume_id,
  (position->>'title')::text,
  (position->>'company')::text,
  (position->>'startDate')::text,
  (position->>'endDate')::text,
  (position->>'description')::text,
  row_number() OVER (PARTITION BY id ORDER BY ordinality) - 1 as display_order
FROM resumes,
LATERAL jsonb_array_elements(positions) WITH ORDINALITY AS position
WHERE positions IS NOT NULL AND jsonb_array_length(positions) > 0;

-- Similar migrations for educations, skills, projects, certifications
-- (See full migration script in supabase-data-migration.sql if needed)
```

### 3. API Changes

The API has been updated to:
- **GET** `/api/resumes/:id` - Returns resume with sections from normalized tables
- **POST** `/api/resumes` - Creates resume and saves sections to normalized tables
- **PUT** `/api/resumes/:id` - Updates resume and syncs sections to normalized tables

The API maintains backward compatibility by returning sections as arrays in the response.

### 4. Frontend Changes

The frontend should continue to work as-is since the API converts between database format and client format. However, you may want to:

- Update types to include `id` and `displayOrder` fields
- Handle the new styling fields
- Add UI for public/private toggle

## Query Examples for Recruiter Dashboard

### Find resumes by company
```sql
SELECT DISTINCT r.*
FROM resumes r
JOIN resume_positions p ON p.resume_id = r.id
WHERE p.company ILIKE '%Google%'
  AND r.is_public = true
  AND r.is_active = true;
```

### Find resumes by skill
```sql
SELECT DISTINCT r.*
FROM resumes r
JOIN resume_skills s ON s.resume_id = r.id
WHERE LOWER(s.name) = LOWER('JavaScript')
  AND r.is_public = true
  AND r.is_active = true;
```

### Find resumes with multiple skills
```sql
SELECT r.*, COUNT(DISTINCT s.name) as skill_count
FROM resumes r
JOIN resume_skills s ON s.resume_id = r.id
WHERE LOWER(s.name) IN (LOWER('JavaScript'), LOWER('React'), LOWER('TypeScript'))
  AND r.is_public = true
  AND r.is_active = true
GROUP BY r.id
HAVING COUNT(DISTINCT s.name) = 3;
```

### Find resumes by education
```sql
SELECT DISTINCT r.*
FROM resumes r
JOIN resume_educations e ON e.resume_id = r.id
WHERE e.school_name ILIKE '%MIT%'
  AND r.is_public = true
  AND r.is_active = true;
```

### Find resumes by location
```sql
SELECT r.*
FROM resumes r
WHERE r.location ILIKE '%San Francisco%'
  AND r.is_public = true
  AND r.is_active = true;
```

### Find resumes by headline/keywords
```sql
SELECT r.*
FROM resumes r
WHERE r.headline ILIKE '%Software Engineer%'
  AND r.is_public = true
  AND r.is_active = true;
```

### Find resumes by name
```sql
SELECT r.*
FROM resumes r
WHERE (r.first_name ILIKE '%John%' OR r.last_name ILIKE '%Doe%')
  AND r.is_public = true
  AND r.is_active = true;
```

## Benefits

1. **Filtering**: Easy to filter by company, skills, education, etc.
2. **Search**: Full-text search capabilities on individual fields
3. **Analytics**: Can build dashboards showing:
   - Most common skills
   - Top companies
   - Education trends
   - Skill combinations
4. **Performance**: Indexed queries are much faster than JSONB queries
5. **Scalability**: Easy to add new filtering criteria

## Notes

- The old JSONB columns (`positions`, `educations`, `skills`, `projects`, `certifications`) can be removed after migration, but we keep them for now for backward compatibility
- Custom sections remain as JSONB since they're user-defined
- All sections have `display_order` for maintaining user-defined order
- Sections are automatically deleted when a resume is deleted (CASCADE)

## Next Steps

1. Run the migration SQL
2. Test API endpoints
3. Update frontend if needed
4. Build recruiter dashboard using the new query capabilities
5. Add public/private toggle UI
6. Consider adding full-text search indexes for better search performance




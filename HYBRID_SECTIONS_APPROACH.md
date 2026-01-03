# Hybrid Resume Sections Approach

## Overview

This implementation uses a **hybrid approach** for storing resume sections:

1. **JSONB Storage (Primary)**: Personal Information, Experience, Education
2. **Normalized Tables (Primary)**: Skills, Projects, Certifications
3. **Normalized Tables (Sync/Filter)**: Personal Information, Experience, Education (synced from JSONB for filtering)

## Storage Strategy

### JSONB as Primary Storage

**Personal Information** (stored in `resumes` table columns):
- `first_name`, `last_name`, `email`, `headline`, `summary`, `location`, `phone_number`, `linkedin_id`, `github_id`
- Also synced to `resume_personal_info` table for filtering

**Experience** (stored in `resumes.positions` JSONB):
- Array of position objects
- Also synced to `resume_positions` table for filtering

**Education** (stored in `resumes.educations` JSONB):
- Array of education objects
- Also synced to `resume_educations` table for filtering

### Normalized Tables as Primary Storage

**Skills** (stored in `resume_skills` table):
- No JSONB backup
- Direct table storage for filtering

**Projects** (stored in `resume_projects` table):
- No JSONB backup
- Direct table storage for filtering

**Certifications** (stored in `resume_certifications` table):
- No JSONB backup
- Direct table storage for filtering

## How It Works

### On Create/Update

1. **Personal Info, Experience, Education**:
   - Saved to JSONB fields in `resumes` table
   - Automatically synced to normalized tables for filtering

2. **Skills, Projects, Certifications**:
   - Saved directly to normalized tables
   - No JSONB storage

### On Read

1. **Personal Info, Experience, Education**:
   - Read from JSONB fields (primary source)
   - Normalized tables used only for filtering/search

2. **Skills, Projects, Certifications**:
   - Read from normalized tables

## Benefits

1. **Flexibility**: JSONB allows easy updates without complex joins
2. **Performance**: Normalized tables enable fast filtering and search
3. **Best of Both Worlds**: 
   - Simple updates via JSONB
   - Powerful queries via normalized tables
4. **Backward Compatibility**: Existing JSONB data continues to work

## API Behavior

### GET `/api/resumes/:id`
- Returns Personal Info, Experience, Education from JSONB
- Returns Skills, Projects, Certifications from normalized tables

### POST `/api/resumes`
- Saves Personal Info, Experience, Education to JSONB
- Syncs them to normalized tables for filtering
- Saves Skills, Projects, Certifications to normalized tables

### PUT `/api/resumes/:id`
- Updates Personal Info, Experience, Education in JSONB
- Syncs updates to normalized tables
- Updates Skills, Projects, Certifications in normalized tables

## Query Examples

### Filter by Company (from normalized table)
```sql
SELECT DISTINCT r.*
FROM resumes r
JOIN resume_positions p ON p.resume_id = r.id
WHERE p.company ILIKE '%Google%'
  AND r.is_public = true;
```

### Filter by Skills (from normalized table)
```sql
SELECT DISTINCT r.*
FROM resumes r
JOIN resume_skills s ON s.resume_id = r.id
WHERE LOWER(s.name) = LOWER('JavaScript')
  AND r.is_public = true;
```

### Filter by Location (from resumes table or normalized table)
```sql
-- From resumes table
SELECT r.*
FROM resumes r
WHERE r.location ILIKE '%San Francisco%'
  AND r.is_public = true;

-- Or from normalized table
SELECT r.*
FROM resumes r
JOIN resume_personal_info p ON p.resume_id = r.id
WHERE p.location ILIKE '%San Francisco%'
  AND r.is_public = true;
```

## Migration

Run `supabase-hybrid-sections-migration.sql` to:
1. Create normalized tables for filtering
2. Add `resume_personal_info` table
3. Keep existing JSONB structure intact
4. Add indexes for all filtering scenarios

## Notes

- The sync happens automatically on create/update
- Normalized tables are kept in sync with JSONB
- If JSONB is updated directly, you may need to manually sync
- Skills, Projects, Certifications have no JSONB backup - they're only in normalized tables




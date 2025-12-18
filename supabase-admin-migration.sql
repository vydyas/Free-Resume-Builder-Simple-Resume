-- Admins table for SimpleResu.me
-- WARNING: For real production use, passwords should be hashed.
-- This helper file is optional; the same schema also exists in supabase-full-migration.sql.

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Seed admin users manually via Supabase SQL editor or dashboard.
-- DO NOT commit real credentials to version control.
-- Example:
-- INSERT INTO admins (username, password) VALUES ('your_admin', 'your_strong_password');

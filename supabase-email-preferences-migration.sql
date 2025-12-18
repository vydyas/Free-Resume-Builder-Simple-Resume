-- Email Preferences and User Profile Migration
-- Add email subscription preference and user name fields to users table

-- Add email_subscription_enabled column (default true - opt-in by default)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_subscription_enabled BOOLEAN DEFAULT true;

-- Add first_name and last_name columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add index for faster queries when filtering by subscription status
CREATE INDEX IF NOT EXISTS idx_users_email_subscription ON users(email_subscription_enabled);

-- Add comments for documentation
COMMENT ON COLUMN users.email_subscription_enabled IS 'User email subscription preference. true = opted in, false = opted out';
COMMENT ON COLUMN users.first_name IS 'User first name';
COMMENT ON COLUMN users.last_name IS 'User last name';



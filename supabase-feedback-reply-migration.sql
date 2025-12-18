-- Feedback reply & status metadata

ALTER TABLE feedback
ADD COLUMN IF NOT EXISTS admin_reply text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_feedback_updated_at ON feedback(updated_at DESC);

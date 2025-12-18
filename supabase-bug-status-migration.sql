-- Bug report status & comments migration

ALTER TABLE bug_reports
ADD COLUMN IF NOT EXISTS status text DEFAULT 'open',
ADD COLUMN IF NOT EXISTS admin_comment text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Optional: simple constraint on status values (can be relaxed later)
-- ALTER TABLE bug_reports
--   ADD CONSTRAINT bug_reports_status_check
--   CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'));

CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);

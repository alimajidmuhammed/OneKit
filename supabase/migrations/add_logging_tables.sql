-- ============================================
-- OneKit API & Security Logging Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- API Request Logs Table
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status_code INTEGER,
    response_time_ms INTEGER,
    level VARCHAR(20) DEFAULT 'info',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Events Logs Table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    event VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_level ON api_logs(level);

CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_event ON security_logs(event);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);

-- Enable RLS
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view api logs"
    ON api_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can view security logs"
    ON security_logs FOR SELECT
    USING (public.is_admin());

-- System can insert logs (authenticated users)
CREATE POLICY "System can insert api logs"
    ON api_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can insert security logs"
    ON security_logs FOR INSERT
    WITH CHECK (true);

-- Auto-cleanup: Delete logs older than 90 days (run via Supabase Edge Function or cron)
-- CREATE OR REPLACE FUNCTION cleanup_old_logs()
-- RETURNS void AS $$
-- BEGIN
--     DELETE FROM api_logs WHERE timestamp < NOW() - INTERVAL '90 days';
--     DELETE FROM security_logs WHERE timestamp < NOW() - INTERVAL '90 days';
-- END;
-- $$ LANGUAGE plpgsql;

-- Success message
SELECT 'Logging tables created successfully! 📊' as status;

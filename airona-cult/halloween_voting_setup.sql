-- Halloween Voting System Database Setup
-- Run these commands in your Supabase SQL editor

-- =====================================================
-- STEP 1: Create Halloween Submissions Table
-- =====================================================
-- This table stores all Halloween event submissions uploaded by admins

CREATE TABLE IF NOT EXISTS halloween_submissions (
    id BIGSERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    author_name TEXT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_halloween_submissions_active ON halloween_submissions(is_active);

-- =====================================================
-- STEP 2: Create Voting Logs Table
-- =====================================================
-- This table tracks every vote cast during the tournament

CREATE TABLE IF NOT EXISTS voting_logs (
    id BIGSERIAL PRIMARY KEY,
    voter_discord_username TEXT NOT NULL,
    submission_id BIGINT NOT NULL REFERENCES halloween_submissions(id) ON DELETE CASCADE,
    opponent_submission_id BIGINT NOT NULL REFERENCES halloween_submissions(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    match_id TEXT NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure voters can only vote once per match
    CONSTRAINT unique_voter_per_match UNIQUE (voter_discord_username, match_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voting_logs_voter ON voting_logs(voter_discord_username);
CREATE INDEX IF NOT EXISTS idx_voting_logs_submission ON voting_logs(submission_id);
CREATE INDEX IF NOT EXISTS idx_voting_logs_round ON voting_logs(round_number);
CREATE INDEX IF NOT EXISTS idx_voting_logs_match ON voting_logs(match_id);

-- =====================================================
-- STEP 3: Create Voting Results Table
-- =====================================================
-- This table stores aggregated voting results and final rankings

CREATE TABLE IF NOT EXISTS voting_results (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES halloween_submissions(id) ON DELETE CASCADE,
    total_votes INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    final_rank INTEGER,
    is_winner BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure each submission only has one result entry
    CONSTRAINT unique_submission_result UNIQUE (submission_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voting_results_submission ON voting_results(submission_id);
CREATE INDEX IF NOT EXISTS idx_voting_results_rank ON voting_results(final_rank);
CREATE INDEX IF NOT EXISTS idx_voting_results_winner ON voting_results(is_winner);

-- =====================================================
-- STEP 4: Create Voter Sessions Table
-- =====================================================
-- This table tracks voter participation and progress through the tournament

CREATE TABLE IF NOT EXISTS voter_sessions (
    id BIGSERIAL PRIMARY KEY,
    discord_username TEXT NOT NULL,
    current_round INTEGER DEFAULT 1,
    matches_completed INTEGER DEFAULT 0,
    session_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_vote_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT FALSE,
    
    -- Allow multiple sessions per user (in case they want to revote)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voter_sessions_username ON voter_sessions(discord_username);
CREATE INDEX IF NOT EXISTS idx_voter_sessions_completed ON voter_sessions(is_completed);

-- =====================================================
-- STEP 5: Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE halloween_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow full access to halloween_submissions" ON halloween_submissions;
DROP POLICY IF EXISTS "Allow full access to voting_logs" ON voting_logs;
DROP POLICY IF EXISTS "Allow full access to voting_results" ON voting_results;
DROP POLICY IF EXISTS "Allow full access to voter_sessions" ON voter_sessions;

-- Create RLS policies - Allow all access (we handle auth in API layer)
CREATE POLICY "Allow full access to halloween_submissions" ON halloween_submissions
    FOR ALL USING (true);

CREATE POLICY "Allow full access to voting_logs" ON voting_logs
    FOR ALL USING (true);

CREATE POLICY "Allow full access to voting_results" ON voting_results
    FOR ALL USING (true);

CREATE POLICY "Allow full access to voter_sessions" ON voter_sessions
    FOR ALL USING (true);

-- =====================================================
-- STEP 6: Create Helper Functions
-- =====================================================

-- Function to update voting results after each vote
CREATE OR REPLACE FUNCTION update_voting_results()
RETURNS TRIGGER AS $$
BEGIN
    -- Update winner's stats
    INSERT INTO voting_results (submission_id, total_votes, wins, losses)
    VALUES (NEW.submission_id, 1, 1, 0)
    ON CONFLICT (submission_id)
    DO UPDATE SET
        total_votes = voting_results.total_votes + 1,
        wins = voting_results.wins + 1,
        last_updated = NOW();
    
    -- Update loser's stats
    INSERT INTO voting_results (submission_id, total_votes, wins, losses)
    VALUES (NEW.opponent_submission_id, 0, 0, 1)
    ON CONFLICT (submission_id)
    DO UPDATE SET
        losses = voting_results.losses + 1,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update results
DROP TRIGGER IF EXISTS trigger_update_voting_results ON voting_logs;
CREATE TRIGGER trigger_update_voting_results
    AFTER INSERT ON voting_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_voting_results();

-- =====================================================
-- STEP 7: Verification Queries
-- =====================================================

-- Check table structures
SELECT 'halloween_submissions' as table_name, COUNT(*) as count FROM halloween_submissions
UNION ALL
SELECT 'voting_logs' as table_name, COUNT(*) as count FROM voting_logs
UNION ALL
SELECT 'voting_results' as table_name, COUNT(*) as count FROM voting_results
UNION ALL
SELECT 'voter_sessions' as table_name, COUNT(*) as count FROM voter_sessions;

-- =====================================================
-- STEP 8: Sample Data (for testing - OPTIONAL)
-- =====================================================

-- Uncomment below to insert test data
/*
INSERT INTO halloween_submissions (image_url, author_name, is_active) VALUES
('https://example.com/submission1.jpg', 'TestUser1', true),
('https://example.com/submission2.jpg', 'TestUser2', true),
('https://example.com/submission3.jpg', 'TestUser3', true),
('https://example.com/submission4.jpg', 'TestUser4', true);
*/

-- =====================================================
-- STEP 9: Useful Query Views
-- =====================================================

-- View current standings
CREATE OR REPLACE VIEW halloween_standings AS
SELECT 
    hs.id,
    hs.author_name,
    hs.image_url,
    COALESCE(vr.total_votes, 0) as total_votes,
    COALESCE(vr.wins, 0) as wins,
    COALESCE(vr.losses, 0) as losses,
    CASE 
        WHEN COALESCE(vr.wins, 0) + COALESCE(vr.losses, 0) > 0 
        THEN ROUND((COALESCE(vr.wins, 0)::NUMERIC / (COALESCE(vr.wins, 0) + COALESCE(vr.losses, 0))) * 100, 2)
        ELSE 0
    END as win_percentage,
    vr.final_rank,
    vr.is_winner
FROM halloween_submissions hs
LEFT JOIN voting_results vr ON hs.id = vr.submission_id
WHERE hs.is_active = true
ORDER BY vr.wins DESC NULLS LAST, vr.total_votes DESC NULLS LAST;

-- View voting activity
CREATE OR REPLACE VIEW voting_activity AS
SELECT 
    DATE(voted_at) as vote_date,
    COUNT(*) as total_votes,
    COUNT(DISTINCT voter_discord_username) as unique_voters
FROM voting_logs
GROUP BY DATE(voted_at)
ORDER BY vote_date DESC;

-- =====================================================
-- STEP 10: Cleanup Commands (use if you need to start over)
-- =====================================================

/*
-- WARNING: These commands will delete all data! Uncomment only if needed.

DROP TRIGGER IF EXISTS trigger_update_voting_results ON voting_logs;
DROP FUNCTION IF EXISTS update_voting_results();
DROP VIEW IF EXISTS halloween_standings;
DROP VIEW IF EXISTS voting_activity;

DROP POLICY IF EXISTS "Allow full access to halloween_submissions" ON halloween_submissions;
DROP POLICY IF EXISTS "Allow full access to voting_logs" ON voting_logs;
DROP POLICY IF EXISTS "Allow full access to voting_results" ON voting_results;
DROP POLICY IF EXISTS "Allow full access to voter_sessions" ON voter_sessions;

DROP TABLE IF EXISTS voter_sessions CASCADE;
DROP TABLE IF EXISTS voting_results CASCADE;
DROP TABLE IF EXISTS voting_logs CASCADE;
DROP TABLE IF EXISTS halloween_submissions CASCADE;
*/

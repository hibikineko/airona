-- =====================================================
-- Clear All Voting Data (Keep Submissions)
-- =====================================================
-- This clears all voting logs, results, and sessions
-- but preserves halloween_submissions so you can start fresh

-- Clear voter sessions
TRUNCATE TABLE voter_sessions CASCADE;

-- Clear voting logs
TRUNCATE TABLE voting_logs CASCADE;

-- Clear voting results (this will reset all tournament counts)
TRUNCATE TABLE voting_results CASCADE;

-- Alternative: Reset only tournament counts without deleting voting_results
-- Uncomment the lines below if you want to keep voting_results but reset tournament counts
/*
UPDATE voting_results 
SET 
    first_place_count = 0,
    second_place_count = 0,
    third_place_count = 0,
    total_tournaments = 0,
    last_updated = NOW();
*/

-- Verify tables are empty
SELECT 'voter_sessions' as table_name, COUNT(*) as count FROM voter_sessions
UNION ALL
SELECT 'voting_logs' as table_name, COUNT(*) as count FROM voting_logs
UNION ALL
SELECT 'voting_results' as table_name, COUNT(*) as count FROM voting_results
UNION ALL
SELECT 'halloween_submissions' as table_name, COUNT(*) as count FROM halloween_submissions;

-- =====================================================
-- If you also want to clear tournament tables (from old system)
-- =====================================================
-- Uncomment these if you want to clear the abandoned tournament tables too
/*
TRUNCATE TABLE tournament_votes CASCADE;
TRUNCATE TABLE tournament_brackets CASCADE;
*/

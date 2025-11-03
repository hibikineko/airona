# Halloween Voting - SQL Queries Reference

## Quick Setup Query
```sql
-- Run this in Supabase SQL Editor to set up everything
-- See halloween_voting_setup.sql for complete setup
```

## Useful Admin Queries

### 1. View All Submissions
```sql
SELECT 
    id,
    author_name,
    image_url,
    upload_date,
    is_active
FROM halloween_submissions
ORDER BY upload_date DESC;
```

### 2. View Current Standings (Using View)
```sql
SELECT * FROM halloween_standings;
```

### 3. View Current Standings (Manual Query)
```sql
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
```

### 4. Get Top 3 Winners
```sql
SELECT 
    author_name,
    wins,
    total_votes,
    win_percentage
FROM halloween_standings
LIMIT 3;
```

### 5. Count Total Votes
```sql
SELECT COUNT(*) as total_votes FROM voting_logs;
```

### 6. Count Unique Voters
```sql
SELECT COUNT(DISTINCT voter_discord_username) as unique_voters 
FROM voting_logs;
```

### 7. Get Voter Participation Stats
```sql
SELECT 
    voter_discord_username,
    COUNT(*) as votes_cast,
    MIN(voted_at) as first_vote,
    MAX(voted_at) as last_vote
FROM voting_logs
GROUP BY voter_discord_username
ORDER BY votes_cast DESC;
```

### 8. View Voting Activity by Date
```sql
SELECT * FROM voting_activity;
-- OR manually:
SELECT 
    DATE(voted_at) as vote_date,
    COUNT(*) as total_votes,
    COUNT(DISTINCT voter_discord_username) as unique_voters
FROM voting_logs
GROUP BY DATE(voted_at)
ORDER BY vote_date DESC;
```

### 9. Get All Votes for a Specific Submission
```sql
SELECT 
    vl.voter_discord_username,
    hs2.author_name as opponent,
    vl.round_number,
    vl.voted_at
FROM voting_logs vl
JOIN halloween_submissions hs2 ON vl.opponent_submission_id = hs2.id
WHERE vl.submission_id = 1  -- Replace 1 with submission ID
ORDER BY vl.voted_at DESC;
```

### 10. View All Matchups with Results
```sql
SELECT 
    vl.voter_discord_username,
    hs1.author_name as winner,
    hs2.author_name as loser,
    vl.round_number,
    vl.match_id,
    vl.voted_at
FROM voting_logs vl
JOIN halloween_submissions hs1 ON vl.submission_id = hs1.id
JOIN halloween_submissions hs2 ON vl.opponent_submission_id = hs2.id
ORDER BY vl.voted_at DESC;
```

### 11. Find Submissions with No Votes Yet
```sql
SELECT 
    hs.id,
    hs.author_name,
    hs.image_url
FROM halloween_submissions hs
LEFT JOIN voting_results vr ON hs.id = vr.submission_id
WHERE hs.is_active = true 
AND (vr.id IS NULL OR (vr.wins = 0 AND vr.losses = 0));
```

### 12. Get Win/Loss Record for Specific Submission
```sql
SELECT 
    hs.author_name,
    COALESCE(vr.wins, 0) as wins,
    COALESCE(vr.losses, 0) as losses,
    COALESCE(vr.total_votes, 0) as votes_received,
    CASE 
        WHEN COALESCE(vr.wins, 0) + COALESCE(vr.losses, 0) > 0 
        THEN ROUND((COALESCE(vr.wins, 0)::NUMERIC / (COALESCE(vr.wins, 0) + COALESCE(vr.losses, 0))) * 100, 2)
        ELSE 0
    END as win_percentage
FROM halloween_submissions hs
LEFT JOIN voting_results vr ON hs.id = vr.submission_id
WHERE hs.id = 1;  -- Replace 1 with submission ID
```

### 13. Find Most Active Voters
```sql
SELECT 
    voter_discord_username,
    COUNT(*) as total_votes,
    COUNT(DISTINCT DATE(voted_at)) as voting_days,
    MAX(voted_at) as last_vote
FROM voting_logs
GROUP BY voter_discord_username
ORDER BY total_votes DESC
LIMIT 10;
```

### 14. Get Voting Progress per Round
```sql
SELECT 
    round_number,
    COUNT(*) as votes_in_round,
    COUNT(DISTINCT voter_discord_username) as unique_voters,
    MIN(voted_at) as round_started,
    MAX(voted_at) as round_ended
FROM voting_logs
GROUP BY round_number
ORDER BY round_number;
```

## Data Modification Queries

### 15. Deactivate a Submission
```sql
UPDATE halloween_submissions
SET is_active = false
WHERE id = 1;  -- Replace 1 with submission ID
```

### 16. Reactivate a Submission
```sql
UPDATE halloween_submissions
SET is_active = true
WHERE id = 1;  -- Replace 1 with submission ID
```

### 17. Set Final Rankings (Manual)
```sql
-- Set rank 1 (Winner)
UPDATE voting_results
SET final_rank = 1, is_winner = true
WHERE submission_id = 1;  -- Replace with winning submission ID

-- Set rank 2
UPDATE voting_results
SET final_rank = 2, is_winner = false
WHERE submission_id = 2;  -- Replace with second place ID

-- Set rank 3
UPDATE voting_results
SET final_rank = 3, is_winner = false
WHERE submission_id = 3;  -- Replace with third place ID
```

### 18. Auto-Set Rankings Based on Wins
```sql
WITH ranked_submissions AS (
    SELECT 
        submission_id,
        ROW_NUMBER() OVER (ORDER BY wins DESC, total_votes DESC) as rank
    FROM voting_results
)
UPDATE voting_results vr
SET 
    final_rank = rs.rank,
    is_winner = CASE WHEN rs.rank = 1 THEN true ELSE false END,
    last_updated = NOW()
FROM ranked_submissions rs
WHERE vr.submission_id = rs.submission_id;
```

### 19. Delete a Specific Vote (If Needed)
```sql
DELETE FROM voting_logs
WHERE id = 1;  -- Replace 1 with vote ID

-- Note: This will automatically update voting_results via trigger
```

### 20. Remove All Votes from a Specific User
```sql
DELETE FROM voting_logs
WHERE voter_discord_username = 'username#1234';  -- Replace with actual username
```

## Reset Queries (Use with Caution!)

### 21. Reset All Voting Data (Keep Submissions)
```sql
-- WARNING: This deletes all votes and results!
TRUNCATE voting_logs CASCADE;
TRUNCATE voting_results CASCADE;
TRUNCATE voter_sessions CASCADE;
```

### 22. Reset Everything Including Submissions
```sql
-- WARNING: This deletes EVERYTHING!
TRUNCATE voter_sessions CASCADE;
TRUNCATE voting_results CASCADE;
TRUNCATE voting_logs CASCADE;
TRUNCATE halloween_submissions CASCADE;
```

### 23. Reset Just One Submission's Votes
```sql
-- Remove votes where this submission was involved
DELETE FROM voting_logs
WHERE submission_id = 1 OR opponent_submission_id = 1;

-- The voting_results will auto-update via trigger
-- Or manually reset:
DELETE FROM voting_results WHERE submission_id = 1;
```

## Maintenance Queries

### 24. Check for Orphaned Records
```sql
-- Find voting_logs with missing submissions
SELECT vl.* 
FROM voting_logs vl
LEFT JOIN halloween_submissions hs1 ON vl.submission_id = hs1.id
LEFT JOIN halloween_submissions hs2 ON vl.opponent_submission_id = hs2.id
WHERE hs1.id IS NULL OR hs2.id IS NULL;
```

### 25. Verify Trigger is Working
```sql
-- Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_voting_results';
```

### 26. Manually Recalculate Results (If Trigger Fails)
```sql
-- Delete all results
TRUNCATE voting_results;

-- Recalculate from voting_logs
INSERT INTO voting_results (submission_id, total_votes, wins, losses, last_updated)
SELECT 
    submission_id,
    COUNT(*) as total_votes,
    COUNT(*) as wins,
    0 as losses,
    NOW()
FROM voting_logs
GROUP BY submission_id
ON CONFLICT (submission_id) DO UPDATE SET
    total_votes = EXCLUDED.total_votes,
    wins = EXCLUDED.wins,
    last_updated = NOW();

-- Add losses
WITH loser_counts AS (
    SELECT 
        opponent_submission_id as submission_id,
        COUNT(*) as loss_count
    FROM voting_logs
    GROUP BY opponent_submission_id
)
UPDATE voting_results vr
SET losses = lc.loss_count
FROM loser_counts lc
WHERE vr.submission_id = lc.submission_id;
```

### 27. Get Database Statistics
```sql
SELECT 
    'Submissions' as table_name,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_active = true) as active
FROM halloween_submissions
UNION ALL
SELECT 
    'Votes',
    COUNT(*),
    NULL
FROM voting_logs
UNION ALL
SELECT 
    'Voters',
    COUNT(DISTINCT voter_discord_username),
    NULL
FROM voting_logs
UNION ALL
SELECT 
    'Results',
    COUNT(*),
    COUNT(*) FILTER (WHERE final_rank IS NOT NULL)
FROM voting_results;
```

## Export Queries (For Reporting)

### 28. Export Final Results as CSV-Ready
```sql
SELECT 
    ROW_NUMBER() OVER (ORDER BY wins DESC, total_votes DESC) as rank,
    author_name as "Author",
    wins as "Wins",
    losses as "Losses",
    total_votes as "Total Votes",
    win_percentage as "Win Rate (%)",
    CASE WHEN is_winner THEN 'Yes' ELSE 'No' END as "Winner"
FROM halloween_standings;
```

### 29. Export All Votes for Analysis
```sql
SELECT 
    vl.voter_discord_username as "Voter",
    hs1.author_name as "Voted For",
    hs2.author_name as "Against",
    vl.round_number as "Round",
    vl.voted_at as "Timestamp"
FROM voting_logs vl
JOIN halloween_submissions hs1 ON vl.submission_id = hs1.id
JOIN halloween_submissions hs2 ON vl.opponent_submission_id = hs2.id
ORDER BY vl.voted_at;
```

---

## Quick Copy Commands

Run the main setup:
```bash
# Copy content from halloween_voting_setup.sql and run in Supabase SQL Editor
```

View current standings:
```sql
SELECT * FROM halloween_standings;
```

Count votes:
```sql
SELECT COUNT(*) FROM voting_logs;
```

Get top winner:
```sql
SELECT author_name, wins, total_votes FROM halloween_standings LIMIT 1;
```

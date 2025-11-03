-- Quick script to create just the views if tables already exist
-- Run this in Supabase SQL Editor

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

-- Verify the views were created
SELECT 'Views created successfully!' as status;

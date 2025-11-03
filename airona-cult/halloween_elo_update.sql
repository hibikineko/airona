-- Halloween Voting System - ELO Rating Update
-- This updates the system to use ELO ratings like typical waifu rankers

-- =====================================================
-- STEP 1: Remove unique constraint for continuous voting
-- =====================================================

-- Drop the unique constraint that prevented duplicate votes on same matchup
-- This allows continuous voting like waifu rankers
ALTER TABLE voting_logs 
DROP CONSTRAINT IF EXISTS unique_voter_per_match;

-- =====================================================
-- STEP 2: Add ELO Rating Column
-- =====================================================

-- Add elo_rating column to voting_results (default 1200 is standard starting ELO)
ALTER TABLE voting_results 
ADD COLUMN IF NOT EXISTS elo_rating NUMERIC DEFAULT 1200;

-- Create index for ELO-based queries
CREATE INDEX IF NOT EXISTS idx_voting_results_elo ON voting_results(elo_rating DESC);

-- =====================================================
-- STEP 2: Initialize ELO for Existing Submissions
-- =====================================================

-- Set starting ELO for all existing submissions
INSERT INTO voting_results (submission_id, elo_rating, total_votes, wins, losses)
SELECT id, 1200, 0, 0, 0
FROM halloween_submissions
WHERE is_active = true
ON CONFLICT (submission_id) DO UPDATE
SET elo_rating = COALESCE(voting_results.elo_rating, 1200);

-- =====================================================
-- STEP 3: Create ELO Calculation Function
-- =====================================================

-- Function to calculate new ELO ratings
-- Formula: New Rating = Old Rating + K * (Actual Score - Expected Score)
-- K-factor = 32 (standard for competitive systems)
-- Expected Score = 1 / (1 + 10^((opponent_rating - player_rating) / 400))
CREATE OR REPLACE FUNCTION calculate_elo(winner_rating NUMERIC, loser_rating NUMERIC)
RETURNS TABLE(new_winner_rating NUMERIC, new_loser_rating NUMERIC) AS $$
DECLARE
    k_factor NUMERIC := 32;
    winner_expected NUMERIC;
    loser_expected NUMERIC;
    winner_new NUMERIC;
    loser_new NUMERIC;
BEGIN
    -- Calculate expected scores
    winner_expected := 1.0 / (1.0 + POWER(10, (loser_rating - winner_rating) / 400.0));
    loser_expected := 1.0 / (1.0 + POWER(10, (winner_rating - loser_rating) / 400.0));
    
    -- Calculate new ratings
    -- Winner gets 1 point (win), expected is winner_expected
    winner_new := winner_rating + k_factor * (1.0 - winner_expected);
    -- Loser gets 0 points (loss), expected is loser_expected
    loser_new := loser_rating + k_factor * (0.0 - loser_expected);
    
    RETURN QUERY SELECT 
        ROUND(winner_new, 2) as new_winner_rating,
        ROUND(loser_new, 2) as new_loser_rating;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 4: Update Trigger Function with ELO
-- =====================================================

-- Replace the old trigger function to include ELO calculation
CREATE OR REPLACE FUNCTION update_voting_results()
RETURNS TRIGGER AS $$
DECLARE
    winner_current_elo NUMERIC;
    loser_current_elo NUMERIC;
    new_ratings RECORD;
BEGIN
    -- Get current ELO ratings (initialize to 1200 if not exists)
    SELECT COALESCE(elo_rating, 1200) INTO winner_current_elo
    FROM voting_results
    WHERE submission_id = NEW.submission_id;
    
    IF winner_current_elo IS NULL THEN
        winner_current_elo := 1200;
    END IF;
    
    SELECT COALESCE(elo_rating, 1200) INTO loser_current_elo
    FROM voting_results
    WHERE submission_id = NEW.opponent_submission_id;
    
    IF loser_current_elo IS NULL THEN
        loser_current_elo := 1200;
    END IF;
    
    -- Calculate new ELO ratings
    SELECT * INTO new_ratings FROM calculate_elo(winner_current_elo, loser_current_elo);
    
    -- Update winner's stats with new ELO
    INSERT INTO voting_results (submission_id, total_votes, wins, losses, elo_rating)
    VALUES (NEW.submission_id, 1, 1, 0, new_ratings.new_winner_rating)
    ON CONFLICT (submission_id)
    DO UPDATE SET
        total_votes = voting_results.total_votes + 1,
        wins = voting_results.wins + 1,
        elo_rating = new_ratings.new_winner_rating,
        last_updated = NOW();
    
    -- Update loser's stats with new ELO
    INSERT INTO voting_results (submission_id, total_votes, wins, losses, elo_rating)
    VALUES (NEW.opponent_submission_id, 0, 0, 1, new_ratings.new_loser_rating)
    ON CONFLICT (submission_id)
    DO UPDATE SET
        losses = voting_results.losses + 1,
        elo_rating = new_ratings.new_loser_rating,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger (it already exists, just ensuring it uses new function)
DROP TRIGGER IF EXISTS trigger_update_voting_results ON voting_logs;
CREATE TRIGGER trigger_update_voting_results
    AFTER INSERT ON voting_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_voting_results();

-- =====================================================
-- STEP 5: Update Views to Use ELO
-- =====================================================

-- Update standings view to sort by ELO rating
CREATE OR REPLACE VIEW halloween_standings AS
SELECT 
    hs.id,
    hs.author_name,
    hs.image_url,
    COALESCE(vr.elo_rating, 1200) as elo_rating,
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
ORDER BY COALESCE(vr.elo_rating, 1200) DESC, vr.wins DESC NULLS LAST;

-- =====================================================
-- STEP 6: Verification
-- =====================================================

-- Check that all submissions have ELO ratings
SELECT 
    hs.id,
    hs.author_name,
    COALESCE(vr.elo_rating, 1200) as elo_rating,
    COALESCE(vr.wins, 0) as wins,
    COALESCE(vr.losses, 0) as losses
FROM halloween_submissions hs
LEFT JOIN voting_results vr ON hs.id = vr.submission_id
WHERE hs.is_active = true
ORDER BY COALESCE(vr.elo_rating, 1200) DESC;

-- =====================================================
-- NOTES
-- =====================================================
-- ELO Rating System:
-- - Starting rating: 1200
-- - K-factor: 32 (determines how much ratings change per match)
-- - Higher ELO = stronger submission
-- - Winning against higher-rated opponent = bigger ELO gain
-- - Winning against lower-rated opponent = smaller ELO gain
-- - Rankings based on ELO, not raw win count
-- - Similar to chess, Elo Hell in games, waifu rankers, etc.

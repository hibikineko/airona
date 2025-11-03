-- =====================================================
-- Add Tournament Ranking Columns to voting_results
-- =====================================================
-- This adds columns to track how many times each submission
-- placed 1st, 2nd, or 3rd in tournaments

-- Add ranking count columns
ALTER TABLE voting_results 
ADD COLUMN IF NOT EXISTS first_place_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS second_place_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS third_place_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tournaments INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_voting_results_first_place ON voting_results(first_place_count);

-- Update the halloween_standings view to include ranking counts
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
    vr.is_winner,
    COALESCE(vr.first_place_count, 0) as first_place_count,
    COALESCE(vr.second_place_count, 0) as second_place_count,
    COALESCE(vr.third_place_count, 0) as third_place_count,
    COALESCE(vr.total_tournaments, 0) as total_tournaments
FROM halloween_submissions hs
LEFT JOIN voting_results vr ON hs.id = vr.submission_id
WHERE hs.is_active = true
ORDER BY 
    vr.first_place_count DESC NULLS LAST,
    vr.second_place_count DESC NULLS LAST,
    vr.third_place_count DESC NULLS LAST,
    vr.wins DESC NULLS LAST, 
    vr.total_votes DESC NULLS LAST;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns
WHERE table_name = 'voting_results' 
AND column_name LIKE '%place%'
ORDER BY ordinal_position;

-- =====================================================
-- Create Function to Increment Tournament Rankings
-- =====================================================
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS increment_ranking(bigint, text);

CREATE OR REPLACE FUNCTION increment_ranking(
    p_submission_id BIGINT,
    p_rank_type TEXT
)
RETURNS void AS $$
BEGIN
    -- Insert or update the voting results
    INSERT INTO voting_results (
        submission_id,
        first_place_count,
        second_place_count,
        third_place_count,
        total_tournaments
    )
    VALUES (
        p_submission_id,
        CASE WHEN p_rank_type = 'first' THEN 1 ELSE 0 END,
        CASE WHEN p_rank_type = 'second' THEN 1 ELSE 0 END,
        CASE WHEN p_rank_type = 'third' THEN 1 ELSE 0 END,
        CASE WHEN p_rank_type = 'first' THEN 1 ELSE 0 END  -- Only increment total_tournaments for 1st place
    )
    ON CONFLICT (submission_id)
    DO UPDATE SET
        first_place_count = CASE 
            WHEN p_rank_type = 'first' THEN voting_results.first_place_count + 1 
            ELSE voting_results.first_place_count 
        END,
        second_place_count = CASE 
            WHEN p_rank_type = 'second' THEN voting_results.second_place_count + 1 
            ELSE voting_results.second_place_count 
        END,
        third_place_count = CASE 
            WHEN p_rank_type = 'third' THEN voting_results.third_place_count + 1 
            ELSE voting_results.third_place_count 
        END,
        total_tournaments = CASE 
            WHEN p_rank_type = 'first' THEN voting_results.total_tournaments + 1 
            ELSE voting_results.total_tournaments 
        END,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

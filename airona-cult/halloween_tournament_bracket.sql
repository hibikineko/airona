-- Halloween Tournament Bracket System
-- Hidden bracket - Users vote on random 1v1s, backend tracks tournament structure
-- Flow: 16→8→4→Double Elim Top 4→Round Robin Top 3→Final Rankings

-- =====================================================
-- STEP 1: Create Tournament Brackets Table
-- =====================================================

CREATE TABLE IF NOT EXISTS tournament_brackets (
    id BIGSERIAL PRIMARY KEY,
    submission1_id BIGINT REFERENCES halloween_submissions(id) ON DELETE CASCADE,
    submission2_id BIGINT REFERENCES halloween_submissions(id) ON DELETE CASCADE,
    winner_id BIGINT REFERENCES halloween_submissions(id) ON DELETE SET NULL,
    round_name TEXT NOT NULL, -- 'round_of_16', 'round_of_8', 'top_4_winners', 'top_4_losers', 'top_3_round_robin'
    match_number INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    vote_threshold INTEGER DEFAULT 10, -- Minimum votes to decide winner
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    
    CONSTRAINT unique_match_per_round UNIQUE (round_name, match_number)
);

CREATE INDEX IF NOT EXISTS idx_brackets_round ON tournament_brackets(round_name);
CREATE INDEX IF NOT EXISTS idx_brackets_completed ON tournament_brackets(is_completed);
CREATE INDEX IF NOT EXISTS idx_brackets_winner ON tournament_brackets(winner_id);

-- =====================================================
-- STEP 2: Create Tournament Votes Table
-- =====================================================

CREATE TABLE IF NOT EXISTS tournament_votes (
    id BIGSERIAL PRIMARY KEY,
    bracket_id BIGINT NOT NULL REFERENCES tournament_brackets(id) ON DELETE CASCADE,
    voter_discord_username TEXT NOT NULL,
    voted_for_id BIGINT NOT NULL REFERENCES halloween_submissions(id) ON DELETE CASCADE,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Each voter can only vote once per bracket match
    CONSTRAINT unique_voter_per_bracket UNIQUE (bracket_id, voter_discord_username)
);

CREATE INDEX IF NOT EXISTS idx_tournament_votes_bracket ON tournament_votes(bracket_id);
CREATE INDEX IF NOT EXISTS idx_tournament_votes_voter ON tournament_votes(voter_discord_username);
CREATE INDEX IF NOT EXISTS idx_tournament_votes_submission ON tournament_votes(voted_for_id);

-- =====================================================
-- STEP 3: Update Voting Results for Tournament Rankings
-- =====================================================

-- Add tournament-specific columns
ALTER TABLE voting_results 
ADD COLUMN IF NOT EXISTS tournament_rank INTEGER,
ADD COLUMN IF NOT EXISTS eliminated_in_round TEXT;

-- =====================================================
-- STEP 4: Create Function to Check Bracket Completion
-- =====================================================

CREATE OR REPLACE FUNCTION check_bracket_completion()
RETURNS TRIGGER AS $$
DECLARE
    total_votes INTEGER;
    sub1_votes INTEGER;
    sub2_votes INTEGER;
    vote_threshold INTEGER := 10; -- Minimum votes needed to decide winner
BEGIN
    -- Count total votes for this bracket
    SELECT COUNT(*) INTO total_votes
    FROM tournament_votes
    WHERE bracket_id = NEW.bracket_id;
    
    -- Only check if we have enough votes
    IF total_votes >= vote_threshold THEN
        -- Get bracket details
        SELECT 
            (SELECT COUNT(*) FROM tournament_votes tv 
             WHERE tv.bracket_id = NEW.bracket_id 
             AND tv.voted_for_id = tb.submission1_id),
            (SELECT COUNT(*) FROM tournament_votes tv 
             WHERE tv.bracket_id = NEW.bracket_id 
             AND tv.voted_for_id = tb.submission2_id)
        INTO sub1_votes, sub2_votes
        FROM tournament_brackets tb
        WHERE tb.id = NEW.bracket_id;
        
        -- Determine winner if we have clear majority
        IF sub1_votes > sub2_votes AND sub1_votes > (total_votes / 2) THEN
            UPDATE tournament_brackets
            SET winner_id = submission1_id,
                is_completed = TRUE,
                completed_at = NOW()
            WHERE id = NEW.bracket_id;
        ELSIF sub2_votes > sub1_votes AND sub2_votes > (total_votes / 2) THEN
            UPDATE tournament_brackets
            SET winner_id = submission2_id,
                is_completed = TRUE,
                completed_at = NOW()
            WHERE id = NEW.bracket_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_check_bracket_completion ON tournament_votes;
CREATE TRIGGER trigger_check_bracket_completion
    AFTER INSERT ON tournament_votes
    FOR EACH ROW
    EXECUTE FUNCTION check_bracket_completion();

-- =====================================================
-- STEP 5: Create View for Bracket Status
-- =====================================================

CREATE OR REPLACE VIEW tournament_bracket_status AS
SELECT 
    tb.id as bracket_id,
    tb.round_name,
    tb.match_number,
    tb.is_completed,
    s1.author_name as submission1_name,
    s1.image_url as submission1_image,
    s2.author_name as submission2_name,
    s2.image_url as submission2_image,
    w.author_name as winner_name,
    w.image_url as winner_image,
    (SELECT COUNT(*) FROM tournament_votes tv WHERE tv.bracket_id = tb.id AND tv.voted_for_id = tb.submission1_id) as submission1_votes,
    (SELECT COUNT(*) FROM tournament_votes tv WHERE tv.bracket_id = tb.id AND tv.voted_for_id = tb.submission2_id) as submission2_votes,
    (SELECT COUNT(*) FROM tournament_votes tv WHERE tv.bracket_id = tb.id) as total_votes
FROM tournament_brackets tb
LEFT JOIN halloween_submissions s1 ON tb.submission1_id = s1.id
LEFT JOIN halloween_submissions s2 ON tb.submission2_id = s2.id
LEFT JOIN halloween_submissions w ON tb.winner_id = w.id
ORDER BY 
    CASE tb.round_name
        WHEN 'round_of_16' THEN 1
        WHEN 'quarterfinals' THEN 2
        WHEN 'semifinals' THEN 3
        WHEN 'finals' THEN 4
    END,
    tb.match_number;

-- =====================================================
-- STEP 6: Function to Initialize Tournament (16 submissions)
-- =====================================================

CREATE OR REPLACE FUNCTION initialize_tournament()
RETURNS TEXT AS $$
DECLARE
    submission_ids BIGINT[];
    i INTEGER;
BEGIN
    -- Get all active submissions (should be exactly 16)
    SELECT ARRAY_AGG(id ORDER BY RANDOM()) INTO submission_ids
    FROM halloween_submissions
    WHERE is_active = TRUE;
    
    IF ARRAY_LENGTH(submission_ids, 1) != 16 THEN
        RETURN 'ERROR: Need exactly 16 submissions. Found: ' || ARRAY_LENGTH(submission_ids, 1);
    END IF;
    
    -- Clear existing brackets and votes
    DELETE FROM tournament_votes;
    DELETE FROM tournament_brackets;
    
    -- Create Round of 16 matches (8 matches: 16 → 8 winners)
    FOR i IN 1..8 LOOP
        INSERT INTO tournament_brackets (submission1_id, submission2_id, round_name, match_number, vote_threshold)
        VALUES (
            submission_ids[i * 2 - 1],
            submission_ids[i * 2],
            'round_of_16',
            i,
            10
        );
    END LOOP;
    
    RETURN 'SUCCESS: Tournament initialized! 8 matches in Round of 16 (16→8). Users will vote on random 1v1 matchups.';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 7: Function to Advance Rounds (Complex Flow)
-- =====================================================

CREATE OR REPLACE FUNCTION advance_round(current_round TEXT)
RETURNS TEXT AS $$
DECLARE
    winner_ids BIGINT[];
    loser_ids BIGINT[];
    top_3_ids BIGINT[];
    i INTEGER;
BEGIN
    -- Check if all matches in current round are completed
    IF EXISTS (
        SELECT 1 FROM tournament_brackets 
        WHERE round_name = current_round 
        AND is_completed = FALSE
    ) THEN
        RETURN 'ERROR: Not all matches in ' || current_round || ' are completed yet';
    END IF;
    
    -- FLOW: Round of 16 (16→8)
    IF current_round = 'round_of_16' THEN
        SELECT ARRAY_AGG(winner_id ORDER BY match_number) INTO winner_ids
        FROM tournament_brackets
        WHERE round_name = 'round_of_16';
        
        -- Create Round of 8: 4 matches (8→4)
        FOR i IN 1..4 LOOP
            INSERT INTO tournament_brackets (submission1_id, submission2_id, round_name, match_number, vote_threshold)
            VALUES (winner_ids[i * 2 - 1], winner_ids[i * 2], 'round_of_8', i, 10);
        END LOOP;
        
        RETURN 'SUCCESS: Advanced to Round of 8! 4 matches (8→4 winners)';
    
    -- FLOW: Round of 8 (8→4) → Top 4 Double Elimination
    ELSIF current_round = 'round_of_8' THEN
        SELECT ARRAY_AGG(winner_id ORDER BY match_number) INTO winner_ids
        FROM tournament_brackets
        WHERE round_name = 'round_of_8';
        
        -- Create Top 4 Winners Bracket: 2 matches
        INSERT INTO tournament_brackets (submission1_id, submission2_id, round_name, match_number, vote_threshold)
        VALUES (winner_ids[1], winner_ids[2], 'top_4_winners', 1, 10);
        INSERT INTO tournament_brackets (submission1_id, submission2_id, round_name, match_number, vote_threshold)
        VALUES (winner_ids[3], winner_ids[4], 'top_4_winners', 2, 10);
        
        RETURN 'SUCCESS: Advanced to Top 4! 2 winners bracket matches created. Run advance_round(''top_4_winners'') when done.';
    
    -- FLOW: Top 4 Winners → Losers Match
    ELSIF current_round = 'top_4_winners' THEN
        -- Get 2 winners (go to finals)
        SELECT ARRAY_AGG(winner_id ORDER BY match_number) INTO winner_ids
        FROM tournament_brackets
        WHERE round_name = 'top_4_winners';
        
        -- Get 2 losers (face each other)
        SELECT ARRAY_AGG(
            CASE 
                WHEN winner_id = submission1_id THEN submission2_id 
                ELSE submission1_id 
            END ORDER BY match_number
        ) INTO loser_ids
        FROM tournament_brackets
        WHERE round_name = 'top_4_winners';
        
        -- Create Losers Match: 1 match
        INSERT INTO tournament_brackets (submission1_id, submission2_id, round_name, match_number, vote_threshold)
        VALUES (loser_ids[1], loser_ids[2], 'top_4_losers', 1, 10);
        
        RETURN 'SUCCESS: 2 winners advance to Top 3. Losers bracket created (1 match). Run advance_round(''top_4_losers'') when done.';
    
    -- FLOW: Top 4 Losers → Top 3 Round Robin
    ELSIF current_round = 'top_4_losers' THEN
        -- Get winner of losers bracket
        SELECT winner_id INTO loser_ids FROM tournament_brackets WHERE round_name = 'top_4_losers' LIMIT 1;
        
        -- Get 2 winners from winners bracket
        SELECT ARRAY_AGG(winner_id ORDER BY match_number) INTO winner_ids
        FROM tournament_brackets
        WHERE round_name = 'top_4_winners';
        
        -- Combine into Top 3
        top_3_ids := ARRAY[winner_ids[1], winner_ids[2], loser_ids];
        
        -- Create Round Robin: All 3 combinations (1v2, 1v3, 2v3)
        INSERT INTO tournament_brackets (submission1_id, submission2_id, round_name, match_number, vote_threshold)
        VALUES (top_3_ids[1], top_3_ids[2], 'top_3_round_robin', 1, 15);
        INSERT INTO tournament_brackets (submission1_id, submission2_id, round_name, match_number, vote_threshold)
        VALUES (top_3_ids[1], top_3_ids[3], 'top_3_round_robin', 2, 15);
        INSERT INTO tournament_brackets (submission1_id, submission2_id, round_name, match_number, vote_threshold)
        VALUES (top_3_ids[2], top_3_ids[3], 'top_3_round_robin', 3, 15);
        
        RETURN 'SUCCESS: Top 3 Round Robin created! 3 matches (all combinations). Run finalize_rankings() when done.';
    
    ELSE
        RETURN 'ERROR: Invalid round or use finalize_rankings() for top 3';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 8: Finalize Rankings from Top 3 Round Robin
-- =====================================================

CREATE OR REPLACE FUNCTION finalize_rankings()
RETURNS TEXT AS $$
DECLARE
    sub_wins RECORD;
    rank_counter INTEGER := 1;
BEGIN
    -- Check if all top 3 matches are complete
    IF EXISTS (
        SELECT 1 FROM tournament_brackets 
        WHERE round_name = 'top_3_round_robin' 
        AND is_completed = FALSE
    ) THEN
        RETURN 'ERROR: Not all Top 3 Round Robin matches are completed yet';
    END IF;
    
    -- Calculate wins for each submission in top 3
    -- Insert into voting_results with tournament_rank
    FOR sub_wins IN (
        SELECT 
            s.id as submission_id,
            s.author_name,
            COUNT(CASE WHEN tb.winner_id = s.id THEN 1 END) as wins
        FROM (
            SELECT DISTINCT submission1_id as id FROM tournament_brackets WHERE round_name = 'top_3_round_robin'
            UNION
            SELECT DISTINCT submission2_id FROM tournament_brackets WHERE round_name = 'top_3_round_robin'
        ) ids
        JOIN halloween_submissions s ON s.id = ids.id
        LEFT JOIN tournament_brackets tb ON 
            tb.round_name = 'top_3_round_robin' AND 
            (tb.submission1_id = s.id OR tb.submission2_id = s.id)
        GROUP BY s.id, s.author_name
        ORDER BY COUNT(CASE WHEN tb.winner_id = s.id THEN 1 END) DESC
    ) LOOP
        UPDATE voting_results
        SET 
            tournament_rank = rank_counter,
            is_winner = (rank_counter = 1),
            eliminated_in_round = 'top_3'
        WHERE submission_id = sub_wins.submission_id;
        
        rank_counter := rank_counter + 1;
    END LOOP;
    
    -- Mark 4th place (loser of losers bracket)
    UPDATE voting_results
    SET 
        tournament_rank = 4,
        eliminated_in_round = 'top_4_losers'
    WHERE submission_id = (
        SELECT CASE 
            WHEN winner_id = submission1_id THEN submission2_id 
            ELSE submission1_id 
        END
        FROM tournament_brackets
        WHERE round_name = 'top_4_losers'
    );
    
    -- Mark 5-8th place (eliminated in Round of 8)
    UPDATE voting_results vr
    SET 
        tournament_rank = 5,
        eliminated_in_round = 'round_of_8'
    WHERE submission_id IN (
        SELECT CASE 
            WHEN winner_id = submission1_id THEN submission2_id 
            ELSE submission1_id 
        END
        FROM tournament_brackets
        WHERE round_name = 'round_of_8'
    );
    
    -- Mark 9-16th place (eliminated in Round of 16)
    UPDATE voting_results vr
    SET 
        tournament_rank = 9,
        eliminated_in_round = 'round_of_16'
    WHERE submission_id IN (
        SELECT CASE 
            WHEN winner_id = submission1_id THEN submission2_id 
            ELSE submission1_id 
        END
        FROM tournament_brackets
        WHERE round_name = 'round_of_16'
    );
    
    RETURN 'SUCCESS: Rankings finalized! 1st, 2nd, 3rd determined from Round Robin. Check voting_results table.';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 9: Enable RLS
-- =====================================================

ALTER TABLE tournament_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to tournament_brackets" ON tournament_brackets;
DROP POLICY IF EXISTS "Allow full access to tournament_votes" ON tournament_votes;

CREATE POLICY "Allow full access to tournament_brackets" ON tournament_brackets
    FOR ALL USING (true);

CREATE POLICY "Allow full access to tournament_votes" ON tournament_votes
    FOR ALL USING (true);

-- =====================================================
-- STEP 9: Helper Queries
-- =====================================================

-- View current tournament status
-- SELECT * FROM tournament_bracket_status;

-- Initialize tournament (run once when ready to start)
-- SELECT initialize_tournament();

-- Check if round is complete and can advance
-- SELECT round_name, COUNT(*) as total_matches, 
--        SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed_matches
-- FROM tournament_brackets
-- GROUP BY round_name;

-- Advance to next round (when current round is complete)
-- SELECT advance_round('round_of_16');
-- SELECT advance_round('quarterfinals');
-- SELECT advance_round('semifinals');

-- Get tournament winner
-- SELECT w.author_name as winner, w.image_url
-- FROM tournament_brackets tb
-- JOIN halloween_submissions w ON tb.winner_id = w.id
-- WHERE tb.round_name = 'finals' AND tb.is_completed = TRUE;

-- =====================================================
-- NOTES - Hidden Bracket System
-- =====================================================
-- Tournament Flow (Users see random 1v1s, backend tracks structure):
--
-- 1. Initialize: SELECT initialize_tournament();
--    Creates 8 matches (16 submissions → 8 winners)
--
-- 2. Users vote on Round of 16 matches
--    Backend: SELECT advance_round('round_of_16'); when all complete
--    Creates 4 matches (8 → 4 winners)
--
-- 3. Users vote on Round of 8 matches  
--    Backend: SELECT advance_round('round_of_8'); when all complete
--    Creates Top 4 double elimination (2 winners bracket matches)
--
-- 4. Users vote on Top 4 Winners matches
--    Backend: SELECT advance_round('top_4_winners'); when all complete
--    Creates 1 losers bracket match (2 losers face off)
--
-- 5. Users vote on Top 4 Losers match
--    Backend: SELECT advance_round('top_4_losers'); when all complete
--    Creates Top 3 Round Robin (all 3 combinations: 1v2, 1v3, 2v3)
--
-- 6. Users vote on Top 3 Round Robin (3 matches)
--    Backend: SELECT finalize_rankings(); when all complete
--    Calculates final rankings: 1st, 2nd, 3rd based on wins
--
-- Final Rankings:
-- - 1st, 2nd, 3rd: Determined by Round Robin wins (2-0, 1-1, 0-2)
-- - 4th: Loser of losers bracket
-- - 5-8th: Eliminated in Round of 8
-- - 9-16th: Eliminated in Round of 16
--
-- Vote threshold: 10 votes for most rounds, 15 for Top 3 (configurable)
-- Auto-completion: Trigger checks after each vote if threshold met

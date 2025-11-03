# Halloween Tournament Bracket System - Quick Start

## Overview
**Hidden bracket system** - Users vote on random 1v1 matchups, backend tracks tournament structure!

**User Experience**: Simple 1v1 votes (just like before)  
**Backend Logic**: Tournament bracket with double elimination at Top 4

### Tournament Flow
1. **Round of 16**: 8 matches (16 → 8 winners)
2. **Round of 8**: 4 matches (8 → 4 winners)
3. **Top 4 Double Elim**: 
   - Winners bracket: 2 matches → 2 finalists
   - Losers of winners face each other → 1 survivor
4. **Top 3 Round Robin**: All combinations (1v2, 1v3, 2v3)
5. **Final Rankings**: 1st, 2nd, 3rd determined by round robin wins!

## Setup Instructions

### 1. Run Database Setup
```sql
-- In Supabase SQL Editor, run:
halloween_tournament_bracket.sql
```

This creates:
- `tournament_brackets` table - stores all bracket matches
- `tournament_votes` table - stores user votes
- Triggers for auto-completion when votes reach threshold
- Helper functions for tournament management

### 2. Upload 16 Submissions
- Go to `/halloween/upload` (members only)
- Upload exactly 16 Halloween submissions
- Verify count in Supabase: `SELECT COUNT(*) FROM halloween_submissions WHERE is_active = true;`

### 3. Initialize Tournament
```sql
-- In Supabase SQL Editor:
SELECT initialize_tournament();
```

This will:
- Randomly seed all 16 submissions
- Create 8 matches for Round of 16
- Return: "SUCCESS: Tournament initialized with 8 matches in Round of 16"

### 4. Open Voting
- Share link: `https://your-site.com/halloween/vote`
- Users vote on each match (one vote per person per match)
- Real-time vote counts displayed
- Match auto-completes when 10+ votes and clear majority

### 5. Advance Rounds (Admin - Run in Supabase)

**Step-by-step progression:**

```sql
-- STEP 1: After Round of 16 complete (8 matches)
SELECT advance_round('round_of_16');
-- Creates 4 matches for Round of 8

-- STEP 2: After Round of 8 complete (4 matches)
SELECT advance_round('round_of_8');
-- Creates 2 Top 4 winners bracket matches

-- STEP 3: After Top 4 Winners complete (2 matches)
SELECT advance_round('top_4_winners');
-- Creates 1 losers bracket match (2 losers face off)

-- STEP 4: After Top 4 Losers complete (1 match)
SELECT advance_round('top_4_losers');
-- Creates Top 3 Round Robin (3 matches: all combinations)

-- STEP 5: After Top 3 Round Robin complete (3 matches)
SELECT finalize_rankings();
-- Calculates final 1st, 2nd, 3rd based on round robin wins!
```

### 6. View Results
- Check `/halloween/results` for final standings
- Tournament winner automatically determined after Finals

## Key Features

### Voting Rules
- ✅ One vote per user per match
- ✅ Can't vote after match is decided
- ✅ Can't change vote after submission
- ✅ Vote counts shown in real-time
- ✅ Winner declared when 10+ votes & clear majority

### Match Completion
Automatic when:
- Minimum 10 votes received
- One submission has >50% of votes
- Example: 10 votes → 6 for A, 4 for B → A wins!

### User Experience
- See all current round matches at once
- Vote on any match in any order
- Track which matches you've voted on
- See vote progress bars
- Click images to zoom
- Confirm before voting

## Tournament Flow Example

```
Round of 16 (8 matches):
Match 1: Sub #3 vs Sub #12 → Sub #3 wins
Match 2: Sub #7 vs Sub #14 → Sub #7 wins
... (6 more matches)
Result: 8 winners advance

↓ advance_round('round_of_16')

Round of 8 (4 matches):
Match 1: Sub #3 vs Sub #7 → Sub #3 wins
Match 2: Sub #5 vs Sub #11 → Sub #11 wins
... (2 more matches)
Result: 4 winners advance

↓ advance_round('round_of_8')

Top 4 Winners Bracket (2 matches):
Match 1: Sub #3 vs Sub #11 → Sub #3 wins
Match 2: Sub #2 vs Sub #9 → Sub #2 wins
Result: Sub #3 & Sub #2 advance to Top 3
        Sub #11 & Sub #9 go to losers bracket

↓ advance_round('top_4_winners')

Top 4 Losers Bracket (1 match):
Match 1: Sub #11 vs Sub #9 → Sub #11 wins
Result: Sub #11 joins Top 3

↓ advance_round('top_4_losers')

Top 3 Round Robin (3 matches):
Match 1: Sub #3 vs Sub #2 → Sub #3 wins
Match 2: Sub #3 vs Sub #11 → Sub #3 wins  
Match 3: Sub #2 vs Sub #11 → Sub #2 wins

Results: Sub #3 (2-0), Sub #2 (1-1), Sub #11 (0-2)

↓ finalize_rankings()

Final Rankings:
🥇 1st: Sub #3 (2 wins in round robin)
🥈 2nd: Sub #2 (1 win in round robin)
🥉 3rd: Sub #11 (0 wins in round robin)
4th: Sub #9 (lost in losers bracket)
5-8th: Eliminated in Round of 8
9-16th: Eliminated in Round of 16
```

## Admin Queries

### Check Tournament Status
```sql
SELECT * FROM tournament_bracket_status;
```

### Check Round Completion
```sql
SELECT 
    round_name, 
    COUNT(*) as total_matches, 
    SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed_matches
FROM tournament_brackets
GROUP BY round_name;
```

### Get Current Winner
```sql
SELECT 
    w.author_name as winner, 
    w.image_url,
    tb.total_votes
FROM tournament_brackets tb
JOIN tournament_bracket_status tbs ON tb.id = tbs.bracket_id
JOIN halloween_submissions w ON tb.winner_id = w.id
WHERE tb.round_name = 'finals' 
AND tb.is_completed = TRUE;
```

### Reset Tournament (WARNING: Deletes all votes!)
```sql
DELETE FROM tournament_votes;
DELETE FROM tournament_brackets;
SELECT initialize_tournament();
```

## Troubleshooting

### "Need exactly 16 submissions" error
- Check active submissions: `SELECT COUNT(*) FROM halloween_submissions WHERE is_active = true;`
- Add more or deactivate some to get exactly 16

### Match won't complete
- Check vote count: `SELECT * FROM tournament_bracket_status WHERE bracket_id = X;`
- Needs 10+ votes minimum
- Needs clear majority (>50%)

### Can't advance round
- Verify all matches completed: Check query above
- All `is_completed` must be `true` for current round

## API Endpoints

### GET `/api/halloween/brackets`
Returns all bracket data grouped by round + current round status

### GET `/api/halloween/tournament?username={username}`
Returns user's vote history

### POST `/api/halloween/tournament`
Submit a vote:
```json
{
  "voterDiscordUsername": "User#1234",
  "bracketId": 123,
  "votedForId": 456
}
```

## Configuration

### Vote Threshold
Default: 10 votes minimum per match

To change, edit in `halloween_tournament_bracket.sql`:
```sql
vote_threshold INTEGER := 10;  -- Change this number
```

### Match Majority
Default: >50% of votes

To change logic, edit trigger function `check_bracket_completion()`

## Tips

- Announce each round advancement on Discord
- Share current round standings
- Build hype for semifinals and finals
- Consider streaming final match results
- Celebrate the winner! 🎃

## Files Created
- `halloween_tournament_bracket.sql` - Database schema
- `src/app/api/halloween/tournament/route.js` - Voting API
- `src/app/api/halloween/brackets/route.js` - Bracket status API
- `src/app/halloween/vote/page.js` - Tournament voting UI

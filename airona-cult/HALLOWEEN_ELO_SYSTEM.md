# Halloween Voting System - ELO Rankings

## Overview
The Halloween voting system has been redesigned to use an **ELO rating system** (like typical waifu rankers, chess ratings, competitive games) instead of simple win counts. This provides **much more accurate rankings** based on the quality of wins, not just quantity.

## How It Works

### ELO Rating System
- **Starting Rating**: Every submission starts at 1200 ELO
- **K-Factor**: 32 (determines how much ratings change per match)
- **Formula**: `New Rating = Old Rating + K × (Actual Score - Expected Score)`
- **Expected Score**: `1 / (1 + 10^((Opponent Rating - Your Rating) / 400))`

### What This Means
- ✅ **Beating a higher-rated opponent** = Big ELO gain
- ✅ **Beating a lower-rated opponent** = Small ELO gain  
- ❌ **Losing to a lower-rated opponent** = Big ELO loss
- ❌ **Losing to a higher-rated opponent** = Small ELO loss

### Example
If Submission A (1400 ELO) beats Submission B (1300 ELO):
- A was expected to win ~64% of the time
- A gains ~11 ELO → 1411
- B loses ~11 ELO → 1289

If Submission C (1200 ELO) beats Submission A (1411 ELO):
- C was only expected to win ~24% of the time (upset!)
- C gains ~24 ELO → 1224
- A loses ~24 ELO → 1387

## Voting Flow

### Continuous Voting (Like Waifu Rankers)
- Voters can vote **as many times as they want**
- Each vote shows 2 **random** submissions
- No completion - vote endlessly!
- ELO updates in **real-time** after each vote

### User Experience
1. Enter Discord username
2. Click "Start Voting"
3. See 2 random submissions side-by-side
4. Click image to expand and view details
5. Click A or B to vote
6. Confirm vote
7. Immediately see next random matchup
8. Repeat forever! 🔄

## Rankings

### Final Standings Based on ELO
Results page (`/halloween/results`) now shows:
- **Top 3 podium** with ELO ratings displayed
- **Full standings table** sorted by ELO (highest first)
- Win-Loss record for context
- Win percentage for comparison

### Why ELO is Better Than Win Count
❌ **Old System (Win Count)**:
- Submission with 20 wins vs weak opponents = Rank #1
- Submission with 15 wins vs strong opponents = Rank #5
- **Problem**: Quantity over quality, luck-based

✅ **New System (ELO)**:
- Submission that consistently beats strong opponents = High ELO
- Submission that beats many weak opponents = Medium ELO  
- **Solution**: Quality of wins matters, fair rankings

## Database Changes

### New Column
```sql
ALTER TABLE voting_results 
ADD COLUMN elo_rating NUMERIC DEFAULT 1200;
```

### Updated Trigger
The `update_voting_results()` trigger now:
1. Fetches current ELO for winner and loser
2. Calculates expected scores
3. Updates both ELOs based on outcome
4. Stores new ratings in database

### Removed Constraint
```sql
ALTER TABLE voting_logs 
DROP CONSTRAINT unique_voter_per_match;
```
This allows continuous voting (same user can vote on same matchup multiple times over time).

## Setup Instructions

### Run in Supabase SQL Editor
```sql
-- Run the halloween_elo_update.sql file
-- This will:
-- 1. Remove unique constraint
-- 2. Add elo_rating column
-- 3. Initialize all submissions to 1200 ELO
-- 4. Create calculate_elo() function
-- 5. Update trigger to use ELO
-- 6. Update views to sort by ELO
```

### No Code Changes Needed
The voting page and results page have been updated to work with the new system automatically.

## Testing

### Verify ELO Updates
```sql
-- Check current ELO ratings
SELECT 
    hs.author_name,
    vr.elo_rating,
    vr.wins,
    vr.losses
FROM halloween_submissions hs
LEFT JOIN voting_results vr ON hs.id = vr.submission_id
ORDER BY vr.elo_rating DESC;
```

### Monitor Real-Time Changes
After each vote, check that:
1. Winner's ELO increases
2. Loser's ELO decreases
3. Total ELO change = 0 (zero-sum system)

## Statistics

### Expected ELO Distribution (16 submissions)
- **Top submission**: ~1350-1400 ELO
- **Middle pack**: ~1150-1250 ELO  
- **Bottom submission**: ~1000-1100 ELO
- **Range**: ~300-400 ELO spread

### Votes Needed for Stability
- **Minimum**: ~50 votes per submission (800+ total votes)
- **Recommended**: ~100 votes per submission (1600+ total votes)
- **Ideal**: ~200 votes per submission (3200+ total votes)

More votes = more accurate ELO ratings!

## Advantages

### For Voters
- ✅ Simple 1v1 interface
- ✅ Vote as much as you want
- ✅ See different matchups each time
- ✅ No pressure to "complete" anything
- ✅ Track your contribution count

### For Submissions  
- ✅ Fair rankings based on opponent strength
- ✅ Can climb ranks by beating strong opponents
- ✅ Quality wins matter more than quantity
- ✅ Similar to competitive game rankings

### For Organizers
- ✅ Automatic ranking calculation
- ✅ Real-time leaderboard updates
- ✅ Industry-standard ELO system
- ✅ Encourages more voting participation

## References
- Chess ELO: https://en.wikipedia.org/wiki/Elo_rating_system
- Waifu ranking sites use similar systems
- Competitive game ladders (League, Overwatch, etc.)

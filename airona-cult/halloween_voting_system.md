# Halloween Voting System Documentation

## Overview
The Halloween Voting System is a feature-rich tournament-style voting platform built for the Airona Cult community. It allows members to upload Halloween event submissions and enables community voting through head-to-head matchups to determine the most popular submissions.

## Features

### 1. **Admin Submission Upload** (Members Only)
- Members can upload Halloween submissions with author attribution
- Image uploads are stored in Supabase Storage under `content/halloween/`
- Each submission includes:
  - Image URL (automatically generated from upload)
  - Author name (Discord username)
  - Upload timestamp
  - Active/inactive status

### 2. **Public Voting System** (No Authentication Required)
- Users enter their Discord username to start voting
- Tournament-style 1v1 matchups
- Random pairing of submissions for fair voting
- Visual card-based interface with image preview
- Progress tracking throughout the voting session
- Prevents duplicate votes on the same matchup
- Real-time vote recording with feedback

### 3. **Member Results Dashboard** (Members Only)
- Live standings and rankings
- Statistics overview:
  - Total votes cast
  - Unique voters count
  - Total submissions
- Top 3 podium display (Gold, Silver, Bronze)
- Complete standings table with:
  - Rank position
  - Author name
  - Win/Loss record
  - Total votes received
  - Win percentage

### 4. **Home Page Integration**
- Replaced Poprona advertisement with Halloween voting banner
- Eye-catching gradient design with Halloween theme
- Direct call-to-action button to voting page
- Animated hover effects

## Database Schema

### Tables Created

#### 1. `halloween_submissions`
Stores all Halloween event submissions uploaded by admins.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| image_url | TEXT | Public URL to the uploaded image |
| author_name | TEXT | Discord username of the submission creator |
| upload_date | TIMESTAMP | When the submission was uploaded |
| is_active | BOOLEAN | Whether the submission is active (default: true) |
| created_at | TIMESTAMP | Record creation timestamp |

**Indexes:**
- `idx_halloween_submissions_active` on `is_active`

#### 2. `voting_logs`
Tracks every vote cast during the tournament.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| voter_discord_username | TEXT | Discord username of the voter |
| submission_id | BIGINT | ID of the submission that won |
| opponent_submission_id | BIGINT | ID of the submission that lost |
| round_number | INTEGER | Current round number |
| match_id | TEXT | Unique identifier for this matchup |
| voted_at | TIMESTAMP | When the vote was cast |

**Constraints:**
- `unique_voter_per_match`: Ensures voters can only vote once per specific matchup

**Indexes:**
- `idx_voting_logs_voter` on `voter_discord_username`
- `idx_voting_logs_submission` on `submission_id`
- `idx_voting_logs_round` on `round_number`
- `idx_voting_logs_match` on `match_id`

#### 3. `voting_results`
Stores aggregated voting results and final rankings.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| submission_id | BIGINT | ID of the submission |
| total_votes | INTEGER | Total votes received (wins only) |
| wins | INTEGER | Number of matchups won |
| losses | INTEGER | Number of matchups lost |
| final_rank | INTEGER | Final ranking position |
| is_winner | BOOLEAN | Whether this is the ultimate winner |
| last_updated | TIMESTAMP | When results were last updated |

**Constraints:**
- `unique_submission_result`: Each submission has only one result entry

**Indexes:**
- `idx_voting_results_submission` on `submission_id`
- `idx_voting_results_rank` on `final_rank`
- `idx_voting_results_winner` on `is_winner`

#### 4. `voter_sessions`
Tracks voter participation and progress.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| discord_username | TEXT | Discord username of the voter |
| current_round | INTEGER | Current round they're on |
| matches_completed | INTEGER | Number of matches they've completed |
| session_started_at | TIMESTAMP | When they started voting |
| last_vote_at | TIMESTAMP | Their most recent vote |
| is_completed | BOOLEAN | Whether they've finished voting |
| created_at | TIMESTAMP | Session creation timestamp |

**Indexes:**
- `idx_voter_sessions_username` on `discord_username`
- `idx_voter_sessions_completed` on `is_completed`

### Database Views

#### `halloween_standings`
A convenient view that joins submissions with their results, showing current rankings.

```sql
SELECT 
    hs.id,
    hs.author_name,
    hs.image_url,
    COALESCE(vr.total_votes, 0) as total_votes,
    COALESCE(vr.wins, 0) as wins,
    COALESCE(vr.losses, 0) as losses,
    win_percentage,
    vr.final_rank,
    vr.is_winner
FROM halloween_submissions hs
LEFT JOIN voting_results vr ON hs.id = vr.submission_id
WHERE hs.is_active = true
ORDER BY vr.wins DESC NULLS LAST, vr.total_votes DESC NULLS LAST;
```

#### `voting_activity`
Shows daily voting activity statistics.

```sql
SELECT 
    DATE(voted_at) as vote_date,
    COUNT(*) as total_votes,
    COUNT(DISTINCT voter_discord_username) as unique_voters
FROM voting_logs
GROUP BY DATE(voted_at)
ORDER BY vote_date DESC;
```

### Database Functions & Triggers

#### `update_voting_results()` Function
Automatically updates the `voting_results` table whenever a new vote is recorded.

- Increments winner's `wins` and `total_votes`
- Increments loser's `losses`
- Updates `last_updated` timestamp
- Uses UPSERT pattern for automatic insertion if record doesn't exist

#### `trigger_update_voting_results` Trigger
Executes the `update_voting_results()` function AFTER INSERT on `voting_logs`.

## API Routes

### 1. `/api/halloween/upload`

#### POST - Upload Submission (Members Only)
Uploads a new Halloween submission.

**Authentication:** Required (NextAuth session)

**Body:** FormData
- `image` (File): The Halloween submission image
- `authorName` (string): Discord username of the creator

**Response:**
```json
{
  "success": true,
  "submission": {
    "id": 1,
    "image_url": "https://...",
    "author_name": "username",
    "upload_date": "2025-11-02T...",
    "is_active": true
  },
  "message": "Halloween submission uploaded successfully!"
}
```

#### GET - Fetch All Submissions
Retrieves all active Halloween submissions.

**Response:**
```json
{
  "submissions": [
    {
      "id": 1,
      "image_url": "https://...",
      "author_name": "username",
      "upload_date": "2025-11-02T...",
      "is_active": true
    }
  ]
}
```

### 2. `/api/halloween/vote`

#### POST - Cast Vote
Records a vote for a specific matchup.

**Body:** JSON
```json
{
  "voterDiscordUsername": "username#1234",
  "winnerId": 1,
  "loserId": 2,
  "roundNumber": 1,
  "matchId": "round1_1_vs_2"
}
```

**Response:**
```json
{
  "success": true,
  "vote": {
    "id": 1,
    "voter_discord_username": "username#1234",
    "submission_id": 1,
    "opponent_submission_id": 2,
    "round_number": 1,
    "match_id": "round1_1_vs_2",
    "voted_at": "2025-11-02T..."
  },
  "message": "Vote recorded successfully!"
}
```

#### GET - Fetch Voting Progress
Retrieves a voter's completed matches.

**Query Parameters:**
- `username` (required): Discord username

**Response:**
```json
{
  "completedMatches": ["round1_1_vs_2", "round1_3_vs_4"],
  "votes": [
    {
      "match_id": "round1_1_vs_2",
      "round_number": 1
    }
  ]
}
```

## Pages

### 1. `/halloween/upload` - Admin Upload Page
**Access:** Members only (requires Discord authentication)

**Features:**
- Upload form with author name and image selection
- File preview and size display
- Gallery view of all current submissions
- Delete/deactivate functionality
- Real-time submission list updates

**Technology:**
- Next.js 14 App Router
- Material-UI components
- NextAuth for authentication
- Supabase client for database access

### 2. `/halloween/vote` - Public Voting Page
**Access:** Public (no authentication required)

**Features:**
- Username entry screen with Halloween theme
- Tournament-style 1v1 matchups
- Large image cards for each submission
- Visual selection feedback
- Progress bar showing voting completion
- Congratulations dialog when finished
- Prevents duplicate votes per matchup

**User Flow:**
1. Enter Discord username
2. View two random submissions side-by-side
3. Select favorite by clicking
4. Confirm vote
5. Proceed to next matchup
6. Receive completion message when done

**Technology:**
- Next.js 14 App Router
- Material-UI components
- React hooks for state management
- Gradient Halloween-themed styling

### 3. `/halloween/results` - Results Dashboard
**Access:** Members only (requires Discord authentication)

**Features:**
- Statistics cards showing:
  - Total votes cast
  - Unique voters
  - Total submissions
- Top 3 podium display with medal colors
- Complete standings table with:
  - Rank badges (🥇🥈🥉)
  - Submission thumbnails
  - Author names
  - Win/Loss records
  - Win percentages
- Sortable by wins and total votes
- Color-coded top 3 rows

**Technology:**
- Next.js 14 App Router
- Material-UI components
- NextAuth for authentication
- Supabase views for optimized queries

### 4. `/` - Home Page (Updated)
**Changes Made:**
- Replaced Poprona advertisement section
- New Halloween voting hero section with:
  - Gradient orange/black background
  - Large emoji decorations (🎃👻)
  - Glowing text effects
  - Prominent "Vote Now" button
  - Hover animations
  - Direct link to `/halloween/vote`

## Installation & Setup

### 1. Database Setup
Run the SQL setup file in your Supabase SQL editor:

```bash
# Execute this file in Supabase
halloween_voting_setup.sql
```

This will create:
- All required tables
- Indexes for performance
- Row Level Security policies
- Helper functions and triggers
- Database views

### 2. Storage Bucket Setup
Create a storage bucket in Supabase:

1. Go to Supabase Dashboard → Storage
2. Create bucket named `content` (if not exists)
3. Create folder `halloween` inside `content`
4. Set bucket to public or configure policies as needed

### 3. Environment Variables
Ensure these variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 4. Deploy Pages
The following files have been created and are ready to use:
- `src/app/halloween/upload/page.js`
- `src/app/halloween/vote/page.js`
- `src/app/halloween/results/page.js`
- `src/app/api/halloween/upload/route.js`
- `src/app/api/halloween/vote/route.js`

### 5. Update Home Page
The home page (`src/app/page.js`) has been automatically updated with the Halloween voting banner.

## Usage Guide

### For Admins (Members)

#### Uploading Submissions
1. Navigate to `/halloween/upload`
2. Ensure you're logged in with Discord
3. Enter the author's Discord username
4. Select the Halloween image file
5. Click "Upload Submission"
6. View all submissions in the gallery below
7. Deactivate submissions if needed using the delete icon

#### Viewing Results
1. Navigate to `/halloween/results`
2. Ensure you're logged in with Discord
3. View real-time statistics and standings
4. Check top 3 podium
5. Review complete standings table

### For Voters (Public)

#### Voting Process
1. Navigate to `/halloween/vote` (or click banner on home page)
2. Enter your Discord username
3. Click "Start Voting!"
4. View two submission images side-by-side
5. Click on your favorite submission
6. Click "Confirm Vote"
7. Repeat for all matchups
8. Receive completion message

**Important Notes:**
- You can only vote once per specific matchup
- Your username is recorded but votes are public
- Voting is anonymous (results don't show who voted for what)
- You can close and resume voting later

## Technical Details

### Vote Counting Logic
- Each vote creates a record in `voting_logs`
- Trigger automatically updates `voting_results`
- Winners receive +1 win, +1 total_votes
- Losers receive +1 loss
- Win percentage calculated as: (wins / (wins + losses)) × 100

### Matchup Generation
- Submissions are shuffled randomly for each voter
- Match IDs prevent duplicate votes: `round{N}_{id1}_vs_{id2}`
- Round numbers allow for multi-stage tournaments
- System checks completed matches per voter

### Security Measures
- Row Level Security enabled on all tables
- Member-only routes check authentication
- Upload routes verify member status
- File uploads sanitized and validated
- Unique constraints prevent duplicate votes

## Maintenance & Troubleshooting

### Common Issues

#### Votes Not Recording
- Check `voting_logs` table for errors
- Verify trigger is active: `trigger_update_voting_results`
- Ensure `voting_results` table has proper permissions

#### Images Not Uploading
- Verify Supabase storage bucket exists: `content/halloween/`
- Check bucket permissions (public read)
- Ensure service role key has storage permissions

#### Results Not Updating
- Verify `halloween_standings` view exists
- Check if trigger function is working
- Manually query `voting_results` table

### Useful Queries

#### View All Votes
```sql
SELECT 
    vl.voter_discord_username,
    hs1.author_name as winner,
    hs2.author_name as loser,
    vl.round_number,
    vl.voted_at
FROM voting_logs vl
JOIN halloween_submissions hs1 ON vl.submission_id = hs1.id
JOIN halloween_submissions hs2 ON vl.opponent_submission_id = hs2.id
ORDER BY vl.voted_at DESC;
```

#### Get Voter Participation
```sql
SELECT 
    voter_discord_username,
    COUNT(*) as votes_cast,
    MAX(voted_at) as last_vote
FROM voting_logs
GROUP BY voter_discord_username
ORDER BY votes_cast DESC;
```

#### Find Most Popular Submission
```sql
SELECT * FROM halloween_standings
ORDER BY wins DESC, total_votes DESC
LIMIT 1;
```

#### Reset All Votes (Careful!)
```sql
-- WARNING: This deletes all voting data
TRUNCATE voting_logs CASCADE;
TRUNCATE voting_results CASCADE;
TRUNCATE voter_sessions CASCADE;
```

## Future Enhancements

### Potential Features
1. **Multi-Round Tournaments**: Implement bracket-style elimination rounds
2. **Real-time Updates**: WebSocket integration for live result updates
3. **Voter Analytics**: Dashboard showing voting patterns and engagement
4. **Share Results**: Social media sharing of final rankings
5. **Submission Categories**: Different categories for different types of submissions
6. **Time-Limited Voting**: Set start/end dates for voting periods
7. **Email Notifications**: Alert winners and top participants
8. **Advanced Stats**: Heat maps, voting trends over time
9. **Mobile App**: Native mobile voting experience
10. **Admin Dashboard**: Comprehensive admin controls and moderation

### Code Improvements
- Implement caching for frequently accessed data
- Add loading skeletons for better UX
- Optimize image delivery with CDN
- Add unit tests for API routes
- Implement rate limiting on voting
- Add input validation with Zod or similar
- Create reusable voting components
- Add error boundaries for better error handling

## Credits
- **System Design**: Halloween Voting Tournament System
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Next.js 14, React, Material-UI
- **Authentication**: NextAuth with Discord Provider
- **Storage**: Supabase Storage

## License
This feature is part of the Airona Cult website project.

---

**Last Updated**: November 2, 2025  
**Version**: 1.0.0  
**Status**: Production Ready

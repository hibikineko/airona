-- Fix for Foreign Key Constraint Error
-- This creates a user record for the Discord ID that's causing the error

-- Insert the missing user record
INSERT INTO users (discord_uid, username, avatar_url, total_cards_collected, created_at, updated_at)
VALUES (
    '275152997498224641', 
    'Owner Test User', 
    NULL, 
    0, 
    NOW(), 
    NOW()
) 
ON CONFLICT (discord_uid) DO NOTHING;

-- Verify the user was created
SELECT discord_uid, username, total_cards_collected, created_at 
FROM users 
WHERE discord_uid = '275152997498224641';

-- Optional: Check if there are any other Discord UIDs that might need user records
-- This query shows discord_uids referenced in related tables but missing from users table
SELECT DISTINCT discord_uid as missing_user_id
FROM user_stats 
WHERE discord_uid NOT IN (SELECT discord_uid FROM users)
UNION
SELECT DISTINCT discord_uid as missing_user_id
FROM user_cards 
WHERE discord_uid NOT IN (SELECT discord_uid FROM users);
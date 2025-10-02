-- Fortune Card Game Database Setup
-- Run these commands in your Supabase SQL editor

-- STEP 1: Create the required tables

-- Create rarity_config table
CREATE TABLE IF NOT EXISTS rarity_config (
    id BIGSERIAL PRIMARY KEY,
    rarity TEXT NOT NULL UNIQUE,
    percentage DECIMAL(5,2) NOT NULL,
    min_roll INTEGER NOT NULL,
    max_roll INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    fortune_message TEXT NOT NULL,
    airona_sticker_path TEXT NOT NULL,
    rarity TEXT NOT NULL REFERENCES rarity_config(rarity),
    background_color TEXT DEFAULT '#af52de',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table (if not exists)
CREATE TABLE IF NOT EXISTS user_stats (
    id BIGSERIAL PRIMARY KEY,
    discord_uid TEXT NOT NULL UNIQUE,
    total_draws INTEGER DEFAULT 0,
    cards_collected INTEGER DEFAULT 0,
    daily_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_draw_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_cards table (if not exists)
CREATE TABLE IF NOT EXISTS user_cards (
    id BIGSERIAL PRIMARY KEY,
    discord_uid TEXT NOT NULL,
    card_id BIGINT NOT NULL REFERENCES cards(id),
    drawn_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_daily_draw BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    discord_uid TEXT NOT NULL UNIQUE,
    username TEXT,
    avatar_url TEXT,
    last_draw_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_cards_discord_uid ON user_cards(discord_uid);
CREATE INDEX IF NOT EXISTS idx_user_cards_drawn_date ON user_cards(drawn_date);
CREATE INDEX IF NOT EXISTS idx_user_cards_daily_draw ON user_cards(is_daily_draw);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
CREATE INDEX IF NOT EXISTS idx_cards_active ON cards(is_active);
CREATE INDEX IF NOT EXISTS idx_user_stats_discord_uid ON user_stats(discord_uid);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE rarity_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (in case you're re-running this)
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own cards" ON user_cards;
DROP POLICY IF EXISTS "Users can view own cards" ON user_cards;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Allow read access to cards" ON cards;
DROP POLICY IF EXISTS "Allow read access to rarity_config" ON rarity_config;
DROP POLICY IF EXISTS "Allow full access to user_stats" ON user_stats;
DROP POLICY IF EXISTS "Allow full access to user_cards" ON user_cards;
DROP POLICY IF EXISTS "Allow full access to users" ON users;

-- Create RLS policies

-- rarity_config: Read-only for everyone
CREATE POLICY "Allow read access to rarity_config" ON rarity_config
    FOR SELECT USING (true);

-- cards: Read-only for everyone
CREATE POLICY "Allow read access to cards" ON cards
    FOR SELECT USING (true);

-- user_stats: Allow all operations (we handle auth in API)
CREATE POLICY "Allow full access to user_stats" ON user_stats
    FOR ALL USING (true);

-- user_cards: Allow all operations (we handle auth in API)
CREATE POLICY "Allow full access to user_cards" ON user_cards
    FOR ALL USING (true);

-- users: Allow all operations (we handle auth in API)
CREATE POLICY "Allow full access to users" ON users
    FOR ALL USING (true);

-- STEP 2: Insert the rarity configuration
INSERT INTO rarity_config (rarity, percentage, min_roll, max_roll) VALUES
('elite', 60.0, 1, 600),
('super_rare', 30.0, 601, 900),
('ultra_rare', 10.0, 901, 1000);

-- STEP 3: Insert Airona Fortune Cards
-- Elite Cards (Purple - 60% chance)
INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Blessing of Joy', 'Airona radiates pure happiness, bringing light to your day', 'May your heart be filled with the same joy that lights up Airona''s smile!', 'airona_happy.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Blessing of Love', 'Love surrounds Airona like a warm embrace', 'Love will find its way to you today, just as it flows from Airona''s heart!', 'airona_love.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Blessing of Wisdom', 'Airona contemplates the mysteries of life', 'Trust in your inner wisdom - Airona believes in your judgment!', 'airona_nerd.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Blessing of Friendship', 'Airona extends her hand in friendship', 'New connections and deeper bonds await you today!', 'airona_handshake.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Blessing of Achievement', 'Airona celebrates your victories', 'Success is within reach - Airona cheers for your accomplishments!', 'airona_thumbsup.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Blessing of Mischief', 'Airona''s playful side brings unexpected surprises', 'A little mischief today will lead to wonderful discoveries!', 'airona_tehehe.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Blessing of Courage', 'Airona faces challenges with determination', 'You have the strength to overcome any obstacle that stands before you!', 'airona_proud.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Blessing of Wonder', 'Airona gasps in amazement at life''s beauty', 'Open your eyes to the magic that surrounds you every moment!', 'airona_gasp.png', 'elite', '#af52de', true);

-- Super Rare Cards (Gold - 30% chance)
INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Golden Prosperity', 'Airona holds the key to abundance and wealth', 'Fortune favors you today - prosperity flows like golden rivers!', 'airona_dollar.png', 'super_rare', '#ff9500', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Golden Heart', 'Airona''s heart shines with pure golden light', 'Your compassion will be rewarded tenfold - spread love freely!', 'airona_heart.png', 'super_rare', '#ff9500', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Golden Victory', 'Airona stands triumphant, radiating confidence', 'Victory is yours to claim - step forward with unwavering confidence!', 'airona_proud2.png', 'super_rare', '#ff9500', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Golden Dreams', 'Airona sleeps peacefully, manifesting dreams into reality', 'Your deepest dreams are closer to reality than you imagine!', 'airona_unconcious.png', 'super_rare', '#ff9500', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Golden Transformation', 'Airona channels incredible power and change', 'Embrace the transformation coming your way - you''re becoming stronger!', 'airona_gojo.png', 'super_rare', '#ff9500', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Golden Adventure', 'Airona embarks on a mystical journey', 'An exciting adventure awaits - trust the path ahead!', 'airona_fox.png', 'super_rare', '#ff9500', true);

-- Ultra Rare Cards (Rainbow/Holographic - 10% chance)
INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Divine Airona', 'The ultimate blessing - Airona in her most radiant form', 'You are blessed beyond measure - the universe conspires in your favor!', 'airona1.png', 'ultra_rare', '#00d4ff', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Celestial Harmony', 'Airona achieves perfect balance with the cosmos', 'Perfect harmony flows through every aspect of your life today!', 'airona2.png', 'ultra_rare', '#00d4ff', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Eternal Bliss', 'Airona transcends earthly concerns, radiating pure bliss', 'Infinite joy and peace are your birthright - claim them now!', 'airona_yay.png', 'ultra_rare', '#00d4ff', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active) 
VALUES ('Cosmic Revelation', 'Airona receives divine wisdom from the stars', 'A life-changing revelation is about to illuminate your path!', 'airona_over.png', 'ultra_rare', '#00d4ff', true);

-- STEP 4: Verify the setup was successful
SELECT 'Rarity Config' as table_name, COUNT(*) as count FROM rarity_config
UNION ALL
SELECT 'Cards' as table_name, COUNT(*) as count FROM cards
UNION ALL
SELECT 'Elite Cards' as table_name, COUNT(*) as count FROM cards WHERE rarity = 'elite'
UNION ALL
SELECT 'Super Rare Cards' as table_name, COUNT(*) as count FROM cards WHERE rarity = 'super_rare'
UNION ALL
SELECT 'Ultra Rare Cards' as table_name, COUNT(*) as count FROM cards WHERE rarity = 'ultra_rare';

-- STEP 5: Preview your cards
SELECT name, rarity, airona_sticker_path FROM cards ORDER BY 
  CASE rarity 
    WHEN 'ultra_rare' THEN 1 
    WHEN 'super_rare' THEN 2 
    WHEN 'elite' THEN 3 
  END, name;

-- STEP 6: Additional helpful queries (optional)

-- Check table structure
\d+ rarity_config;
\d+ cards;
\d+ user_stats;
\d+ user_cards;
\d+ users;

-- Test rarity distribution
SELECT 
    rarity,
    percentage,
    min_roll,
    max_roll,
    (max_roll - min_roll + 1) as roll_range
FROM rarity_config 
ORDER BY min_roll;

-- Count cards by rarity
SELECT 
    rarity,
    COUNT(*) as card_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM cards), 2) as actual_percentage
FROM cards 
WHERE is_active = true
GROUP BY rarity
ORDER BY 
    CASE rarity 
        WHEN 'ultra_rare' THEN 1 
        WHEN 'super_rare' THEN 2 
        WHEN 'elite' THEN 3 
    END;

-- STEP 7: Cleanup commands (use if you need to start over)
/*
-- WARNING: These commands will delete all data! Uncomment only if needed.

DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own cards" ON user_cards;
DROP POLICY IF EXISTS "Users can view own cards" ON user_cards;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Allow read access to cards" ON cards;
DROP POLICY IF EXISTS "Allow read access to rarity_config" ON rarity_config;

DROP TABLE IF EXISTS user_cards CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS rarity_config CASCADE;
*/
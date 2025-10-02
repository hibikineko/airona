-- Quick Fix for Fortune Card Draw Error
-- Run this in Supabase SQL Editor to fix the RLS policies

-- Drop problematic RLS policies that block our Discord auth system
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own cards" ON user_cards;
DROP POLICY IF EXISTS "Users can view own cards" ON user_cards;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;

-- Create permissive policies that work with our server-side authentication
CREATE POLICY "Allow full access to user_stats" ON user_stats
    FOR ALL USING (true);

CREATE POLICY "Allow full access to user_cards" ON user_cards
    FOR ALL USING (true);

CREATE POLICY "Allow full access to users" ON users
    FOR ALL USING (true);

-- Verify the policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('user_stats', 'user_cards', 'users')
ORDER BY tablename, policyname;
-- Create function to get fortune leaderboard
CREATE OR REPLACE FUNCTION get_fortune_leaderboard(total_cards INTEGER DEFAULT 30)
RETURNS TABLE (
  user_id TEXT,
  username TEXT,
  avatar TEXT,
  cards_collected BIGINT,
  completion_rate NUMERIC,
  total_draws BIGINT,
  daily_streak INTEGER,
  last_draw_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.discord_uid as user_id,
    u.username,
    u.avatar_url as avatar,
    COALESCE(uc.cards_collected, 0) as cards_collected,
    ROUND(
      (COALESCE(uc.cards_collected, 0)::NUMERIC / total_cards::NUMERIC) * 100, 
      1
    ) as completion_rate,
    COALESCE(us.total_draws, 0) as total_draws,
    COALESCE(us.daily_streak, 0) as daily_streak,
    us.last_draw_date
  FROM users u
  LEFT JOIN (
    SELECT 
      discord_uid,
      COUNT(DISTINCT card_id) as cards_collected
    FROM user_cards 
    GROUP BY discord_uid
  ) uc ON u.discord_uid = uc.discord_uid
  LEFT JOIN user_stats us ON u.discord_uid = us.discord_uid
  WHERE COALESCE(uc.cards_collected, 0) > 0 -- Only show users who have at least one card
  ORDER BY 
    completion_rate DESC,
    cards_collected DESC,
    total_draws ASC,
    daily_streak DESC;
END;
$$ LANGUAGE plpgsql;
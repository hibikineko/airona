-- Create view for archive statistics
CREATE VIEW card_archive_stats AS
SELECT 
  c.id,
  c.name,
  c.description,
  c.fortune_message,
  c.airona_sticker_path,
  c.rarity,
  c.background_color,
  COUNT(DISTINCT uc.discord_uid) as total_owners,
  ROUND(
    (COUNT(DISTINCT uc.discord_uid)::numeric / 
     NULLIF((SELECT COUNT(DISTINCT discord_uid)::numeric FROM users), 0)) * 100, 
    1
  ) as ownership_percentage,
  SUM(uc.quantity) as total_copies_owned
FROM cards c
LEFT JOIN user_cards uc ON c.id = uc.card_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.description, c.fortune_message, 
         c.airona_sticker_path, c.rarity, c.background_color
ORDER BY 
  CASE c.rarity 
    WHEN 'ultra_rare' THEN 1
    WHEN 'super_rare' THEN 2  
    WHEN 'elite' THEN 3
    ELSE 4
  END,
  c.name;

-- Function to get user-specific archive view
CREATE OR REPLACE FUNCTION get_user_archive(user_discord_uid text)
RETURNS TABLE (
  card_id integer,
  name text,
  description text,
  fortune_message text,
  airona_sticker_path text,
  rarity text,
  background_color text,
  user_owns boolean,
  user_quantity integer,
  total_owners bigint,
  ownership_percentage numeric,
  total_copies_owned bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cas.id,
    cas.name,
    cas.description,
    cas.fortune_message,
    cas.airona_sticker_path,
    cas.rarity,
    cas.background_color,
    CASE WHEN uc.quantity IS NOT NULL THEN true ELSE false END as user_owns,
    COALESCE(uc.quantity, 0) as user_quantity,
    cas.total_owners,
    cas.ownership_percentage,
    cas.total_copies_owned
  FROM card_archive_stats cas
  LEFT JOIN user_cards uc ON cas.id = uc.card_id AND uc.discord_uid = user_discord_uid
  ORDER BY 
    CASE cas.rarity 
      WHEN 'ultra_rare' THEN 1
      WHEN 'super_rare' THEN 2  
      WHEN 'elite' THEN 3
      ELSE 4
    END,
    cas.name;
END;
$$ LANGUAGE plpgsql;
-- Update existing cards to better distribute rarities
-- Update some existing cards to different rarities for better balance

UPDATE cards SET rarity = 'super_rare', background_color = '#ff9500' WHERE name = 'Golden Transformation';
UPDATE cards SET rarity = 'super_rare', background_color = '#ff9500' WHERE name = 'Golden Adventure';

-- Now, update the specified ultra rare cards
UPDATE cards SET rarity = 'ultra_rare', background_color = '#00d4ff' WHERE airona_sticker_path = 'airona_evilgrab.png';
UPDATE cards SET rarity = 'ultra_rare', background_color = '#00d4ff' WHERE airona_sticker_path = 'airona_gojo.png';
UPDATE cards SET rarity = 'ultra_rare', background_color = '#00d4ff' WHERE airona_sticker_path = 'airona_fox.png';

-- Insert new Ultra Rare card (airona_card.png)
INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Destiny''s Hand', 'Airona reveals the cards of fate in her grasp', 'The cards of destiny are in your favor - a life-changing opportunity awaits!', 'airona_card.png', 'ultra_rare', '#00d4ff', true);

-- Insert new Super Rare cards (separate statements)
INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Golden Wisdom', 'Airona contemplates the deepest mysteries with enlightened understanding', 'Divine wisdom flows through you today - trust your intuition completely!', 'airona_note.png', 'super_rare', '#ff9500', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Golden Serenity', 'Airona finds perfect peace in the chaos of existence', 'Inner peace will guide you through any storm that may come your way!', 'airona_unconcious.png', 'super_rare', '#ff9500', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Golden Mischief', 'Airona''s playful energy brings unexpected fortune', 'A delightful surprise will turn your day in the most wonderful direction!', 'airona_wink.png', 'super_rare', '#ff9500', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Golden Grace', 'Airona moves with divine elegance and poise', 'Grace and elegance will open doors you never knew existed!', 'airona_blush.png', 'super_rare', '#ff9500', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Golden Feast', 'Airona enjoys the abundance of life''s pleasures', 'Abundance flows to you from unexpected sources - prepare to receive!', 'airona_fish.png', 'super_rare', '#ff9500', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Golden Defiance', 'Airona stands firm against all adversity', 'Your determination will break through every barrier in your path!', 'airona_hmph.png', 'super_rare', '#ff9500', true);

-- Insert new Elite cards (separate statements)
INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Tears', 'Airona''s tears wash away sorrow and bring renewal', 'Sometimes tears clear the path to happiness - healing is coming your way!', 'airona_cry.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Laughter', 'Airona''s infectious laughter lights up the world', 'Laughter is the best medicine - joy will heal what troubles you today!', 'airona_wheeze.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Curiosity', 'Airona questions everything with innocent wonder', 'Ask the right questions today and you''ll discover amazing answers!', 'airona_whatme.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Determination', 'Airona channels focused energy toward her goals', 'Your unwavering focus will manifest exactly what you desire!', 'airona_grab.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Darkness', 'Airona embraces her shadow side with acceptance', 'Sometimes we must face the darkness to appreciate the light ahead!', 'airona_evil.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Stress', 'Airona learns valuable lessons from challenging times', 'Today''s challenges are tomorrow''s strengths - you''re growing stronger!', 'airona_stressed.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Indulgence', 'Airona enjoys life''s simple pleasures without guilt', 'Allow yourself to enjoy the sweet moments - you''ve earned them!', 'airona_drool.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Dawn', 'Airona greets each new day with fresh hope', 'A new dawn brings new possibilities - today is full of potential!', 'airona_eos.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Earth', 'Airona connects with the grounding energy of nature', 'Stay grounded in your values while reaching for your dreams!', 'airona_doro.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Mystery', 'Airona contemplates the unknown with serene acceptance', 'The unknown holds beautiful surprises - trust in life''s mysterious ways!', 'airona3.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Radiance', 'Airona glows with inner light and confidence', 'Your inner light shines so bright it illuminates the path for others!', 'airona4.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Balance', 'Airona finds harmony between all aspects of life', 'Perfect balance is within reach - trust your ability to find it!', 'airona5.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Growth', 'Airona embraces change and personal evolution', 'You''re evolving into your best self - embrace this transformation!', 'airona6.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Creativity', 'Airona''s imagination knows no bounds', 'Creative inspiration flows through you like a mighty river today!', 'airona7.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Connection', 'Airona bridges the gap between hearts and minds', 'Meaningful connections will enrich your life in unexpected ways!', 'airona8.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Freedom', 'Airona soars above limitations with boundless spirit', 'Break free from what holds you back - your spirit is meant to soar!', 'airona9.png', 'elite', '#af52de', true);

INSERT INTO cards (name, description, fortune_message, airona_sticker_path, rarity, background_color, is_active)
VALUES ('Blessing of Completion', 'Airona celebrates the fulfillment of a long journey', 'What you''ve been working toward is finally coming to fruition!', 'airona10.png', 'elite', '#af52de', true);

-- Final summary query to see all cards by rarity
SELECT 
  rarity,
  COUNT(*) as card_count,
  ARRAY_AGG(name ORDER BY name) as card_names
FROM cards 
WHERE is_active = true 
GROUP BY rarity 
ORDER BY 
  CASE rarity 
    WHEN 'ultra_rare' THEN 1 
    WHEN 'super_rare' THEN 2 
    WHEN 'elite' THEN 3 
  END;
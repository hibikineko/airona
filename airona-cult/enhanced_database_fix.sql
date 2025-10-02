-- Enhanced Fortune Card Database Schema Updates
-- Run these commands in your Supabase SQL editor to fix the multi-banner system

-- 1. Add Airona Coin balance to users table (if not already added)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.users 
        ADD COLUMN airona_coins integer DEFAULT 10;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, do nothing
    END;
    
    BEGIN
        ALTER TABLE public.users 
        ADD COLUMN created_at timestamp without time zone DEFAULT now();
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, do nothing
    END;
    
    BEGIN
        ALTER TABLE public.users 
        ADD COLUMN updated_at timestamp without time zone DEFAULT now();
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, do nothing
    END;
END $$;

-- 2. Add pity system tracking to user_stats
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.user_stats 
        ADD COLUMN standard_pity_counter integer DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, do nothing
    END;
    
    BEGIN
        ALTER TABLE public.user_stats 
        ADD COLUMN limited_pity_counter integer DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, do nothing
    END;
    
    BEGIN
        ALTER TABLE public.user_stats 
        ADD COLUMN total_coin_draws integer DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, do nothing
    END;
END $$;

-- 3. Add quantity tracking and banner support to user_cards
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.user_cards 
        ADD COLUMN quantity integer DEFAULT 1;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, do nothing
    END;
    
    BEGIN
        ALTER TABLE public.user_cards 
        ADD COLUMN banner_type text DEFAULT 'standard';
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, do nothing
    END;
    
    BEGIN
        ALTER TABLE public.user_cards 
        ADD COLUMN is_coin_draw boolean DEFAULT false;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, do nothing
    END;
END $$;

-- 4. Create banner configuration table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'banner_config_id_seq') THEN
        CREATE SEQUENCE public.banner_config_id_seq;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.banner_config (
  id bigint NOT NULL DEFAULT nextval('banner_config_id_seq'::regclass),
  banner_type text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  rate_up_ultra_rare_id integer,
  rate_up_super_rare_id integer,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT banner_config_pkey PRIMARY KEY (id),
  CONSTRAINT banner_config_rate_up_ultra_fkey FOREIGN KEY (rate_up_ultra_rare_id) REFERENCES public.cards(id),
  CONSTRAINT banner_config_rate_up_super_fkey FOREIGN KEY (rate_up_super_rare_id) REFERENCES public.cards(id)
);

-- 5. Create coin transaction log
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'coin_transactions_id_seq') THEN
        CREATE SEQUENCE public.coin_transactions_id_seq;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id bigint NOT NULL DEFAULT nextval('coin_transactions_id_seq'::regclass),
  discord_uid text NOT NULL,
  transaction_type text NOT NULL, -- 'earned', 'spent', 'admin_add', 'admin_remove'
  amount integer NOT NULL,
  reason text,
  related_card_ids integer[],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coin_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT coin_transactions_discord_uid_fkey FOREIGN KEY (discord_uid) REFERENCES public.users(discord_uid)
);

-- 6. Initialize banner configuration (if not already done)
INSERT INTO public.banner_config (banner_type, is_active, rate_up_ultra_rare_id, rate_up_super_rare_id) 
VALUES 
('standard', true, NULL, NULL),
('limited', true, 1, 2) -- Replace with actual card IDs
ON CONFLICT (banner_type) DO NOTHING;

-- 7. Update existing user_cards to have proper quantities (merge duplicates)
DO $$
BEGIN
    -- First, update quantities based on duplicate entries
    UPDATE public.user_cards 
    SET quantity = subquery.card_count
    FROM (
      SELECT discord_uid, card_id, COUNT(*) as card_count
      FROM public.user_cards 
      GROUP BY discord_uid, card_id
      HAVING COUNT(*) > 1
    ) AS subquery
    WHERE user_cards.discord_uid = subquery.discord_uid 
    AND user_cards.card_id = subquery.card_id;

    -- Remove duplicate entries (keep the one with highest ID - most recent)
    DELETE FROM public.user_cards 
    WHERE id NOT IN (
      SELECT MAX(id) 
      FROM public.user_cards 
      GROUP BY discord_uid, card_id
    );
END $$;

-- 8. Add unique constraint to prevent future duplicates (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_cards_unique_user_card'
    ) THEN
        ALTER TABLE public.user_cards 
        ADD CONSTRAINT user_cards_unique_user_card UNIQUE (discord_uid, card_id);
    END IF;
END $$;

-- 9. Ensure all existing users have starting coin balance
UPDATE public.users 
SET airona_coins = 10 
WHERE airona_coins IS NULL;

-- 10. Initialize user stats for existing users who don't have them
INSERT INTO public.user_stats (discord_uid, total_draws, cards_collected, daily_streak, longest_streak, standard_pity_counter, limited_pity_counter, total_coin_draws)
SELECT 
    u.discord_uid,
    0,
    0,
    0,
    0,
    0,
    0,
    0
FROM public.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_stats us 
    WHERE us.discord_uid = u.discord_uid
)
ON CONFLICT (discord_uid) DO NOTHING;
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabaseServer } from "@/lib/supabaseServer";
import { moderateRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  // Apply rate limiting for card draws
  const rateLimitResult = moderateRateLimit.check(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.error }, 
      { 
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter.toString()
        }
      }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { bannerType = 'standard', useCoin = false, use_coin = false } = body;
    
    // Handle both parameter names for backward compatibility
    const usingCoin = useCoin || use_coin;

    const discord_uid = session.user.id;
    const today = new Date().toISOString().split('T')[0]; // UTC date
    
    // Owner bypass for testing (Discord ID: 275152997498224641)
    const isOwner = discord_uid === "275152997498224641";

    // Check if user already drew today for free pulls (skip for owner)
    if (!isOwner && !usingCoin) {
      const { data: existingDraw } = await supabaseServer
        .from("user_cards")
        .select("id")
        .eq("discord_uid", discord_uid)
        .eq("drawn_date", today)
        .eq("is_daily_draw", true)
        .eq("banner_type", bannerType);

      if (existingDraw && existingDraw.length > 0) {
        return NextResponse.json(
          { error: `You have already used your free daily draw on the ${bannerType} banner today!` },
          { status: 400 }
        );
      }
    }

    // Get current user stats and coin balance
    const { data: existingStats } = await supabaseServer
      .from("user_stats")
      .select("*")
      .eq("discord_uid", discord_uid)
      .single();

    const { data: userInfo } = await supabaseServer
      .from("users")
      .select("airona_coins")
      .eq("discord_uid", discord_uid)
      .single();

    // Check coin balance for coin draws
    if (usingCoin) {
      const currentCoins = userInfo?.airona_coins || 0;
      if (currentCoins < 1) {
        return NextResponse.json(
          { error: "Insufficient Airona Coins! You need 1 coin to draw." },
          { status: 400 }
        );
      }
    }

    // Get banner configuration
    const { data: bannerConfig } = await supabaseServer
      .from("banner_config")
      .select("*")
      .eq("banner_type", bannerType)
      .eq("is_active", true)
      .single();

    if (!bannerConfig) {
      return NextResponse.json(
        { error: `Banner "${bannerType}" not found or inactive` },
        { status: 400 }
      );
    }

    // Check pity system
    const pityCounter = bannerType === 'limited' 
      ? (existingStats?.limited_pity_counter || 0)
      : (existingStats?.standard_pity_counter || 0);

    let guaranteedRarity = null;
    let resetPity = false;
    
    if (pityCounter >= 19) {
      guaranteedRarity = 'ultra_rare';
      resetPity = true;
    }

    // Get rarity configuration
    const { data: rarityConfig, error: rarityError } = await supabaseServer
      .from("rarity_config")
      .select("*")
      .order("percentage", { ascending: false });

    if (rarityError || !rarityConfig || rarityConfig.length === 0) {
      console.error("Rarity config fetch error:", rarityError);
      return NextResponse.json(
        { error: "Game configuration error" },
        { status: 500 }
      );
    }

    // Determine rarity
    let selectedRarity = 'elite'; // Default fallback
    
    if (guaranteedRarity) {
      selectedRarity = guaranteedRarity;
    } else {
      // Generate random number for rarity (1-1000 for precise percentages)
      const randomRoll = Math.floor(Math.random() * 1000) + 1;
      
      // Find the rarity based on roll ranges
      for (const config of rarityConfig) {
        if (randomRoll >= config.min_roll && randomRoll <= config.max_roll) {
          selectedRarity = config.rarity;
          break;
        }
      }
    }

    // Apply rate-up for limited banner
    let rateUpCardId = null;
    if (bannerType === 'limited') {
      const rateUpChance = Math.random() < 0.75; // 75% rate-up chance
      
      if (selectedRarity === 'ultra_rare' && rateUpChance && bannerConfig.rate_up_ultra_rare_id) {
        rateUpCardId = bannerConfig.rate_up_ultra_rare_id;
      } else if (selectedRarity === 'super_rare' && rateUpChance && bannerConfig.rate_up_super_rare_id) {
        rateUpCardId = bannerConfig.rate_up_super_rare_id;
      }
    }

    // Get the card
    let selectedCard;
    if (rateUpCardId) {
      // Get specific rate-up card
      const { data: rateUpCard, error: rateUpError } = await supabaseServer
        .from("cards")
        .select("*")
        .eq("id", rateUpCardId)
        .eq("is_active", true)
        .single();

      if (rateUpError || !rateUpCard) {
        console.error("Rate-up card fetch error:", rateUpError);
        // Fallback to normal pool
        rateUpCardId = null;
      } else {
        selectedCard = rateUpCard;
      }
    }

    if (!selectedCard) {
      // Get random card of selected rarity (normal pool)
      const { data: availableCards, error: cardsError } = await supabaseServer
        .from("cards")
        .select("*")
        .eq("rarity", selectedRarity)
        .eq("is_active", true);

      if (cardsError || !availableCards || availableCards.length === 0) {
        console.error("Cards fetch error:", cardsError);
        return NextResponse.json(
          { error: `No cards available for rarity: ${selectedRarity}` },
          { status: 500 }
        );
      }

      selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    }

    // Ensure user exists in users table first
    await supabaseServer
      .from("users")
      .upsert({
        discord_uid,
        username: session.user.name,
        avatar_url: session.user.image,
        last_draw_date: today
      }, {
        onConflict: 'discord_uid'
      });

    // Check if user already owns this card for quantity increment
    const { data: existingCard } = await supabaseServer
      .from("user_cards")
      .select("quantity")
      .eq("discord_uid", discord_uid)
      .eq("card_id", selectedCard.id)
      .single();

    let cardInsertData;
    
    if (existingCard) {
      // Update quantity
      const { error: updateError } = await supabaseServer
        .from("user_cards")
        .update({ 
          quantity: existingCard.quantity + 1 
        })
        .eq("discord_uid", discord_uid)
        .eq("card_id", selectedCard.id);

      if (updateError) {
        console.error("Card quantity update error:", updateError);
        return NextResponse.json(
          { error: "Failed to update card quantity" },
          { status: 500 }
        );
      }
      
      cardInsertData = {
        ...selectedCard,
        quantity: existingCard.quantity + 1,
        draw_date: today
      };
    } else {
      // Insert new card
      const { data: newDraw, error: drawError } = await supabaseServer
        .from("user_cards")
        .insert({
          discord_uid,
          card_id: selectedCard.id,
          drawn_date: today,
          is_daily_draw: !usingCoin,
          is_coin_draw: usingCoin,
          banner_type: bannerType,
          quantity: 1
        })
        .select("*")
        .single();

      if (drawError) {
        console.error("Draw save error:", drawError);
        return NextResponse.json(
          { error: "Failed to save card draw" },
          { status: 500 }
        );
      }

      cardInsertData = {
        ...selectedCard,
        quantity: 1,
        draw_date: today
      };
    }

    // Update pity counters
    const newPityCounters = {};
    
    // Be explicit about field names to avoid any issues
    const pityFieldName = bannerType === 'limited' ? 'limited_pity_counter' : 'standard_pity_counter';
    
    if (selectedCard.rarity === 'ultra_rare') {
      // Reset pity counter for this banner
      newPityCounters[pityFieldName] = 0;
    } else {
      // Increment pity counter for this banner
      newPityCounters[pityFieldName] = (pityCounter + 1);
    }

    // Update user stats
    const newTotalDraws = (existingStats?.total_draws || 0) + 1;
    const newCardsCollected = existingCard 
      ? (existingStats?.cards_collected || 0)
      : (existingStats?.cards_collected || 0) + 1;

    const { data: updatedStats } = await supabaseServer
      .from("user_stats")
      .upsert({
        discord_uid,
        total_draws: newTotalDraws,
        cards_collected: newCardsCollected,
        total_coin_draws: usingCoin ? ((existingStats?.total_coin_draws || 0) + 1) : (existingStats?.total_coin_draws || 0),
        last_draw_date: today,
        daily_streak: !usingCoin ? calculateStreak(existingStats?.last_draw_date, today, existingStats?.daily_streak || 0) : (existingStats?.daily_streak || 0),
        longest_streak: !usingCoin ? Math.max(
          existingStats?.longest_streak || 0, 
          calculateStreak(existingStats?.last_draw_date, today, existingStats?.daily_streak || 0)
        ) : (existingStats?.longest_streak || 0),
        ...newPityCounters
      }, {
        onConflict: 'discord_uid'
      })
      .select()
      .single();

    // Deduct coin if coin draw
    if (usingCoin) {
      const { error: coinError } = await supabaseServer
        .from("users")
        .update({ 
          airona_coins: (userInfo?.airona_coins || 0) - 1 
        })
        .eq('discord_uid', discord_uid);

      if (coinError) {
        console.error("Coin deduction error:", coinError);
        return NextResponse.json(
          { error: "Failed to deduct coins" },
          { status: 500 }
        );
      }

      // Log coin transaction
      await supabaseServer
        .from("coin_transactions")
        .insert({
          discord_uid,
          transaction_type: 'spent',
          amount: -1,
          reason: `Card draw on ${bannerType} banner`,
          related_card_ids: [selectedCard.id]
        });
    }

    // Update users table
    await supabaseServer
      .from("users")
      .update({
        last_draw_date: today,
        total_cards_collected: newCardsCollected
      })
      .eq('discord_uid', discord_uid);

    // Return the drawn card with updated stats
    return NextResponse.json({
      success: true,
      card: cardInsertData,
      updatedStats: updatedStats,
      isRateUp: !!rateUpCardId,
      wasPityDraw: !!guaranteedRarity,
      bannerType,
      usedCoin: usingCoin,
      newCoinBalance: usingCoin ? ((userInfo?.airona_coins || 0) - 1) : (userInfo?.airona_coins || 0)
    });

  } catch (error) {
    console.error("Fortune draw error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during the draw" },
      { status: 500 }
    );
  }
}

// Helper function to calculate streak
function calculateStreak(lastDrawDate, today, currentStreak) {
  if (!lastDrawDate) return 1; // First draw
  
  const lastDraw = new Date(lastDrawDate);
  const todayDate = new Date(today);
  const daysDiff = Math.floor((todayDate - lastDraw) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    return currentStreak + 1; // Consecutive day
  } else if (daysDiff === 0) {
    return currentStreak; // Same day (shouldn't happen with our checks)
  } else {
    return 1; // Streak broken, restart
  }
}
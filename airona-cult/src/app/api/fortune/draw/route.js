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

    const discord_uid = session.user.id;
    const today = new Date().toISOString().split('T')[0]; // UTC date
    
    // Owner bypass for testing (Discord ID: 275152997498224641)
    const isOwner = discord_uid === "275152997498224641";

    // Check if user already drew today (skip for owner)
    if (!isOwner) {
      const { data: existingDraw } = await supabaseServer
        .from("user_cards")
        .select("id")
        .eq("discord_uid", discord_uid)
        .eq("drawn_date", today)
        .eq("is_daily_draw", true)
        .single();

      if (existingDraw) {
        return NextResponse.json(
          { error: "You have already drawn your fortune card today!" },
          { status: 400 }
        );
      }
    }

    // Get current user stats for streak calculation
    const { data: existingStats } = await supabaseServer
      .from("user_stats")
      .select("*")
      .eq("discord_uid", discord_uid)
      .single();

    // Get rarity configuration
    const { data: rarityConfig, error: rarityError } = await supabaseServer
      .from("rarity_config")
      .select("*")
      .order("percentage", { ascending: false });

    if (rarityError) {
      console.error("Rarity config fetch error:", rarityError);
      return NextResponse.json(
        { error: "Game configuration error" },
        { status: 500 }
      );
    }

    if (!rarityConfig || rarityConfig.length === 0) {
      console.error("No rarity configuration found");
      return NextResponse.json(
        { error: "Game configuration error" },
        { status: 500 }
      );
    }

    // Generate random number for rarity (1-1000 for precise percentages)
    const randomRoll = Math.floor(Math.random() * 1000) + 1;
    let selectedRarity = 'elite'; // Default fallback
    
    // Find the rarity based on roll ranges
    for (const config of rarityConfig) {
      if (randomRoll >= config.min_roll && randomRoll <= config.max_roll) {
        selectedRarity = config.rarity;
        break;
      }
    }

    // Get random card of selected rarity
    const { data: availableCards, error: cardsError } = await supabaseServer
      .from("cards")
      .select("*")
      .eq("rarity", selectedRarity)
      .eq("is_active", true);

    if (cardsError) {
      console.error("Cards fetch error:", cardsError);
      return NextResponse.json(
        { error: "Failed to fetch cards" },
        { status: 500 }
      );
    }

    if (!availableCards || availableCards.length === 0) {
      console.error(`No cards available for rarity: ${selectedRarity}`);
      return NextResponse.json(
        { error: `No cards available for rarity: ${selectedRarity}` },
        { status: 500 }
      );
    }

    console.log(`Drawing from ${availableCards.length} available ${selectedRarity} cards`);
    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];

    // Ensure user exists in users table first (required for foreign key)
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

    // Save the drawn card to user's collection
    const { data: newDraw, error: drawError } = await supabaseServer
      .from("user_cards")
      .insert({
        discord_uid,
        card_id: randomCard.id,
        drawn_date: today,
        is_daily_draw: true
      })
      .select("*")
      .single();

    if (drawError) {
      console.error("Draw save error:", drawError);
      console.error("Attempted to insert:", { discord_uid, card_id: randomCard.id, drawn_date: today });
      return NextResponse.json(
        { 
          error: "Failed to save card draw",
          details: drawError.message,
          debug: { discord_uid, card_id: randomCard.id, drawn_date: today }
        },
        { status: 500 }
      );
    }

    // Update user stats after successful draw
    const { data: updatedStats } = await supabaseServer
      .from("user_stats")
      .upsert({
        discord_uid,
        total_draws: (existingStats?.total_draws || 0) + 1,
        cards_collected: (existingStats?.cards_collected || 0) + 1,
        last_draw_date: today,
        daily_streak: calculateStreak(existingStats?.last_draw_date, today, existingStats?.daily_streak || 0),
        longest_streak: Math.max(
          existingStats?.longest_streak || 0, 
          calculateStreak(existingStats?.last_draw_date, today, existingStats?.daily_streak || 0)
        )
      }, {
        onConflict: 'discord_uid'
      })
      .select()
      .single();

    // Update users table with latest draw info
    await supabaseServer
      .from("users")
      .update({
        last_draw_date: today,
        total_cards_collected: (existingStats?.cards_collected || 0) + 1
      })
      .eq('discord_uid', discord_uid);

    // Return the drawn card with updated stats
    return NextResponse.json({
      success: true,
      card: {
        ...randomCard,
        draw_date: today
      },
      updatedStats: updatedStats || {
        total_draws: 1,
        cards_collected: 1,
        daily_streak: 1,
        longest_streak: 1,
        last_draw_date: today
      }
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
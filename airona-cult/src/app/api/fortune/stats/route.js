import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabaseServer } from "@/lib/supabaseServer";
import { lenientRateLimit } from "@/lib/rateLimit";

export async function GET(request) {
  // Apply rate limiting
  const rateLimitResult = lenientRateLimit.check(request);
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
    
    // Owner bypass for testing (Discord ID: 275152997498224641)
    const isOwner = discord_uid === "275152997498224641";

    // Get or create user stats
    const { data: existingStats } = await supabaseServer
      .from("user_stats")
      .select("*")
      .eq("discord_uid", discord_uid)
      .single();

    if (!existingStats) {
      // Create initial stats for new user
      const { data: newStats, error: createError } = await supabaseServer
        .from("user_stats")
        .insert({
          discord_uid,
          total_draws: 0,
          cards_collected: 0,
          daily_streak: 0,
          longest_streak: 0,
          last_draw_date: null
        })
        .select()
        .single();

      if (createError) {
        console.error("Stats creation error:", createError);
        return NextResponse.json(
          { 
            stats: {
              total_draws: 0,
              cards_collected: 0,
              daily_streak: 0,
              longest_streak: 0,
              last_draw_date: null
            },
            gameState: {
              canDrawToday: true,
              streakExpired: false,
              nextDrawAvailable: null
            },
            isNewUser: true
          }
        );
      }

      return NextResponse.json({ 
        stats: newStats, 
        gameState: {
          canDrawToday: true,
          streakExpired: false,
          nextDrawAvailable: null
        },
        isNewUser: true 
      });
    }

    // Calculate streak status with UTC midnight reset
    const today = new Date().toISOString().split('T')[0];
    const lastDrawDate = existingStats.last_draw_date;
    
    let canDrawToday = true;
    let streakExpired = false;
    let nextDrawAvailable = null;
    
    if (lastDrawDate && !isOwner) {
      // Check if user has drawn today
      const hasDrawnToday = lastDrawDate === today;
      canDrawToday = !hasDrawnToday;
      
      if (!canDrawToday) {
        // Calculate next midnight UTC
        const now = new Date();
        const nextMidnight = new Date(now);
        nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
        nextMidnight.setUTCHours(0, 0, 0, 0);
        nextDrawAvailable = nextMidnight.toISOString();
      }
      
      // Check streak status
      if (lastDrawDate) {
        const lastDraw = new Date(lastDrawDate);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate - lastDraw) / (1000 * 60 * 60 * 24));
        streakExpired = daysDiff > 1; // Streak breaks if more than 1 day gap
      }
    } else if (isOwner) {
      // Owner can always draw
      canDrawToday = true;
    }

    return NextResponse.json({
      stats: existingStats,
      gameState: {
        canDrawToday,
        streakExpired,
        nextDrawAvailable,
        isOwner // Add owner status for UI
      }
    });

  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
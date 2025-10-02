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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 50);

    // Get user's collected cards with card details
    const { data: userCards, error } = await supabaseServer
      .from("user_cards")
      .select(`
        id,
        drawn_date,
        is_daily_draw,
        cards (
          id,
          name,
          description,
          fortune_message,
          airona_sticker_path,
          rarity,
          background_color
        )
      `)
      .eq("discord_uid", discord_uid)
      .order("drawn_date", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Collection fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch collection" },
        { status: 500 }
      );
    }

    // Get all available cards for completion tracking
    const { data: allCards } = await supabaseServer
      .from("cards")
      .select("id, name, rarity")
      .eq("is_active", true)
      .order("rarity", { ascending: true })
      .order("name", { ascending: true });

    // Calculate collection stats
    const collectedCardIds = new Set(userCards.map(uc => uc.cards.id));
    const totalCards = allCards?.length || 0;
    const collectedCount = collectedCardIds.size;
    const completionRate = totalCards > 0 ? (collectedCount / totalCards * 100).toFixed(1) : 0;

    return NextResponse.json({
      userCards,
      stats: {
        total_collected: collectedCount,
        total_available: totalCards,
        completion_rate: completionRate,
        daily_draws: userCards.filter(uc => uc.is_daily_draw).length
      },
      pagination: {
        page,
        pageSize,
        hasMore: userCards.length === pageSize
      }
    });

  } catch (error) {
    console.error("Collection API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
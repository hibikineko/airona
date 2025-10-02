import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request) {
  try {
    // Note: Making this endpoint public since banner information is not sensitive
    // and needs to be accessible to show available banners
    
    // Get active banner configuration
    const { data: bannerConfigRaw, error: configError } = await supabaseServer
      .from("banner_config")
      .select("*")
      .eq("is_active", true)
      .order("banner_type");

    if (configError) {
      console.error("Banner config fetch error:", configError);
      return NextResponse.json(
        { error: "Failed to fetch banner configuration" },
        { status: 500 }
      );
    }

    // Get all card IDs referenced in banner configs
    const allCardIds = [];
    bannerConfigRaw.forEach(banner => {
      if (banner.rate_up_ultra_rare_id) allCardIds.push(banner.rate_up_ultra_rare_id);
      if (banner.rate_up_super_rare_id) allCardIds.push(banner.rate_up_super_rare_id);
    });

    // Fetch the referenced cards if any exist
    let existingCards = [];
    if (allCardIds.length > 0) {
      const { data: cards, error: cardsError } = await supabaseServer
        .from("cards")
        .select("id, name, rarity, airona_sticker_path, background_color")
        .in("id", allCardIds);

      if (cardsError) {
        console.error("Cards fetch error:", cardsError);
      } else {
        existingCards = cards || [];
      }
    }

    // Build the response with proper card data and image paths
    const banners = bannerConfigRaw.map(banner => {
      const result = { ...banner };
      
      if (banner.rate_up_ultra_rare_id) {
        const ultraRareCard = existingCards?.find(card => card.id === banner.rate_up_ultra_rare_id);
        if (ultraRareCard) {
          result.rate_up_ultra_rare = {
            ...ultraRareCard,
            // Ensure image path is properly formatted for Next.js Image component
            airona_sticker_path: ultraRareCard.airona_sticker_path.startsWith('/') 
              ? ultraRareCard.airona_sticker_path 
              : `/airona/${ultraRareCard.airona_sticker_path}`
          };
        }
      }
      
      if (banner.rate_up_super_rare_id) {
        const superRareCard = existingCards?.find(card => card.id === banner.rate_up_super_rare_id);
        if (superRareCard) {
          result.rate_up_super_rare = {
            ...superRareCard,
            // Ensure image path is properly formatted for Next.js Image component
            airona_sticker_path: superRareCard.airona_sticker_path.startsWith('/') 
              ? superRareCard.airona_sticker_path 
              : `/airona/${superRareCard.airona_sticker_path}`
          };
        }
      }
      
      return result;
    });

    return NextResponse.json({
      success: true,
      banners
    });

  } catch (error) {
    console.error("Banner API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
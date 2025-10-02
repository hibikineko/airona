import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { supabaseServer } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

const ADMIN_DISCORD_ID = "275152997498224641";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.id !== ADMIN_DISCORD_ID) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get current banner configurations
    const { data: banners, error: bannerError } = await supabaseServer
      .from('banner_config')
      .select(`
        *,
        rate_up_ultra_rare:rate_up_ultra_rare_id(id, name, airona_sticker_path, rarity),
        rate_up_super_rare:rate_up_super_rare_id(id, name, airona_sticker_path, rarity)
      `)
      .order('id');

    if (bannerError) {
      console.error('Error fetching banners:', bannerError);
      return NextResponse.json(
        { error: 'Failed to fetch banner configurations' },
        { status: 500 }
      );
    }

    // Get all available cards for selection
    const { data: cards, error: cardsError } = await supabaseServer
      .from('cards')
      .select('id, name, airona_sticker_path, rarity, background_color')
      .eq('is_active', true)
      .order('rarity, name');

    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      banners,
      cards
    });

  } catch (error) {
    console.error('Admin banners API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.id !== ADMIN_DISCORD_ID) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { bannerType, rateUpUltraRareId, rateUpSuperRareId, isActive } = await request.json();

    if (!bannerType) {
      return NextResponse.json(
        { error: 'Banner type is required' },
        { status: 400 }
      );
    }

    // Update banner configuration
    const updateData = {
      rate_up_ultra_rare_id: rateUpUltraRareId || null,
      rate_up_super_rare_id: rateUpSuperRareId || null,
      is_active: isActive !== undefined ? isActive : true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseServer
      .from('banner_config')
      .update(updateData)
      .eq('banner_type', bannerType)
      .select()
      .single();

    if (error) {
      console.error('Error updating banner:', error);
      return NextResponse.json(
        { error: 'Failed to update banner configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${bannerType} banner updated successfully`,
      banner: data
    });

  } catch (error) {
    console.error('Admin banners update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
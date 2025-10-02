import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { supabaseServer } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rarity = searchParams.get('rarity');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'rarity';

    const supabase = supabaseServer;

    // Call the database function to get user archive
    const { data: archiveData, error: archiveError } = await supabase
      .rpc('get_user_archive', {
        user_discord_uid: session.user.id
      });

    if (archiveError) {
      console.error('Error fetching archive:', archiveError);
      return NextResponse.json(
        { error: 'Failed to fetch card archive' },
        { status: 500 }
      );
    }

    let filteredData = archiveData || [];

    // Apply rarity filter
    if (rarity && rarity !== 'all') {
      filteredData = filteredData.filter(card => card.rarity === rarity);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(card => 
        card.name.toLowerCase().includes(searchLower) ||
        card.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sort === 'name') {
      filteredData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'ownership_percentage') {
      filteredData.sort((a, b) => b.ownership_percentage - a.ownership_percentage);
    }
    // Default sort by rarity is already applied in the database function

    // Calculate statistics
    const stats = {
      totalCards: archiveData?.length || 0,
      ownedCards: archiveData?.filter(card => card.user_owns).length || 0,
      collectionPercentage: archiveData?.length > 0 
        ? ((archiveData.filter(card => card.user_owns).length / archiveData.length) * 100).toFixed(1)
        : '0.0',
      rarityDistribution: {
        ultra_rare: archiveData?.filter(card => card.rarity === 'ultra_rare').length || 0,
        super_rare: archiveData?.filter(card => card.rarity === 'super_rare').length || 0,
        elite: archiveData?.filter(card => card.rarity === 'elite').length || 0
      },
      ownedByRarity: {
        ultra_rare: archiveData?.filter(card => card.rarity === 'ultra_rare' && card.user_owns).length || 0,
        super_rare: archiveData?.filter(card => card.rarity === 'super_rare' && card.user_owns).length || 0,
        elite: archiveData?.filter(card => card.rarity === 'elite' && card.user_owns).length || 0
      }
    };

    return NextResponse.json({
      success: true,
      cards: filteredData,
      stats: stats,
      filters: {
        rarity: rarity || 'all',
        search: search || '',
        sort: sort
      }
    });

  } catch (error) {
    console.error('Archive API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
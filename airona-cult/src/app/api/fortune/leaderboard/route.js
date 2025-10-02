import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const discord_uid = session.user.id;

    // Get total number of cards for completion percentage calculation
    const { data: totalCards, error: cardsError } = await supabaseServer
      .from('cards')
      .select('id', { count: 'exact' });

    if (cardsError) {
      console.error('Error fetching total cards:', cardsError);
      return NextResponse.json({ error: 'Failed to get total cards' }, { status: 500 });
    }

    const totalCardCount = totalCards?.length || 30; // Fallback to 30 if count fails

    // Get leaderboard data with user stats and collection counts
    // Using direct queries instead of RPC function for better debugging
    const { data: usersWithCards, error: leaderboardError } = await supabaseServer
      .from('users')
      .select(`
        discord_uid,
        username,
        avatar_url
      `)
      .not('discord_uid', 'is', null);

    if (leaderboardError) {
      console.error('Error fetching users:', leaderboardError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get card collection counts for each user
    const leaderboardData = [];
    
    for (const user of usersWithCards || []) {
      // Get card count
      const { data: userCards, error: cardError } = await supabaseServer
        .from('user_cards')
        .select('card_id')
        .eq('discord_uid', user.discord_uid);

      if (cardError) {
        console.error('Error fetching user cards:', cardError);
        continue;
      }

      // Get user stats
      const { data: userStats, error: statsError } = await supabaseServer
        .from('user_stats')
        .select('total_draws, daily_streak, last_draw_date, total_coin_draws, standard_pity_counter, limited_pity_counter')
        .eq('discord_uid', user.discord_uid)
        .single();

      if (statsError && statsError.code !== 'PGRST116') { // Ignore "not found" errors
        console.error('Error fetching user stats:', statsError);
      }

      const uniqueCards = [...new Set(userCards?.map(c => c.card_id) || [])];
      const cardsCollected = uniqueCards.length;
      
      if (cardsCollected > 0) { // Only include users with cards
        const completionRate = ((cardsCollected / totalCardCount) * 100).toFixed(1);
        
        leaderboardData.push({
          user_id: user.discord_uid,
          username: user.username || 'Anonymous',
          avatar: user.avatar_url,
          cards_collected: cardsCollected,
          completion_rate: parseFloat(completionRate),
          total_draws: userStats?.total_draws || 0,
          total_coin_draws: userStats?.total_coin_draws || 0,
          daily_streak: userStats?.daily_streak || 0,
          last_draw_date: userStats?.last_draw_date,
          standard_pity: userStats?.standard_pity_counter || 0,
          limited_pity: userStats?.limited_pity_counter || 0
        });
      }
    }

    // Sort the leaderboard
    leaderboardData.sort((a, b) => {
      if (b.completion_rate !== a.completion_rate) {
        return b.completion_rate - a.completion_rate;
      }
      if (b.cards_collected !== a.cards_collected) {
        return b.cards_collected - a.cards_collected;
      }
      if (a.total_draws !== b.total_draws) {
        return a.total_draws - b.total_draws;
      }
      return b.daily_streak - a.daily_streak;
    });

    // Find current user's rank
    const userRank = leaderboardData?.find(player => player.user_id === discord_uid) || null;

    // Format the response
    const rankings = leaderboardData?.map((player, index) => ({
      ...player,
      rank: index + 1,
      completion_rate: parseFloat(player.completion_rate).toFixed(1)
    })) || [];

    const formattedUserRank = userRank ? {
      ...userRank,
      rank: rankings.findIndex(p => p.user_id === discord_uid) + 1,
      completion_rate: parseFloat(userRank.completion_rate).toFixed(1)
    } : null;

    return NextResponse.json({
      rankings,
      userRank: formattedUserRank,
      totalPlayers: rankings.length,
      success: true
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
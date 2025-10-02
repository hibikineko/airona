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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabaseServer
      .from('users')
      .select('discord_uid, username, airona_coins, created_at')
      .order('airona_coins', { ascending: false })
      .limit(limit);

    if (search) {
      query = query.or(`username.ilike.%${search}%, discord_uid.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get coin statistics
    const { data: stats, error: statsError } = await supabaseServer
      .from('users')
      .select('airona_coins')
      .not('airona_coins', 'is', null);

    if (statsError) {
      console.error('Error fetching coin stats:', statsError);
    }

    const coinStats = {
      totalUsers: stats?.length || 0,
      totalCoins: stats?.reduce((sum, user) => sum + (user.airona_coins || 0), 0) || 0,
      averageCoins: stats?.length > 0 
        ? (stats.reduce((sum, user) => sum + (user.airona_coins || 0), 0) / stats.length).toFixed(1)
        : 0
    };

    return NextResponse.json({
      success: true,
      users,
      stats: coinStats
    });

  } catch (error) {
    console.error('Admin coins API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    const { targetUserId, amount, reason, operation } = await request.json();

    if (!targetUserId || !amount || !operation) {
      return NextResponse.json(
        { error: 'Missing required fields: targetUserId, amount, operation' },
        { status: 400 }
      );
    }

    if (!['add', 'remove', 'set'].includes(operation)) {
      return NextResponse.json(
        { error: 'Operation must be "add", "remove", or "set"' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Get current user info
    const { data: currentUser, error: userError } = await supabaseServer
      .from('users')
      .select('discord_uid, username, airona_coins')
      .eq('discord_uid', targetUserId)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let newBalance;
    let transactionAmount;
    let transactionType;

    switch (operation) {
      case 'add':
        newBalance = (currentUser.airona_coins || 0) + amount;
        transactionAmount = amount;
        transactionType = 'admin_add';
        break;
      case 'remove':
        newBalance = Math.max(0, (currentUser.airona_coins || 0) - amount);
        transactionAmount = -amount;
        transactionType = 'admin_remove';
        break;
      case 'set':
        newBalance = amount;
        transactionAmount = amount - (currentUser.airona_coins || 0);
        transactionType = transactionAmount >= 0 ? 'admin_add' : 'admin_remove';
        break;
    }

    // Update user balance
    const { error: updateError } = await supabaseServer
      .from('users')
      .update({ airona_coins: newBalance })
      .eq('discord_uid', targetUserId);

    if (updateError) {
      console.error('Error updating user balance:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user balance' },
        { status: 500 }
      );
    }

    // Log transaction
    const { error: logError } = await supabaseServer
      .from('coin_transactions')
      .insert({
        discord_uid: targetUserId,
        transaction_type: transactionType,
        amount: transactionAmount,
        reason: reason || `Admin ${operation}: ${Math.abs(transactionAmount)} coins`
      });

    if (logError) {
      console.error('Error logging transaction:', logError);
      // Don't fail the whole operation for logging errors
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${operation === 'set' ? 'set' : operation + 'ed'} ${Math.abs(transactionAmount)} coins ${operation === 'remove' ? 'from' : 'to'} ${currentUser.username || targetUserId}`,
      user: {
        discord_uid: targetUserId,
        username: currentUser.username,
        previousBalance: currentUser.airona_coins || 0,
        newBalance,
        change: transactionAmount
      }
    });

  } catch (error) {
    console.error('Admin coins update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
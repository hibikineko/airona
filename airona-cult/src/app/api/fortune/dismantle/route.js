import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { supabaseServer } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { cardIds } = await request.json();
    
    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json(
        { error: 'No cards selected for dismantling' },
        { status: 400 }
      );
    }

    const discord_uid = session.user.id;

    // Start transaction
    const { data: userCards, error: fetchError } = await supabaseServer
      .from('user_cards')
      .select(`
        id,
        card_id,
        quantity,
        cards!inner(
          id,
          name,
          rarity
        )
      `)
      .eq('discord_uid', discord_uid)
      .in('card_id', cardIds);

    if (fetchError) {
      console.error('Error fetching user cards:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user cards' },
        { status: 500 }
      );
    }

    // Validate dismantling rules
    const dismantlingInfo = [];
    let totalCoinsEarned = 0;

    for (const userCard of userCards) {
      const card = userCard.cards;
      
      // Cannot dismantle if user only has 1 copy
      if (userCard.quantity <= 1) {
        return NextResponse.json(
          { error: `Cannot dismantle "${card.name}" - you only have 1 copy. Must keep at least 1 copy of each card.` },
          { status: 400 }
        );
      }

      // Calculate coins based on rarity
      let coinsPerCard;
      let requiredCards;
      
      switch (card.rarity) {
        case 'ultra_rare':
          coinsPerCard = 1;
          requiredCards = 1;
          break;
        case 'super_rare':
          coinsPerCard = 1;
          requiredCards = 3;
          break;
        case 'elite':
          coinsPerCard = 1;
          requiredCards = 5;
          break;
        default:
          return NextResponse.json(
            { error: `Unknown rarity: ${card.rarity}` },
            { status: 400 }
          );
      }

      // Calculate how many sets we can dismantle
      const availableForDismantling = userCard.quantity - 1; // Keep at least 1
      const setsToDismantle = Math.floor(availableForDismantling / requiredCards);
      
      if (setsToDismantle === 0) {
        return NextResponse.json(
          { error: `Cannot dismantle "${card.name}" - you need at least ${requiredCards + 1} copies (you have ${userCard.quantity})` },
          { status: 400 }
        );
      }

      const cardsToRemove = setsToDismantle * requiredCards;
      const coinsToEarn = setsToDismantle * coinsPerCard;

      dismantlingInfo.push({
        userCardId: userCard.id,
        cardId: card.id,
        cardName: card.name,
        rarity: card.rarity,
        currentQuantity: userCard.quantity,
        cardsToRemove,
        newQuantity: userCard.quantity - cardsToRemove,
        coinsEarned: coinsToEarn
      });

      totalCoinsEarned += coinsToEarn;
    }

    if (totalCoinsEarned === 0) {
      return NextResponse.json(
        { error: 'No cards can be dismantled with current quantities' },
        { status: 400 }
      );
    }

    // Execute dismantling
    const updates = [];
    const transactionData = [];

    for (const info of dismantlingInfo) {
      // Update card quantity
      const { error: updateError } = await supabaseServer
        .from('user_cards')
        .update({ quantity: info.newQuantity })
        .eq('id', info.userCardId);

      if (updateError) {
        console.error('Error updating card quantity:', updateError);
        return NextResponse.json(
          { error: 'Failed to update card quantities' },
          { status: 500 }
        );
      }

      updates.push({
        cardName: info.cardName,
        rarity: info.rarity,
        cardsRemoved: info.cardsToRemove,
        coinsEarned: info.coinsEarned
      });

      transactionData.push(info.cardId);
    }

    // Update user coin balance
    const { error: coinError } = await supabaseServer
      .from('users')
      .update({ 
        airona_coins: supabaseServer.raw(`airona_coins + ${totalCoinsEarned}`)
      })
      .eq('discord_uid', discord_uid);

    if (coinError) {
      console.error('Error updating coin balance:', coinError);
      return NextResponse.json(
        { error: 'Failed to update coin balance' },
        { status: 500 }
      );
    }

    // Log transaction
    const { error: logError } = await supabaseServer
      .from('coin_transactions')
      .insert({
        discord_uid,
        transaction_type: 'earned',
        amount: totalCoinsEarned,
        reason: `Dismantled ${updates.length} card type(s)`,
        related_card_ids: transactionData
      });

    if (logError) {
      console.error('Error logging transaction:', logError);
      // Don't fail the whole operation for logging errors
    }

    // Get updated coin balance
    const { data: updatedUser } = await supabaseServer
      .from('users')
      .select('airona_coins')
      .eq('discord_uid', discord_uid)
      .single();

    return NextResponse.json({
      success: true,
      message: `Successfully dismantled cards and earned ${totalCoinsEarned} Airona Coins!`,
      updates,
      totalCoinsEarned,
      newBalance: updatedUser?.airona_coins || 0
    });

  } catch (error) {
    console.error('Dismantling API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
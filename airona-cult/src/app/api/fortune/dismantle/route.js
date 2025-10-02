import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabaseServer } from "@/lib/supabaseServer";
import { strictRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  // Apply strict rate limiting for dismantling
  const rateLimitResult = strictRateLimit.check(request);
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
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { dismantleData } = await request.json();
    const discord_uid = session.user.id;

    // Validate input - dismantleData should be array of {cardId, quantity}
    if (!Array.isArray(dismantleData) || dismantleData.length === 0) {
      return NextResponse.json(
        { error: "Invalid card selection" },
        { status: 400 }
      );
    }

    // Extract card IDs and build quantity map
    const cardIds = dismantleData.map(item => item.cardId);
    const quantityMap = dismantleData.reduce((acc, item) => {
      acc[item.cardId] = item.quantity;
      return acc;
    }, {});

    // Dismantling requirements and rewards
    const dismantleRequirements = {
      elite: { required: 5, reward: 1 },
      super_rare: { required: 3, reward: 1 },
      ultra_rare: { required: 1, reward: 1 }
    };

    // Get user's cards that are being dismantled
    const { data: userCards, error: cardsError } = await supabaseServer
      .from("user_cards")
      .select(`
        card_id,
        quantity,
        cards (
          id,
          name,
          rarity
        )
      `)
      .eq("discord_uid", discord_uid)
      .in("card_id", cardIds);

    if (cardsError) {
      console.error("Error fetching user cards:", cardsError);
      return NextResponse.json(
        { error: "Failed to fetch user cards" },
        { status: 500 }
      );
    }

    // Validate user owns all selected cards with sufficient quantity
    for (const item of dismantleData) {
      const userCard = userCards.find(uc => uc.card_id === item.cardId);
      if (!userCard || userCard.quantity <= item.quantity) {
        return NextResponse.json(
          { error: `You don't have enough copies of card ${item.cardId} to dismantle ${item.quantity} copies. You have ${userCard?.quantity || 0}, need to keep at least 1.` },
          { status: 400 }
        );
      }
    }

    // Count total selected cards by rarity
    const rarityCounts = {};
    let totalSelectedCards = 0;
    
    dismantleData.forEach(item => {
      const userCard = userCards.find(uc => uc.card_id === item.cardId);
      if (userCard) {
        const rarity = userCard.cards.rarity;
        rarityCounts[rarity] = (rarityCounts[rarity] || 0) + item.quantity;
        totalSelectedCards += item.quantity;
      }
    });

    // Validate exactly one dismantling combination
    const validCombinations = Object.entries(dismantleRequirements).filter(([rarity, req]) => {
      return rarityCounts[rarity] === req.required;
    });

    if (validCombinations.length !== 1) {
      return NextResponse.json(
        { error: "Invalid dismantling combination. You must select exactly 5 Elite, 3 Super Rare, or 1 Ultra Rare cards." },
        { status: 400 }
      );
    }

    const totalSelected = totalSelectedCards;
    const [validRarity, validRequirement] = validCombinations[0];
    
    if (totalSelected !== validRequirement.required) {
      return NextResponse.json(
        { error: "Invalid dismantling selection. Only select the exact required amount." },
        { status: 400 }
      );
    }

    // Start transaction by updating card quantities
    const updatePromises = [];
    const coinTransactionData = [];

    for (const item of dismantleData) {
      const userCard = userCards.find(uc => uc.card_id === item.cardId);
      const newQuantity = userCard.quantity - item.quantity;
      
      if (newQuantity === 0) {
        // Delete the user_card entry if quantity reaches 0
        updatePromises.push(
          supabaseServer
            .from("user_cards")
            .delete()
            .eq("discord_uid", discord_uid)
            .eq("card_id", userCard.card_id)
        );
      } else {
        // Update quantity
        updatePromises.push(
          supabaseServer
            .from("user_cards")
            .update({ quantity: newQuantity })
            .eq("discord_uid", discord_uid)
            .eq("card_id", userCard.card_id)
        );
      }

      // Track for coin transaction log (repeat cardId for each copy dismantled)
      for (let i = 0; i < item.quantity; i++) {
        coinTransactionData.push(userCard.card_id);
      }
    }

    // Execute all card quantity updates
    const updateResults = await Promise.all(updatePromises);
    
    // Check for any errors in updates
    for (const result of updateResults) {
      if (result.error) {
        console.error("Error updating card quantity:", result.error);
        return NextResponse.json(
          { error: "Failed to update card quantities" },
          { status: 500 }
        );
      }
    }

    // Add coins to user
    const coinsEarned = validRequirement.reward;
    const { data: currentUser } = await supabaseServer
      .from("users")
      .select("airona_coins")
      .eq("discord_uid", discord_uid)
      .single();

    const newCoinBalance = (currentUser?.airona_coins || 0) + coinsEarned;

    const { error: coinUpdateError } = await supabaseServer
      .from("users")
      .update({ airona_coins: newCoinBalance })
      .eq("discord_uid", discord_uid);

    if (coinUpdateError) {
      console.error("Error updating coin balance:", coinUpdateError);
      return NextResponse.json(
        { error: "Failed to update coin balance" },
        { status: 500 }
      );
    }

    // Log coin transaction
    const { error: transactionError } = await supabaseServer
      .from("coin_transactions")
      .insert({
        discord_uid,
        transaction_type: 'earned',
        amount: coinsEarned,
        reason: `Dismantled ${validRequirement.required} ${validRarity} cards`,
        related_card_ids: coinTransactionData
      });

    if (transactionError) {
      console.error("Error logging coin transaction:", transactionError);
      // Don't fail the request for logging errors
    }

    // Update user stats - decrease cards_collected for cards that were completely removed
    const cardsCompletelyRemoved = dismantleData.filter(item => {
      const userCard = userCards.find(uc => uc.card_id === item.cardId);
      return userCard && userCard.quantity === item.quantity;
    }).length;
    
    if (cardsCompletelyRemoved > 0) {
      const { data: currentStats } = await supabaseServer
        .from("user_stats")
        .select("cards_collected")
        .eq("discord_uid", discord_uid)
        .single();

      const newCardsCollected = Math.max(0, (currentStats?.cards_collected || 0) - cardsCompletelyRemoved);

      await supabaseServer
        .from("user_stats")
        .upsert({
          discord_uid,
          cards_collected: newCardsCollected
        }, {
          onConflict: 'discord_uid'
        });
    }

    return NextResponse.json({
      success: true,
      coinsEarned,
      newCoinBalance,
      dismantledCards: dismantleData.map(item => {
        const userCard = userCards.find(uc => uc.card_id === item.cardId);
        return {
          id: item.cardId,
          name: userCard.cards.name,
          rarity: userCard.cards.rarity,
          quantity: item.quantity
        };
      }),
      message: `Successfully dismantled ${totalSelected} cards and earned ${coinsEarned} Airona Coin${coinsEarned > 1 ? 's' : ''}!`
    });

  } catch (error) {
    console.error("Dismantling API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
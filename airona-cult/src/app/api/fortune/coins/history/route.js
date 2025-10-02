import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const discord_uid = session.user.id;

    // Get user's coin transaction history
    const { data: transactions, error } = await supabaseServer
      .from("coin_transactions")
      .select("*")
      .eq("discord_uid", discord_uid)
      .order("created_at", { ascending: false })
      .limit(50); // Limit to last 50 transactions

    if (error) {
      console.error("Transaction history fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch transaction history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || []
    });

  } catch (error) {
    console.error("Coin history API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
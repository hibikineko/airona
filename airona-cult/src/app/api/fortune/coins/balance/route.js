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

    // Get user's current coin balance
    const { data: userInfo, error } = await supabaseServer
      .from("users")
      .select("airona_coins")
      .eq("discord_uid", discord_uid)
      .single();

    if (error) {
      console.error("User balance fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch coin balance" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      balance: userInfo?.airona_coins || 0
    });

  } catch (error) {
    console.error("Coin balance API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
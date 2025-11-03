import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      voterDiscordUsername,
      winnerId,
      loserId,
      roundNumber,
      matchId,
    } = body;

    // Validate required fields
    if (!voterDiscordUsername || !winnerId || !loserId || !roundNumber || !matchId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if voter has already voted in this match
    const { data: existingVote } = await supabaseServer
      .from("voting_logs")
      .select("id")
      .eq("voter_discord_username", voterDiscordUsername)
      .eq("match_id", matchId)
      .maybeSingle();

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted in this match" },
        { status: 400 }
      );
    }

    // Insert vote
    const { data: vote, error: voteError } = await supabaseServer
      .from("voting_logs")
      .insert([
        {
          voter_discord_username: voterDiscordUsername,
          submission_id: winnerId,
          opponent_submission_id: loserId,
          round_number: roundNumber,
          match_id: matchId,
        },
      ])
      .select()
      .single();

    if (voteError) {
      console.error("Vote error:", voteError);
      return NextResponse.json(
        { error: "Failed to record vote" },
        { status: 500 }
      );
    }

    // Update or create voter session
    const { error: sessionError } = await supabaseServer
      .from("voter_sessions")
      .upsert(
        {
          discord_username: voterDiscordUsername,
          current_round: roundNumber,
          last_vote_at: new Date().toISOString(),
        },
        {
          onConflict: "discord_username",
        }
      );

    if (sessionError) {
      console.error("Session update error:", sessionError);
    }

    return NextResponse.json({
      success: true,
      vote,
      message: "Vote recorded successfully!",
    });
  } catch (error) {
    console.error("Error in voting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch voting progress
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username required" },
        { status: 400 }
      );
    }

    // Get voter's completed matches
    const { data: votes, error } = await supabaseServer
      .from("voting_logs")
      .select("match_id, round_number")
      .eq("voter_discord_username", username);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch voting progress" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      completedMatches: votes.map(v => v.match_id),
      votes 
    });
  } catch (error) {
    console.error("Error fetching voting progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

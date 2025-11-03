import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request) {
  try {
    // Fetch standings using the view with server client (bypasses RLS)
    const { data: standingsData, error: standingsError } = await supabaseServer
      .from("halloween_standings")
      .select("*");

    if (standingsError) {
      console.error("Standings error:", standingsError);
      return Response.json({ error: standingsError.message }, { status: 500 });
    }

    // Fetch statistics
    const { data: votesData, error: votesError } = await supabaseServer
      .from("voting_logs")
      .select("id, voter_discord_username");

    const { data: submissionsData, error: submissionsError } = await supabaseServer
      .from("halloween_submissions")
      .select("id")
      .eq("is_active", true);

    if (votesError || submissionsError) {
      console.error("Stats error:", votesError || submissionsError);
    }

    const uniqueVoters = votesData ? new Set(votesData.map(v => v.voter_discord_username)) : new Set();
    
    const stats = {
      totalVotes: votesData?.length || 0,
      totalVoters: uniqueVoters.size,
      totalSubmissions: submissionsData?.length || 0,
    };

    return Response.json({
      results: standingsData || [],
      stats,
    });
  } catch (error) {
    console.error("Error in results API:", error);
    return Response.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { winnerId, voterUsername, top3 } = await request.json();

    if (!winnerId || !voterUsername) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log("POST /api/halloween/results:", { winnerId, voterUsername, top3 });

    // If top3 is provided, update all three rankings
    if (top3 && Array.isArray(top3) && top3.length === 3) {
      console.log("Updating top 3:", top3);
      
      // Update 1st place
      const { data: first, error: firstError } = await supabaseServer.rpc('increment_ranking', {
        p_submission_id: top3[0],
        p_rank_type: 'first'
      });
      if (firstError) {
        console.error("Error updating 1st place:", firstError);
        return Response.json({ error: `Failed to update 1st place: ${firstError.message}` }, { status: 500 });
      }

      // Update 2nd place
      const { data: second, error: secondError } = await supabaseServer.rpc('increment_ranking', {
        p_submission_id: top3[1],
        p_rank_type: 'second'
      });
      if (secondError) {
        console.error("Error updating 2nd place:", secondError);
        return Response.json({ error: `Failed to update 2nd place: ${secondError.message}` }, { status: 500 });
      }

      // Update 3rd place
      const { data: third, error: thirdError } = await supabaseServer.rpc('increment_ranking', {
        p_submission_id: top3[2],
        p_rank_type: 'third'
      });
      if (thirdError) {
        console.error("Error updating 3rd place:", thirdError);
        return Response.json({ error: `Failed to update 3rd place: ${thirdError.message}` }, { status: 500 });
      }

      console.log("Successfully updated all top 3 rankings");
    } else {
      // Just update winner
      const { data, error } = await supabaseServer.rpc('increment_ranking', {
        p_submission_id: winnerId,
        p_rank_type: 'first'
      });
      if (error) {
        console.error("Error updating winner:", error);
        return Response.json({ error: `Failed to update winner: ${error.message}` }, { status: 500 });
      }
    }

    // Record voter session completion
    const { error: sessionError } = await supabaseServer
      .from("voter_sessions")
      .insert({
        discord_username: voterUsername,
        is_completed: true,
        matches_completed: 15, // 16->8->4->2->1 + double elim + round robin = ~15 matches
      });

    if (sessionError) {
      console.error("Session error:", sessionError);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error in POST results API:", error);
    return Response.json({ error: "Failed to save results" }, { status: 500 });
  }
}

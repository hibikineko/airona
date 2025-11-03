import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request) {
  try {
    // Fetch standings using the view with server client (bypasses RLS)
    const { data: standingsData, error: standingsError } = await supabaseServer
      .from("halloween_standings")
      .select("*")
      .order("wins", { ascending: false })
      .order("total_votes", { ascending: false });

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

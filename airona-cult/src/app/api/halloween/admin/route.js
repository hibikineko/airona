import { supabaseServer } from "@/lib/supabaseServer";

// GET - Fetch all unique voters with their vote counts
export async function GET(request) {
  try {
    // Fetch all voting logs grouped by voter
    const { data: votingData, error: votingError } = await supabaseServer
      .from("voting_logs")
      .select("voter_discord_username, voted_at, id");

    if (votingError) {
      console.error("Error fetching voting logs:", votingError);
      return Response.json({ error: votingError.message }, { status: 500 });
    }

    // Group by voter and calculate stats
    const voterMap = new Map();
    
    votingData.forEach(vote => {
      const username = vote.voter_discord_username;
      if (!voterMap.has(username)) {
        voterMap.set(username, {
          username,
          voteCount: 0,
          firstVote: vote.voted_at,
          lastVote: vote.voted_at,
          voteIds: []
        });
      }
      
      const voter = voterMap.get(username);
      voter.voteCount++;
      voter.voteIds.push(vote.id);
      
      if (new Date(vote.voted_at) < new Date(voter.firstVote)) {
        voter.firstVote = vote.voted_at;
      }
      if (new Date(vote.voted_at) > new Date(voter.lastVote)) {
        voter.lastVote = vote.voted_at;
      }
    });

    const voters = Array.from(voterMap.values()).sort((a, b) => b.voteCount - a.voteCount);

    return Response.json({
      voters,
      totalVoters: voters.length,
      totalVotes: votingData.length
    });
  } catch (error) {
    console.error("Error in admin API:", error);
    return Response.json({ error: "Failed to fetch voter data" }, { status: 500 });
  }
}

// DELETE - Invalidate a voter (delete all their votes)
export async function DELETE(request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    // Delete all votes from this user
    const { error: deleteError } = await supabaseServer
      .from("voting_logs")
      .delete()
      .eq("voter_discord_username", username);

    if (deleteError) {
      console.error("Error deleting votes:", deleteError);
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    // The trigger will automatically update voting_results table

    return Response.json({ 
      success: true, 
      message: `All votes from ${username} have been invalidated` 
    });
  } catch (error) {
    console.error("Error invalidating voter:", error);
    return Response.json({ error: "Failed to invalidate voter" }, { status: 500 });
  }
}
